import { sendResetEmail } from '../../services/nodemailer';
import crypto from 'crypto';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { Password } from '../../lib/password';
import { BadRequestError } from '../../errors/bad-request.error';
import { UnauthorizedError } from '../../errors/unauthorized.error';
import { ForbiddenError } from '../../errors/forbidden.error';
import { config } from '../../config';
import User from './users.postgres';
import { db } from '../../services/rds-postgres';
import { Profile, VerifyCallback } from 'passport-google-oauth20';

const accessTokenSecret = config.jwt.accessToken;
const refreshTokenSecret = config.jwt.refreshToken;

function generateAccessToken(userId: string): string {
    const accessToken = jwt.sign({ userId, type: 'access' }, accessTokenSecret!, { expiresIn: '1m' });
    return accessToken;
}

async function generateRefreshToken(userId: string): Promise<string> {
    const refreshToken = jwt.sign({ userId, type: 'refresh' }, refreshTokenSecret!, { expiresIn: '7d' });
    console.warn(refreshToken);
    // add refresh token to the store
    try {
        await db('refreshTokens').insert({
            user_id: userId,
            token: refreshToken,
            expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        });
    } catch (error) {
        console.error(error);
    }
    return refreshToken;
}

export async function signUp(email: string, password: string, confirmPassword: string) {
    if (password !== confirmPassword) throw new BadRequestError("Passwords don't match");

    const existingUser = await User.findUserBy({ email });
    if (existingUser) throw new BadRequestError('Email already in use');

    const hashedPassword = await Password.toHash(password);
    const newUser = await User.createUser({ email, password: hashedPassword });

    const userAccessToken = generateAccessToken(newUser.id);
    const userRefreshToken = await generateRefreshToken(newUser.id);

    return { newUser, userAccessToken, userRefreshToken };
}

export async function signIn(email: string, password: string) {
    const existingUser = await User.findUserBy({ email });
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

export async function googleSignIn(accessToken: string, refreshToken: string, profile: Profile, done: VerifyCallback) {
    console.warn(profile);
    // const firstName = profile.name?.givenName;
    // const lastName = profile.name?.familyName;
    // const email = profile.emails![0].value;
    // const provider = 'google';
    // const profilePhoto = profile.photos![0].value;
    // const userId = profile.id;
    try {
        // Check if user already exists
        const existingUser = await User.findUserBy({ googleId: profile.id });

        if (existingUser) {
            return done(null, existingUser);
        }

        // If not, create new user
        const newUser = await User.createUser({
            email: profile.emails![0].value,
            googleId: profile.id,
            // Set a random password since it's not used with Google auth
            password: Math.random().toString(36).slice(-8),
        });
        done(null, newUser);
        // store the profile id in a cookie
    } catch (error) {
        done(error, undefined);
    }
}

export async function signOut(refreshToken: string) {
    if (!refreshToken) throw new UnauthorizedError('Refresh Token missing');
    await db('refreshTokens').where({ token: refreshToken }).delete();
    return;
}

export async function forgotPassword(email: string) {
    // Check if user exists
    const user = await User.findUserBy({ email });
    if (user) {
        // Generate a secure token
        const resetToken = crypto.randomBytes(32).toString('hex');
        // Hash the token
        const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
        // Set expiration time
        const expiration = new Date(Date.now() + 3600000); // Token valid for 1 hour

        // Store the hashed token and expiration in the database
        await User.updateUser(user.id, {
            resetPasswordToken: hashedToken,
            resetPasswordExpires: expiration,
        });

        await sendResetEmail(email, resetToken);
        return;
    }
    return;
}

export async function resetPassword(token: string, newPassword: string) {
    // Hash the incoming token
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    // Find the user by hashed token and expiration time
    const user = await User.findUserBy({
        resetPasswordToken: hashedToken,
    });

    if (!user) throw new BadRequestError('Invalid or expired token');

    // Update password
    user.password = newPassword;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
}

export async function refreshToken(refreshToken: string) {
    if (!refreshToken) throw new UnauthorizedError('Refresh Token missing');
    // check if the refresh token does not exist in the database
    const refreshTokenRecord = await db('refreshTokens').where({ token: refreshToken }).first();
    if (!refreshTokenRecord) throw new ForbiddenError();
    try {
        // Verify refresh token
        const decoded = jwt.verify(refreshToken, config.jwt.refreshToken) as JwtPayload;
        // Generate new tokens
        const newAccessToken = generateAccessToken(decoded.userId);
        const newRefreshToken = await generateRefreshToken(decoded.userId);
        // Remove the old expired refresh token
        await db('refreshTokens').where({ token: refreshToken }).delete();
        // Return the new tokens
        return { newAccessToken, newRefreshToken };
    } catch (error) {
        if (error instanceof jwt.JsonWebTokenError) {
            throw new UnauthorizedError('Invalid refresh token.');
        } else if (error instanceof jwt.TokenExpiredError) {
            await db('refreshTokens').where({ token: refreshToken }).delete();
            throw new UnauthorizedError('Refresh token has expired.');
        } else throw new UnauthorizedError('Token verification failed.');
    }
}
