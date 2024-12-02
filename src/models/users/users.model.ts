import { sendResetEmail } from '../../services/nodemailer';
import crypto from 'crypto';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { Password } from '../../lib/password';
import { BadRequestError } from '../../errors/bad-request.error';
import { ServerError } from '../../errors/server.error';
import { UnauthorizedError } from '../../errors/unauthorized.error';
import { ForbiddenError } from '../../errors/forbidden.error';
import { config } from '../../config';
import User from './users.postgres';
import { db } from '../../services/rds-postgres';

const accessTokenSecret = config.jwt.accessToken;
const refreshTokenSecret = config.jwt.refreshToken;

function generateAccessToken(userId: string): string {
    const accessToken = jwt.sign({ userId, type: 'access' }, accessTokenSecret!, { expiresIn: '10m' });
    return accessToken;
}

async function generateRefreshToken(userId: string): Promise<string> {
    const refreshToken = jwt.sign({ userId, type: 'refresh' }, refreshTokenSecret!, { expiresIn: '7d' });
    // add refresh token to the store
    await db('refreshTokens').insert({
        user_id: userId,
        token: refreshToken,
        expires_at: Date.now() + 7 * 24 * 60 * 60 * 1000,
    });
    return refreshToken;
}

export async function signUp(email: string, password: string, confirmPassword: string) {
    if (password !== confirmPassword) throw new BadRequestError("Passwords don't match");

    const existingUser = await User.findUserByEmail(email);
    if (existingUser) throw new BadRequestError('Email already in use');

    const hashedPassword = await Password.toHash(password);
    const newUser = await User.createUser({ email, password: hashedPassword });

    const userAccessToken = generateAccessToken(newUser.id);
    const userRefreshToken = await generateRefreshToken(newUser.id);

    return { newUser, userAccessToken, userRefreshToken };
}

export async function signIn(email: string, password: string) {
    const existingUser = await User.findUserByEmail(email);
    if (!existingUser || !(await Password.compare(password, existingUser.password))) {
        throw new UnauthorizedError('Invalid credentials');
    }
    const userAccessToken = generateAccessToken(existingUser.id);
    const userRefreshToken = await generateRefreshToken(existingUser.id);

    return {
        user: existingUser,
        accessToken: userAccessToken,
        refreshToken: userRefreshToken,
    };
}

export async function signOut(refreshToken: string) {
    if (!refreshToken) throw new UnauthorizedError('Refresh Token missing');
    await db('refreshTokens').where({ token: refreshToken }).delete();
    return;
}

export async function forgotPassword(email: string) {
    // Find user by email
    const user = await User.findUserByEmail(email);
    if (user) {
        // Generate a reset token
        const resetToken = crypto.randomBytes(32).toString('hex');
        const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

        await User.updateUser(user.id, {
            resetPasswordToken: hashedToken,
            resetPasswordExpires: Date.now() + 3600000,
        });

        try {
            // Send the unhashed resetToken via email
            return await sendResetEmail(email, resetToken);
        } catch {
            throw new ServerError('Error sending email');
        }
    }
    return;
}

// export async function resetPassword(token: string, newPassword: string) {
//     // Hash the incoming token
//     const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

//     // Find the user by hashed token and expiration time
//     const user = await User.findUserByResetPasswordToken({
//         resetPasswordToken: hashedToken,
//         resetPasswordExpires: { $gt: Date.now() },
//     });

//     if (!user) throw new BadRequestError('Invalid or expired token');

//     // Update password
//     user.password = newPassword;
//     user.resetPasswordToken = undefined;
//     user.resetPasswordExpires = undefined;
//     await user.save();
// }

export async function refreshToken(refreshToken: string) {
    if (!refreshToken) throw new UnauthorizedError('Refresh Token missing');
    // check if the refresh token does not exist in the store in the database
    const refreshTokenRecord = await db('refreshTokens').where({ token: refreshToken }).first();
    if (!refreshTokenRecord) throw new ForbiddenError();
    // Verify refresh token
    try {
        const decoded = jwt.verify(refreshToken, config.jwt.refreshToken) as JwtPayload;
        // Generate new tokens
        const newAccessToken = generateAccessToken(decoded.userId);
        const newRefreshToken = await generateRefreshToken(decoded.userId);
        await db('refreshTokens').where({ token: refreshToken }).delete();
        return { newAccessToken, newRefreshToken };
    } catch (error) {
        if (error instanceof jwt.JsonWebTokenError) {
            throw new UnauthorizedError('Invalid refresh token.');
        } else if (error instanceof jwt.TokenExpiredError) {
            throw new UnauthorizedError('Refresh token has expired.');
        } else throw new UnauthorizedError('Token verification failed.');
    }
}
