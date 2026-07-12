import express from 'express';
import {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
} from '../controllers/task.controller.js';
import { protect } from '../middlewares/auth.middleware.js';
import { verifyRelationship } from '../middlewares/relationship.middleware.js';

const router = express.Router();

router.use(protect);
router.use(verifyRelationship);

router.get('/', getTasks);
router.post('/', createTask);
router.patch('/:id', updateTask);
router.delete('/:id', deleteTask);

export default router;
