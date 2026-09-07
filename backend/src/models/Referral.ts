import mongoose, { Document, Schema } from 'mongoose';
import { ReferralPriority, ReferralStatus } from '../types/enums';

export interface IReferralTimeline {
  status: string;
  note: string;
  updatedBy: mongoose.Types.ObjectId;
  timestamp: Date;
}

export interface IReferral extends Document {
  referralNumber: string;
  patient: mongoose.Types.ObjectId;
  referringDoctor: mongoose.Types.ObjectId;
  referringHospital: mongoose.Types.ObjectId;
  receivingHospital: mongoose.Types.ObjectId;
  department: string;
  requiredSpecialty: string;
  priority: ReferralPriority;
  reason: string;
  clinicalSummary: string;
  status: ReferralStatus;
  timeline: IReferralTimeline[];
  scheduledDate?: Date;
  completedDate?: Date;
  rejectionReason?: string;
  isDemo: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const referralSchema = new Schema<IReferral>(
  {
    referralNumber: { type: String, unique: true, index: true },
    patient: { type: Schema.Types.ObjectId, ref: 'Patient', required: true, index: true },
    referringDoctor: { type: Schema.Types.ObjectId, ref: 'Doctor', required: true },
    referringHospital: { type: Schema.Types.ObjectId, ref: 'Hospital', required: true },
    receivingHospital: { type: Schema.Types.ObjectId, ref: 'Hospital', required: true, index: true },
    department: { type: String, required: true },
    requiredSpecialty: { type: String, required: true },
    priority: {
      type: String,
      enum: Object.values(ReferralPriority),
      default: ReferralPriority.NORMAL,
      index: true,
    },
    reason: { type: String, required: true },
    clinicalSummary: { type: String, required: true },
    status: {
      type: String,
      enum: Object.values(ReferralStatus),
      default: ReferralStatus.PENDING,
      index: true,
    },
    timeline: [
      {
        status: { type: String },
        note: { type: String },
        updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
        timestamp: { type: Date, default: Date.now },
      },
    ],
    scheduledDate: { type: Date },
    completedDate: { type: Date },
    rejectionReason: { type: String },
    isDemo: { type: Boolean, default: false },
  },
  { timestamps: true }
);

referralSchema.pre('save', async function () {
  if (!this.referralNumber) {
    this.referralNumber = `REF-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
  }
});

referralSchema.index({ referringHospital: 1, status: 1 });
referralSchema.index({ receivingHospital: 1, status: 1 });
referralSchema.index({ patient: 1, status: 1 });
referralSchema.index({ createdAt: -1 });

export const Referral = mongoose.model<IReferral>('Referral', referralSchema);
