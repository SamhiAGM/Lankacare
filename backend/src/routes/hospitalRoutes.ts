import { Router } from 'express';
import {
  getHospitals,
  getHospitalById,
  createHospital,
  updateHospital,
  getDashboardStats,
  getCapacityByRegion,
} from '../controllers/hospitalController';
import { authenticate, authorize } from '../middleware/authMiddleware';
import { UserRole } from '../types/enums';

const router = Router();

router.get('/', getHospitals);
router.get('/stats', getDashboardStats);
router.get('/capacity-by-region', getCapacityByRegion);
router.get('/:id', getHospitalById);

router.post(
  '/',
  authenticate,
  authorize(UserRole.SUPER_ADMIN, UserRole.MINISTRY_ADMIN),
  createHospital
);

router.patch(
  '/:id',
  authenticate,
  authorize(UserRole.SUPER_ADMIN, UserRole.MINISTRY_ADMIN, UserRole.HOSPITAL_ADMIN),
  updateHospital
);

export default router;
