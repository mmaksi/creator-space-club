import { sendResetEmail } from '../../services/nodemailer';
import { User } from './users.mongo';
import crypto from 'crypto';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { Password } from '../../lib/password';
import { BadRequestError } from '../../errors/bad-request.error';
import { ServerError } from '../../errors/server.error';
import { UnauthorizedError } from '../../errors/unauthorized.error';
import { ForbiddenError } from '../../errors/forbidden.error';

// TODO store refresh tokens in a redis database
let refreshTokensStore = [] as string[];

function generateAccessToken(userId: string) {
    const accessTokenSecret = process.env.ACCESS_TOKEN;
    const accessToken = jwt.sign({ userId, type: 'access' }, accessTokenSecret!, { expiresIn: '10m' });
    return accessToken;
}

function generateRefreshToken(userId: string) {
    const refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET;
    const refreshToken = jwt.sign({ userId, type: 'refresh' }, refreshTokenSecret!);
    refreshTokensStore.push(refreshToken);
    return refreshToken;
}

export async function signUp(email: string, password: string, confirmPassword: string) {
    if (password !== confirmPassword) throw new BadRequestError("Passwords don't match");

    const existingUser = await User.findOne({ email });
    if (existingUser) throw new BadRequestError('Email already in use');

    const newUser = User.build({ email, password });

    const userAccessToken = generateAccessToken(JSON.stringify(newUser._id));
    const userRefreshToken = generateRefreshToken(JSON.stringify(newUser._id));

    return { newUser, userAccessToken, userRefreshToken };
}

export async function signIn(email: string, password: string) {
    const existingUser = await User.findOne({ email });
    if (!existingUser || !(await Password.compare(password, existingUser.password))) {
        throw new UnauthorizedError('Invalid credentials');
    }
    const userAccessToken = generateAccessToken(existingUser.id);
    const userRefreshToken = generateRefreshToken(existingUser.id);

    return {
        user: existingUser,
        accessToken: userAccessToken,
        refreshToken: userRefreshToken,
    };
}

export async function signOut(refreshToken: string) {
    if (!refreshToken) throw new UnauthorizedError('Refresh Token missing');
    refreshTokensStore = refreshTokensStore.filter((token) => token !== refreshToken);
    return;
}

export async function forgotPassword(email: string) {
    // Find user by email
    const user = await User.findOne({ email });
    if (user) {
        // Generate a reset token
        const resetToken = crypto.randomBytes(32).toString('hex');
        const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
        user.resetPasswordToken = hashedToken;
        user.resetPasswordExpires = Date.now() + 3600000;

        await user.save();

        try {
            // Send the unhashed resetToken via email
            return await sendResetEmail(email, resetToken);
        } catch {
            throw new ServerError('Error sending email');
        }
    }
    return;
}

export async function resetPassword(token: string, newPassword: string) {
    // Hash the incoming token
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    // Find the user by hashed token and expiration time
    const user = await User.findOne({
        resetPasswordToken: hashedToken,
        resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) throw new BadRequestError('Invalid or expired token');

    // Update password
    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();
}

export async function refreshToken(refreshToken: string) {
    if (!refreshToken) throw new ForbiddenError();
    if (!refreshTokensStore.includes(refreshToken)) throw new UnauthorizedError('Unauthorized');
    // Verify refresh token
    try {
        const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET!) as JwtPayload;
        // Generate new tokens
        const newAccessToken = generateAccessToken(decoded.userId);
        const newRefreshToken = generateRefreshToken(decoded.userId);
        // TODO delete old refresh token from the store
        return { newAccessToken, newRefreshToken };
    } catch (error) {
        if (error instanceof jwt.JsonWebTokenError) {
            throw new UnauthorizedError('Invalid refresh token.');
        } else if (error instanceof jwt.TokenExpiredError) {
            throw new UnauthorizedError('Refresh token has expired.');
        } else throw new UnauthorizedError('Token verification failed.');
    }
}
