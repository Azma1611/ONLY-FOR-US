import rateLimit from 'express-rate-limit';

/**
 * Global rate limiter: limits overall requests from an IP to 200 per 15 minutes.
 */
export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 200 : 5000,
  message: {
    success: false,
    message: 'Too many requests from this IP. Please try again in 15 minutes.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Authentication rate limiter: limits login/register/verification attempts.
 */
export const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: process.env.NODE_ENV === 'production' ? 15 : 1000,
  message: {
    success: false,
    message: 'Too many authentication attempts. Please try again after an hour.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});
