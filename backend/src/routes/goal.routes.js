import express from 'express';
import {
  getGoals,
  createGoal,
  updateGoal,
  deleteGoal,
} from '../controllers/goal.controller.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = express.Router();

// All goal routes require authentication
router.get('/', protect, getGoals);
router.post('/', protect, createGoal);
router.patch('/:id', protect, updateGoal);
router.delete('/:id', protect, deleteGoal);

export default router;
