import { Router } from 'express';
import {
  getReferrals,
  createReferral,
  updateReferralStatus,
  getReferralById,
} from '../controllers/referralController';
import { authenticate, authorize } from '../middleware/authMiddleware';
import { UserRole } from '../types/enums';

const router = Router();

router.get('/', authenticate, getReferrals);
router.get('/:id', authenticate, getReferralById);

router.post(
  '/',
  authenticate,
  authorize(UserRole.SUPER_ADMIN, UserRole.MINISTRY_ADMIN, UserRole.HOSPITAL_ADMIN, UserRole.DOCTOR),
  createReferral
);

router.patch(
  '/:id/status',
  authenticate,
  authorize(UserRole.SUPER_ADMIN, UserRole.MINISTRY_ADMIN, UserRole.HOSPITAL_ADMIN, UserRole.DOCTOR),
  updateReferralStatus
);

export default router;
