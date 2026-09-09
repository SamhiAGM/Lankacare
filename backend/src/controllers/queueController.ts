import { Request, Response, NextFunction } from 'express';
import { QueueToken } from '../models/QueueToken';
import { AuditLog } from '../models/AuditLog';
import { AppError } from '../middleware/errorMiddleware';
import { AuthRequest } from '../middleware/authMiddleware';
import { AuditAction, QueueStatus } from '../types/enums';

/**
 * POST /api/queue/token
 * Citizen requests a queue token
 */
export const requestToken = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { hospitalId, department, serviceType } = req.body;
    const citizenId = req.user!.id;

    // Basic check to prevent multiple active tokens for same citizen/hospital/dept
    const existingToken = await QueueToken.findOne({
      hospital: hospitalId,
      department,
      citizen: citizenId,
      status: { $in: [QueueStatus.BOOKED, QueueStatus.CHECKED_IN, QueueStatus.WAITING, QueueStatus.CALLED] }
    });

    if (existingToken) {
      throw new AppError('You already have an active token for this department.', 400);
    }

    // Generate next token number (simplified for now)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const count = await QueueToken.countDocuments({
      hospital: hospitalId,
      department,
      createdAt: { $gte: today }
    });

    const prefix = serviceType.substring(0, 1).toUpperCase();
    const tokenNumber = `${prefix}-${(count + 1).toString().padStart(3, '0')}`;

    const token = await QueueToken.create({
      hospital: hospitalId,
      department,
      serviceType,
      citizen: citizenId,
      tokenNumber,
      status: QueueStatus.BOOKED,
      bookedAt: new Date(),
    });

    await AuditLog.create({
      user: citizenId as any,
      action: AuditAction.QUEUE_TOKEN_CREATE,
      resource: 'QueueToken',
      resourceId: token._id,
      ipAddress: req.ip,
    });

    res.status(201).json({
      success: true,
      data: {
        tokenNumber: token.tokenNumber,
        qrReference: token.qrReference,
        status: token.status,
        department: token.department,
        serviceType: token.serviceType,
        bookedAt: token.bookedAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/queue/my-tokens
 * Citizen gets their own active tokens
 */
export const getMyTokens = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const tokens = await QueueToken.find({ citizen: req.user!.id })
      .populate('hospital', 'officialName displayName province district')
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({ success: true, data: tokens });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/queue/:hospitalId/:department/status
 * Public crowd status — NEVER exposes citizen info
 */
export const getQueueStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { hospitalId, department } = req.params;

    const [waitingCount, calledTokens] = await Promise.all([
      QueueToken.countDocuments({
        hospital: hospitalId,
        department,
        status: { $in: [QueueStatus.BOOKED, QueueStatus.CHECKED_IN, QueueStatus.WAITING] }
      }),
      QueueToken.find({
        hospital: hospitalId,
        department,
        status: QueueStatus.CALLED
      })
        .select('tokenNumber serviceLocation calledAt')
        .sort({ calledAt: -1 })
        .limit(5)
        .lean()
    ]);

    let crowdLevel = 'UNKNOWN';
    if (waitingCount < 10) crowdLevel = 'LOW';
    else if (waitingCount < 30) crowdLevel = 'MODERATE';
    else if (waitingCount < 50) crowdLevel = 'BUSY';
    else crowdLevel = 'VERY_BUSY';

    res.status(200).json({
      success: true,
      data: {
        waitingCount,
        crowdLevel,
        recentlyCalled: calledTokens,
      }
    });
  } catch (error) {
    next(error);
  }
};
