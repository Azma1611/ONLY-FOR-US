import express from 'express';
import {
  getHabits,
  createHabit,
  updateHabit,
  toggleHabitDate,
  deleteHabit,
} from '../controllers/habit.controller.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = express.Router();

// All habit routes require authentication
router.get('/', protect, getHabits);
router.post('/', protect, createHabit);
router.patch('/:id', protect, updateHabit);
router.patch('/:id/toggle', protect, toggleHabitDate);
router.delete('/:id', protect, deleteHabit);

export default router;
