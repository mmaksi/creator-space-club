import express from 'express';
import 'express-async-errors';
import api from './routes/api';
import cookieSession from 'cookie-session';
// import { errorLogger } from 'express-winston';
// import { requestLogger } from './middlewares/logger';
import { errorHandler } from './middlewares/error-handler';
import helmet from 'helmet';
import cors from 'cors';
import hpp from 'hpp';
import { rateLimiterMiddleware } from './middlewares/rateLimiter';
import passport from 'passport';
import { googleStrategy } from './services/passport';
import sessionOptions from './lib/session-options';

export const app = express();
app.set('trust proxy', 1);

passport.use(googleStrategy);

// app.use(requestLogger);
app.use(helmet());
app.use(hpp());
app.use(cors());
app.use(express.json());
app.use(cookieSession(sessionOptions));
app.use(rateLimiterMiddleware);
app.use('/api', api);
// app.use(errorLogger);
app.use(errorHandler);
