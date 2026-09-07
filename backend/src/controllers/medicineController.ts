import { Response, NextFunction } from 'express';
import { Medicine, MedicineInventory } from '../models/Medicine';
import { AppError } from '../middleware/errorMiddleware';
import { AuthRequest } from '../middleware/authMiddleware';
import { AuditLog } from '../models/AuditLog';
import { AuditAction, MedicineStatus, UserRole } from '../types/enums';

export const getMedicines = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const {
      page = '1', limit = '20',
      search, category, status, hospitalId, region,
    } = req.query as Record<string, string>;

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, parseInt(limit));
    const skip = (pageNum - 1) * limitNum;

    const inventoryQuery: Record<string, unknown> = {};
    if (status) inventoryQuery.status = status;
    if (hospitalId) inventoryQuery.hospital = hospitalId;

    // If filtering by region, first find hospitals in that region
    if (region) {
      const { Hospital } = await import('../models/Hospital');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const hospitals = await Hospital.find({ region } as any).select('_id').lean();
      inventoryQuery.hospital = { $in: hospitals.map((h) => h._id) };
    }

    const medicineQuery: Record<string, unknown> = {};
    if (search) {
      medicineQuery.$or = [
        { name: { $regex: search, $options: 'i' } },
        { genericName: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
      ];
    }
    if (category) medicineQuery.category = category;

    let medicineIds: unknown[] | undefined;
    if (search || category) {
      const medicines = await Medicine.find(medicineQuery).select('_id').lean();
      medicineIds = medicines.map((m) => m._id);
      inventoryQuery.medicine = { $in: medicineIds };
    }

    const [inventory, total] = await Promise.all([
      MedicineInventory.find(inventoryQuery)
        .populate('medicine', 'name genericName category dosageForm strength isEssential')
        .populate('hospital', 'name address.city region')
        .populate('lastUpdatedBy', 'name')
        .skip(skip)
        .limit(limitNum)
        .sort({ status: 1, updatedAt: -1 })
        .lean(),
      MedicineInventory.countDocuments(inventoryQuery),
    ]);

    res.status(200).json({
      success: true,
      data: inventory,
      pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) },
    });
  } catch (error) {
    next(error);
  }
};

export const getMedicineById = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const item = await MedicineInventory.findById(req.params.id)
      .populate('medicine')
      .populate('hospital', 'name address phone')
      .populate('lastUpdatedBy', 'name role')
      .lean();
    if (!item) throw new AppError('Medicine inventory record not found.', 404);
    res.status(200).json({ success: true, data: item });
  } catch (error) {
    next(error);
  }
};

export const updateInventory = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { quantity, minQuantity, batchNumber, expiryDate } = req.body;
    const item = await MedicineInventory.findById(req.params.id);
    if (!item) throw new AppError('Inventory record not found.', 404);

    if (quantity !== undefined) item.quantity = quantity;
    if (minQuantity !== undefined) item.minQuantity = minQuantity;
    if (batchNumber !== undefined) item.batchNumber = batchNumber;
    if (expiryDate !== undefined) item.expiryDate = new Date(expiryDate);
    item.lastUpdatedBy = req.user!.id as unknown as import('mongoose').Types.ObjectId;
    item.lastUpdatedAt = new Date();
    await item.save();

    await AuditLog.create({
      user: req.user!.id,
      action: AuditAction.MEDICINE_UPDATE,
      resource: 'MedicineInventory',
      resourceId: item._id,
      details: { quantity, minQuantity },
      ipAddress: req.ip,
    });

    res.status(200).json({ success: true, message: 'Inventory updated.', data: item });
  } catch (error) {
    next(error);
  }
};

export const getShortages = async (_req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const shortages = await MedicineInventory.find({
      status: { $in: [MedicineStatus.CRITICAL, MedicineStatus.OUT_OF_STOCK, MedicineStatus.LOW_STOCK] },
    })
      .populate('medicine', 'name genericName category isEssential')
      .populate('hospital', 'name address.city region')
      .sort({ status: 1 })
      .limit(50)
      .lean();

    res.status(200).json({ success: true, data: shortages });
  } catch (error) {
    next(error);
  }
};

export const getMedicineCategories = async (_req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const categories = await Medicine.distinct('category');
    res.status(200).json({ success: true, data: categories });
  } catch (error) {
    next(error);
  }
};

export const getMedicineStats = async (_req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const stats = await MedicineInventory.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    const result: Record<string, number> = {};
    for (const s of stats) {
      result[s._id] = s.count;
    }

    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};
