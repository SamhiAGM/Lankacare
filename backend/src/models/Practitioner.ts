import mongoose, { Document, Schema } from 'mongoose';
import { SlmcRegistrationStatus, VerificationStatus } from '../types/enums';

/**
 * Practitioner — represents a healthcare professional's verified professional identity.
 *
 * IMPORTANT ARCHITECTURE SEPARATION:
 * - This model verifies the PRACTITIONER (via SLMC or other registrar).
 * - It does NOT prove that a practitioner works at any specific hospital.
 * - Hospital assignment is handled by HospitalStaffAssignment (separate model).
 * - Never infer employment from SLMC registration alone.
 */
export interface IPractitioner extends Document {
  // ── Professional Identity (from SLMC or other authoritative body) ─────────
  fullName: string;
  slmcRegistrationNumber?: string | null;  // Sri Lanka Medical Council number
  registrationStatus: SlmcRegistrationStatus;
  registrationType?: string | null;        // e.g. "Full Registration", "Temporary"

  // ── Qualifications (from verified source only) ────────────────────────────
  qualifications?: string[];               // e.g. ["MBBS", "MD (Medicine)"]
  specialistDiscipline?: string | null;    // e.g. "Cardiology" — only from verified source

  // ── Verification ──────────────────────────────────────────────────────────
  verificationStatus: VerificationStatus;
  verifiedAt?: Date | null;
  verifiedBy?: mongoose.Types.ObjectId;    // DATA_ADMIN user who performed verification
  verificationSource?: string;             // "SLMC Registry" / "Manual verification by DATA_ADMIN"

  // ── Privacy ───────────────────────────────────────────────────────────────
  // Private fields — NEVER exposed in public API responses
  privatePhone?: string | null;
  privateEmail?: string | null;

  // ── User Account Link (optional) ─────────────────────────────────────────
  userId?: mongoose.Types.ObjectId | null;  // If practitioner has a LankaCare account

  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const practitionerSchema = new Schema<IPractitioner>(
  {
    fullName: { type: String, required: true, trim: true, index: true },
    slmcRegistrationNumber: { type: String, default: null, sparse: true, index: true },
    registrationStatus: {
      type: String,
      enum: Object.values(SlmcRegistrationStatus),
      default: SlmcRegistrationStatus.UNKNOWN,
      index: true,
    },
    registrationType: { type: String, default: null },
    qualifications: [{ type: String }],
    specialistDiscipline: { type: String, default: null },

    verificationStatus: {
      type: String,
      enum: Object.values(VerificationStatus),
      default: VerificationStatus.PENDING,
      index: true,
    },
    verifiedAt: { type: Date, default: null },
    verifiedBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    verificationSource: { type: String },

    privatePhone: { type: String, default: null, select: false },
    privateEmail: { type: String, default: null, select: false },

    userId: { type: Schema.Types.ObjectId, ref: 'User', default: null, sparse: true },
    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

practitionerSchema.index({ slmcRegistrationNumber: 1 }, { sparse: true });
practitionerSchema.index({ fullName: 'text' });

export const Practitioner = mongoose.model<IPractitioner>('Practitioner', practitionerSchema);
