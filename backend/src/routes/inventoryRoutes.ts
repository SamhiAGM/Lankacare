import { Router } from 'express';
import {
  getHospitalInventory,
  updateMedicineStock,
} from '../controllers/inventoryController';
import { authenticate, authorize } from '../middleware/authMiddleware';
import { UserRole } from '../types/enums';

const router = Router();

// Staff routes (requires authorization middleware check for same-hospital access which is handled in authMiddleware)
router.get(
  '/:hospitalId/medicines',
  authenticate,
  authorize(UserRole.SUPER_ADMIN, UserRole.MINISTRY_ADMIN, UserRole.HOSPITAL_ADMIN, UserRole.PHARMACIST, UserRole.DOCTOR),
  getHospitalInventory
);

router.patch(
  '/:hospitalId/medicines/:medicineId',
  authenticate,
  authorize(UserRole.SUPER_ADMIN, UserRole.HOSPITAL_ADMIN, UserRole.PHARMACIST),
  updateMedicineStock
);

export default router;
