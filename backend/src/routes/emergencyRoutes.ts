import { Router } from 'express';
import {
  getEmergencies,
  createEmergency,
  updateEmergencyStatus,
  getEmergencyById,
  getActiveEmergencySummary,
} from '../controllers/emergencyController';
import { authenticate, authorize } from '../middleware/authMiddleware';
import { UserRole } from '../types/enums';

const router = Router();

router.get('/', authenticate, getEmergencies);
router.get('/summary', authenticate, getActiveEmergencySummary);
router.get('/:id', authenticate, getEmergencyById);

router.post(
  '/',
  authenticate,
  authorize(UserRole.SUPER_ADMIN, UserRole.MINISTRY_ADMIN, UserRole.HOSPITAL_ADMIN, UserRole.HEALTH_WORKER),
  createEmergency
);

router.patch(
  '/:id/status',
  authenticate,
  authorize(UserRole.SUPER_ADMIN, UserRole.MINISTRY_ADMIN, UserRole.HOSPITAL_ADMIN),
  updateEmergencyStatus
);

export default router;
