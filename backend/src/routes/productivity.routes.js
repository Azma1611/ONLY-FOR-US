import express from 'express';
import { protect } from '../middlewares/auth.middleware.js';
import { getProductivityItems, createProductivityItem, updateProductivityItem, deleteProductivityItem } from '../controllers/productivity.controller.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getProductivityItems)
  .post(createProductivityItem);

router.route('/:id')
  .put(updateProductivityItem)
  .delete(deleteProductivityItem);

export default router;
