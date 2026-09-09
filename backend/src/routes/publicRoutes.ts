import { Router } from 'express';
import {
  getPublicHospitals,
  getPublicHospitalById,
  getHospitalsNear,
  getDistricts,
  getProvinces,
  getMedicineAvailability,
  submitDataCorrection,
} from '../controllers/publicController';
import rateLimit from 'express-rate-limit';

const router = Router();

// ── Rate Limiting for Public Endpoints ────────────────────────────────────────
const publicLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
  message: { success: false, message: 'Too many requests. Please try again later.' },
});

const dataCorrectionLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // Limit each IP to 5 data correction reports per hour
  message: { success: false, message: 'Too many reports submitted. Please try again later.' },
});

router.use(publicLimiter);

// ── Geography ─────────────────────────────────────────────────────────────────
router.get('/provinces', getProvinces);
router.get('/districts', getDistricts);

// ── Hospitals ─────────────────────────────────────────────────────────────────
router.get('/hospitals', getPublicHospitals);
router.get('/hospitals/near', getHospitalsNear);
router.get('/hospitals/:id', getPublicHospitalById);

// ── Medicine Availability ─────────────────────────────────────────────────────
router.get('/medicine-availability', getMedicineAvailability);

// ── Data Correction ───────────────────────────────────────────────────────────
router.post('/data-corrections', dataCorrectionLimiter, submitDataCorrection);

export default router;
