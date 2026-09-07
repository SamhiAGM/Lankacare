import { Router } from 'express';
import { authenticate, authorize, optionalAuth } from '../middleware/authMiddleware';
import { UserRole } from '../types/enums';
import {
  getAnnouncements,
  getAnnouncementById,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
} from '../controllers/announcementController';

const router = Router();

// Public: get published announcements (optional auth)
router.get('/', optionalAuth, getAnnouncements);
router.get('/:id', optionalAuth, getAnnouncementById);

// Admin-only actions
router.post(
  '/',
  authenticate,
  authorize(UserRole.SUPER_ADMIN, UserRole.MINISTRY_ADMIN),
  createAnnouncement
);
router.patch(
  '/:id',
  authenticate,
  authorize(UserRole.SUPER_ADMIN, UserRole.MINISTRY_ADMIN),
  updateAnnouncement
);
router.delete(
  '/:id',
  authenticate,
  authorize(UserRole.SUPER_ADMIN),
  deleteAnnouncement
);

export default router;
