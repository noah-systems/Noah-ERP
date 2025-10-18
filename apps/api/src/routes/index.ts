import { Router } from 'express';

import { authRoutes } from './auth.routes';
import { leadRoutes } from './lead.routes';
import { opportunityRoutes } from './opportunity.routes';
import { implementationRoutes } from './implementation.routes';
import { cancellationRoutes } from './cancellation.routes';
import { healthRoutes } from './health.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/leads', leadRoutes);
router.use('/opps', opportunityRoutes);
router.use('/implants', implementationRoutes);
router.use('/cancellations', cancellationRoutes);
router.use('/health', healthRoutes);

export const apiRoutes = router;
