import mongoose, { Document, Schema } from 'mongoose';

export interface IHospitalBed extends Document {
  hospitalId: string;
  wardName: string;
  bedNumber: string;
  bedType: string;
  status: string;
  currentPatientId?: string;
  currentPatientName?: string;
  hasOxygen: boolean;
  hasVentilator: boolean;
  notes?: string;
  lastUpdated: string;
  createdAt: Date;
  updatedAt: Date;
}

const hospitalBedSchema = new Schema<IHospitalBed>(
  {
    hospitalId: { type: String, required: true, index: true },
    wardName: { type: String, required: true },
    bedNumber: { type: String, required: true },
    bedType: { type: String, required: true },
    status: { type: String, default: 'AVAILABLE', index: true },
    currentPatientId: { type: String },
    currentPatientName: { type: String },
    hasOxygen: { type: Boolean, default: false },
    hasVentilator: { type: Boolean, default: false },
    notes: { type: String },
    lastUpdated: { type: String, default: () => new Date().toISOString() },
  },
  { timestamps: true }
);

hospitalBedSchema.index({ hospitalId: 1, bedNumber: 1 }, { unique: true });
hospitalBedSchema.index({ hospitalId: 1, status: 1 });

export default mongoose.models.HospitalBed || mongoose.model<IHospitalBed>('HospitalBed', hospitalBedSchema);
