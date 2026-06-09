import { Router } from 'express';
import { getMessages, sendMessage, deleteMessage } from '../controllers/messageController';
import authMiddleware from '../middleware/auth';

const router = Router();

router.use(authMiddleware);
router.get('/:conversationId', getMessages);
router.post('/', sendMessage);
router.delete('/:messageId', deleteMessage);

export default router;