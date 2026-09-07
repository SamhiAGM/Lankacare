import { Response, NextFunction } from 'express';
import { HealthCampaign } from '../models/HealthCampaign';
import { AppError } from '../middleware/errorMiddleware';
import { AuthRequest } from '../middleware/authMiddleware';

export const getCampaigns = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { page = '1', limit = '12', status, search } = req.query as Record<string, string>;

    const query: Record<string, unknown> = {};
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, parseInt(limit));
    const skip = (pageNum - 1) * limitNum;

    const [campaigns, total] = await Promise.all([
      HealthCampaign.find(query)
        .populate('createdBy', 'name role')
        .skip(skip)
        .limit(limitNum)
        .sort({ startDate: -1 })
        .lean(),
      HealthCampaign.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      data: campaigns,
      pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) },
    });
  } catch (error) {
    next(error);
  }
};

export const getCampaignById = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const campaign = await HealthCampaign.findById(req.params.id)
      .populate('createdBy', 'name role organization')
      .lean();
    if (!campaign) throw new AppError('Campaign not found.', 404);
    res.status(200).json({ success: true, data: campaign });
  } catch (error) {
    next(error);
  }
};

export const createCampaign = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const campaign = await HealthCampaign.create({
      ...req.body,
      createdBy: req.user!.id,
    });
    res.status(201).json({ success: true, message: 'Campaign created.', data: campaign });
  } catch (error) {
    next(error);
  }
};

export const updateCampaign = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const campaign = await HealthCampaign.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!campaign) throw new AppError('Campaign not found.', 404);
    res.status(200).json({ success: true, message: 'Campaign updated.', data: campaign });
  } catch (error) {
    next(error);
  }
};
