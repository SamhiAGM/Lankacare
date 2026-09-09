import mongoose, { Document, Schema } from 'mongoose';
import { HospitalStatus, SriLankaRegion } from '../types/enums';

// Official Ministry of Health Sri Lanka Classification
export enum OfficialCategory {
  NATIONAL_HOSPITAL = 'National Hospital',
  TEACHING_HOSPITAL = 'Teaching Hospital',
  PROVINCIAL_GENERAL_HOSPITAL = 'Provincial General Hospital',
  DISTRICT_GENERAL_HOSPITAL = 'District General Hospital',
  BASE_HOSPITAL_TYPE_A = 'Base Hospital Type A',
  BASE_HOSPITAL_TYPE_B = 'Base Hospital Type B',
  DIVISIONAL_HOSPITAL_TYPE_A = 'Divisional Hospital Type A',
  DIVISIONAL_HOSPITAL_TYPE_B = 'Divisional Hospital Type B',
  DIVISIONAL_HOSPITAL_TYPE_C = 'Divisional Hospital Type C',
  PRIMARY_MEDICAL_CARE_UNIT = 'Primary Medical Care Unit',
  SPECIALIZED_HOSPITAL = 'Specialized Hospital',
  MATERNITY_HOME = 'Maternity Home',
  MEDICAL_OFFICER_OF_HEALTH = 'MOH Office',
}

export enum OwnershipType {
  MINISTRY_OF_HEALTH_LINE = 'MOH Line Ministry',
  PROVINCIAL_COUNCIL = 'Provincial Council',
  ARMED_FORCES = 'Armed Forces',
  PRIVATE_SECTOR = 'Private Sector',
  ESTATE_SECTOR = 'Estate Sector',
  LOCAL_AUTHORITY = 'Local Authority',
  NGO = 'NGO/Charity',
}

export interface IHospital extends Document {
  facilityCode: string; // Ministry Unique ID
  name: string;
  officialCategory: OfficialCategory;
  ownershipType: OwnershipType;
  
  // Sri Lankan Geo Hierarchy
  province: SriLankaRegion;
  district: string;
  mohArea?: string; // Medical Officer of Health Area
  rdhsArea?: string; // Regional Directorate of Health Services Area
  
  address: {
    street: string;
    city: string;
    postalCode?: string;
  };
  coordinates?: { lat: number; lng: number };
  
  // Bed statistics (reported vs live)
  totalBeds: number;
  availableBeds?: number; // Nullable if telemetry not active
  icuBedsTotal: number;
  availableIcuBeds?: number;
  
  emergencyAvailable: boolean;
  status: HospitalStatus;
  
  phone?: string;
  email?: string;
  website?: string;
  adminUser?: mongoose.Types.ObjectId;
  departments: string[];
  accreditation?: string;
  establishedYear?: number;
  imageUrl?: string;
  
  createdAt: Date;
  updatedAt: Date;
}

const hospitalSchema = new Schema<IHospital>(
  {
    facilityCode: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true, trim: true, index: true },
    officialCategory: { type: String, enum: Object.values(OfficialCategory), required: true },
    ownershipType: { type: String, enum: Object.values(OwnershipType), required: true },
    province: { type: String, enum: Object.values(SriLankaRegion), required: true, index: true },
    district: { type: String, required: true, index: true },
    mohArea: { type: String },
    rdhsArea: { type: String },
    
    address: {
      street: { type: String, required: true },
      city: { type: String, required: true, index: true },
      postalCode: { type: String },
    },
    coordinates: {
      lat: { type: Number },
      lng: { type: Number },
    },
    
    totalBeds: { type: Number, required: true, min: 0 },
    availableBeds: { type: Number, min: 0 },
    icuBedsTotal: { type: Number, default: 0, min: 0 },
    availableIcuBeds: { type: Number, min: 0 },
    
    emergencyAvailable: { type: Boolean, default: true },
    status: {
      type: String,
      enum: Object.values(HospitalStatus),
      default: HospitalStatus.OPERATIONAL,
    },
    phone: { type: String },
    email: { type: String },
    website: { type: String },
    adminUser: { type: Schema.Types.ObjectId, ref: 'User' },
    departments: [{ type: String }],
    accreditation: { type: String },
    establishedYear: { type: Number },
    imageUrl: { type: String },
  },
  { timestamps: true }
);

hospitalSchema.index({ province: 1, status: 1 });
hospitalSchema.index({ officialCategory: 1 });
hospitalSchema.index({ 'address.city': 1 });
hospitalSchema.index({ district: 1 });
hospitalSchema.index({ coordinates: '2dsphere' }); // Proper geospatial index
hospitalSchema.index({ emergencyAvailable: 1 });

export const Hospital = mongoose.model<IHospital>('Hospital', hospitalSchema);
