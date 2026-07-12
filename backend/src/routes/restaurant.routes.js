import express from 'express';
import {
  getRestaurantPlans,
  createRestaurantPlan,
  updateRestaurantPlan,
  deleteRestaurantPlan,
} from '../controllers/restaurant.controller.js';
import { protect } from '../middlewares/auth.middleware.js';
import { verifyRelationship } from '../middlewares/relationship.middleware.js';

const router = express.Router();

router.use(protect);
router.use(verifyRelationship);

router.get('/', getRestaurantPlans);
router.post('/', createRestaurantPlan);
router.patch('/:id', updateRestaurantPlan);
router.delete('/:id', deleteRestaurantPlan);

export default router;
