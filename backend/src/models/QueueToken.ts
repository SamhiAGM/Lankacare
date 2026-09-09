import mongoose, { Document, Schema } from 'mongoose';
import crypto from 'crypto';
import { QueueStatus } from '../types/enums';

/**
 * QueueToken — represents a citizen's place in a hospital queue.
 *
 * PRIVACY: Only the citizen themselves can see their own token.
 * QR code contains only a signed random reference — no NIC, blood group, or diagnosis.
 * Queue status endpoints return only aggregate crowd indicators, never individual identities.
 */
export interface IQueueToken extends Document {
  hospital: mongoose.Types.ObjectId;
  department: string;
  serviceType: string;             // e.g. "OPD", "PHARMACY", "CLINIC"

  citizen: mongoose.Types.ObjectId;  // The citizen this token belongs to (private)

  tokenNumber: string;             // Sequential public token e.g. "A-042" — no personal info
  qrReference: string;             // Signed random UUID — NOT NIC/blood group/diagnosis
  status: QueueStatus;

  estimatedServiceTime?: string | null;   // Only shown to token owner
  serviceLocation?: string | null;        // E.g. "OPD Counter 3"

  appointmentId?: mongoose.Types.ObjectId | null;  // If linked to appointment

  bookedAt: Date;
  checkedInAt?: Date | null;
  calledAt?: Date | null;
  completedAt?: Date | null;
  cancelledAt?: Date | null;

  createdAt: Date;
  updatedAt: Date;
}

const queueTokenSchema = new Schema<IQueueToken>(
  {
    hospital: { type: Schema.Types.ObjectId, ref: 'Hospital', required: true, index: true },
    department: { type: String, required: true, index: true },
    serviceType: { type: String, required: true },

    // Citizen ID is indexed but never returned in public/aggregate endpoints
    citizen: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },

    tokenNumber: { type: String, required: true },
    qrReference: {
      type: String,
      required: true,
      unique: true,
      default: () => crypto.randomUUID(),
    },
    status: {
      type: String,
      enum: Object.values(QueueStatus),
      default: QueueStatus.BOOKED,
      index: true,
    },

    estimatedServiceTime: { type: String, default: null },
    serviceLocation: { type: String, default: null },

    appointmentId: { type: Schema.Types.ObjectId, ref: 'Appointment', default: null },

    bookedAt: { type: Date, required: true, default: Date.now },
    checkedInAt: { type: Date, default: null },
    calledAt: { type: Date, default: null },
    completedAt: { type: Date, default: null },
    cancelledAt: { type: Date, default: null },
  },
  { timestamps: true }
);

queueTokenSchema.index({ hospital: 1, department: 1, status: 1 });
queueTokenSchema.index({ citizen: 1, status: 1 });
queueTokenSchema.index({ qrReference: 1 }, { unique: true });

export const QueueToken = mongoose.model<IQueueToken>('QueueToken', queueTokenSchema);
