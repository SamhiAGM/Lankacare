import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import { Hospital } from '../models/Hospital';
import { Doctor } from '../models/Doctor';
import { Patient } from '../models/Patient';
import { Appointment } from '../models/Appointment';
import { Referral } from '../models/Referral';
import { MedicineInventory } from '../models/Medicine';
import { DiseaseReport } from '../models/DiseaseReport';
import { EmergencyIncident } from '../models/EmergencyIncident';
import { Complaint } from '../models/Complaint';
import { HealthCampaign } from '../models/HealthCampaign';
import { Notification } from '../models/Notification';
import { User } from '../models/User';
import { MedicineStatus, AppointmentStatus, EmergencyStatus, AlertLevel } from '../types/enums';

export const getDashboardOverview = async (_req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const [
      totalHospitals,
      totalDoctors,
      totalPatients,
      bedStats,
      medicineShortageStat,
      activeAlerts,
      activeEmergencies,
      pendingComplaints,
      activeCampaigns,
      appointmentStats,
    ] = await Promise.all([
      Hospital.countDocuments(),
      Doctor.countDocuments(),
      Patient.countDocuments(),
      Hospital.aggregate([
        {
          $group: {
            _id: null,
            totalBeds: { $sum: '$totalBeds' },
            availableBeds: { $sum: '$availableBeds' },
          },
        },
      ]),
      MedicineInventory.countDocuments({
        status: { $in: [MedicineStatus.CRITICAL, MedicineStatus.OUT_OF_STOCK] },
      }),
      DiseaseReport.countDocuments({
        alertLevel: { $in: [AlertLevel.ORANGE, AlertLevel.RED] },
      }),
      EmergencyIncident.countDocuments({
        status: { $in: [EmergencyStatus.ACTIVE, EmergencyStatus.RESPONDING] },
      }),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      Complaint.countDocuments({ status: { $in: ['SUBMITTED', 'UNDER_REVIEW', 'IN_PROGRESS'] } } as any),
      HealthCampaign.countDocuments({ status: 'ACTIVE' }),
      Appointment.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalHospitals,
        totalDoctors,
        totalPatients,
        totalBeds: bedStats[0]?.totalBeds || 0,
        availableBeds: bedStats[0]?.availableBeds || 0,
        medicineShortageStat,
        activeAlerts,
        activeEmergencies,
        pendingComplaints,
        activeCampaigns,
        appointmentStats,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getGlobalSearch = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { q } = req.query as { q: string };
    if (!q || q.length < 2) {
      res.status(200).json({ success: true, data: {} });
      return;
    }

    const regex = { $regex: q, $options: 'i' };

    const [hospitals, doctors, patients] = await Promise.all([
      Hospital.find({ name: regex }).limit(5).select('name address.city region type').lean(),
      Doctor.find({ specialty: regex })
        .populate('user', 'name')
        .populate('hospital', 'name')
        .limit(5)
        .lean(),
      Patient.find({ name: regex }).limit(5).select('name nationalId').lean(),
    ]);

    res.status(200).json({
      success: true,
      data: { hospitals, doctors, patients },
    });
  } catch (error) {
    next(error);
  }
};

export const getAuditLogs = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { AuditLog } = await import('../models/AuditLog');
    const { page = '1', limit = '20', action, userId } = req.query as Record<string, string>;

    const query: Record<string, unknown> = {};
    if (action) query.action = action;
    if (userId) query.user = userId;

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, parseInt(limit));
    const skip = (pageNum - 1) * limitNum;

    const [logs, total] = await Promise.all([
      AuditLog.find(query)
        .populate('user', 'name email role')
        .skip(skip)
        .limit(limitNum)
        .sort({ createdAt: -1 })
        .lean(),
      AuditLog.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      data: logs,
      pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) },
    });
  } catch (error) {
    next(error);
  }
};
