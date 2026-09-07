import { Response, NextFunction } from 'express';
import { Referral } from '../models/Referral';
import { AppError } from '../middleware/errorMiddleware';
import { AuthRequest } from '../middleware/authMiddleware';
import { AuditLog } from '../models/AuditLog';
import { AuditAction, ReferralStatus, UserRole, NotificationPriority } from '../types/enums';
import { Notification } from '../models/Notification';
import { Doctor } from '../models/Doctor';
import { Hospital } from '../models/Hospital';
import { User } from '../models/User';

export const getReferrals = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { page = '1', limit = '10', status, priority, hospitalId } = req.query as Record<string, string>;

    const query: Record<string, unknown> = {};

    if (req.user!.role === UserRole.DOCTOR) {
      const doctor = await Doctor.findOne({ user: req.user!.id });
      if (doctor) query.referringDoctor = doctor._id;
    } else if (req.user!.role === UserRole.HOSPITAL_ADMIN && hospitalId) {
      query.$or = [{ referringHospital: hospitalId }, { receivingHospital: hospitalId }];
    }

    if (status) query.status = status;
    if (priority) query.priority = priority;

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, parseInt(limit));
    const skip = (pageNum - 1) * limitNum;

    const [referrals, total] = await Promise.all([
      Referral.find(query)
        .populate('patient', 'name nationalId')
        .populate({ path: 'referringDoctor', populate: { path: 'user', select: 'name' } })
        .populate('referringHospital', 'name address.city')
        .populate('receivingHospital', 'name address.city')
        .skip(skip)
        .limit(limitNum)
        .sort({ createdAt: -1 })
        .lean(),
      Referral.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      data: referrals,
      pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) },
    });
  } catch (error) {
    next(error);
  }
};

export const createReferral = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const doctor = await Doctor.findOne({ user: req.user!.id });
    if (!doctor) throw new AppError('Doctor profile not found.', 404);

    const referral = await Referral.create({
      ...req.body,
      referringDoctor: doctor._id,
      referringHospital: doctor.hospital,
      timeline: [
        {
          status: ReferralStatus.PENDING,
          note: 'Referral created and submitted.',
          updatedBy: req.user!.id,
          timestamp: new Date(),
        },
      ],
    });

    await AuditLog.create({
      user: req.user!.id,
      action: AuditAction.REFERRAL_CREATE,
      resource: 'Referral',
      resourceId: referral._id,
      ipAddress: req.ip,
    });

    // Notify hospital admins at receiving hospital
    const hospitalAdmins = await User.find({
      role: UserRole.HOSPITAL_ADMIN,
      hospitalId: referral.receivingHospital,
    });

    for (const admin of hospitalAdmins) {
      await Notification.create({
        user: admin._id,
        type: 'REFERRAL_RECEIVED',
        title: 'New Referral Received',
        message: `A ${referral.priority.toLowerCase()} priority referral has been received for the ${referral.department} department.`,
        relatedResource: 'Referral',
        relatedId: referral._id,
        priority: referral.priority === 'CRITICAL' ? NotificationPriority.CRITICAL : NotificationPriority.HIGH,
        actionUrl: `/referrals/${referral._id}`,
      });
    }

    res.status(201).json({
      success: true,
      message: 'Referral created successfully.',
      data: referral,
    });
  } catch (error) {
    next(error);
  }
};

export const updateReferralStatus = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { status, note, scheduledDate, rejectionReason } = req.body;
    const referral = await Referral.findById(req.params.id);
    if (!referral) throw new AppError('Referral not found.', 404);

    referral.status = status as ReferralStatus;
    referral.timeline.push({
      status,
      note: note || `Status updated to ${status}`,
      updatedBy: req.user!.id as unknown as import('mongoose').Types.ObjectId,
      timestamp: new Date(),
    });
    if (scheduledDate) referral.scheduledDate = new Date(scheduledDate);
    if (rejectionReason) referral.rejectionReason = rejectionReason;
    if (status === ReferralStatus.COMPLETED) referral.completedDate = new Date();

    await referral.save();

    await AuditLog.create({
      user: req.user!.id,
      action: AuditAction.REFERRAL_UPDATE,
      resource: 'Referral',
      resourceId: referral._id,
      details: { status },
      ipAddress: req.ip,
    });

    // Notify referring doctor
    const referringDoctor = await Doctor.findById(referral.referringDoctor);
    if (referringDoctor) {
      await Notification.create({
        user: referringDoctor.user,
        type: status === ReferralStatus.ACCEPTED ? 'REFERRAL_ACCEPTED' : 'REFERRAL_RECEIVED',
        title: `Referral ${status.charAt(0) + status.slice(1).toLowerCase()}`,
        message: `Referral #${referral.referralNumber} has been ${status.toLowerCase()}.`,
        relatedResource: 'Referral',
        relatedId: referral._id,
        priority: NotificationPriority.MEDIUM,
        actionUrl: `/referrals/${referral._id}`,
      });
    }

    res.status(200).json({
      success: true,
      message: 'Referral status updated.',
      data: referral,
    });
  } catch (error) {
    next(error);
  }
};

export const getReferralById = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const referral = await Referral.findById(req.params.id)
      .populate('patient', 'name nationalId dateOfBirth gender bloodType')
      .populate({ path: 'referringDoctor', populate: { path: 'user', select: 'name email' } })
      .populate('referringHospital', 'name address phone')
      .populate('receivingHospital', 'name address phone')
      .populate('timeline.updatedBy', 'name role')
      .lean();

    if (!referral) throw new AppError('Referral not found.', 404);

    res.status(200).json({ success: true, data: referral });
  } catch (error) {
    next(error);
  }
};
