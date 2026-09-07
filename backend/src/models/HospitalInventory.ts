import mongoose, { Document, Schema } from 'mongoose';

export interface IHospitalInventory extends Document {
  hospitalId: string;
  hospitalName: string;
  medicineId: string;
  medicineName: string;
  genericName: string;
  batchNumber: string;
  stockQuantity: number;
  unit: string;
  expiryDate: string;
  storageLocation: string;
  reorderThreshold: number;
  status: string;
  lastAudited: string;
  createdAt: Date;
  updatedAt: Date;
}

const hospitalInventorySchema = new Schema<IHospitalInventory>(
  {
    hospitalId: { type: String, required: true, index: true },
    hospitalName: { type: String, required: true },
    medicineId: { type: String, required: true },
    medicineName: { type: String, required: true },
    genericName: { type: String, required: true },
    batchNumber: { type: String, required: true },
    stockQuantity: { type: Number, required: true, default: 0 },
    unit: { type: String, default: 'units' },
    expiryDate: { type: String, required: true },
    storageLocation: { type: String, required: true },
    reorderThreshold: { type: Number, default: 50 },
    status: { type: String, default: 'ADEQUATE', index: true },
    lastAudited: { type: String, default: () => new Date().toISOString() },
  },
  { timestamps: true }
);

hospitalInventorySchema.index({ hospitalId: 1, batchNumber: 1 });

export default mongoose.models.HospitalInventory || mongoose.model<IHospitalInventory>('HospitalInventory', hospitalInventorySchema);
