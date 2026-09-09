import mongoose, { Document, Schema } from 'mongoose';

export interface IOtp extends Document {
  user: mongoose.Types.ObjectId;
  otpHash: string;
  expiresAt: Date;
  attempts: number;
}

const otpSchema = new Schema<IOtp>({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true }, // one active OTP per user
  otpHash: { type: String, required: true },
  expiresAt: { type: Date, required: true },
  attempts: { type: Number, default: 0 },
});

// TTL Index for automatic expiration and cleanup
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const Otp = mongoose.model<IOtp>('Otp', otpSchema);
