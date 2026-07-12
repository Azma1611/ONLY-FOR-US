import express from 'express';
import {
  getTravelPlans,
  createTravelPlan,
  updateTravelPlan,
  deleteTravelPlan,
} from '../controllers/travel.controller.js';
import { protect } from '../middlewares/auth.middleware.js';
import { verifyRelationship } from '../middlewares/relationship.middleware.js';

const router = express.Router();

router.use(protect);
router.use(verifyRelationship);

router.get('/', getTravelPlans);
router.post('/', createTravelPlan);
router.patch('/:id', updateTravelPlan);
router.delete('/:id', deleteTravelPlan);

export default router;
