import express from 'express';
import 'express-async-errors';
import api from './routes/api';
import cookieSession from 'cookie-session';
import { errorLogger } from 'express-winston';
import { errorHandler } from './middlewares/error-handler';
import { requestLogger } from './middlewares/logger';
import helmet from 'helmet';
import cors from 'cors';
import hpp from 'hpp';

export const app = express();
const sessionOptions = {
    httpOnly: true,
    signed: false,
    secure: process.env.NODE_ENV !== 'test',
};

app.set('trust proxy', 1);

app.use(requestLogger);
app.use(helmet());
app.use(hpp());
app.use(cors());
app.use(express.json());
app.use(cookieSession(sessionOptions));
app.use('/api', api);
app.use(errorHandler);
app.use(errorLogger);
