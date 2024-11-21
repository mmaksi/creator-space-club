import { Request, Response } from 'express';
import { addListMember, sendListEmails } from '../../models/mail/mailgun.model';

export async function httpSendBulkEmails(req: Request, res: Response) {
    const message = await sendListEmails(
        'waiters@sandboxe6ee7852f3c04dff9a3025f453776590.mailgun.org',
        'TestSubject',
        'TestBodyText',
        'TestBodyHTML'
    );
    return res.status(201).json({ message });
}

export async function httpAddToEmailList(req: Request, res: Response) {
    const email = req.body.email;
    const name = req.body.name || '';
    const message = await addListMember('waiters@sandboxe6ee7852f3c04dff9a3025f453776590.mailgun.org', email, name);
    return res.status(201).json({ message });
}
