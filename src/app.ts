import express from 'express';
import 'express-async-errors';
import api from './routes/api';
import cookieSession from 'cookie-session';

export const app = express();

// Important middlewares
app.set('trust proxy', 1);
app.use(express.json());
app.use(
    cookieSession({
        signed: false,
        secure: process.env.NODE_ENV !== 'test',
    })
);
// applySecurityMiddlewares(app);

// Router mounting
app.use('/api', api);

// Error handling
// app.use(errorHandler);
