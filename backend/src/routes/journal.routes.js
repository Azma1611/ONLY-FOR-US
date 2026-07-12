import express from 'express';
import {
  getJournals,
  createJournal,
  updateJournal,
  deleteJournal,
} from '../controllers/journal.controller.js';
import { protect } from '../middlewares/auth.middleware.js';
import { upload } from '../services/cloudinary.service.js';

const router = express.Router();

// All journal routes require authentication
router.get('/', protect, getJournals);
router.post('/', protect, upload.array('images', 5), createJournal); // support up to 5 images per entry
router.patch('/:id', protect, upload.array('images', 5), updateJournal);
router.delete('/:id', protect, deleteJournal);

export default router;
