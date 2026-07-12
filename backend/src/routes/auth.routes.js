import express from 'express';
import {
  register,
  login,
  logout,
  sendOTP,
  verifyOTPEndpoint,
  resendOTP,
  forgotPassword,
  resetPassword,
  refreshToken,
  getMe,
} from '../controllers/auth.controller.js';
import { protect } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validation.middleware.js';
import { authLimiter } from '../middlewares/rateLimiter.js';
import {
  validateRegister,
  validateLogin,
  validateForgotPassword,
  validateResetPassword,
  validateOTP,
} from '../validators/auth.validator.js';

const router = express.Router();

// Public auth endpoints with validation & throttling limiters
router.post('/register', authLimiter, validateRegister, validate, register);
router.post('/login', authLimiter, validateLogin, validate, login);
router.post('/logout', logout);
router.post('/send-otp', authLimiter, sendOTP);
router.post('/verify-otp', authLimiter, validateOTP, validate, verifyOTPEndpoint);
router.post('/resend-otp', authLimiter, resendOTP);
router.post('/forgot-password', authLimiter, validateForgotPassword, validate, forgotPassword);
router.post('/reset-password', authLimiter, validateResetPassword, validate, resetPassword);
router.post('/refresh-token', refreshToken);

// Protected auth endpoints
router.get('/me', protect, getMe);

export default router;
