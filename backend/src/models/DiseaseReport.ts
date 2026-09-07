import mongoose, { Document, Schema } from 'mongoose';
import { AlertLevel, SriLankaRegion } from '../types/enums';

export interface IDiseaseReport extends Document {
  disease: string;
  category: string;
  region: SriLankaRegion;
  reportDate: Date;
  confirmedCases: number;
  suspectedCases: number;
  deaths: number;
  recoveries: number;
  activeCases: number;
  alertLevel: AlertLevel;
  trend: 'INCREASING' | 'STABLE' | 'DECREASING';
  notes?: string;
  reportedBy: mongoose.Types.ObjectId;
  hospitals: mongoose.Types.ObjectId[];
  isDemo: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const diseaseReportSchema = new Schema<IDiseaseReport>(
  {
    disease: { type: String, required: true, trim: true, index: true },
    category: { type: String, required: true },
    region: { type: String, enum: Object.values(SriLankaRegion), required: true, index: true },
    reportDate: { type: Date, required: true, index: true },
    confirmedCases: { type: Number, required: true, min: 0 },
    suspectedCases: { type: Number, default: 0 },
    deaths: { type: Number, default: 0 },
    recoveries: { type: Number, default: 0 },
    activeCases: { type: Number, default: 0 },
    alertLevel: {
      type: String,
      enum: Object.values(AlertLevel),
      default: AlertLevel.GREEN,
      index: true,
    },
    trend: {
      type: String,
      enum: ['INCREASING', 'STABLE', 'DECREASING'],
      default: 'STABLE',
    },
    notes: { type: String },
    reportedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    hospitals: [{ type: Schema.Types.ObjectId, ref: 'Hospital' }],
    isDemo: { type: Boolean, default: false },
  },
  { timestamps: true }
);

diseaseReportSchema.index({ disease: 1, region: 1, reportDate: -1 });
diseaseReportSchema.index({ alertLevel: 1, reportDate: -1 });

export const DiseaseReport = mongoose.model<IDiseaseReport>('DiseaseReport', diseaseReportSchema);
