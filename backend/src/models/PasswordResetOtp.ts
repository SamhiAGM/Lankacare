import mongoose, { Document, Schema } from 'mongoose';

export enum OtpPurpose {
  PASSWORD_RESET = 'PASSWORD_RESET',
}

export enum OtpChannel {
  EMAIL = 'EMAIL',
  SMS = 'SMS',
}

export interface IPasswordResetOtp extends Document {
  user: mongoose.Types.ObjectId;
  purpose: OtpPurpose;
  channel: OtpChannel;
  destinationHash: string; // Hash of email or phone to prevent plain text PII exposure in DB where possible (optional depending on strictness)
  otpHash: string;
  expiresAt: Date;
  attemptCount: number;
  maxAttempts: number;
  resendCount: number;
  usedAt?: Date;
  requestIpHash?: string;
  createdAt: Date;
  updatedAt: Date;
}

const passwordResetOtpSchema = new Schema<IPasswordResetOtp>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    purpose: { type: String, enum: Object.values(OtpPurpose), required: true },
    channel: { type: String, enum: Object.values(OtpChannel), required: true },
    destinationHash: { type: String, required: true },
    otpHash: { type: String, required: true },
    expiresAt: { type: Date, required: true },
    attemptCount: { type: Number, default: 0 },
    maxAttempts: { type: Number, default: 5 },
    resendCount: { type: Number, default: 0 },
    usedAt: { type: Date },
    requestIpHash: { type: String },
  },
  { timestamps: true }
);

// TTL Index: automatically delete document when it expires (MongoDB TTL background thread runs every ~60s)
passwordResetOtpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Prevent multiple active OTPs for the same user/purpose to simplify management
passwordResetOtpSchema.index({ user: 1, purpose: 1 }, { unique: false }); // Let service manage this by invalidating old ones

export const PasswordResetOtp = mongoose.model<IPasswordResetOtp>('PasswordResetOtp', passwordResetOtpSchema);
