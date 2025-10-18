import { Router } from 'express';

import { authenticate } from '../middleware/auth';
import { createCancellation, listCancellations } from '../controllers/cancellationController';

const router = Router();

router.use(authenticate);
router.get('/', listCancellations);
router.post('/', createCancellation);

export default router;
