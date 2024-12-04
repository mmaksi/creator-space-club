import { Request, Response, NextFunction } from 'express';
import { UnauthorizedError } from '../errors/unauthorized.error';
import { ForbiddenError } from '../errors/forbidden.error';
import { IUser } from '../lib/types';

declare global {
    namespace Express {
        interface Request {
            currentUser?: IUser;
        }
    }
}

export function authorizeRoles(roles: string[]) {
    return (req: Request, res: Response, next: NextFunction) => {
        if (!req.currentUser) throw new UnauthorizedError('Authentication required. No token provided.');

        const hasRole = req.currentUser.roles?.some((role: string) => roles.includes(role));
        if (!hasRole) throw new ForbiddenError();

        next();
    };
}
