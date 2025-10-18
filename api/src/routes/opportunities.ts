import { Router } from 'express';

import { authenticate } from '../middleware/auth';
import {
  createOpportunity,
  deleteOpportunity,
  listOpportunities,
  moveOpportunity,
  updateOpportunity,
} from '../controllers/opportunitiesController';

const router = Router();

router.use(authenticate);
router.get('/', listOpportunities);
router.post('/', createOpportunity);
router.put('/:id', updateOpportunity);
router.delete('/:id', deleteOpportunity);
router.put('/:id/move', moveOpportunity);

export default router;
