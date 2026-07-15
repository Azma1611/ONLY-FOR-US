import express from 'express';
import { protect } from '../middlewares/auth.middleware.js';
import { verifyRelationship } from '../middlewares/relationship.middleware.js';
import { pushOfflineQueue, getSyncStatus } from '../controllers/sync.controller.js';

const router = express.Router();

router.use(protect);
router.use(verifyRelationship);

router.post('/push', pushOfflineQueue);
router.get('/status', getSyncStatus);

export default router;
