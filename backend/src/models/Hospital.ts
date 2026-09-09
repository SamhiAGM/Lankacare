import mongoose, { Document, Schema } from 'mongoose';
import { HospitalStatus, SriLankaRegion, VerificationStatus } from '../types/enums';

// Official Ministry of Health Sri Lanka Classification
// Never collapse these into a generic "General Hospital"
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
  AYURVEDIC_HOSPITAL = 'Ayurvedic Hospital',
  ESTATE_HOSPITAL = 'Estate Hospital',
  ARMED_FORCES_HOSPITAL = 'Armed Forces Hospital',
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
  // ── Identity ─────────────────────────────────────────────────────────────
  facilityCode: string;          // Ministry Unique Facility Code (primary key from dataset)
  officialName: string;          // Exact name from Ministry source
  displayName?: string;          // Localised or simplified display name
  alternativeNames?: string[];   // Known aliases / former names
  nameSi?: string;               // Sinhala name
  nameTa?: string;               // Tamil name

  // ── Classification ────────────────────────────────────────────────────────
  officialCategory: OfficialCategory;
  ownershipType: OwnershipType;

  // ── Sri Lankan Geographic Hierarchy ──────────────────────────────────────
  province: SriLankaRegion;
  district: string;
  rdhsArea?: string;  // Regional Directorate of Health Services Area
  mohArea?: string;   // Medical Officer of Health Area
  town?: string;      // Sub-district locality

  address: {
    street: string;
    city: string;
    postalCode?: string;
  };

  // ── Location ──────────────────────────────────────────────────────────────
  // null when GPS coordinates cannot be verified — NEVER randomly generated
  coordinates?: {
    lat: number;
    lng: number;
  } | null;

  // ── Contact (public-safe only) ────────────────────────────────────────────
  telephoneNumbers?: string[];
  publicEmail?: string | null;
  officialWebsite?: string | null;

  // ── Services ──────────────────────────────────────────────────────────────
  departments: string[];
  publicServices?: string[];         // Verified services available to public
  emergencyServiceStatus?: string;   // AVAILABLE | UNKNOWN — never fabricated

  // ── Bed Statistics (from published reports — not live telemetry) ──────────
  // null means figure not in dataset — DO NOT invent
  publishedBedStrength?: number | null;
  publishedBedReportingYear?: number | null;
  // Legacy fields kept for backward compatibility
  totalBeds: number;
  availableBeds?: number | null;
  icuBedsTotal: number;
  availableIcuBeds?: number | null;

  // ── Operational Status ────────────────────────────────────────────────────
  emergencyAvailable: boolean;
  status: HospitalStatus;

  // ── Data Provenance ───────────────────────────────────────────────────────
  // Reference to DataSource document that this record came from
  sourceId?: mongoose.Types.ObjectId;
  sourceName?: string;           // Human-readable: "Ministry of Health Sri Lanka — Annual Health Statistics 2023"
  sourceUrl?: string;            // URL to the official publication
  verificationStatus: VerificationStatus;
  lastVerifiedAt?: Date | null;  // When data was last confirmed against source
  lastImportedAt?: Date | null;  // When record was last imported/updated from dataset

  // ── Admin ──────────────────────────────────────────────────────────────────
  adminUser?: mongoose.Types.ObjectId;
  accreditation?: string;
  establishedYear?: number | null;
  imageUrl?: string | null;

  createdAt: Date;
  updatedAt: Date;
}

const hospitalSchema = new Schema<IHospital>(
  {
    // ── Identity ────────────────────────────────────────────────────────────
    facilityCode: { type: String, required: true, unique: true, index: true, trim: true },
    officialName: { type: String, required: true, trim: true, index: true },
    displayName: { type: String, trim: true },
    alternativeNames: [{ type: String, trim: true }],
    nameSi: { type: String, trim: true },
    nameTa: { type: String, trim: true },

    // ── Classification ──────────────────────────────────────────────────────
    officialCategory: {
      type: String,
      enum: Object.values(OfficialCategory),
      required: true,
      index: true,
    },
    ownershipType: { type: String, enum: Object.values(OwnershipType), required: true },

    // ── Geographic Hierarchy ────────────────────────────────────────────────
    province: { type: String, enum: Object.values(SriLankaRegion), required: true, index: true },
    district: { type: String, required: true, index: true },
    rdhsArea: { type: String },
    mohArea: { type: String },
    town: { type: String, index: true },

    address: {
      street: { type: String, required: true },
      city: { type: String, required: true, index: true },
      postalCode: { type: String },
    },

    // ── Location ────────────────────────────────────────────────────────────
    coordinates: {
      lat: { type: Number },
      lng: { type: Number },
    },

    // ── Contact ─────────────────────────────────────────────────────────────
    telephoneNumbers: [{ type: String }],
    publicEmail: { type: String, default: null },
    officialWebsite: { type: String, default: null },

    // ── Services ────────────────────────────────────────────────────────────
    departments: [{ type: String }],
    publicServices: [{ type: String }],
    emergencyServiceStatus: { type: String },

    // ── Beds ─────────────────────────────────────────────────────────────────
    publishedBedStrength: { type: Number, default: null },
    publishedBedReportingYear: { type: Number, default: null },
    totalBeds: { type: Number, default: 0, min: 0 },
    availableBeds: { type: Number, default: null, min: 0 },
    icuBedsTotal: { type: Number, default: 0, min: 0 },
    availableIcuBeds: { type: Number, default: null, min: 0 },

    // ── Status ──────────────────────────────────────────────────────────────
    emergencyAvailable: { type: Boolean, default: false },
    status: {
      type: String,
      enum: Object.values(HospitalStatus),
      default: HospitalStatus.OPERATIONAL,
    },

    // ── Data Provenance ──────────────────────────────────────────────────────
    sourceId: { type: Schema.Types.ObjectId, ref: 'DataSource' },
    sourceName: { type: String },
    sourceUrl: { type: String },
    verificationStatus: {
      type: String,
      enum: Object.values(VerificationStatus),
      default: VerificationStatus.PENDING,
      index: true,
    },
    lastVerifiedAt: { type: Date, default: null },
    lastImportedAt: { type: Date, default: null },

    // ── Admin ────────────────────────────────────────────────────────────────
    adminUser: { type: Schema.Types.ObjectId, ref: 'User' },
    accreditation: { type: String },
    establishedYear: { type: Number, default: null },
    imageUrl: { type: String, default: null },
  },
  { timestamps: true }
);

// ── Indexes ──────────────────────────────────────────────────────────────────
hospitalSchema.index({ province: 1, status: 1 });
hospitalSchema.index({ province: 1, district: 1 });
hospitalSchema.index({ officialCategory: 1 });
hospitalSchema.index({ district: 1, officialCategory: 1 });
hospitalSchema.index({ 'address.city': 1 });
// Geospatial index for "find near me" — only used for hospitals with verified coordinates
hospitalSchema.index({ coordinates: '2dsphere' });
hospitalSchema.index({ emergencyAvailable: 1 });
hospitalSchema.index({ verificationStatus: 1 });
hospitalSchema.index({ officialName: 'text', displayName: 'text', alternativeNames: 'text' });

export const Hospital = mongoose.model<IHospital>('Hospital', hospitalSchema);
