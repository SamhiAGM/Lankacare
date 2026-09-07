import mongoose, { Document, Schema } from 'mongoose';
import { HospitalType, HospitalStatus, SriLankaRegion } from '../types/enums';

export interface IHospital extends Document {
  name: string;
  type: HospitalType;
  region: SriLankaRegion;
  address: {
    street: string;
    city: string;
    district: string;
    postalCode?: string;
  };
  coordinates?: { lat: number; lng: number };
  totalBeds: number;
  availableBeds: number;
  icuBeds: number;
  availableIcuBeds: number;
  emergencyAvailable: boolean;
  status: HospitalStatus;
  phone: string;
  email?: string;
  website?: string;
  adminUser?: mongoose.Types.ObjectId;
  departments: string[];
  accreditation?: string;
  establishedYear?: number;
  imageUrl?: string;
  isDemo: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const hospitalSchema = new Schema<IHospital>(
  {
    name: { type: String, required: true, trim: true, index: true },
    type: { type: String, enum: Object.values(HospitalType), required: true },
    region: { type: String, enum: Object.values(SriLankaRegion), required: true, index: true },
    address: {
      street: { type: String, required: true },
      city: { type: String, required: true, index: true },
      district: { type: String, required: true },
      postalCode: { type: String },
    },
    coordinates: {
      lat: { type: Number },
      lng: { type: Number },
    },
    totalBeds: { type: Number, required: true, min: 0 },
    availableBeds: { type: Number, required: true, min: 0 },
    icuBeds: { type: Number, default: 0 },
    availableIcuBeds: { type: Number, default: 0 },
    emergencyAvailable: { type: Boolean, default: true },
    status: {
      type: String,
      enum: Object.values(HospitalStatus),
      default: HospitalStatus.OPERATIONAL,
    },
    phone: { type: String, required: true },
    email: { type: String },
    website: { type: String },
    adminUser: { type: Schema.Types.ObjectId, ref: 'User' },
    departments: [{ type: String }],
    accreditation: { type: String },
    establishedYear: { type: Number },
    imageUrl: { type: String },
    isDemo: { type: Boolean, default: false },
  },
  { timestamps: true }
);

hospitalSchema.index({ region: 1, status: 1 });
hospitalSchema.index({ 'address.city': 1 });
hospitalSchema.index({ 'address.district': 1 });
hospitalSchema.index({ 'coordinates.lat': 1, 'coordinates.lng': 1 });
hospitalSchema.index({ emergencyAvailable: 1 });

export const Hospital = mongoose.model<IHospital>('Hospital', hospitalSchema);
