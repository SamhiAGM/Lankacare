import mongoose, { Document, Schema } from 'mongoose';
import { MedicineStatus } from '../types/enums';

export interface IMedicine extends Document {
  name: string;
  genericName: string;
  category: string;
  description?: string;
  dosageForm: string;
  strength: string;
  manufacturer?: string;
  isEssential: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IMedicineInventory extends Document {
  medicine: mongoose.Types.ObjectId;
  hospital: mongoose.Types.ObjectId;
  quantity: number;
  minQuantity: number;
  unit: string;
  batchNumber?: string;
  expiryDate?: Date;
  status: MedicineStatus;
  lastUpdatedBy: mongoose.Types.ObjectId;
  lastUpdatedAt: Date;
  isDemo: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const medicineSchema = new Schema<IMedicine>(
  {
    name: { type: String, required: true, trim: true, index: true },
    genericName: { type: String, required: true, trim: true },
    category: { type: String, required: true, index: true },
    description: { type: String },
    dosageForm: { type: String, required: true },
    strength: { type: String, required: true },
    manufacturer: { type: String },
    isEssential: { type: Boolean, default: false },
  },
  { timestamps: true }
);

medicineSchema.index({ name: 'text', genericName: 'text' });

const medicineInventorySchema = new Schema<IMedicineInventory>(
  {
    medicine: { type: Schema.Types.ObjectId, ref: 'Medicine', required: true, index: true },
    hospital: { type: Schema.Types.ObjectId, ref: 'Hospital', required: true, index: true },
    quantity: { type: Number, required: true, min: 0 },
    minQuantity: { type: Number, required: true, min: 0 },
    unit: { type: String, required: true },
    batchNumber: { type: String },
    expiryDate: { type: Date },
    status: {
      type: String,
      enum: Object.values(MedicineStatus),
      default: MedicineStatus.AVAILABLE,
      index: true,
    },
    lastUpdatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    lastUpdatedAt: { type: Date, default: Date.now },
    isDemo: { type: Boolean, default: false },
  },
  { timestamps: true }
);

medicineInventorySchema.index({ hospital: 1, status: 1 });
medicineInventorySchema.index({ medicine: 1, hospital: 1 }, { unique: true });

// Auto-calculate status based on quantity
medicineInventorySchema.pre('save', async function () {
  if (this.quantity === 0) {
    this.status = MedicineStatus.OUT_OF_STOCK;
  } else if (this.quantity <= this.minQuantity * 0.25) {
    this.status = MedicineStatus.CRITICAL;
  } else if (this.quantity <= this.minQuantity) {
    this.status = MedicineStatus.LOW_STOCK;
  } else {
    this.status = MedicineStatus.AVAILABLE;
  }

  if (this.expiryDate && this.expiryDate < new Date()) {
    this.status = MedicineStatus.EXPIRED;
  }
});

export const Medicine = mongoose.model<IMedicine>('Medicine', medicineSchema);
export const MedicineInventory = mongoose.model<IMedicineInventory>(
  'MedicineInventory',
  medicineInventorySchema
);
