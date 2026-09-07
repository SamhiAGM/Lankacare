import mongoose, { Document, Schema } from 'mongoose';
import { SriLankaRegion } from '../types/enums';

export interface IHealthCampaign extends Document {
  title: string;
  type: string;
  description: string;
  objectives: string[];
  startDate: Date;
  endDate: Date;
  targetPopulation: string;
  targetCount?: number;
  reachedCount: number;
  regions: SriLankaRegion[];
  hospitals: mongoose.Types.ObjectId[];
  budget?: number;
  status: 'PLANNED' | 'ACTIVE' | 'COMPLETED' | 'SUSPENDED';
  resources?: { title: string; url: string }[];
  imageUrl?: string;
  createdBy: mongoose.Types.ObjectId;
  isDemo: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const healthCampaignSchema = new Schema<IHealthCampaign>(
  {
    title: { type: String, required: true, trim: true },
    type: {
      type: String,
      required: true,
      enum: [
        'VACCINATION',
        'AWARENESS',
        'SCREENING',
        'NUTRITION',
        'MENTAL_HEALTH',
        'MATERNAL_HEALTH',
        'CHILD_HEALTH',
        'CHRONIC_DISEASE',
        'PREVENTION',
        'OTHER',
      ],
    },
    description: { type: String, required: true },
    objectives: [{ type: String }],
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    targetPopulation: { type: String, required: true },
    targetCount: { type: Number },
    reachedCount: { type: Number, default: 0 },
    regions: [{ type: String, enum: Object.values(SriLankaRegion) }],
    hospitals: [{ type: Schema.Types.ObjectId, ref: 'Hospital' }],
    budget: { type: Number },
    status: {
      type: String,
      enum: ['PLANNED', 'ACTIVE', 'COMPLETED', 'SUSPENDED'],
      default: 'PLANNED',
      index: true,
    },
    resources: [
      {
        title: { type: String },
        url: { type: String },
      },
    ],
    imageUrl: { type: String },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    isDemo: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const HealthCampaign = mongoose.model<IHealthCampaign>('HealthCampaign', healthCampaignSchema);
