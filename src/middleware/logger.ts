import winston from 'winston';
import expressWinston from 'express-winston';

// Custom format for logging
const logFormat = winston.format.combine(winston.format.timestamp(), winston.format.json(), winston.format.metadata());

// Create the logger middleware
export const requestLogger = expressWinston.logger({
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({
            filename: 'logs/error.log',
            level: 'error',
        }),
        new winston.transports.File({
            filename: 'logs/combined.log',
        }),
    ],
    format: logFormat,
    meta: true,
    msg: 'HTTP {{req.method}} {{req.url}}',
    expressFormat: true,
    colorize: false,
    ignoreRoute: (req) => {
        // Ignore health check routes if needed
        return req.url === '/health';
    },
});

// Error logger middleware
export const errorLogger = expressWinston.errorLogger({
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({
            filename: 'logs/error.log',
        }),
    ],
    format: logFormat,
});
