import { Router } from 'express';

import { authenticate } from '../middleware/auth';
import {
  createLead,
  deleteLead,
  listLeads,
  moveLead,
  updateLead,
} from '../controllers/leadsController';

const router = Router();

router.use(authenticate);
router.get('/', listLeads);
router.post('/', createLead);
router.put('/:id', updateLead);
router.delete('/:id', deleteLead);
router.put('/:id/move', moveLead);

export default router;
