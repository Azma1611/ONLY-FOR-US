import express from 'express';
import { protect, verifyRelationship } from '../middleware/auth.middleware.js';
import { upload } from '../services/cloudinary.service.js';
import {
  uploadMedia,
  getMedia,
  downloadMedia,
  toggleFavorite,
  deleteMedia,
  markViewed
} from '../controllers/media.controller.js';

const router = express.Router();

// All media routes require authentication and a valid relationship
router.use(protect);
router.use(verifyRelationship);

router.post('/upload', upload.single('file'), uploadMedia);
router.get('/', getMedia);
router.get('/download/:id', downloadMedia);
router.patch('/favorite/:id', toggleFavorite);
router.patch('/viewed/:id', markViewed);
router.delete('/:id', deleteMedia);

export default router;
