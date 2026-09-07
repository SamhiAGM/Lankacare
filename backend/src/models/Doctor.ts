import mongoose, { Document, Schema } from 'mongoose';

export interface IDoctor extends Document {
  user: mongoose.Types.ObjectId;
  hospital: mongoose.Types.ObjectId;
  department: string;
  specialty: string;
  licenseNumber: string;
  qualification: string;
  experience: number;
  consultationFee?: number;
  bio?: string;
  availability: {
    day: string;
    startTime: string;
    endTime: string;
    maxAppointments: number;
  }[];
  isAvailable: boolean;
  rating?: number;
  totalReviews?: number;
  isDemo: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const doctorSchema = new Schema<IDoctor>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    hospital: { type: Schema.Types.ObjectId, ref: 'Hospital', required: true, index: true },
    department: { type: String, required: true, index: true },
    specialty: { type: String, required: true, index: true },
    licenseNumber: { type: String, required: true, unique: true },
    qualification: { type: String, required: true },
    experience: { type: Number, required: true, min: 0 },
    consultationFee: { type: Number },
    bio: { type: String },
    availability: [
      {
        day: {
          type: String,
          enum: ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'],
        },
        startTime: { type: String },
        endTime: { type: String },
        maxAppointments: { type: Number, default: 20 },
      },
    ],
    isAvailable: { type: Boolean, default: true },
    rating: { type: Number, min: 0, max: 5 },
    totalReviews: { type: Number, default: 0 },
    isDemo: { type: Boolean, default: false },
  },
  { timestamps: true }
);

doctorSchema.index({ hospital: 1, department: 1 });
doctorSchema.index({ specialty: 1 });

export const Doctor = mongoose.model<IDoctor>('Doctor', doctorSchema);
