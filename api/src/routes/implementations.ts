import { Router } from 'express';

import { authenticate } from '../middleware/auth';
import {
  createImplementation,
  listImplementations,
  updateImplementation,
} from '../controllers/implementationController';

const router = Router();

router.use(authenticate);
router.get('/', listImplementations);
router.post('/', createImplementation);
router.put('/:id', updateImplementation);

export default router;
