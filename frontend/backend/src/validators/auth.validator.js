import { body } from 'express-validator';

/**
 * Validation schema rules for User Registration.
 */
export const validateRegister = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name field is required.')
    .isLength({ min: 2 }).withMessage('Name must be at least 2 characters long.'),
  body('email')
    .trim()
    .isEmail().withMessage('Please specify a valid email address.'),
  body('password')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters long.')
    .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter.')
    .matches(/[0-9]/).withMessage('Password must contain at least one numeric digit.'),
  body('username')
    .optional()
    .trim()
    .isLength({ min: 3 }).withMessage('Username must be at least 3 characters long.')
    .isAlphanumeric().withMessage('Username must be alphanumeric with no symbols.'),
];

/**
 * Validation schema rules for User Login.
 */
export const validateLogin = [
  body('email')
    .trim()
    .isEmail().withMessage('Please specify a valid email address.'),
  body('password')
    .notEmpty().withMessage('Password is required.'),
];

/**
 * Validation schema rules for Password Reset Requests.
 */
export const validateForgotPassword = [
  body('email')
    .trim()
    .isEmail().withMessage('Please specify a valid email address.'),
];

/**
 * Validation schema rules for Password Reset.
 */
export const validateResetPassword = [
  body('token')
    .trim()
    .notEmpty().withMessage('Reset token is required.'),
  body('password')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters long.')
    .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter.')
    .matches(/[0-9]/).withMessage('Password must contain at least one numeric digit.'),
];

/**
 * Validation schema rules for OTP verification.
 */
export const validateOTP = [
  body('email')
    .trim()
    .isEmail().withMessage('Please specify a valid email address.'),
  body('otp')
    .trim()
    .isLength({ min: 6, max: 6 }).withMessage('OTP code must be exactly 6 digits long.')
    .isNumeric().withMessage('OTP code must be numeric.'),
];
