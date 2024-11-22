import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface IUserPayload {
    id: string;
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

    const payload = jwt.verify(req.session.accessToken, process.env.ACCESS_TOKEN!) as IUserPayload;
    req.currentUser = payload;

    next();
};
