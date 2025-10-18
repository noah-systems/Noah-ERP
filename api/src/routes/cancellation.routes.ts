import { Router } from 'express';

import { authenticate } from '../middleware/auth';
import { createCancellation, listCancellations } from '../controllers/cancellation.controller';

const router = Router();

router.use(authenticate);
router.get('/', listCancellations);
router.post('/', createCancellation);

export const cancellationRoutes = router;
