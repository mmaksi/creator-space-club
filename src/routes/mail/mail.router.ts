import express from 'express';
import { httpSendBulkEmails, httpAddToEmailList } from './mail.controller';

const mailRouter = express.Router();

mailRouter.post('/bulk-send', httpSendBulkEmails);
mailRouter.post('/email-list', httpAddToEmailList);

export default mailRouter;
