import mongoose, { Document, Schema } from 'mongoose';
import { VerificationStatus } from '../types/enums';

/**
 * HospitalStaffAssignment — links a verified Practitioner to a specific Hospital.
 *
 * CRITICAL: This is entirely separate from SLMC registration.
 * Existence in SLMC does NOT automatically mean assignment to any hospital.
 * Assignment must come from an authorized hospital data source.
 */
export interface IHospitalStaffAssignment extends Document {
  practitioner: mongoose.Types.ObjectId;
  hospital: mongoose.Types.ObjectId;
  department: string;
  role: string;                        // e.g. "Consultant Physician", "Medical Officer", "Nurse"
  employmentStatus: 'ACTIVE' | 'INACTIVE' | 'TRANSFERRED' | 'RESIGNED' | 'UNKNOWN';

  // ── Public-safe clinic information (where authorized for publication) ────
  clinicDays?: string[];               // e.g. ["MONDAY", "THURSDAY"]
  clinicStartTime?: string | null;
  clinicEndTime?: string | null;

  // ── Assignment Verification ───────────────────────────────────────────────
  verificationStatus: VerificationStatus;
  assignmentSource: string;            // "Authorized hospital data" / "Ministry circular"
  assignedAt?: Date | null;
  verifiedBy?: mongoose.Types.ObjectId;

  isPubliclyVisible: boolean;          // Whether to show on hospital's public doctor page
  createdAt: Date;
  updatedAt: Date;
}

const hospitalStaffAssignmentSchema = new Schema<IHospitalStaffAssignment>(
  {
    practitioner: {
      type: Schema.Types.ObjectId,
      ref: 'Practitioner',
      required: true,
      index: true,
    },
    hospital: {
      type: Schema.Types.ObjectId,
      ref: 'Hospital',
      required: true,
      index: true,
    },
    department: { type: String, required: true, index: true },
    role: { type: String, required: true },
    employmentStatus: {
      type: String,
      enum: ['ACTIVE', 'INACTIVE', 'TRANSFERRED', 'RESIGNED', 'UNKNOWN'],
      default: 'ACTIVE',
      index: true,
    },

    clinicDays: [{ type: String }],
    clinicStartTime: { type: String, default: null },
    clinicEndTime: { type: String, default: null },

    verificationStatus: {
      type: String,
      enum: Object.values(VerificationStatus),
      default: VerificationStatus.PENDING,
    },
    assignmentSource: { type: String, required: true },
    assignedAt: { type: Date, default: null },
    verifiedBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },

    isPubliclyVisible: { type: Boolean, default: false },
  },
  { timestamps: true }
);

hospitalStaffAssignmentSchema.index({ hospital: 1, department: 1 });
hospitalStaffAssignmentSchema.index({ hospital: 1, employmentStatus: 1 });
hospitalStaffAssignmentSchema.index({ practitioner: 1, hospital: 1 });

export const HospitalStaffAssignment = mongoose.model<IHospitalStaffAssignment>(
  'HospitalStaffAssignment',
  hospitalStaffAssignmentSchema
);
