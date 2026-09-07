import { Response, NextFunction } from 'express';
import { Hospital } from '../models/Hospital';
import { Doctor } from '../models/Doctor';
import { AppError } from '../middleware/errorMiddleware';
import { AuthRequest } from '../middleware/authMiddleware';
import { AuditLog } from '../models/AuditLog';
import { AuditAction, UserRole, HospitalStatus } from '../types/enums';

export const getHospitals = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const {
      page = '1',
      limit = '12',
      search,
      region,
      type,
      status,
      emergency,
    } = req.query as Record<string, string>;

    const query: Record<string, unknown> = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { 'address.city': { $regex: search, $options: 'i' } },
        { 'address.district': { $regex: search, $options: 'i' } },
      ];
    }
    if (region) query.region = region;
    if (type) query.type = type;
    if (status) query.status = status;
    if (emergency === 'true') query.emergencyAvailable = true;

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, parseInt(limit));
    const skip = (pageNum - 1) * limitNum;

    const [hospitals, total] = await Promise.all([
      Hospital.find(query).skip(skip).limit(limitNum).sort({ name: 1 }).lean(),
      Hospital.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      data: hospitals,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getHospitalById = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const hospital = await Hospital.findById(req.params.id).lean();
    if (!hospital) throw new AppError('Hospital not found.', 404);

    const doctors = await Doctor.find({ hospital: req.params.id })
      .populate('user', 'name email avatar')
      .lean();

    res.status(200).json({
      success: true,
      data: { ...hospital, doctors },
    });
  } catch (error) {
    next(error);
  }
};

export const createHospital = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const hospital = await Hospital.create(req.body);

    await AuditLog.create({
      user: req.user!.id,
      action: AuditAction.HOSPITAL_CREATE,
      resource: 'Hospital',
      resourceId: hospital._id,
      ipAddress: req.ip,
    });

    res.status(201).json({
      success: true,
      message: 'Hospital created successfully.',
      data: hospital,
    });
  } catch (error) {
    next(error);
  }
};

export const updateHospital = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const hospital = await Hospital.findById(req.params.id);
    if (!hospital) throw new AppError('Hospital not found.', 404);

    // Hospital admins can only update their own hospital
    if (
      req.user!.role === UserRole.HOSPITAL_ADMIN &&
      hospital.adminUser?.toString() !== req.user!.id
    ) {
      throw new AppError('You do not have permission to update this hospital.', 403);
    }

    const updated = await Hospital.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    await AuditLog.create({
      user: req.user!.id,
      action: AuditAction.HOSPITAL_UPDATE,
      resource: 'Hospital',
      resourceId: hospital._id,
      details: req.body,
      ipAddress: req.ip,
    });

    res.status(200).json({
      success: true,
      message: 'Hospital updated successfully.',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

export const getDashboardStats = async (_req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const [
      totalHospitals,
      operationalHospitals,
      totalBeds,
      availableBeds,
    ] = await Promise.all([
      Hospital.countDocuments(),
      Hospital.countDocuments({ status: HospitalStatus.OPERATIONAL }),
      Hospital.aggregate([{ $group: { _id: null, total: { $sum: '$totalBeds' } } }]),
      Hospital.aggregate([{ $group: { _id: null, total: { $sum: '$availableBeds' } } }]),
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalHospitals,
        operationalHospitals,
        totalBeds: totalBeds[0]?.total || 0,
        availableBeds: availableBeds[0]?.total || 0,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getCapacityByRegion = async (_req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const data = await Hospital.aggregate([
      {
        $group: {
          _id: '$region',
          totalBeds: { $sum: '$totalBeds' },
          availableBeds: { $sum: '$availableBeds' },
          hospitals: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};
