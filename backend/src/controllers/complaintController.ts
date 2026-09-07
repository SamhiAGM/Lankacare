import { Response, NextFunction } from 'express';
import { Complaint } from '../models/Complaint';
import { AppError } from '../middleware/errorMiddleware';
import { AuthRequest } from '../middleware/authMiddleware';
import { ComplaintStatus, UserRole, NotificationPriority } from '../types/enums';
import { Notification } from '../models/Notification';

export const getComplaints = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { page = '1', limit = '15', status, priority, category } = req.query as Record<string, string>;

    const query: Record<string, unknown> = {};

    // Citizens can only see their own complaints
    if (req.user!.role === UserRole.CITIZEN) {
      query.submittedBy = req.user!.id;
    }

    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (category) query.category = category;

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, parseInt(limit));
    const skip = (pageNum - 1) * limitNum;

    const [complaints, total] = await Promise.all([
      Complaint.find(query)
        .populate('submittedBy', 'name email')
        .populate('assignedTo', 'name role')
        .skip(skip)
        .limit(limitNum)
        .sort({ createdAt: -1 })
        .lean(),
      Complaint.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      data: complaints,
      pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) },
    });
  } catch (error) {
    next(error);
  }
};

export const getComplaintById = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const complaint = await Complaint.findById(req.params.id)
      .populate('submittedBy', 'name email phone')
      .populate('assignedTo', 'name role email')
      .populate('relatedHospital', 'name address.city')
      .populate('statusHistory.changedBy', 'name role')
      .lean();

    if (!complaint) throw new AppError('Complaint not found.', 404);

    // Citizens can only view their own complaints
    if (
      req.user!.role === UserRole.CITIZEN &&
      (complaint.submittedBy as { _id: { toString(): string } })._id.toString() !== req.user!.id
    ) {
      throw new AppError('You do not have permission to view this complaint.', 403);
    }

    res.status(200).json({ success: true, data: complaint });
  } catch (error) {
    next(error);
  }
};

export const createComplaint = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const complaint = await Complaint.create({
      ...req.body,
      submittedBy: req.user!.id,
      statusHistory: [
        {
          status: ComplaintStatus.SUBMITTED,
          changedBy: req.user!.id,
          timestamp: new Date(),
          note: 'Complaint submitted.',
        },
      ],
    });

    res.status(201).json({ success: true, message: 'Complaint submitted successfully.', data: complaint });
  } catch (error) {
    next(error);
  }
};

export const updateComplaintStatus = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (req.user!.role === UserRole.CITIZEN) {
      throw new AppError('Citizens cannot update complaint status.', 403);
    }

    const { status, note, assignedTo } = req.body;
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) throw new AppError('Complaint not found.', 404);

    complaint.status = status as ComplaintStatus;
    if (assignedTo) complaint.assignedTo = assignedTo;
    if (status === ComplaintStatus.RESOLVED || status === ComplaintStatus.CLOSED) {
      complaint.resolvedAt = new Date();
    }

    (complaint.statusHistory as Array<{
      status: string; note: string;
      changedBy: import('mongoose').Types.ObjectId; timestamp: Date;
    }>).push({
      status,
      changedBy: req.user!.id as unknown as import('mongoose').Types.ObjectId,
      timestamp: new Date(),
      note: note || `Status updated to ${status}`,
    });

    await complaint.save();

    // Notify the complainant
    await Notification.create({
      user: complaint.submittedBy,
      type: 'COMPLAINT_UPDATE',
      title: 'Complaint Status Updated',
      message: `Your complaint #${complaint.complaintNumber} has been updated to: ${status.replace('_', ' ')}.`,
      relatedResource: 'Complaint',
      relatedId: complaint._id,
      priority: NotificationPriority.MEDIUM,
      actionUrl: `/complaints/${complaint._id}`,
    });

    res.status(200).json({ success: true, message: 'Complaint status updated.', data: complaint });
  } catch (error) {
    next(error);
  }
};
