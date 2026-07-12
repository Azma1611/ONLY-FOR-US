import express from 'express';
import {
  getWishlist,
  createWishlistItem,
  updateWishlistItem,
  deleteWishlistItem,
} from '../controllers/wishlist.controller.js';
import { protect } from '../middlewares/auth.middleware.js';
import { upload } from '../services/cloudinary.service.js';

const router = express.Router();

// All wishlist routes require authentication
router.get('/', protect, getWishlist);
router.post('/', protect, upload.single('image'), createWishlistItem);
router.patch('/:id', protect, upload.single('image'), updateWishlistItem);
router.delete('/:id', protect, deleteWishlistItem);

export default router;
