import { Request, Response, NextFunction } from 'express';
import { UnauthorizedError } from '../errors/unauthorized.error';

export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
    if (req.user) return next();
    if (!req.currentUser) {
        throw new UnauthorizedError('Authentication required. No token provided.');
    }

    next();
};
