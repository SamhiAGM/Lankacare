import { Router } from 'express';
import { authenticate, authorize } from '../middleware/authMiddleware';
import { UserRole } from '../types/enums';
import {
  getMedicines,
  getMedicineById,
  updateInventory,
  getShortages,
  getMedicineCategories,
  getMedicineStats,
} from '../controllers/medicineController';

const router = Router();

router.use(authenticate);

router.get('/', getMedicines);
router.get('/shortages', getShortages);
router.get('/categories', getMedicineCategories);
router.get('/stats', getMedicineStats);
router.get('/:id', getMedicineById);
router.patch(
  '/:id',
  authorize(UserRole.SUPER_ADMIN, UserRole.MINISTRY_ADMIN, UserRole.HOSPITAL_ADMIN),
  updateInventory
);

export default router;
