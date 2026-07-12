import express from 'express';
import {
  getProfile,
  updateProfile,
  updateAvatar,
  deleteAccount,
} from '../controllers/user.controller.js';
import { protect } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validation.middleware.js';
import { validateUpdateProfile } from '../validators/user.validator.js';
import { upload } from '../services/cloudinary.service.js';

const router = express.Router();

// All user routes require authentication
router.get('/profile', protect, getProfile);
router.patch('/profile', protect, validateUpdateProfile, validate, updateProfile);
router.patch('/avatar', protect, upload.single('avatar'), updateAvatar);
router.delete('/account', protect, deleteAccount);

export default router;
