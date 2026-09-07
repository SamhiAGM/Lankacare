import { Response, NextFunction } from 'express';
import { Patient } from '../models/Patient';
import { AppError } from '../middleware/errorMiddleware';
import { AuthRequest } from '../middleware/authMiddleware';
import { AuditLog } from '../models/AuditLog';
import { AuditAction, UserRole } from '../types/enums';
import { Appointment } from '../models/Appointment';
import { Referral } from '../models/Referral';

export const getPatients = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { page = '1', limit = '20', search, gender, bloodType } = req.query as Record<string, string>;

    const query: Record<string, unknown> = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { nationalId: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ];
    }
    if (gender) query.gender = gender;
    if (bloodType) query.bloodType = bloodType;

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, parseInt(limit));
    const skip = (pageNum - 1) * limitNum;

    const [patients, total] = await Promise.all([
      Patient.find(query)
        .select('-emergencyContact') // omit sensitive fields from list
        .skip(skip)
        .limit(limitNum)
        .sort({ name: 1 })
        .lean(),
      Patient.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      data: patients,
      pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) },
    });
  } catch (error) {
    next(error);
  }
};

export const getPatientById = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const patient = await Patient.findById(req.params.id).lean();
    if (!patient) throw new AppError('Patient not found.', 404);

    await AuditLog.create({
      user: req.user!.id,
      action: AuditAction.PATIENT_ACCESS,
      resource: 'Patient',
      resourceId: patient._id,
      ipAddress: req.ip,
    });

    // Get recent appointments and referrals
    const [appointments, referrals] = await Promise.all([
      Appointment.find({ patient: patient._id })
        .populate('doctor', 'user')
        .populate('hospital', 'name')
        .sort({ scheduledDate: -1 })
        .limit(10)
        .lean(),
      Referral.find({ patient: patient._id })
        .populate('referringHospital', 'name')
        .populate('receivingHospital', 'name')
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),
    ]);

    res.status(200).json({
      success: true,
      data: { ...patient, appointments, referrals },
    });
  } catch (error) {
    next(error);
  }
};

export const createPatient = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const existing = await Patient.findOne({ nationalId: req.body.nationalId });
    if (existing) throw new AppError('A patient with this National ID already exists.', 409);

    const patient = await Patient.create({ ...req.body, isDemo: false });

    await AuditLog.create({
      user: req.user!.id,
      action: AuditAction.PATIENT_CREATE,
      resource: 'Patient',
      resourceId: patient._id,
      ipAddress: req.ip,
    });

    res.status(201).json({ success: true, message: 'Patient registered.', data: patient });
  } catch (error) {
    next(error);
  }
};

export const updatePatient = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const patient = await Patient.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!patient) throw new AppError('Patient not found.', 404);

    await AuditLog.create({
      user: req.user!.id,
      action: AuditAction.PATIENT_UPDATE,
      resource: 'Patient',
      resourceId: patient._id,
      details: req.body,
      ipAddress: req.ip,
    });

    res.status(200).json({ success: true, message: 'Patient record updated.', data: patient });
  } catch (error) {
    next(error);
  }
};
