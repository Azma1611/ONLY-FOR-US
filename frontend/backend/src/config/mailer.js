import nodemailer from 'nodemailer';

/**
 * Creates and configures Nodemailer transporter for Gmail SMTP services.
 */
const getTransporter = () => {
  if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    return nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true, // true for port 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      tls: {
        // Do not fail on invalid/self-signed certificates (highly robust for various environments)
        rejectUnauthorized: false,
      },
    });
  }
  return null;
};

export default getTransporter;
export const FROM_EMAIL = process.env.EMAIL_USER
  ? `"Only For Us" <${process.env.EMAIL_USER}>`
  : '"Only For Us" <noreply@onlyforus.app>';
