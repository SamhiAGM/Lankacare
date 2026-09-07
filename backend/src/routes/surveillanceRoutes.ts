import { Router } from 'express';
import {
  getDiseaseReports,
  createDiseaseReport,
  getSurveillanceSummary,
} from '../controllers/surveillanceController';
import { authenticate, authorize } from '../middleware/authMiddleware';
import { UserRole } from '../types/enums';

const router = Router();

router.get('/', getDiseaseReports);
router.get('/summary', getSurveillanceSummary);

router.post(
  '/',
  authenticate,
  authorize(UserRole.SUPER_ADMIN, UserRole.MINISTRY_ADMIN, UserRole.HOSPITAL_ADMIN, UserRole.HEALTH_WORKER),
  createDiseaseReport
);

export default router;
