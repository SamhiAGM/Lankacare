import mongoose, { Document, Schema } from 'mongoose';

export interface IPatientMovement {
  id: string;
  fromWard: string;
  toWard: string;
  toBedId: string;
  timestamp: string;
  reason: string;
}

export interface IAdmission extends Document {
  patientId: string;
  patientName: string;
  patientNic: string;
  hospitalId: string;
  hospitalName: string;
  wardName: string;
  bedId: string;
  admissionType: string;
  admittingDiagnosis: string;
  attendingDoctorId: string;
  attendingDoctorName: string;
  admittedAt: string;
  status: string;
  movements: IPatientMovement[];
  dischargeSummary?: {
    dischargedAt: string;
    summary: string;
    followUpInstructions?: string;
    dischargingDoctorId?: string;
  };
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const admissionSchema = new Schema<IAdmission>(
  {
    patientId: { type: String, required: true, index: true },
    patientName: { type: String, required: true },
    patientNic: { type: String, required: true, index: true },
    hospitalId: { type: String, required: true, index: true },
    hospitalName: { type: String, required: true },
    wardName: { type: String, required: true },
    bedId: { type: String, required: true },
    admissionType: { type: String, default: 'EMERGENCY' },
    admittingDiagnosis: { type: String, required: true },
    attendingDoctorId: { type: String, required: true },
    attendingDoctorName: { type: String, required: true },
    admittedAt: { type: String, default: () => new Date().toISOString() },
    status: { type: String, default: 'ADMITTED', index: true },
    movements: [
      {
        id: { type: String, required: true },
        fromWard: { type: String, required: true },
        toWard: { type: String, required: true },
        toBedId: { type: String, required: true },
        timestamp: { type: String, required: true },
        reason: { type: String, required: true },
      },
    ],
    dischargeSummary: {
      dischargedAt: { type: String },
      summary: { type: String },
      followUpInstructions: { type: String },
      dischargingDoctorId: { type: String },
    },
    notes: { type: String },
  },
  { timestamps: true }
);

admissionSchema.index({ hospitalId: 1, status: 1 });
admissionSchema.index({ admittedAt: -1 });
admissionSchema.index({ 'dischargeSummary.dischargedAt': -1 });

export default mongoose.models.Admission || mongoose.model<IAdmission>('Admission', admissionSchema);
