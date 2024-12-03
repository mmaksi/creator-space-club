import express from 'express';
import { currentUser } from '../../middlewares/current-user';
import {
    httpSignup,
    httpSignin,
    httpGetCurrentUser,
    httpSignOut,
    httpForgotPassword,
    httpRefreshToken,
    httpResetPassword,
} from './users.controller';
import { signinValidator, signupValidator } from '../../lib/request-validator';
import { requireAuth } from '../../middlewares/require-auth';
import { validateRequest } from '../../middlewares/request-validator';

const usersRouter = express.Router();

usersRouter.get('/current-user', currentUser, requireAuth, httpGetCurrentUser);
usersRouter.post('/email/signup', signupValidator, validateRequest, httpSignup);
usersRouter.post('/email/signin', signinValidator, validateRequest, httpSignin);
usersRouter.post('/email/forgot-password', httpForgotPassword);
usersRouter.post('/signout', httpSignOut);
usersRouter.post('/reset-password/:token', httpResetPassword);
usersRouter.post('/token/refresh', httpRefreshToken);

export default usersRouter;
