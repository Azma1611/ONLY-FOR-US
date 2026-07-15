import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.ethereal.email',
  port: process.env.SMTP_PORT || 587,
  auth: {
    user: process.env.SMTP_USER || 'ethereal.user@ethereal.email',
    pass: process.env.SMTP_PASS || 'ethereal_password'
  }
});

export const sendAutomationEmail = async ({ to, subject, html }) => {
  try {
    if (!process.env.SMTP_HOST) {
      console.log(`[Email Mock] To: ${to} | Subject: ${subject}`);
      return true;
    }
    
    const info = await transporter.sendMail({
      from: `"Only For Us" <${process.env.SMTP_USER || 'noreply@onlyforus.app'}>`,
      to,
      subject,
      html
    });
    console.log(`Email sent: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error('Email sending failed:', error);
    return false;
  }
};
