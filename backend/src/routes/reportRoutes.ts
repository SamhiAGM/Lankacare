import { Router } from 'express';
import { authenticate, authorize } from '../middleware/authMiddleware';
import { UserRole } from '../types/enums';
import {
  getHospitalUtilizationReport,
  getAppointmentReport,
  getMedicineShortageReport,
  getDiseaseReport,
  getComplaintReport,
  getRegionalHealthIndicators,
} from '../controllers/reportsController';

const router = Router();

router.use(authenticate);
router.use(authorize(UserRole.SUPER_ADMIN, UserRole.MINISTRY_ADMIN, UserRole.HOSPITAL_ADMIN));

router.get('/hospital-utilization', getHospitalUtilizationReport);
router.get('/appointments', getAppointmentReport);
router.get('/medicine-shortages', getMedicineShortageReport);
router.get('/disease-trends', getDiseaseReport);
router.get('/complaints', getComplaintReport);
router.get('/regional-health', getRegionalHealthIndicators);

export default router;
