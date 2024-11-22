import { Request, Response } from 'express';
import { CustomError } from '../errors/custom-error';

export const errorHandler = (err: Error, _: Request, res: Response) => {
    if (err instanceof CustomError) {
        return res.status(err.statusCode).send({ errors: err.serializeErrors() });
    }
    console.error(err);
    return res.status(400).send({ message: 'Something went wrong' });
};
