import { body } from 'express-validator';

/**
 * Validation schema rules for updating User profiles.
 */
export const validateUpdateProfile = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2 }).withMessage('Name must be at least 2 characters long.'),
  body('username')
    .optional()
    .trim()
    .isLength({ min: 3 }).withMessage('Username must be at least 3 characters long.')
    .isAlphanumeric().withMessage('Username must be alphanumeric with no symbols.'),
  body('bio')
    .optional()
    .trim()
    .isLength({ max: 160 }).withMessage('Bio description cannot exceed 160 characters.'),
  body('phone')
    .optional()
    .trim()
    .isMobilePhone().withMessage('Please specify a valid mobile phone number.'),
  body('theme')
    .optional()
    .isIn(['light', 'dark', 'auto']).withMessage('Theme selection must be one of: light, dark, or auto.'),
  body('language')
    .optional()
    .trim(),
  body('notificationSettings')
    .optional()
    .isObject().withMessage('Notification settings parameter must be an object.'),
];
