import { Router } from 'express';
import {
  requestToken,
  getMyTokens,
  getQueueStatus,
} from '../controllers/queueController';
import { authenticate, authorize } from '../middleware/authMiddleware';
import { UserRole } from '../types/enums';

const router = Router();

// Public crowd status
router.get('/:hospitalId/:department/status', getQueueStatus);

// Citizen routes
router.post('/token', authenticate, authorize(UserRole.CITIZEN), requestToken);
router.get('/my-tokens', authenticate, authorize(UserRole.CITIZEN), getMyTokens);

export default router;
