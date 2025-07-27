import { Resend } from 'resend';

// Make sure this is stored securely (e.g., in environment variable)
const resend = new Resend(process.env.RESEND_API_KEY);

// Email sending function
export const sendVaccinationEmail = async ({
  to,
  subject,
  htmlContent,
  attachment,
}: {
  to: string;
  subject: string;
  htmlContent: string;
  attachment?: { content: string; filename: string; type: string };
}) => {
  try {
    const emailData: any = {
      from: 'KidCare Chronicle <no-reply@kidcarechronicle.com>',
      to,
      subject,
      html: htmlContent,
    };

    if (attachment) {
      emailData.attachments = [
        {
          filename: attachment.filename,
          content: attachment.content,
          type: attachment.type,
          disposition: 'attachment',
        },
      ];
    }

    const response = await resend.emails.send(emailData);
    return response;
  } catch (error) {
    console.error('Failed to send vaccination email:', error);
    throw error;
  }
};