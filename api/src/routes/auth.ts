import { Router } from 'express';

import { authenticate } from '../middleware/auth';
import { login, logout, me } from '../controllers/authController';

const router = Router();

router.post('/login', login);
router.post('/logout', authenticate, logout);
router.get('/me', authenticate, me);

export default router;
