import express from 'express';
import {
  getChatMessages,
  createChatMessage,
  deleteChatMessage,
  editChatMessage,
  uploadChatFile,
} from '../controllers/chat.controller.js';
import { protect } from '../middlewares/auth.middleware.js';
import { verifyRelationship } from '../middlewares/relationship.middleware.js';
import { upload } from '../services/cloudinary.service.js';

const router = express.Router();

// Apply auth protection & relationship connection check to all chat endpoints
router.use(protect);
router.use(verifyRelationship);

router.get('/messages', getChatMessages);
router.post('/message', createChatMessage);
router.delete('/message/:id', deleteChatMessage);
router.patch('/message/:id', editChatMessage);
router.post('/upload', upload.single('file'), uploadChatFile);

export default router;
