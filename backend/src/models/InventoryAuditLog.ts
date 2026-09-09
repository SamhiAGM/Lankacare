import mongoose, { Document, Schema } from 'mongoose';
import { MedicineStatus, FreshnessStatus } from '../types/enums';

/**
 * InventoryAuditLog — immutable record of every medicine stock change.
 *
 * Every pharmacy update MUST create an audit record.
 * Records are never deleted or overwritten.
 * Citizen-facing data NEVER exposes this log.
 */
export interface IInventoryAuditLog extends Document {
  hospital: mongoose.Types.ObjectId;
  medicine: mongoose.Types.ObjectId;
  medicineName: string;        // Denormalized for audit readability

  // ── Before / After ────────────────────────────────────────────────────────
  previousQuantity?: number | null;
  newQuantity?: number | null;
  previousStatus?: MedicineStatus | null;
  newStatus?: MedicineStatus | null;
  unit: string;

  // ── Actor ──────────────────────────────────────────────────────────────────
  updatedBy: mongoose.Types.ObjectId;
  updatedByRole: string;
  ipAddress?: string | null;

  // ── Context ───────────────────────────────────────────────────────────────
  reason?: string | null;
  batchNumber?: string | null;
  expiryDate?: Date | null;
  notes?: string | null;

  createdAt: Date;
}

const inventoryAuditLogSchema = new Schema<IInventoryAuditLog>(
  {
    hospital: { type: Schema.Types.ObjectId, ref: 'Hospital', required: true, index: true },
    medicine: { type: Schema.Types.ObjectId, ref: 'Medicine', required: true, index: true },
    medicineName: { type: String, required: true },

    previousQuantity: { type: Number, default: null },
    newQuantity: { type: Number, default: null },
    previousStatus: {
      type: String,
      enum: [...Object.values(MedicineStatus), null],
      default: null,
    },
    newStatus: {
      type: String,
      enum: Object.values(MedicineStatus),
      default: null,
    },
    unit: { type: String, required: true },

    updatedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    updatedByRole: { type: String, required: true },
    ipAddress: { type: String, default: null },

    reason: { type: String, default: null },
    batchNumber: { type: String, default: null },
    expiryDate: { type: Date, default: null },
    notes: { type: String, default: null },
  },
  {
    timestamps: { createdAt: true, updatedAt: false }, // Audit logs are immutable
    versionKey: false,
  }
);

inventoryAuditLogSchema.index({ hospital: 1, medicine: 1, createdAt: -1 });
inventoryAuditLogSchema.index({ updatedBy: 1, createdAt: -1 });
// Auto-expire after 5 years
inventoryAuditLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 157680000 });

export const InventoryAuditLog = mongoose.model<IInventoryAuditLog>(
  'InventoryAuditLog',
  inventoryAuditLogSchema
);
