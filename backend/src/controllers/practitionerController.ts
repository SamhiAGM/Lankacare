import { Request, Response, NextFunction } from 'express';
import { Practitioner } from '../models/Practitioner';
import { HospitalStaffAssignment } from '../models/HospitalStaffAssignment';
import { AuditLog } from '../models/AuditLog';
import { AppError } from '../middleware/errorMiddleware';
import { AuthRequest } from '../middleware/authMiddleware';
import { AuditAction, VerificationStatus } from '../types/enums';

/**
 * GET /api/practitioners/:slmc
 * Look up practitioner by SLMC number (publicly visible info)
 */
export const getPractitionerBySlmc = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { slmc } = req.params;

    const practitioner = await Practitioner.findOne({ slmcRegistrationNumber: slmc })
      .select('fullName slmcRegistrationNumber registrationStatus qualifications specialistDiscipline verificationStatus verifiedAt')
      .lean();

    if (!practitioner) {
      throw new AppError('Practitioner not found with that SLMC number.', 404);
    }

    res.status(200).json({ success: true, data: practitioner });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/practitioners/:id/assignments
 * Get hospital assignments for a practitioner
 */
export const getPractitionerAssignments = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;

    const assignments = await HospitalStaffAssignment.find({
      practitioner: id,
      employmentStatus: 'ACTIVE',
      isPubliclyVisible: true,
    })
      .populate('hospital', 'officialName displayName province district')
      .lean();

    res.status(200).json({ success: true, data: assignments });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/practitioners/verify
 * DATA_ADMIN manually verifies a practitioner
 */
export const verifyPractitioner = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { slmcRegistrationNumber, registrationStatus, registrationType, qualifications, specialistDiscipline } = req.body;

    let practitioner = await Practitioner.findOne({ slmcRegistrationNumber });

    if (practitioner) {
      practitioner.registrationStatus = registrationStatus;
      practitioner.registrationType = registrationType;
      if (qualifications) practitioner.qualifications = qualifications;
      if (specialistDiscipline) practitioner.specialistDiscipline = specialistDiscipline;
      practitioner.verificationStatus = VerificationStatus.VERIFIED;
      practitioner.verifiedAt = new Date();
      practitioner.verifiedBy = req.user!.id as any;
      practitioner.verificationSource = 'Manual verification by DATA_ADMIN';
      await practitioner.save();
    } else {
      practitioner = await Practitioner.create({
        fullName: req.body.fullName, // Required for creation
        slmcRegistrationNumber,
        registrationStatus,
        registrationType,
        qualifications: qualifications || [],
        specialistDiscipline,
        verificationStatus: VerificationStatus.VERIFIED,
        verifiedAt: new Date(),
        verifiedBy: req.user!.id,
        verificationSource: 'Manual verification by DATA_ADMIN',
      });
    }

    await AuditLog.create({
      user: req.user!.id,
      action: AuditAction.PRACTITIONER_VERIFY,
      resource: 'Practitioner',
      resourceId: practitioner._id,
      details: { slmcRegistrationNumber, registrationStatus },
      ipAddress: req.ip,
    });

    res.status(200).json({
      success: true,
      message: 'Practitioner successfully verified.',
      data: practitioner,
    });
  } catch (error) {
    next(error);
  }
};
