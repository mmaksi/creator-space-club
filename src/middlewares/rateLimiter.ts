import { Request, Response, NextFunction } from 'express';
import { RateLimiterMemory } from 'rate-limiter-flexible';
import { TooManyRequestsError } from '../errors/too-many-requests.error';

const rateLimiter = new RateLimiterMemory({
    points: 10,
    duration: 1,
    blockDuration: 60,
});

export const rateLimiterMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const clientIp = req.ip as string;
        await rateLimiter.consume(clientIp);
        next();
    } catch {
        throw new TooManyRequestsError();
    }
};
