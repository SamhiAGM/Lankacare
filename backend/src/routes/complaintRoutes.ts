import { Router } from 'express';
import { authenticate, authorize } from '../middleware/authMiddleware';
import { UserRole } from '../types/enums';
import {
  getComplaints,
  getComplaintById,
  createComplaint,
  updateComplaintStatus,
} from '../controllers/complaintController';

const router = Router();

router.use(authenticate);

router.get('/', getComplaints);
router.get('/:id', getComplaintById);
router.post('/', createComplaint);
router.patch(
  '/:id/status',
  authorize(UserRole.SUPER_ADMIN, UserRole.MINISTRY_ADMIN, UserRole.HOSPITAL_ADMIN),
  updateComplaintStatus
);

export default router;
