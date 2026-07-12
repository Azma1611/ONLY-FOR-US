import fs from 'fs';
import path from 'path';
import getTransporter, { FROM_EMAIL } from '../config/mailer.js';
import logger from '../utils/logger.js';

// Base styling properties for premium email templates
const baseStyles = `
  body {
    margin: 0;
    padding: 0;
    background-color: #0F172A;
    color: #F8FAFC;
    font-family: 'Outfit', 'Inter', sans-serif;
    -webkit-font-smoothing: antialiased;
  }
  .container {
    max-width: 540px;
    margin: 0 auto;
    padding: 40px 20px;
  }
  .card {
    background-color: #1E293B;
    background: linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.95) 100%);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 24px;
    padding: 40px;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.35);
    text-align: center;
  }
  .logo-container {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 56px;
    height: 56px;
    border-radius: 16px;
    background: linear-gradient(135deg, #FF4D88, #8B5CF6);
    margin-bottom: 24px;
    box-shadow: 0 8px 20px rgba(255, 77, 136, 0.3);
  }
  .logo-emoji {
    font-size: 28px;
    line-height: 1;
  }
  .app-name {
    font-size: 24px;
    font-weight: 800;
    margin: 0 0 8px 0;
    letter-spacing: -0.02em;
    background: linear-gradient(135deg, #FF4D88, #8B5CF6);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    color: #FF4D88;
  }
  .title {
    font-size: 20px;
    font-weight: 700;
    color: #F8FAFC;
    margin: 0 0 16px 0;
    letter-spacing: -0.01em;
  }
  .greeting {
    font-size: 15px;
    color: #CBD5E1;
    line-height: 1.6;
    margin: 0 0 24px 0;
    text-align: left;
  }
  .action-btn {
    display: inline-block;
    background: linear-gradient(135deg, #FF4D88, #8B5CF6);
    color: #FFFFFF !important;
    text-decoration: none;
    font-weight: bold;
    padding: 14px 28px;
    border-radius: 14px;
    margin: 20px 0;
    box-shadow: 0 8px 20px rgba(255, 77, 136, 0.35);
  }
  .otp-container {
    background: rgba(255, 77, 136, 0.06);
    border: 1px dashed rgba(255, 77, 136, 0.3);
    border-radius: 16px;
    padding: 20px;
    margin: 28px 0;
    box-shadow: 0 0 20px rgba(255, 77, 136, 0.1);
  }
  .otp-code {
    font-family: monospace;
    font-size: 38px;
    font-weight: 800;
    letter-spacing: 0.25em;
    color: #FF4D88;
  }
  .expiry-text {
    font-size: 13px;
    color: #A78BFA;
    font-weight: 600;
    margin: 0 0 20px 0;
  }
  .warning-text {
    font-size: 12px;
    color: #64748B;
    line-height: 1.5;
    margin: 24px 0 0 0;
    border-top: 1px solid rgba(255, 255, 255, 0.06);
    padding-top: 20px;
    text-align: center;
  }
  .footer {
    font-size: 12px;
    color: #475569;
    text-align: center;
    margin-top: 24px;
    font-weight: 500;
  }
`;

/**
 * Dispatches an email via the configured transporter. Logs fallbacks in local environment.
 */
const sendMail = async (options) => {
  const transporter = getTransporter();
  if (transporter) {
    try {
      await transporter.sendMail({
        from: FROM_EMAIL,
        ...options,
      });
      logger.info(`[SMTP] Email successfully dispatched to ${options.to}`);
      return true;
    } catch (error) {
      logger.error(`[SMTP ERROR] Failed sending to ${options.to}`, error);
      return false;
    }
  } else {
    // Development console fallback when SMTP is not configured
    console.log('\n┌────────────────────────────────────────────────────────┐');
    console.log('│  DEVELOPMENT EMAIL FALLBACK LOG                        │');
    console.log('├────────────────────────────────────────────────────────┤');
    console.log(`│ TO:      ${options.to.padEnd(46)}│`);
    console.log(`│ SUBJECT: ${options.subject.padEnd(46)}│`);
    console.log(`│ TEXT:    ${(options.text || '').replace(/\n/g, ' ').slice(0, 43).padEnd(46)}...│`);
    console.log('└────────────────────────────────────────────────────────┘\n');

    // Also write to a file in development so automated test flows can easily extract OTPs
    try {
      const logContent = `[${new Date().toISOString()}] TO: ${options.to} | SUBJECT: ${options.subject} | TEXT: ${options.text}\n`;
      fs.appendFileSync(path.join(process.cwd(), 'dev-email-log.txt'), logContent);
    } catch (err) {
      // Suppress logging write errors to console
    }

    return true;
  }
};

/**
 * 1. Sends Welcome Email
 */
