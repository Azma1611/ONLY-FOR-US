import express from 'express';
import {
  getMemories,
  createMemory,
  updateMemory,
  deleteMemory,
} from '../controllers/memory.controller.js';
import { protect } from '../middlewares/auth.middleware.js';
import { upload } from '../services/cloudinary.service.js';

const router = express.Router();

// All memory routes require authentication
router.get('/', protect, getMemories);
router.post(
  '/',
  protect,
  upload.fields([
    { name: 'photos', maxCount: 5 },
    { name: 'videos', maxCount: 2 },
  ]),
  createMemory
);
router.patch(
  '/:id',
  protect,
  upload.fields([
    { name: 'photos', maxCount: 5 },
    { name: 'videos', maxCount: 2 },
  ]),
  updateMemory
);
router.delete('/:id', protect, deleteMemory);

export default router;
