import { Response, NextFunction } from 'express';
import { DiseaseReport } from '../models/DiseaseReport';
import { AppError } from '../middleware/errorMiddleware';
import { AuthRequest } from '../middleware/authMiddleware';

export const getDiseaseReports = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { page = '1', limit = '10', disease, region, alertLevel, dateFrom, dateTo } = req.query as Record<string, string>;

    const query: Record<string, unknown> = {};
    if (disease) query.disease = { $regex: disease, $options: 'i' };
    if (region) query.region = region;
    if (alertLevel) query.alertLevel = alertLevel;
    if (dateFrom || dateTo) {
      query.reportDate = {};
      if (dateFrom) (query.reportDate as Record<string, unknown>)['$gte'] = new Date(dateFrom);
      if (dateTo) (query.reportDate as Record<string, unknown>)['$lte'] = new Date(dateTo);
    }

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, parseInt(limit));
    const skip = (pageNum - 1) * limitNum;

    const [reports, total] = await Promise.all([
      DiseaseReport.find(query)
        .populate('reportedBy', 'name role')
        .skip(skip)
        .limit(limitNum)
        .sort({ reportDate: -1 })
        .lean(),
      DiseaseReport.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      data: reports,
      pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) },
    });
  } catch (error) {
    next(error);
  }
};

export const createDiseaseReport = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const report = await DiseaseReport.create({
      ...req.body,
      reportedBy: req.user!.id,
      activeCases: (req.body.confirmedCases || 0) - (req.body.deaths || 0) - (req.body.recoveries || 0),
    });

    res.status(201).json({
      success: true,
      message: 'Disease report submitted.',
      data: report,
    });
  } catch (error) {
    next(error);
  }
};

export const getSurveillanceSummary = async (_req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const [byAlertLevel, byRegion, byDisease, trends] = await Promise.all([
      DiseaseReport.aggregate([
        { $group: { _id: '$alertLevel', count: { $sum: 1 }, totalCases: { $sum: '$confirmedCases' } } },
      ]),
      DiseaseReport.aggregate([
        { $group: { _id: '$region', totalCases: { $sum: '$confirmedCases' }, totalDeaths: { $sum: '$deaths' } } },
        { $sort: { totalCases: -1 } },
      ]),
      DiseaseReport.aggregate([
        { $group: { _id: '$disease', totalCases: { $sum: '$confirmedCases' }, reports: { $sum: 1 } } },
        { $sort: { totalCases: -1 } },
        { $limit: 10 },
      ]),
      DiseaseReport.aggregate([
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$reportDate' } },
            cases: { $sum: '$confirmedCases' },
            deaths: { $sum: '$deaths' },
          },
        },
        { $sort: { _id: 1 } },
        { $limit: 30 },
      ]),
    ]);

    res.status(200).json({
      success: true,
      data: { byAlertLevel, byRegion, byDisease, trends },
    });
  } catch (error) {
    next(error);
  }
};
