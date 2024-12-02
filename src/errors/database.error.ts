import { CustomError } from './custom-error';

export class DatabaseConnectionError extends CustomError {
    statusCode = 500;
    constructor(message?: string) {
        super(message || 'Error connecting to the database');
        Object.setPrototypeOf(this, DatabaseConnectionError.prototype);
    }

    serializeErrors() {
        return [{ message: this.message || 'Error connecting to the database' }];
    }
}
