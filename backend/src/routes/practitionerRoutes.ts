import { Router } from 'express';
import {
  getPractitionerBySlmc,
  getPractitionerAssignments,
  verifyPractitioner,
} from '../controllers/practitionerController';
import { authenticate, authorize } from '../middleware/authMiddleware';
import { UserRole } from '../types/enums';

const router = Router();

// Public routes
router.get('/:slmc', getPractitionerBySlmc);
router.get('/:id/assignments', getPractitionerAssignments);

// Admin routes
router.post(
  '/verify',
  authenticate,
  authorize(UserRole.SUPER_ADMIN, UserRole.MINISTRY_ADMIN, UserRole.DATA_ADMIN),
  verifyPractitioner
);

export default router;
