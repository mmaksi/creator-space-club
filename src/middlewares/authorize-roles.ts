import { Request, Response, NextFunction } from 'express';
import { ForbiddenError } from '../errors/forbidden.error';

export function authorizeRoles(roles: string[]) {
    return (req: Request, res: Response, next: NextFunction) => {
        const hasRole = req.currentUser!.roles.some((role: string) => roles.includes(role));
        if (!hasRole) throw new ForbiddenError();

        next();
    };
}
