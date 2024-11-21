import formData from 'form-data';
import Mailgun, { MailgunMessageData } from 'mailgun.js';
import { config } from '../../config';

const mailgun = new Mailgun(formData);
const mg = mailgun.client({
    username: 'api',
    key: config.mailgun.key,
    url: config.mailgun.domain,
});

/**
 * Sends an email using Mailgun API
 * @param domain - The Mailgun domain to send from
 * @param messageData - The email message data including from, to, subject, and content
 * @returns Promise resolving to the Mailgun API response or undefined if error occurs
 */
export async function sendEmail(domain: string, messageData: MailgunMessageData) {
    try {
        const body = await mg.messages.create(domain, messageData);
        return body;
    } catch (error) {
        console.error('Error sending email:', error);
    }
}

/**
 * Fetches all members of a given Mailgun list and extracts their names and emails.
 *
 * @param {string} listAddress - The address of the Mailgun mailing list (e.g., list@yourdomain.com).
 * @returns {Promise<{ name: string; email: string }[]>} - An array of objects containing names and emails.
 */
export async function extractListMembers(listAddress: string): Promise<{ name: string; email: string }[]> {
    try {
        const response = await mg.lists.members.listMembers(listAddress);
        const members = response.items.map((member: any) => ({
            name: member.name,
            email: member.address,
        }));
        return members;
    } catch (error) {
        console.error('Failed to fetch list members:', error);
        throw error;
    }
}

/**
 * Sends a bulk email to a Mailgun list with recipient-specific customization.
 *
 * @param {string} listAddress - The address of the Mailgun mailing list (e.g., list@yourdomain.com).
 * @param {string} subject - Subject of the email.
 * @param {string} bodyText - Plain text version of the email.
 * @param {string} bodyHtml - HTML version of the email with placeholders for the name.
 */
export async function sendListEmails(
    listAddress: string,
    subject: string,
    bodyText: string,
    bodyHtml: string
): Promise<void> {
    const domain = config.mailgun.domain;

    const recipients = await extractListMembers(listAddress);
    // Construct recipient variables for personalization
    const recipientVariables: Record<string, { name: string }> = {};
    recipients.forEach((recipient) => {
        recipientVariables[recipient.email] = { name: recipient.name };
    });

    const messageData = {
        from: `Your Company <no-reply@${domain}>`,
        to: Object.keys(recipientVariables).join(','),
        subject,
        text: bodyText,
        html: bodyHtml,
        'recipient-variables': JSON.stringify(recipientVariables), // Add personalization variables
        template: '',
    };

    try {
        const response = await mg.messages.create(domain, messageData);
        console.log('Bulk email sent successfully:', response);
    } catch (error) {
        console.error('Failed to send bulk email:', error);
        throw error;
    }
}

/**
 * Adds a new member to a Mailgun mailing list
 *
 * @param {string} listAddress - The address of the Mailgun mailing list (e.g., list@yourdomain.com)
 * @param {string} email - Email address of the new member
 * @param {string} name - Name of the new member
 * @returns {Promise<any>} - Promise resolving to the Mailgun API response
 */
export async function addListMember(listAddress: string, email: string, name: string): Promise<any> {
    try {
        const response = await mg.lists.members.createMember(listAddress, {
            address: email,
            name: name,
            subscribed: true,
            upsert: 'yes',
        });
        return response;
    } catch (error) {
        console.error('Failed to add member to list:', error);
        throw error;
    }
}
