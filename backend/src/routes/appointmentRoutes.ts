import { Router } from 'express';
import {
  getAppointments,
  createAppointment,
  updateAppointmentStatus,
  getAppointmentById,
  getAppointmentStats,
} from '../controllers/appointmentController';
import { authenticate, authorize } from '../middleware/authMiddleware';
import { UserRole } from '../types/enums';

const router = Router();

const allRoles = Object.values(UserRole);

router.get('/', authenticate, getAppointments);
router.get('/stats', authenticate, authorize(UserRole.SUPER_ADMIN, UserRole.MINISTRY_ADMIN, UserRole.HOSPITAL_ADMIN), getAppointmentStats);
router.get('/:id', authenticate, getAppointmentById);

router.post('/', authenticate, createAppointment);

router.patch(
  '/:id/status',
  authenticate,
  authorize(UserRole.SUPER_ADMIN, UserRole.MINISTRY_ADMIN, UserRole.HOSPITAL_ADMIN, UserRole.DOCTOR),
  updateAppointmentStatus
);

export default router;
