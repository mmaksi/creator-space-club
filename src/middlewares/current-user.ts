import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { UnauthorizedError } from '../errors/unauthorized.error';

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

export const currentUser = (req: Request, res: Response, next: NextFunction) => {
    if (!req.session?.accessToken) {
        return next();
    }
    try {
        const payload = jwt.verify(req.session.accessToken, config.jwt.accessToken) as IUserPayload;
        console.warn({ payload });
        req.currentUser = payload;
        next();
    } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
            return res.status(401).json({ message: 'Token expired. Please log in again.' });
        } else if (error instanceof jwt.JsonWebTokenError) {
            return res.status(401).json({ message: 'Invalid token.' });
        } else if (error instanceof jwt.NotBeforeError) {
            return res.status(401).json({ message: 'Token not active yet.' });
        } else throw new UnauthorizedError('Token verification failed.');
    }
};
