import mongoose, { Document, Schema } from 'mongoose';
import { ServiceAvailabilityStatus } from '../types/enums';

/**
 * HospitalServiceAvailability — tracks whether a specific service is currently available.
 *
 * Status is UNKNOWN by default unless a participating hospital provides updates.
 * NEVER show "OPEN NOW" without actual schedule/status information.
 */
export interface IHospitalServiceAvailability extends Document {
  hospital: mongoose.Types.ObjectId;
  serviceId: string;          // Standardised service identifier e.g. "OPD", "EMERGENCY", "PHARMACY"
  serviceName: string;        // Human-readable name
  status: ServiceAvailabilityStatus;
  schedule?: {
    days: string[];           // ["MONDAY", "TUESDAY", ...]
    startTime?: string;       // "08:00"
    endTime?: string;         // "17:00"
    notes?: string;
  } | null;
  lastUpdated: Date;
  updatedBy?: mongoose.Types.ObjectId;
  source?: string;            // e.g. "Hospital admin update"
  verifiedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const hospitalServiceAvailabilitySchema = new Schema<IHospitalServiceAvailability>(
  {
    hospital: { type: Schema.Types.ObjectId, ref: 'Hospital', required: true, index: true },
    serviceId: { type: String, required: true, index: true },
    serviceName: { type: String, required: true },
    status: {
      type: String,
      enum: Object.values(ServiceAvailabilityStatus),
      default: ServiceAvailabilityStatus.UNKNOWN,
      index: true,
    },
    schedule: {
      days: [{ type: String }],
      startTime: { type: String },
      endTime: { type: String },
      notes: { type: String },
    },
    lastUpdated: { type: Date, required: true, default: Date.now },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    source: { type: String },
    verifiedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

hospitalServiceAvailabilitySchema.index({ hospital: 1, serviceId: 1 }, { unique: true });
hospitalServiceAvailabilitySchema.index({ hospital: 1, status: 1 });

export const HospitalServiceAvailability = mongoose.model<IHospitalServiceAvailability>(
  'HospitalServiceAvailability',
  hospitalServiceAvailabilitySchema
);
