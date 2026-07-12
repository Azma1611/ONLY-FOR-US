import express from 'express';
import {
  getReminders,
  dismissReminder,
  deleteReminder,
} from '../controllers/reminder.controller.js';
import { protect } from '../middlewares/auth.middleware.js';
import { verifyRelationship } from '../middlewares/relationship.middleware.js';

const router = express.Router();

router.use(protect);
router.use(verifyRelationship);

router.get('/', getReminders);
router.patch('/:id/dismiss', dismissReminder);
router.delete('/:id', deleteReminder);

export default router;
