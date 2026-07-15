import express from 'express';
import { protect } from '../middlewares/auth.middleware.js';
import { getGoals, createGoal, updateGoal, deleteGoal } from '../controllers/goals.controller.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getGoals)
  .post(createGoal);

router.route('/:id')
  .put(updateGoal)
  .delete(deleteGoal);

export default router;
