import { Router } from 'express';
import { register, login, getMe, searchUsers } from '../controllers/authController';
import authMiddleware from '../middleware/auth';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', authMiddleware, getMe);
router.get('/search', authMiddleware, searchUsers);

export default router;