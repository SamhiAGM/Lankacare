import { Router } from 'express';
import { authenticate, authorize } from '../middleware/authMiddleware';
import { UserRole } from '../types/enums';
import { getPatients, getPatientById, createPatient, updatePatient } from '../controllers/patientController';

const router = Router();

router.use(authenticate);
router.use(authorize(
  UserRole.SUPER_ADMIN, UserRole.MINISTRY_ADMIN, UserRole.HOSPITAL_ADMIN,
  UserRole.DOCTOR, UserRole.HEALTH_WORKER
));

router.get('/', getPatients);
router.get('/:id', getPatientById);
router.post('/', createPatient);
router.patch('/:id', updatePatient);

export default router;
