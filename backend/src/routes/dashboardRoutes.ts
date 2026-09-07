import { Router } from 'express';
import { getDashboardOverview, getGlobalSearch, getAuditLogs } from '../controllers/dashboardController';
import { authenticate, authorize } from '../middleware/authMiddleware';
import { UserRole } from '../types/enums';

const router = Router();

router.get('/overview', authenticate, getDashboardOverview);
router.get('/search', authenticate, getGlobalSearch);
router.get(
  '/audit-logs',
  authenticate,
  authorize(UserRole.SUPER_ADMIN, UserRole.MINISTRY_ADMIN),
  getAuditLogs
);

export default router;
