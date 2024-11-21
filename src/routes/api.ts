import express from 'express';
import usersRouter from './users/users.router';
import mailRouter from './mail/mail.router';

const api = express.Router();

api.use('/auth', usersRouter);
api.use('/mail', mailRouter);

export default api;
