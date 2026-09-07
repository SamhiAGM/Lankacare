import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import { Hospital } from '../models/Hospital';
import { Doctor } from '../models/Doctor';
import { Patient } from '../models/Patient';
import { Appointment } from '../models/Appointment';
import { Referral } from '../models/Referral';
import { MedicineInventory } from '../models/Medicine';
import { DiseaseReport } from '../models/DiseaseReport';
import { Complaint } from '../models/Complaint';
import { AppointmentStatus, MedicineStatus } from '../types/enums';

const getDateRange = (period: string): Date => {
  const now = new Date();
  switch (period) {
    case '7d': return new Date(now.setDate(now.getDate() - 7));
    case '30d': return new Date(now.setDate(now.getDate() - 30));
    case '3m': return new Date(now.setMonth(now.getMonth() - 3));
    case '6m': return new Date(now.setMonth(now.getMonth() - 6));
    case '1y': return new Date(now.setFullYear(now.getFullYear() - 1));
    default: return new Date(now.setDate(now.getDate() - 30));
  }
};

export const getHospitalUtilizationReport = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const data = await Hospital.aggregate([
      {
        $project: {
          name: 1,
          region: 1,
          type: 1,
          totalBeds: 1,
          availableBeds: 1,
          occupiedBeds: { $subtract: ['$totalBeds', '$availableBeds'] },
          occupancyRate: {
            $multiply: [
              { $divide: [{ $subtract: ['$totalBeds', '$availableBeds'] }, '$totalBeds'] },
              100,
            ],
          },
          emergencyAvailable: 1,
          status: 1,
        },
      },
      { $sort: { occupancyRate: -1 } },
    ]);
    res.status(200).json({ success: true, data, reportType: 'hospital_utilization' });
  } catch (error) {
    next(error);
  }
};

export const getAppointmentReport = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { period = '30d' } = req.query as { period: string };
    const since = getDateRange(period);

    const [byStatus, byRegion, total] = await Promise.all([
      Appointment.aggregate([
        { $match: { createdAt: { $gte: since } } },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      Appointment.aggregate([
        { $match: { createdAt: { $gte: since } } },
        { $lookup: { from: 'hospitals', localField: 'hospital', foreignField: '_id', as: 'hosp' } },
        { $unwind: '$hosp' },
        { $group: { _id: '$hosp.region', count: { $sum: 1 } } },
      ]),
      Appointment.countDocuments({ createdAt: { $gte: since } }),
    ]);

    const completed = byStatus.find((s) => s._id === AppointmentStatus.COMPLETED)?.count || 0;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    res.status(200).json({
      success: true,
      data: { byStatus, byRegion, total, completionRate },
      reportType: 'appointments',
      period,
    });
  } catch (error) {
    next(error);
  }
};

export const getMedicineShortageReport = async (_req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const [byStatus, byRegion, critical] = await Promise.all([
      MedicineInventory.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      MedicineInventory.aggregate([
        { $match: { status: { $in: [MedicineStatus.CRITICAL, MedicineStatus.OUT_OF_STOCK] } } },
        { $lookup: { from: 'hospitals', localField: 'hospital', foreignField: '_id', as: 'hosp' } },
        { $unwind: '$hosp' },
        { $group: { _id: '$hosp.region', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      MedicineInventory.find({
        status: { $in: [MedicineStatus.CRITICAL, MedicineStatus.OUT_OF_STOCK] },
      })
        .populate('medicine', 'name genericName category isEssential')
        .populate('hospital', 'name address.city region')
        .limit(20)
        .lean(),
    ]);

    res.status(200).json({
      success: true,
      data: { byStatus, byRegion, criticalItems: critical },
      reportType: 'medicine_shortage',
    });
  } catch (error) {
    next(error);
  }
};

export const getDiseaseReport = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { period = '30d' } = req.query as { period: string };
    const since = getDateRange(period);

    const [byRegion, byAlertLevel, trends] = await Promise.all([
      DiseaseReport.aggregate([
        { $match: { reportDate: { $gte: since } } },
        { $group: { _id: '$region', totalCases: { $sum: '$totalCases' }, count: { $sum: 1 } } },
        { $sort: { totalCases: -1 } },
      ]),
      DiseaseReport.aggregate([
        { $match: { reportDate: { $gte: since } } },
        { $group: { _id: '$alertLevel', count: { $sum: 1 } } },
      ]),
      DiseaseReport.find({ reportDate: { $gte: since } })
        .sort({ reportDate: -1 })
        .limit(50)
        .select('disease region totalCases newCases alertLevel reportDate')
        .lean(),
    ]);

    res.status(200).json({
      success: true,
      data: { byRegion, byAlertLevel, trends },
      reportType: 'disease_trends',
      period,
    });
  } catch (error) {
    next(error);
  }
};

export const getComplaintReport = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { period = '30d' } = req.query as { period: string };
    const since = getDateRange(period);

    const [byStatus, byCategory, total, resolved] = await Promise.all([
      Complaint.aggregate([
        { $match: { createdAt: { $gte: since } } },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      Complaint.aggregate([
        { $match: { createdAt: { $gte: since } } },
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      Complaint.countDocuments({ createdAt: { $gte: since } } as any),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      Complaint.countDocuments({ createdAt: { $gte: since }, status: { $in: ['RESOLVED', 'CLOSED'] } } as any),
    ]);

    const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 0;

    res.status(200).json({
      success: true,
      data: { byStatus, byCategory, total, resolved, resolutionRate },
      reportType: 'complaints',
      period,
    });
  } catch (error) {
    next(error);
  }
};

export const getRegionalHealthIndicators = async (_req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const [hospitalsByRegion, patientsByRegion] = await Promise.all([
      Hospital.aggregate([
        {
          $group: {
            _id: '$region',
            hospitals: { $sum: 1 },
            totalBeds: { $sum: '$totalBeds' },
            availableBeds: { $sum: '$availableBeds' },
            emergencyCount: { $sum: { $cond: ['$emergencyAvailable', 1, 0] } },
          },
        },
        { $sort: { _id: 1 } },
      ]),
      Doctor.aggregate([
        { $group: { _id: '$region', doctors: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),
    ]);

    res.status(200).json({
      success: true,
      data: { hospitalsByRegion, patientsByRegion },
      reportType: 'regional_health',
    });
  } catch (error) {
    next(error);
  }
};
