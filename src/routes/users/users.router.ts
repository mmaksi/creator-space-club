import express from 'express';
import { currentUser } from '../../middlewares/current-user';
import {
    httpSignup,
    httpSignin,
    httpGetCurrentUser,
    httpSignOut,
    httpForgotPassword,
    httpRefreshToken,
} from './users.controller';
import { signinValidator, signupValidator } from '../../lib/request-validator';
import { requireAuth } from '../../middlewares/require-auth';
import { validateRequest } from '../../middlewares/request-validator';

const usersRouter = express.Router();

usersRouter.get('/current-user', currentUser, requireAuth, httpGetCurrentUser);
usersRouter.post('/signup', signupValidator, validateRequest, httpSignup);
usersRouter.post('/signin', signinValidator, validateRequest, httpSignin);
usersRouter.post('/signout', httpSignOut);
usersRouter.post('/forgot-password', httpForgotPassword);
// usersRouter.post('/reset-password/:token', httpResetPassword);
usersRouter.post('/refresh-token', httpRefreshToken);

export default usersRouter;
