import { Response, NextFunction } from 'express';
import { EmergencyIncident } from '../models/EmergencyIncident';
import { AppError } from '../middleware/errorMiddleware';
import { AuthRequest } from '../middleware/authMiddleware';
import { AuditLog } from '../models/AuditLog';
import { AuditAction, EmergencyStatus, UserRole, NotificationPriority } from '../types/enums';
import { Notification } from '../models/Notification';
import { User } from '../models/User';

export const getEmergencies = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { page = '1', limit = '10', status, severity, region } = req.query as Record<string, string>;

    const query: Record<string, unknown> = {};
    if (status) query.status = status;
    if (severity) query.severity = severity;
    if (region) query.region = region;

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, parseInt(limit));
    const skip = (pageNum - 1) * limitNum;

    const [incidents, total] = await Promise.all([
      EmergencyIncident.find(query)
        .populate('hospital', 'name address.city')
        .populate('reportedBy', 'name role')
        .skip(skip)
        .limit(limitNum)
        .sort({ createdAt: -1 })
        .lean(),
      EmergencyIncident.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      data: incidents,
      pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) },
    });
  } catch (error) {
    next(error);
  }
};

export const createEmergency = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const incident = await EmergencyIncident.create({
      ...req.body,
      reportedBy: req.user!.id,
      timeline: [
        {
          action: 'INCIDENT_CREATED',
          note: 'Emergency incident reported.',
          performedBy: req.user!.id,
          timestamp: new Date(),
        },
      ],
    });

    await AuditLog.create({
      user: req.user!.id,
      action: AuditAction.EMERGENCY_CREATE,
      resource: 'EmergencyIncident',
      resourceId: incident._id,
      ipAddress: req.ip,
    });

    // Notify all admins for CRITICAL/HIGH incidents
    if (['CRITICAL', 'HIGH'].includes(incident.severity)) {
      const admins = await User.find({
        role: { $in: [UserRole.SUPER_ADMIN, UserRole.MINISTRY_ADMIN] },
      });

      for (const admin of admins) {
        await Notification.create({
          user: admin._id,
          type: 'EMERGENCY_INCIDENT',
          title: `🚨 ${incident.severity} Emergency Incident`,
          message: `${incident.title} — ${incident.region} region. Immediate attention required.`,
          relatedResource: 'EmergencyIncident',
          relatedId: incident._id,
          priority: NotificationPriority.CRITICAL,
          actionUrl: `/emergency/${incident._id}`,
        });
      }
    }

    res.status(201).json({
      success: true,
      message: 'Emergency incident reported.',
      data: incident,
    });
  } catch (error) {
    next(error);
  }
};

export const updateEmergencyStatus = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { status, note } = req.body;
    const incident = await EmergencyIncident.findById(req.params.id);
    if (!incident) throw new AppError('Emergency incident not found.', 404);

    incident.status = status as EmergencyStatus;
    incident.timeline.push({
      action: `STATUS_UPDATED_TO_${status}`,
      note: note || `Status changed to ${status}`,
      performedBy: req.user!.id as unknown as import('mongoose').Types.ObjectId,
      timestamp: new Date(),
    });

    if (status === EmergencyStatus.RESOLVED) {
      incident.resolvedAt = new Date();
    }

    await incident.save();

    await AuditLog.create({
      user: req.user!.id,
      action: AuditAction.EMERGENCY_UPDATE,
      resource: 'EmergencyIncident',
      resourceId: incident._id,
      details: { status },
      ipAddress: req.ip,
    });

    res.status(200).json({
      success: true,
      message: 'Emergency status updated.',
      data: incident,
    });
  } catch (error) {
    next(error);
  }
};

export const getEmergencyById = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const incident = await EmergencyIncident.findById(req.params.id)
      .populate('hospital', 'name address phone')
      .populate('reportedBy', 'name role email')
      .populate('timeline.performedBy', 'name role')
      .lean();

    if (!incident) throw new AppError('Emergency incident not found.', 404);

    res.status(200).json({ success: true, data: incident });
  } catch (error) {
    next(error);
  }
};

export const getActiveEmergencySummary = async (_req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const [active, bySeverity, byRegion] = await Promise.all([
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      EmergencyIncident.countDocuments({ status: { $in: ['ACTIVE', 'RESPONDING'] } } as any),
      EmergencyIncident.aggregate([
        { $match: { status: { $in: ['ACTIVE', 'RESPONDING'] } } },
        { $group: { _id: '$severity', count: { $sum: 1 } } },
      ]),
      EmergencyIncident.aggregate([
        { $match: { status: { $in: ['ACTIVE', 'RESPONDING'] } } },
        { $group: { _id: '$region', count: { $sum: 1 } } },
      ]),
    ]);

    res.status(200).json({ success: true, data: { active, bySeverity, byRegion } });
  } catch (error) {
    next(error);
  }
};
