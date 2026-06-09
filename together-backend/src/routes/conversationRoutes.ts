import { Router } from 'express';
import { getConversations, createDirect, createGroup } from '../controllers/conversationController';
import authMiddleware from '../middleware/auth';

const router = Router();

router.use(authMiddleware);
router.get('/', getConversations);
router.post('/direct', createDirect);
router.post('/group', createGroup);

export default router;