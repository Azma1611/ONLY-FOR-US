import express from 'express';
import {
  getEvents,
  createEvent,
  updateEvent,
  deleteEvent,
} from '../controllers/calendar.controller.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = express.Router();

// All calendar routes require authentication
router.get('/', protect, getEvents);
router.post('/', protect, createEvent);
router.patch('/:id', protect, updateEvent);
router.delete('/:id', protect, deleteEvent);

export default router;
