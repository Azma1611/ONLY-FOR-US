import express from 'express';
import {
  getMessages,
  sendMessage,
  markAsSeen,
  deleteMessage,
  updateMessage,
} from '../controllers/message.controller.js';
import { protect } from '../middlewares/auth.middleware.js';
import { upload } from '../services/cloudinary.service.js';

const router = express.Router();

// All message routes require authentication
router.get('/', protect, getMessages);
router.post('/', protect, upload.single('attachment'), sendMessage);
router.patch('/:id/seen', protect, markAsSeen);
router.patch('/:id', protect, updateMessage);
router.delete('/:id', protect, deleteMessage);

export default router;
