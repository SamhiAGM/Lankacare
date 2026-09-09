import { Request, Response, NextFunction } from 'express';
import { Medicine, MedicineInventory } from '../models/Medicine';
import { InventoryAuditLog } from '../models/InventoryAuditLog';
import { AppError } from '../middleware/errorMiddleware';
import { AuthRequest } from '../middleware/authMiddleware';
import { AuditAction } from '../types/enums';

/**
 * GET /api/inventory/:hospitalId/medicines
 * Pharmacist/Admin view full inventory for a hospital
 */
export const getHospitalInventory = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { hospitalId } = req.params;

    const inventory = await MedicineInventory.find({ hospital: hospitalId })
      .populate('medicine', 'name genericName dosageForm strength category status')
      .lean();

    res.status(200).json({ success: true, data: inventory });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/inventory/:hospitalId/medicines/:medicineId
 * Pharmacist updates stock (Audit Logged)
 */
export const updateMedicineStock = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { hospitalId, medicineId } = req.params;
    const { quantity, status, batchNumber, expiryDate, reason, notes } = req.body;

    const medicine = await Medicine.findById(medicineId);
    if (!medicine) throw new AppError('Medicine not found in national catalog.', 404);

    let inventory = await MedicineInventory.findOne({ hospital: hospitalId, medicine: medicineId });

    let previousQuantity = null;
    let previousStatus = null;

    if (inventory) {
      previousQuantity = inventory.quantity;
      previousStatus = inventory.status;

      inventory.quantity = quantity;
      inventory.status = status;
      if (batchNumber) inventory.batchNumber = batchNumber;
      if (expiryDate) inventory.expiryDate = expiryDate;
      inventory.lastUpdatedAt = new Date();
      inventory.lastUpdatedBy = req.user!.id as any;

      await inventory.save();
    } else {
      inventory = await MedicineInventory.create({
        hospital: String(hospitalId),
        medicine: String(medicineId),
        quantity,
        status,
        batchNumber,
        expiryDate,
        lastUpdatedAt: new Date(),
        lastUpdatedBy: req.user!.id,
      });
    }

    // MANDATORY AUDIT LOG
    await InventoryAuditLog.create({
      hospital: hospitalId as any,
      medicine: medicineId as any,
      medicineName: medicine.name,
      previousQuantity,
      newQuantity: quantity,
      previousStatus,
      newStatus: status,
      unit: medicine.dosageForm,
      updatedBy: req.user!.id as any,
      updatedByRole: req.user!.role,
      ipAddress: req.ip,
      reason,
      batchNumber,
      expiryDate,
      notes,
    });

    res.status(200).json({
      success: true,
      message: 'Inventory updated successfully.',
      data: inventory,
    });
  } catch (error) {
    next(error);
  }
};
