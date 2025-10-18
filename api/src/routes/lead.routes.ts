import { Router } from 'express';

import { authenticate } from '../middleware/auth';
import {
  createLead,
  deleteLead,
  listLeads,
  moveLead,
  updateLead,
} from '../controllers/lead.controller';

const router = Router();

router.use(authenticate);
router.get('/', listLeads);
router.post('/', createLead);
router.put('/:id', updateLead);
router.delete('/:id', deleteLead);
router.put('/:id/move', moveLead);

export const leadRoutes = router;
