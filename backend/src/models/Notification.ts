import mongoose, { Document, Schema } from 'mongoose';
import { NotificationPriority } from '../types/enums';

export interface INotification extends Document {
  user: mongoose.Types.ObjectId;
  type: string;
  title: string;
  message: string;
  relatedResource?: string;
  relatedId?: mongoose.Types.ObjectId;
  isRead: boolean;
  priority: NotificationPriority;
  actionUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: {
      type: String,
      required: true,
      enum: [
        'APPOINTMENT_NEW',
        'APPOINTMENT_CANCELLED',
        'APPOINTMENT_CONFIRMED',
        'REFERRAL_RECEIVED',
        'REFERRAL_ACCEPTED',
        'REFERRAL_REJECTED',
        'MEDICINE_SHORTAGE',
        'DISEASE_ALERT',
        'EMERGENCY_INCIDENT',
        'COMPLAINT_UPDATE',
        'ANNOUNCEMENT',
        'GENERAL',
      ],
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    relatedResource: { type: String },
    relatedId: { type: Schema.Types.ObjectId },
    isRead: { type: Boolean, default: false, index: true },
    priority: {
      type: String,
      enum: Object.values(NotificationPriority),
      default: NotificationPriority.MEDIUM,
    },
    actionUrl: { type: String },
  },
  { timestamps: true }
);

notificationSchema.index({ user: 1, isRead: 1, createdAt: -1 });

export const Notification = mongoose.model<INotification>('Notification', notificationSchema);
