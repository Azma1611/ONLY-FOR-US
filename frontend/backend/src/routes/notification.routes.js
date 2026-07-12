import express from 'express';
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  createNotification,
} from '../controllers/notification.controller.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = express.Router();

// All notification routes require authentication
router.get('/', protect, getNotifications);
router.post('/', protect, createNotification);
router.patch('/read-all', protect, markAllAsRead);
router.patch('/:id/read', protect, markAsRead);
router.delete('/:id', protect, deleteNotification);

export default router;
