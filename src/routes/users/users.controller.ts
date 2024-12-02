import { Request, Response } from 'express';
import { signUp, signIn, signOut, forgotPassword, refreshToken } from '../../models/users/users.model';

interface IUserPayload {
    userId: string;
    type: string;
    exp: number;
    iat: number;
}
declare global {
    namespace Express {
        interface Request {
            currentUser?: IUserPayload;
        }
    }
}

export async function httpSignup(req: Request, res: Response) {
    const { email, password, confirmPassword } = req.body;
    const { newUser, userAccessToken, userRefreshToken } = await signUp(email, password, confirmPassword);
    req.session!.accessToken = userAccessToken;
    req.session!.refreshToken = userRefreshToken;
    return res.status(201).json({ user: newUser });
}

export async function httpSignin(req: Request, res: Response) {
    const { email, password } = req.body;
    const { user, accessToken, refreshToken } = await signIn(email, password);
    // Store user's JWT in the cookie
    req.session!.accessToken = accessToken;
    req.session!.refreshToken = refreshToken;
    return res.status(200).json(user);
}

export async function httpGetCurrentUser(req: Request, res: Response) {
    return res.json({ currentUser: req.currentUser || null });
}

export async function httpSignOut(req: Request, res: Response) {
    const refreshToken = req.session!.refreshToken || req.body.refreshToken;
    await signOut(refreshToken);
    // Clear the session after removing refresh token from the DB
    req.session = null;
    return res.status(200).json({});
}

export async function httpForgotPassword(req: Request, res: Response) {
    const { email } = req.body;
    await forgotPassword(email);
    return res
        .status(200)
        .json('If your email exists in our database, you will get a reset password link on your inbox soon.');
}

// export async function httpResetPassword(req: Request, res: Response) {
//     const { token } = req.params;
//     const { newPassword } = req.body;

//     await resetPassword(token, newPassword);

//     return res.send('Password has been reset');
// }

export async function httpRefreshToken(req: Request, res: Response) {
    const userRefreshToken = req.session!.refreshToken || req.body.refreshToken;
    const { newAccessToken, newRefreshToken } = await refreshToken(userRefreshToken);
    // Update tokens in cookies
    req.session!.accessToken = newAccessToken;
    req.session!.refreshToken = newRefreshToken;
    return res.status(200).json({ message: 'Tokens refreshed' });
}
