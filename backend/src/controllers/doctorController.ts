import { Response, NextFunction } from 'express';
import { Doctor } from '../models/Doctor';
import { User } from '../models/User';
import { AppError } from '../middleware/errorMiddleware';
import { AuthRequest } from '../middleware/authMiddleware';
import { UserRole } from '../types/enums';

export const getDoctors = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const {
      page = '1',
      limit = '12',
      search,
      hospital,
      department,
      specialty,
      available,
    } = req.query as Record<string, string>;

    const query: Record<string, unknown> = {};
    if (hospital) query.hospital = hospital;
    if (department) query.department = { $regex: department, $options: 'i' };
    if (specialty) query.specialty = { $regex: specialty, $options: 'i' };
    if (available === 'true') query.isAvailable = true;

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, parseInt(limit));
    const skip = (pageNum - 1) * limitNum;

    let dbQuery = Doctor.find(query)
      .populate('user', 'name email avatar phone')
      .populate('hospital', 'name address.city region type')
      .skip(skip)
      .limit(limitNum)
      .sort({ createdAt: -1 });

    // Text search on user name
    if (search) {
      const userIds = await User.find({
        name: { $regex: search, $options: 'i' },
        role: UserRole.DOCTOR,
      }).distinct('_id');
      query.user = { $in: userIds };
      dbQuery = Doctor.find(query)
        .populate('user', 'name email avatar phone')
        .populate('hospital', 'name address.city region type')
        .skip(skip)
        .limit(limitNum);
    }

    const [doctors, total] = await Promise.all([
      dbQuery.lean(),
      Doctor.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      data: doctors,
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

export const getDoctorById = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const doctor = await Doctor.findById(req.params.id)
      .populate('user', 'name email avatar phone')
      .populate('hospital', 'name address region type phone')
      .lean();

    if (!doctor) throw new AppError('Doctor not found.', 404);

    res.status(200).json({ success: true, data: doctor });
  } catch (error) {
    next(error);
  }
};

export const getDoctorsByHospital = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const doctors = await Doctor.find({ hospital: req.params.hospitalId })
      .populate('user', 'name email avatar phone')
      .lean();

    res.status(200).json({ success: true, data: doctors });
  } catch (error) {
    next(error);
  }
};

export const updateDoctorAvailability = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { isAvailable, availability } = req.body;
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) throw new AppError('Doctor not found.', 404);

    if (
      req.user!.role === UserRole.DOCTOR &&
      doctor.user.toString() !== req.user!.id
    ) {
      throw new AppError('You can only update your own availability.', 403);
    }

    const updated = await Doctor.findByIdAndUpdate(
      req.params.id,
      { isAvailable, availability },
      { new: true }
    ).populate('user', 'name email');

    res.status(200).json({
      success: true,
      message: 'Availability updated.',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};
