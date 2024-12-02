/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response } from 'express';
import { CustomError } from '../errors/custom-error';

export const errorHandler = (err: Error, _: Request, res: Response, next: NextFunction) => {
    console.error(err.message);
    if (err instanceof CustomError) {
        return res.status(err.statusCode).send({
            errors: err.serializeErrors(),
            timestamp: new Date().toISOString(),
        });
    }
    return res.status(400).send({ message: 'Something went wrong' });
};
