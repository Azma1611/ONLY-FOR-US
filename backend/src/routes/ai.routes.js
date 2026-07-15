import express from 'express';
import { protect } from '../middlewares/auth.middleware.js';
import { 
  getConversations, 
  createConversation, 
  deleteConversation,
  getMessages,
  chatStream,
  generateSummary
} from '../controllers/ai.controller.js';

const router = express.Router();

router.use(protect);

router.route('/conversations')
  .get(getConversations)
  .post(createConversation);

router.route('/conversations/:id')
  .delete(deleteConversation);

router.route('/conversations/:id/messages')
  .get(getMessages);

router.post('/chat/stream', chatStream);

router.post('/summary', generateSummary);

export default router;