export const sendWelcomeEmail = async (email, name) => {
  return sendMail({
    to: email,
    subject: 'Welcome to Only For Us! 💕',
    text: `Hi ${name},\n\nWelcome to Only For Us! We are excited to have you join our relationship platform.\n\nOnly For Us Team`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Welcome to Only For Us</title>
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800&display=swap" rel="stylesheet">
        <style>${baseStyles}</style>
      </head>
      <body>
        <div class="container">
          <div class="card">
            <div class="logo-container"><span class="logo-emoji">💕</span></div>
            <div class="app-name">Only For Us</div>
            <h2 class="title">Welcome, ${name}!</h2>
            <p class="greeting">
              We are absolutely thrilled to welcome you to <strong>Only For Us</strong>! <br><br>
              Our app is designed to help you and your partner build a private digital home where you can track habits, manage finances, record calendar events, message each other, and store your most cherished memories.
            </p>
            <p class="warning-text">
              Invite your partner to connect using your unique invitation code to unlock the full couple space!
            </p>
          </div>
          <div class="footer">Sent with 💕 by the Only For Us Team</div>
        </div>
      </body>
      </html>
    `,
  });
};

/**
 * 2. Sends Email Verification OTP
 */
export const sendOTPEmail = async (email, name, otp) => {
  return sendMail({
    to: email,
    subject: `Verify your account: ${otp} 💕`,
    text: `Hi ${name},\n\nYour 6-digit email verification code is: ${otp}\n\nThis code expires in 10 minutes.`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Verify your Email Address</title>
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800&display=swap" rel="stylesheet">
        <style>${baseStyles}</style>
      </head>
      <body>
        <div class="container">
          <div class="card">
            <div class="logo-container"><span class="logo-emoji">🔒</span></div>
            <div class="app-name">Only For Us</div>
            <h2 class="title">Verify Your Email</h2>
            <p class="greeting">
              Hi <strong>${name}</strong>,<br>
              To complete your account verification, please enter the following secure 6-digit verification code:
            </p>
            <div class="otp-container">
              <div class="otp-code">${otp}</div>
            </div>
            <p class="expiry-text">⏰ This verification code expires in 10 minutes.</p>
            <p class="warning-text">If you did not request this, you can safely ignore this email.</p>
          </div>
          <div class="footer">Sent with 💕 by the Only For Us Team</div>
        </div>
      </body>
      </html>
    `,
  });
};

/**
 * 3. Sends Password Reset Email
 */
export const sendPasswordResetEmail = async (email, name, resetUrl) => {
  return sendMail({
    to: email,
    subject: 'Reset your password 🔑',
    text: `Hi ${name},\n\nYou requested a password reset. Reset your password using the following link: ${resetUrl}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Reset Your Password</title>
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800&display=swap" rel="stylesheet">
        <style>${baseStyles}</style>
      </head>
      <body>
        <div class="container">
          <div class="card">
            <div class="logo-container"><span class="logo-emoji">🔑</span></div>
            <div class="app-name">Only For Us</div>
            <h2 class="title">Password Reset Request</h2>
            <p class="greeting">
              Hi <strong>${name}</strong>,<br>
              We received a request to reset the password for your account. Please click the button below to choose a new one:
            </p>
            <a href="${resetUrl}" class="action-btn">Reset Password</a>
            <p class="expiry-text">⏰ This link will expire in 1 hour.</p>
            <p class="warning-text">If you did not request a password reset, you can safely ignore this email.</p>
          </div>
          <div class="footer">Sent with 💕 by the Only For Us Team</div>
        </div>
      </body>
      </html>
    `,
  });
};

/**
 * 4. Sends Password Changed Notification Email
 */
export const sendPasswordChangedEmail = async (email, name) => {
  return sendMail({
    to: email,
    subject: 'Your password was changed 🔒',
    text: `Hi ${name},\n\nThis is a notification that the password for your Only For Us account has been successfully updated.`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Password Changed</title>
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800&display=swap" rel="stylesheet">
        <style>${baseStyles}</style>
      </head>
      <body>
        <div class="container">
          <div class="card">
            <div class="logo-container"><span class="logo-emoji">🔒</span></div>
            <div class="app-name">Only For Us</div>
            <h2 class="title">Password Updated</h2>
            <p class="greeting">
              Hi <strong>${name}</strong>,<br>
              The password for your Only For Us account was recently updated.<br><br>
              If you made this change, no action is required. If you did not make this change, please contact support immediately or reset your password.
            </p>
            <p class="warning-text">Account security is our top priority.</p>
          </div>
          <div class="footer">Sent with 💕 by the Only For Us Team</div>
        </div>
      </body>
      </html>
    `,
  });
};

/**
 * 5. Sends Invitation Accepted Email
 */
export const sendInvitationAcceptedEmail = async (email, name, partnerName) => {
  return sendMail({
    to: email,
    subject: 'Your partner accepted your invitation! 💖',
    text: `Hi ${name},\n\nGreat news! ${partnerName} has accepted your invitation. Your shared relationship space is now active!`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Invitation Accepted</title>
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800&display=swap" rel="stylesheet">
        <style>${baseStyles}</style>
      </head>
      <body>
        <div class="container">
          <div class="card">
            <div class="logo-container"><span class="logo-emoji">💖</span></div>
            <div class="app-name">Only For Us</div>
            <h2 class="title">Invitation Accepted!</h2>
            <p class="greeting">
              Hi <strong>${name}</strong>,<br>
              Wonderful news! <strong>${partnerName}</strong> entered your invitation code and connected to your account. Your shared relationship space is now fully active! <br><br>
              Log in now to begin organizing your lives together.
            </p>
            <p class="warning-text">💕 Welcome to your shared digital world.</p>
          </div>
          <div class="footer">Sent with 💕 by the Only For Us Team</div>
        </div>
      </body>
      </html>
    `,
  });
};
