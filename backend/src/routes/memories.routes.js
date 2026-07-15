import express from 'express';
import {
  getMemories, createMemory, updateMemory, deleteMemory,
  getAlbums, createAlbum, deleteAlbum,
  getLoveLetters, createLoveLetter, updateLoveLetter, deleteLoveLetter,
  getMilestones, createMilestone, deleteMilestone
} from '../controllers/memories.controller.js';
import { protect } from '../middlewares/auth.middleware.js';
import { verifyRelationship } from '../middlewares/relationship.middleware.js';
import { upload } from '../services/upload.service.js';

const router = express.Router();

// All memory routes require authentication and an active relationship
router.use(protect);
router.use(verifyRelationship);

// Memories (using upload.single for files)
router.route('/')
  .get(getMemories)
  .post(upload.single('mediaFile'), createMemory);
  
router.route('/:id')
  .put(updateMemory)
  .delete(deleteMemory);

// Albums
router.route('/albums')
  .get(getAlbums)
  .post(createAlbum);

router.route('/albums/:id')
  .delete(deleteAlbum);

// Love Letters
router.route('/letters')
  .get(getLoveLetters)
  .post(createLoveLetter);

router.route('/letters/:id')
  .put(updateLoveLetter)
  .delete(deleteLoveLetter);

// Milestones
router.route('/milestones')
  .get(getMilestones)
  .post(createMilestone);

router.route('/milestones/:id')
  .delete(deleteMilestone);

export default router;
