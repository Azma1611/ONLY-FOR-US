import express from 'express';
import { protect } from '../middlewares/auth.middleware.js';
import { getHabits, createHabit, updateHabit, deleteHabit, logHabit } from '../controllers/habits.controller.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getHabits)
  .post(createHabit);

router.route('/:id')
  .put(updateHabit)
  .delete(deleteHabit);

router.post('/:id/log', logHabit);

export default router;
