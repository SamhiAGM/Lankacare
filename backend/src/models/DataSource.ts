import mongoose, { Document, Schema } from 'mongoose';
import { DataSourceType, VerificationStatus } from '../types/enums';

/**
 * DataSource — tracks the authoritative origin of every piece of data in LankaCare.
 * Every hospital, medicine, and public-health record references one of these.
 * Citizens can view the data source via the "View Data Source" button.
 */
export interface IDataSource extends Document {
  name: string;                       // "Ministry of Health Sri Lanka — Annual Health Statistics 2023"
  organization: string;               // "Ministry of Health, Nutrition and Indigenous Medicine"
  sourceUrl: string;                  // URL to the publication/dataset
  dataset: string;                    // "List of Hospitals 2023" / "NMRA Drug Register"
  version?: string;                   // Dataset version or edition
  publishedAt?: Date | null;          // Official publication date
  retrievedAt: Date;                  // When we downloaded / accessed this source
  type: DataSourceType;
  verificationStatus: VerificationStatus;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const dataSourceSchema = new Schema<IDataSource>(
  {
    name: { type: String, required: true, trim: true, unique: true, index: true },
    organization: { type: String, required: true, trim: true },
    sourceUrl: { type: String, required: true, trim: true },
    dataset: { type: String, required: true, trim: true },
    version: { type: String },
    publishedAt: { type: Date, default: null },
    retrievedAt: { type: Date, required: true, default: Date.now },
    type: {
      type: String,
      enum: Object.values(DataSourceType),
      required: true,
      default: DataSourceType.OFFICIAL_GOVERNMENT,
    },
    verificationStatus: {
      type: String,
      enum: Object.values(VerificationStatus),
      default: VerificationStatus.VERIFIED,
    },
    notes: { type: String },
  },
  { timestamps: true }
);

export const DataSource = mongoose.model<IDataSource>('DataSource', dataSourceSchema);
