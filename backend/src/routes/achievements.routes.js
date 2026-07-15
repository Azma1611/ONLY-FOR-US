import express from 'express';
import { protect } from '../middlewares/auth.middleware.js';
import { getAchievements, unlockAchievement } from '../controllers/achievements.controller.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getAchievements)
  .post(unlockAchievement);

export default router;
