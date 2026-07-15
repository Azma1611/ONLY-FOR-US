import express from 'express';
import { protect } from '../middlewares/auth.middleware.js';
import { verifyRelationship } from '../middlewares/relationship.middleware.js';
import { getCalendarAuthUrl, handleCalendarCallback, exportData } from '../controllers/integrations.controller.js';

const router = express.Router();

router.get('/google/auth', protect, getCalendarAuthUrl);
router.get('/google/callback', handleCalendarCallback); // Open for OAuth redirect
router.get('/export', protect, verifyRelationship, exportData);

export default router;
