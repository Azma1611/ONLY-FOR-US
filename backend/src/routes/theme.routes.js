import express from 'express';
import { getTheme, updateTheme } from '../controllers/theme.controller.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = express.Router();

// All theme routes require authentication
router.get('/', protect, getTheme);
router.put('/', protect, updateTheme);

export default router;
