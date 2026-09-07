import mongoose, { Document, Schema } from 'mongoose';

export interface IPatient extends Document {
  nationalId: string;
  name: string;
  dateOfBirth: Date;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  bloodType?: string;
  phone: string;
  email?: string;
  address: {
    street: string;
    city: string;
    district: string;
  };
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
  };
  registeredBy: mongoose.Types.ObjectId;
  medicalHistory?: string;
  allergies?: string[];
  chronicConditions?: string[];
  isDemo: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const patientSchema = new Schema<IPatient>(
  {
    nationalId: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true, trim: true, index: true },
    dateOfBirth: { type: Date, required: true },
    gender: { type: String, enum: ['MALE', 'FEMALE', 'OTHER'], required: true },
    bloodType: { type: String, enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] },
    phone: { type: String, required: true },
    email: { type: String },
    address: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      district: { type: String, required: true },
    },
    emergencyContact: {
      name: { type: String, required: true },
      relationship: { type: String, required: true },
      phone: { type: String, required: true },
    },
    registeredBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    medicalHistory: { type: String },
    allergies: [{ type: String }],
    chronicConditions: [{ type: String }],
    isDemo: { type: Boolean, default: false },
  },
  { timestamps: true }
);

patientSchema.index({ nationalId: 1 });
patientSchema.index({ name: 'text' });

export const Patient = mongoose.model<IPatient>('Patient', patientSchema);
