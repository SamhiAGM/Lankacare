import { Router } from 'express';
import {
  getDoctors,
  getDoctorById,
  getDoctorsByHospital,
  updateDoctorAvailability,
} from '../controllers/doctorController';
import { authenticate, authorize } from '../middleware/authMiddleware';
import { UserRole } from '../types/enums';

const router = Router();

router.get('/', getDoctors);
router.get('/:id', getDoctorById);
router.get('/hospital/:hospitalId', getDoctorsByHospital);
router.patch(
  '/:id/availability',
  authenticate,
  authorize(UserRole.SUPER_ADMIN, UserRole.MINISTRY_ADMIN, UserRole.HOSPITAL_ADMIN, UserRole.DOCTOR),
  updateDoctorAvailability
);

export default router;
