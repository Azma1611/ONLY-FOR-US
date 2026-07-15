import User from '../models/User.js';
import OTP from '../models/OTP.js';
import Session from '../models/Session.js';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../services/jwt.service.js';
import { createOTP, verifyOTP } from '../services/otp.service.js';
import { sendOTPEmail, sendPasswordResetEmail, sendPasswordChangedEmail, sendWelcomeEmail } from '../services/email.service.js';
import { generateInviteCode } from '../utils/generateInviteCode.js';
import { sendSuccess, sendError } from '../utils/response.js';
import logger from '../utils/logger.js';
import crypto from 'crypto';

/**
 * Parses browser details from user-agent string.
 */
const parseBrowser = (ua) => {
  if (!ua) return 'unknown';
  if (ua.includes('Firefox')) return 'Firefox';
  if (ua.includes('Chrome')) return 'Chrome';
  if (ua.includes('Safari')) return 'Safari';
  if (ua.includes('Edge')) return 'Edge';
  return 'Other';
};

/**
 * Parses device details from user-agent string.
 */
const parseDevice = (ua) => {
  if (!ua) return 'unknown';
  if (ua.includes('Mobile') || ua.includes('Android') || ua.includes('iPhone')) return 'Mobile';
  if (ua.includes('Tablet') || ua.includes('iPad')) return 'Tablet';
  return 'Desktop';
};

/**
 * POST /api/auth/register
 */
