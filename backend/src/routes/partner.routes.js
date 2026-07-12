import express from 'express';
import {
  createInviteCode,
  getActiveInvite,
  joinPartner,
  getPartnerStatus,
  disconnectPartner,
  regenerateInviteCode,
} from '../controllers/partner.controller.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = express.Router();

// All partner/relationship pairing APIs require authentication
router.post('/create-invite', protect, createInviteCode);
router.get('/my-invite', protect, getActiveInvite);
router.post('/join', protect, joinPartner);
router.get('/status', protect, getPartnerStatus);
router.delete('/disconnect', protect, disconnectPartner);
router.post('/regenerate', protect, regenerateInviteCode);

export default router;
