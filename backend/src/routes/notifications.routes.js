import express from 'express';
import { protect } from '../middlewares/auth.middleware.js';
import { verifyRelationship } from '../middlewares/relationship.middleware.js';
import { getNotifications, markAsRead, markAllAsRead, deleteNotification, subscribeToPush } from '../controllers/notifications.controller.js';

const router = express.Router();

router.use(protect);
router.use(verifyRelationship);

router.get('/', getNotifications);
router.patch('/read-all', markAllAsRead);
router.patch('/:id/read', markAsRead);
router.delete('/:id', deleteNotification);

// Push subscription
router.post('/subscribe', subscribeToPush);

export default router;
