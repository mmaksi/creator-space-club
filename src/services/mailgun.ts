import axios from 'axios';
import { config } from '../config';

/**
 * Subscribes a user's email address to a Mailgun mailing list.
 *
 * @param email - The email address to subscribe
 * @throws Will log an error if subscription fails
 * @returns Promise<void>
 */
export async function subscribeUserToList(email: string): Promise<void> {
    try {
        const url = `https://api.mailgun.net/v3/lists/${config.mailgun.list}/members`;
        const auth = { username: 'api', password: config.mailgun.key };
        const data = { address: email, subscribed: true };

        const response = await axios.post(url, data, { auth });
        if (response.status === 200) {
            console.log(`${email} successfully subscribed to the list.`);
        }
    } catch (error) {
        if (error instanceof Error) console.error(`Error: ${error.message}`);
    }
}

/**
 * Sends a bulk email to a Mailgun mailing list.
 *
 * @param emailList - The mailing list address (e.g., 'mylist@mydomain.com')
 * @param subject - The email subject line
 * @param htmlContent - The HTML content of the email
 * @throws Will log an error if sending fails
 * @returns Promise<void>
 */
export async function sendBulkEmail(emailList: string, subject: string, htmlContent: string): Promise<void> {
    try {
        const url = `https://api.mailgun.net/v3/${config.mailgun.domain}/messages`;
        const auth = { username: 'api', password: config.mailgun.key };
        const data = {
            from: `Your Service <no-reply@${config.mailgun.domain}>`,
            to: emailList, // List name as configured in Mailgun, e.g., 'mylist@mydomain.com'
            subject: subject,
            html: htmlContent,
        };

        const response = await axios.post(url, data, { auth });
        if (response.status === 200) {
            console.log(`Email sent to list ${emailList} successfully.`);
        }
    } catch (error) {
        if (error instanceof Error) console.error(`Error: ${error.message}`);
    }
}
