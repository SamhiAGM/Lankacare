import mongoose, { Document, Schema } from 'mongoose';
import { AuditAction } from '../types/enums';

export interface IAuditLog extends Document {
  user: mongoose.Types.ObjectId;
  action: AuditAction;
  resource: string;
  resourceId?: mongoose.Types.ObjectId;
  details?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  success: boolean;
  createdAt: Date;
}

const auditLogSchema = new Schema<IAuditLog>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    action: { type: String, enum: Object.values(AuditAction), required: true, index: true },
    resource: { type: String, required: true },
    resourceId: { type: Schema.Types.ObjectId },
    details: { type: Schema.Types.Mixed },
    ipAddress: { type: String },
    userAgent: { type: String },
    success: { type: Boolean, default: true },
  },
  { timestamps: true, versionKey: false }
);

auditLogSchema.index({ user: 1, createdAt: -1 });
auditLogSchema.index({ action: 1, createdAt: -1 });

// Auto-expire audit logs after 2 years
auditLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 63072000 });

export const AuditLog = mongoose.model<IAuditLog>('AuditLog', auditLogSchema);
