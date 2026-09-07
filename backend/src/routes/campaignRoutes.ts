import { Router } from 'express';
import { authenticate, authorize, optionalAuth } from '../middleware/authMiddleware';
import { UserRole } from '../types/enums';
import {
  getCampaigns, getCampaignById, createCampaign, updateCampaign,
} from '../controllers/campaignController';

const router = Router();

router.get('/', optionalAuth, getCampaigns);
router.get('/:id', optionalAuth, getCampaignById);
router.post(
  '/',
  authenticate,
  authorize(UserRole.SUPER_ADMIN, UserRole.MINISTRY_ADMIN),
  createCampaign
);
router.patch(
  '/:id',
  authenticate,
  authorize(UserRole.SUPER_ADMIN, UserRole.MINISTRY_ADMIN),
  updateCampaign
);

export default router;
