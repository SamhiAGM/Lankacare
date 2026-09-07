import mongoose, { Document, Schema } from 'mongoose';
import { ComplaintStatus, ComplaintPriority } from '../types/enums';

export interface IComplaintStatusHistory {
  status: string;
  note: string;
  changedBy: mongoose.Types.ObjectId;
  timestamp: Date;
}

export interface IComplaint extends Document {
  complaintNumber: string;
  submittedBy: mongoose.Types.ObjectId;
  category: string;
  relatedHospital?: mongoose.Types.ObjectId;
  subject: string;
  description: string;
  status: ComplaintStatus;
  priority: ComplaintPriority;
  assignedTo?: mongoose.Types.ObjectId;
  statusHistory: IComplaintStatusHistory[];
  resolutionNote?: string;
  resolvedAt?: Date;
  isDemo: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const complaintSchema = new Schema<IComplaint>(
  {
    complaintNumber: { type: String, unique: true, index: true },
    submittedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    category: {
      type: String,
      required: true,
      enum: [
        'HOSPITAL_SERVICE',
        'APPOINTMENT_ISSUE',
        'MEDICINE_AVAILABILITY',
        'STAFF_COMPLAINT',
        'FACILITY_ISSUE',
        'OTHER',
      ],
    },
    relatedHospital: { type: Schema.Types.ObjectId, ref: 'Hospital' },
    subject: { type: String, required: true },
    description: { type: String, required: true },
    status: {
      type: String,
      enum: Object.values(ComplaintStatus),
      default: ComplaintStatus.SUBMITTED,
      index: true,
    },
    priority: {
      type: String,
      enum: Object.values(ComplaintPriority),
      default: ComplaintPriority.MEDIUM,
    },
    assignedTo: { type: Schema.Types.ObjectId, ref: 'User' },
    statusHistory: [
      {
        status: { type: String },
        note: { type: String },
        changedBy: { type: Schema.Types.ObjectId, ref: 'User' },
        timestamp: { type: Date, default: Date.now },
      },
    ],
    resolutionNote: { type: String },
    resolvedAt: { type: Date },
    isDemo: { type: Boolean, default: false },
  },
  { timestamps: true }
);

complaintSchema.pre('save', async function () {
  if (!this.complaintNumber) {
    this.complaintNumber = `CMP-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
  }
});

export const Complaint = mongoose.model<IComplaint>('Complaint', complaintSchema);
