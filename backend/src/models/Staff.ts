import mongoose, { Document, Schema } from 'mongoose';

export interface IStaff extends Document {
  hospitalId: string;
  hospitalName: string;
  name: string;
  role: string;
  specialization?: string;
  department: string;
  slmcNumber?: string;
  nic: string;
  phone: string;
  email?: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const staffSchema = new Schema<IStaff>(
  {
    hospitalId: { type: String, required: true, index: true },
    hospitalName: { type: String, required: true },
    name: { type: String, required: true, trim: true },
    role: { type: String, required: true, index: true },
    specialization: { type: String },
    department: { type: String, required: true },
    slmcNumber: { type: String },
    nic: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.models.Staff || mongoose.model<IStaff>('Staff', staffSchema);
