import express from 'express';
import {
  getShoppingList,
  createShoppingItem,
  updateShoppingItem,
  deleteShoppingItem,
} from '../controllers/shopping.controller.js';
import { protect } from '../middlewares/auth.middleware.js';
import { verifyRelationship } from '../middlewares/relationship.middleware.js';

const router = express.Router();

router.use(protect);
router.use(verifyRelationship);

router.get('/', getShoppingList);
router.post('/', createShoppingItem);
router.patch('/:id', updateShoppingItem);
router.delete('/:id', deleteShoppingItem);

export default router;
