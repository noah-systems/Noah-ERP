import { Router } from 'express';

import authRoutes from './auth';
import cancellationRoutes from './cancellations';
import implementationRoutes from './implementations';
import leadRoutes from './leads';
import opportunityRoutes from './opportunities';
import { healthCheck } from '../controllers/healthController';

const router = Router();

router.get('/health', healthCheck);
router.use('/auth', authRoutes);
router.use('/leads', leadRoutes);
router.use('/opps', opportunityRoutes);
router.use('/implants', implementationRoutes);
router.use('/cancellations', cancellationRoutes);

export default router;
