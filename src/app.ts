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
import { IUser } from './lib/types';
import User from './models/users/users.postgres';

declare global {
    namespace Express {
        // eslint-disable-next-line @typescript-eslint/naming-convention, @typescript-eslint/no-empty-object-type
        interface User extends IUser {}
        interface Request {
            currentUser?: IUser;
        }
    }
}

passport.serializeUser((user: Express.User, done) => {
    done(null, user);
});

passport.deserializeUser(async (user: Express.User, done) => {
    const existingUser = await User.findUserBy({ id: user.id });
    done(null, existingUser);
});

passport.use(googleStrategy);

export const app = express();
app.set('trust proxy', 1);

// app.use(requestLogger);
app.use(helmet());
app.use(hpp());
app.use(cors());
app.use(express.json());
app.use(cookieSession(sessionOptions));
app.use(passport.initialize());
app.use(passport.session());
app.use(rateLimiterMiddleware);
app.use('/api', api);
// app.use(errorLogger);
app.use(errorHandler);
