import express from 'express';
import {
  createRelationship,
  joinRelationship,
  getRelationship,
  updateRelationship,
} from '../controllers/relationship.controller.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = express.Router();

// All relationship routes require authentication
router.post('/create', protect, createRelationship);
router.post('/join', protect, joinRelationship);
router.get('/', protect, getRelationship);
router.patch('/', protect, updateRelationship);

export default router;
