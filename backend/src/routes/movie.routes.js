import express from 'express';
import {
  getMoviePlans,
  createMoviePlan,
  updateMoviePlan,
  deleteMoviePlan,
} from '../controllers/movie.controller.js';
import { protect } from '../middlewares/auth.middleware.js';
import { verifyRelationship } from '../middlewares/relationship.middleware.js';

const router = express.Router();

router.use(protect);
router.use(verifyRelationship);

router.get('/', getMoviePlans);
router.post('/', createMoviePlan);
router.patch('/:id', updateMoviePlan);
router.delete('/:id', deleteMoviePlan);

export default router;
