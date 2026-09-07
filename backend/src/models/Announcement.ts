import mongoose, { Document, Schema } from 'mongoose';
import { AnnouncementCategory } from '../types/enums';

export interface IAnnouncement extends Document {
  title: string;
  category: AnnouncementCategory;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  content: string;
  summary: string;
  author: mongoose.Types.ObjectId;
  isPublished: boolean;
  publishedAt?: Date;
  expiresAt?: Date;
  attachments?: { name: string; url: string }[];
  viewCount: number;
  tags: string[];
  isDemo: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const announcementSchema = new Schema<IAnnouncement>(
  {
    title: { type: String, required: true, trim: true, index: true },
    category: {
      type: String,
      enum: Object.values(AnnouncementCategory),
      required: true,
      index: true,
    },
    priority: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'],
      default: 'MEDIUM',
    },
    content: { type: String, required: true },
    summary: { type: String, required: true },
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    isPublished: { type: Boolean, default: false, index: true },
    publishedAt: { type: Date },
    expiresAt: { type: Date },
    attachments: [
      {
        name: { type: String },
        url: { type: String },
      },
    ],
    viewCount: { type: Number, default: 0 },
    tags: [{ type: String }],
    isDemo: { type: Boolean, default: false },
  },
  { timestamps: true }
);

announcementSchema.index({ isPublished: 1, publishedAt: -1 });
announcementSchema.index({ category: 1, isPublished: 1 });

export const Announcement = mongoose.model<IAnnouncement>('Announcement', announcementSchema);
