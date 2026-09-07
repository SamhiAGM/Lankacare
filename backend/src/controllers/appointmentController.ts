import { Response, NextFunction } from 'express';
import { Appointment } from '../models/Appointment';
import { AppError } from '../middleware/errorMiddleware';
import { AuthRequest } from '../middleware/authMiddleware';
import { AuditLog } from '../models/AuditLog';
import { AuditAction, AppointmentStatus, UserRole, NotificationPriority } from '../types/enums';
import { Notification } from '../models/Notification';
import { Doctor } from '../models/Doctor';

export const getAppointments = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { page = '1', limit = '10', status, doctorId, patientId, date } = req.query as Record<string, string>;

    const query: Record<string, unknown> = {};

    // Scope results by role
    if (req.user!.role === UserRole.CITIZEN) {
      // Citizens see their own appointments only
      query.bookedBy = req.user!.id;
    } else if (req.user!.role === UserRole.DOCTOR) {
      const doctor = await Doctor.findOne({ user: req.user!.id });
      if (doctor) query.doctor = doctor._id;
    } else if (req.user!.role === UserRole.HOSPITAL_ADMIN) {
      // Hospital admins: filter by their hospital (set via query or their profile)
      if (req.query.hospitalId) query.hospital = req.query.hospitalId;
    }

    if (status) query.status = status;
    if (doctorId) query.doctor = doctorId;
    if (patientId) query.patient = patientId;
    if (date) {
      const start = new Date(date);
      const end = new Date(date);
      end.setDate(end.getDate() + 1);
      query.appointmentDate = { $gte: start, $lt: end };
    }

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, parseInt(limit));
    const skip = (pageNum - 1) * limitNum;

    const [appointments, total] = await Promise.all([
      Appointment.find(query)
        .populate('patient', 'name nationalId dateOfBirth gender phone')
        .populate({ path: 'doctor', populate: { path: 'user', select: 'name avatar' } })
        .populate('hospital', 'name address.city')
        .skip(skip)
        .limit(limitNum)
        .sort({ appointmentDate: -1 })
        .lean(),
      Appointment.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      data: appointments,
      pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) },
    });
  } catch (error) {
    next(error);
  }
};

export const createAppointment = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const appointment = await Appointment.create({
      ...req.body,
      bookedBy: req.user!.id,
    });

    await AuditLog.create({
      user: req.user!.id,
      action: AuditAction.APPOINTMENT_CREATE,
      resource: 'Appointment',
      resourceId: appointment._id,
      ipAddress: req.ip,
    });

    // Notify the doctor
    const doctor = await Doctor.findById(appointment.doctor);
    if (doctor) {
      await Notification.create({
        user: doctor.user,
        type: 'APPOINTMENT_NEW',
        title: 'New Appointment Booked',
        message: `A new appointment has been booked for ${new Date(appointment.appointmentDate).toDateString()} at ${appointment.timeSlot}.`,
        relatedResource: 'Appointment',
        relatedId: appointment._id,
        priority: NotificationPriority.MEDIUM,
        actionUrl: `/appointments/${appointment._id}`,
      });
    }

    res.status(201).json({
      success: true,
      message: 'Appointment booked successfully.',
      data: appointment,
    });
  } catch (error) {
    next(error);
  }
};

export const updateAppointmentStatus = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { status, doctorNotes } = req.body;
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) throw new AppError('Appointment not found.', 404);

    // Doctors can only update their own appointments
    if (req.user!.role === UserRole.DOCTOR) {
      const doctor = await Doctor.findOne({ user: req.user!.id });
      if (!doctor || appointment.doctor.toString() !== doctor._id.toString()) {
        throw new AppError('You cannot update this appointment.', 403);
      }
    }

    appointment.status = status as AppointmentStatus;
    if (doctorNotes) appointment.doctorNotes = doctorNotes;
    await appointment.save();

    await AuditLog.create({
      user: req.user!.id,
      action: AuditAction.APPOINTMENT_UPDATE,
      resource: 'Appointment',
      resourceId: appointment._id,
      details: { status },
      ipAddress: req.ip,
    });

    // Notify the patient's user
    await Notification.create({
      user: appointment.bookedBy,
      type: status === AppointmentStatus.CANCELLED ? 'APPOINTMENT_CANCELLED' : 'APPOINTMENT_CONFIRMED',
      title: `Appointment ${status.charAt(0) + status.slice(1).toLowerCase()}`,
      message: `Your appointment on ${new Date(appointment.appointmentDate).toDateString()} has been ${status.toLowerCase()}.`,
      relatedResource: 'Appointment',
      relatedId: appointment._id,
      priority: status === AppointmentStatus.CANCELLED ? NotificationPriority.HIGH : NotificationPriority.MEDIUM,
      actionUrl: `/appointments/${appointment._id}`,
    });

    res.status(200).json({
      success: true,
      message: `Appointment ${status.toLowerCase()} successfully.`,
      data: appointment,
    });
  } catch (error) {
    next(error);
  }
};

export const getAppointmentById = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('patient', 'name nationalId dateOfBirth gender phone bloodType')
      .populate({ path: 'doctor', populate: { path: 'user', select: 'name avatar email' } })
      .populate('hospital', 'name address phone')
      .lean();

    if (!appointment) throw new AppError('Appointment not found.', 404);

    res.status(200).json({ success: true, data: appointment });
  } catch (error) {
    next(error);
  }
};

export const getAppointmentStats = async (_req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const stats = await Appointment.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    res.status(200).json({ success: true, data: stats });
  } catch (error) {
    next(error);
  }
};