export const register = async (req, res, next) => {
  try {
    const { name, email, password, username } = req.body;

    // Check if user exists
    const emailExists = await User.findOne({ email });
    if (emailExists) {
      return sendError(res, 'An account already exists with this email address.', 400);
    }

    if (username) {
      const usernameExists = await User.findOne({ username });
      if (usernameExists) {
        return sendError(res, 'This username is already taken.', 400);
      }
    }

    // Generate custom unique pairing code
    let inviteCode = generateInviteCode();
    let codeExists = await User.findOne({ invitationCode: inviteCode });
    while (codeExists) {
      inviteCode = generateInviteCode();
      codeExists = await User.findOne({ invitationCode: inviteCode });
    }

    // Create unverified user account
    const user = await User.create({
      name,
      email,
      password,
      username: username || undefined,
      invitationCode: inviteCode,
      emailVerified: false,
    });

    logger.info(`User registered: ${user.name} <${user.email}>`);

    // Generate OTP & email it
    const otp = await createOTP(email, 'verification');
    await sendOTPEmail(email, name, otp);

    return sendSuccess(res, 'Registration successful! Verification code sent to your email.', {
      email: user.email,
    }, 201);
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/auth/login
 */
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).populate('relationshipId');
    if (!user) {
      return sendError(res, 'Invalid email or password credentials.', 401);
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return sendError(res, 'Invalid email or password credentials.', 401);
    }

    // Block logins for unverified email accounts
    if (!user.emailVerified) {
      return res.status(403).json({
        success: false,
        message: 'Please verify your email before continuing.',
        emailVerified: false,
        email: user.email,
      });
    }

    // Sign Access and Refresh JWTs
    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // Save session logs (multi-device tracking support)
    const ua = req.headers['user-agent'] || 'unknown';
    const browser = parseBrowser(ua);
    const device = parseDevice(ua);
    const ipAddress = req.ip || req.connection.remoteAddress || 'unknown';
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days matching token lifespan

    await Session.create({
      user: user._id,
      refreshToken,
      device,
      browser,
      ipAddress,
      expiresAt,
    });

    logger.info(`User logged in: ${user.name} <${user.email}>`);

    return sendSuccess(res, 'Login completed successfully.', {
      user,
      accessToken,
      refreshToken,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/auth/logout
 */
export const logout = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (refreshToken) {
      // Remove specific active session records matching token
      await Session.deleteOne({ refreshToken });
    }
    return sendSuccess(res, 'Logout completed successfully.');
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/auth/send-otp
 */
export const sendOTP = async (req, res, next) => {
  try {
    const { email, purpose } = req.body;
    if (!email || !purpose) {
      return sendError(res, 'Email and purpose fields are required.', 400);
    }

    const user = await User.findOne({ email });
    if (!user) {
      return sendError(res, 'User account matching this email was not found.', 404);
    }

    const otp = await createOTP(email, purpose);
    await sendOTPEmail(email, user.name, otp);

    return sendSuccess(res, 'Verification code sent successfully.');
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/auth/verify-otp
 */
export const verifyOTPEndpoint = async (req, res, next) => {
  try {
    const { email, otp, purpose } = req.body;
    if (!email || !otp || !purpose) {
      return sendError(res, 'Email, OTP code, and purpose fields are required.', 400);
    }

    const user = await User.findOne({ email });
    if (!user) {
      return sendError(res, 'User account matching this email was not found.', 404);
    }

    const isValid = await verifyOTP(email, otp, purpose);
    if (!isValid) {
      return sendError(res, 'Invalid or expired verification code.', 400);
    }

    // If verification was for registering, set account as emailVerified
    if (purpose === 'verification') {
      user.emailVerified = true;
      await user.save();
      await sendWelcomeEmail(user.email, user.name);

      // Sign tokens to auto-login verified users
      const accessToken = generateAccessToken(user._id);
      const refreshToken = generateRefreshToken(user._id);

      const ua = req.headers['user-agent'] || 'unknown';
      await Session.create({
        user: user._id,
        refreshToken,
        device: parseDevice(ua),
        browser: parseBrowser(ua),
        ipAddress: req.ip || 'unknown',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      });

      return sendSuccess(res, 'Account verified and activated successfully!', {
        user,
        accessToken,
        refreshToken,
      });
    }

    return sendSuccess(res, 'OTP verification successful.');
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/auth/resend-otp
 */
export const resendOTP = async (req, res, next) => {
  try {
    const { email, purpose } = req.body;
    if (!email || !purpose) {
      return sendError(res, 'Email and purpose fields are required.', 400);
    }

    const user = await User.findOne({ email });
    if (!user) {
      return sendError(res, 'User account matching this email was not found.', 404);
    }

    const otp = await createOTP(email, purpose);
    await sendOTPEmail(email, user.name, otp);

    return sendSuccess(res, 'A new verification code has been dispatched.');
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/auth/forgot-password
 */
export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    // Secure design: return success state even if account is not found to prevent user enumeration
    const genericSuccess = 'If an account matches that email, a password reset link has been dispatched.';
    if (!user) {
      return sendSuccess(res, genericSuccess);
    }

    // Generate random token for reset URL link
    const resetToken = crypto.randomBytes(32).toString('hex');
    
    // Save to OTP model as token reset
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await OTP.deleteMany({ email, purpose: 'reset_password' });
    await OTP.create({
      email,
      otp: resetToken,
      purpose: 'reset_password',
      expiresAt,
    });

    const clientUrl = process.env.FRONTEND_URL;
    const resetUrl = `${clientUrl}/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`;

    await sendPasswordResetEmail(email, user.name, resetUrl);

    return sendSuccess(res, genericSuccess);
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/auth/reset-password
 */
export const resetPassword = async (req, res, next) => {
  try {
    const { token, email, password } = req.body;

    const otpRecord = await OTP.findOne({
      email,
      purpose: 'reset_password',
      expiresAt: { $gt: new Date() },
    });

    if (!otpRecord) {
      return sendError(res, 'Invalid or expired password reset token.', 400);
    }

    const isMatch = await otpRecord.compareOTP(token);
    if (!isMatch) {
      return sendError(res, 'Invalid or expired password reset token.', 400);
    }

    // Reset password
    const user = await User.findOne({ email });
    if (!user) {
      return sendError(res, 'Account not found.', 404);
    }

    user.password = password;
    await user.save();

    // Clean up OTP token
    await OTP.deleteOne({ _id: otpRecord._id });

    // Invalidate all active sessions for security
    await Session.deleteMany({ user: user._id });

    await sendPasswordChangedEmail(email, user.name);

    return sendSuccess(res, 'Your password has been successfully reset! You can now log in.');
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/auth/refresh-token
 */
export const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken: clientToken } = req.body;
    if (!clientToken) {
      return sendError(res, 'Refresh token is required.', 400);
    }

    const savedSession = await Session.findOne({ refreshToken: clientToken });
    if (!savedSession) {
      return sendError(res, 'Session expired or invalid.', 401);
    }

    // Verify token payload
    let decoded;
    try {
      decoded = verifyRefreshToken(clientToken);
    } catch (err) {
      await Session.deleteOne({ _id: savedSession._id });
      return sendError(res, 'Invalid refresh token.', 401);
    }

    // Token Rotation logic: delete old session token
    await Session.deleteOne({ _id: savedSession._id });

    const user = await User.findById(decoded.id).populate('relationshipId');
    if (!user) {
      return sendError(res, 'User account not found.', 401);
    }

    // Sign new pair of tokens
    const newAccessToken = generateAccessToken(user._id);
    const newRefreshToken = generateRefreshToken(user._id);

    // Save rotated session log
    const ua = req.headers['user-agent'] || 'unknown';
    await Session.create({
      user: user._id,
      refreshToken: newRefreshToken,
      device: parseDevice(ua),
      browser: parseBrowser(ua),
      ipAddress: req.ip || 'unknown',
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    return sendSuccess(res, 'Token rotation successful.', {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/auth/me
 */
export const getMe = async (req, res, next) => {
  try {
    // User already attached via protect middleware
    const user = await User.findById(req.user._id).populate('relationshipId');
    return sendSuccess(res, 'User profile fetched.', { user });
  } catch (error) {
    next(error);
  }
};
