import { Response, NextFunction } from 'express';
import { Announcement } from '../models/Announcement';
import { AppError } from '../middleware/errorMiddleware';
import { AuthRequest } from '../middleware/authMiddleware';
import { AuditLog } from '../models/AuditLog';
import { AuditAction } from '../types/enums';

export const getAnnouncements = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const {
      page = '1', limit = '15',
      category, published, search,
    } = req.query as Record<string, string>;

    const query: Record<string, unknown> = {};
    if (category) query.category = category;
    if (published !== undefined) query.isPublished = published === 'true';
    if (search) query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { content: { $regex: search, $options: 'i' } },
    ];

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, parseInt(limit));
    const skip = (pageNum - 1) * limitNum;

    const [announcements, total] = await Promise.all([
      Announcement.find(query)
        .populate('author', 'name role')
        .skip(skip)
        .limit(limitNum)
        .sort({ priority: -1, publishedAt: -1 })
        .lean(),
      Announcement.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      data: announcements,
      pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) },
    });
  } catch (error) {
    next(error);
  }
};

export const getAnnouncementById = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const announcement = await Announcement.findById(req.params.id)
      .populate('author', 'name role organization')
      .lean();
    if (!announcement) throw new AppError('Announcement not found.', 404);
    res.status(200).json({ success: true, data: announcement });
  } catch (error) {
    next(error);
  }
};

export const createAnnouncement = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const announcement = await Announcement.create({
      ...req.body,
      author: req.user!.id,
      publishedAt: req.body.isPublished ? new Date() : undefined,
    });

    await AuditLog.create({
      user: req.user!.id,
      action: AuditAction.ANNOUNCEMENT_PUBLISH,
      resource: 'Announcement',
      resourceId: announcement._id,
      ipAddress: req.ip,
    });

    res.status(201).json({ success: true, message: 'Announcement created.', data: announcement });
  } catch (error) {
    next(error);
  }
};

export const updateAnnouncement = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const existing = await Announcement.findById(req.params.id);
    if (!existing) throw new AppError('Announcement not found.', 404);

    if (req.body.isPublished && !existing.isPublished) {
      req.body.publishedAt = new Date();
    }

    const updated = await Announcement.findByIdAndUpdate(req.params.id, req.body, {
      new: true, runValidators: true,
    });

    res.status(200).json({ success: true, message: 'Announcement updated.', data: updated });
  } catch (error) {
    next(error);
  }
};

export const deleteAnnouncement = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const announcement = await Announcement.findByIdAndDelete(req.params.id);
    if (!announcement) throw new AppError('Announcement not found.', 404);
    res.status(200).json({ success: true, message: 'Announcement deleted.' });
  } catch (error) {
    next(error);
  }
};
