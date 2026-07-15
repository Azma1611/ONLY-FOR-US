import express from 'express';
import { protect } from '../middlewares/auth.middleware.js';
import { verifyRelationship } from '../middlewares/relationship.middleware.js';
import { getReminders, createReminder, updateReminder, deleteReminder } from '../controllers/reminders.controller.js';

const router = express.Router();

router.use(protect);
router.use(verifyRelationship);

router.route('/')
  .get(getReminders)
  .post(createReminder);

router.route('/:id')
  .put(updateReminder)
  .delete(deleteReminder);

export default router;
