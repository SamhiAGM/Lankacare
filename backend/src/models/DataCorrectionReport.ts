import mongoose, { Document, Schema } from 'mongoose';
import { DataCorrectionStatus } from '../types/enums';

/**
 * DataCorrectionReport — citizen submission for incorrect hospital/medicine information.
 *
 * CRITICAL: A citizen report NEVER directly modifies official hospital data.
 * Workflow: Submit → DATA_ADMIN Review → Verify Against Source → Approve/Reject → Audit
 */
export interface IDataCorrectionReport extends Document {
  // ── Target ────────────────────────────────────────────────────────────────
  targetType: 'HOSPITAL' | 'MEDICINE' | 'PRACTITIONER' | 'SERVICE_AVAILABILITY';
  targetId: mongoose.Types.ObjectId;
  targetName: string;   // Denormalized for admin review readability

  // ── Report Content ────────────────────────────────────────────────────────
  reportedField: string;   // e.g. "phone", "address", "officialCategory"
  currentValue?: string;   // What's currently in the database
  reportedCorrectValue?: string;  // What the citizen believes is correct
  description: string;     // Free-text description of the issue
  issueType:
    | 'WRONG_LOCATION'
    | 'WRONG_TELEPHONE'
    | 'WRONG_CATEGORY'
    | 'WRONG_SERVICE'
    | 'WRONG_MEDICINE_INFO'
    | 'DUPLICATE_FACILITY'
    | 'FACILITY_CLOSED'
    | 'OTHER';

  // ── Submission ────────────────────────────────────────────────────────────
  submittedBy?: mongoose.Types.ObjectId | null;  // null if anonymous
  submitterEmail?: string | null;
  submittedAt: Date;

  // ── Resolution Workflow ───────────────────────────────────────────────────
  status: DataCorrectionStatus;
  assignedTo?: mongoose.Types.ObjectId | null;   // DATA_ADMIN
  reviewNotes?: string | null;
  verificationEvidence?: string | null;
  resolvedAt?: Date | null;
  resolvedBy?: mongoose.Types.ObjectId | null;

  createdAt: Date;
  updatedAt: Date;
}

const dataCorrectionReportSchema = new Schema<IDataCorrectionReport>(
  {
    targetType: {
      type: String,
      enum: ['HOSPITAL', 'MEDICINE', 'PRACTITIONER', 'SERVICE_AVAILABILITY'],
      required: true,
      index: true,
    },
    targetId: { type: Schema.Types.ObjectId, required: true, index: true },
    targetName: { type: String, required: true },

    reportedField: { type: String, required: true },
    currentValue: { type: String },
    reportedCorrectValue: { type: String },
    description: { type: String, required: true, maxlength: 2000 },
    issueType: {
      type: String,
      enum: [
        'WRONG_LOCATION', 'WRONG_TELEPHONE', 'WRONG_CATEGORY',
        'WRONG_SERVICE', 'WRONG_MEDICINE_INFO', 'DUPLICATE_FACILITY',
        'FACILITY_CLOSED', 'OTHER',
      ],
      required: true,
    },

    submittedBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    submitterEmail: { type: String, default: null },
    submittedAt: { type: Date, required: true, default: Date.now },

    status: {
      type: String,
      enum: Object.values(DataCorrectionStatus),
      default: DataCorrectionStatus.SUBMITTED,
      index: true,
    },
    assignedTo: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    reviewNotes: { type: String, default: null },
    verificationEvidence: { type: String, default: null },
    resolvedAt: { type: Date, default: null },
    resolvedBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { timestamps: true }
);

dataCorrectionReportSchema.index({ status: 1, submittedAt: -1 });
dataCorrectionReportSchema.index({ targetType: 1, targetId: 1 });

export const DataCorrectionReport = mongoose.model<IDataCorrectionReport>(
  'DataCorrectionReport',
  dataCorrectionReportSchema
);
