import mongoose, { Document, Schema } from 'mongoose';
import { EmergencySeverity, EmergencyStatus, SriLankaRegion } from '../types/enums';

export interface IEmergencyTimeline {
  action: string;
  note: string;
  performedBy: mongoose.Types.ObjectId;
  timestamp: Date;
}

export interface IEmergencyIncident extends Document {
  incidentNumber: string;
  title: string;
  type: string;
  severity: EmergencySeverity;
  status: EmergencyStatus;
  region: SriLankaRegion;
  hospital?: mongoose.Types.ObjectId;
  description: string;
  affectedPeople?: number;
  casualties?: number;
  timeline: IEmergencyTimeline[];
  assignedTeam?: string[];
  contactPerson?: string;
  contactPhone?: string;
  resolvedAt?: Date;
  reportedBy: mongoose.Types.ObjectId;
  isDemo: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const emergencySchema = new Schema<IEmergencyIncident>(
  {
    incidentNumber: { type: String, unique: true, index: true },
    title: { type: String, required: true, trim: true },
    type: {
      type: String,
      required: true,
      enum: [
        'MASS_CASUALTY',
        'DISEASE_OUTBREAK',
        'NATURAL_DISASTER',
        'INFRASTRUCTURE_FAILURE',
        'CHEMICAL_HAZARD',
        'FLOOD',
        'FIRE',
        'OTHER',
      ],
    },
    severity: {
      type: String,
      enum: Object.values(EmergencySeverity),
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: Object.values(EmergencyStatus),
      default: EmergencyStatus.ACTIVE,
      index: true,
    },
    region: { type: String, enum: Object.values(SriLankaRegion), required: true, index: true },
    hospital: { type: Schema.Types.ObjectId, ref: 'Hospital' },
    description: { type: String, required: true },
    affectedPeople: { type: Number },
    casualties: { type: Number, default: 0 },
    timeline: [
      {
        action: { type: String },
        note: { type: String },
        performedBy: { type: Schema.Types.ObjectId, ref: 'User' },
        timestamp: { type: Date, default: Date.now },
      },
    ],
    assignedTeam: [{ type: String }],
    contactPerson: { type: String },
    contactPhone: { type: String },
    resolvedAt: { type: Date },
    reportedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    isDemo: { type: Boolean, default: false },
  },
  { timestamps: true }
);

emergencySchema.pre('save', async function () {
  if (!this.incidentNumber) {
    this.incidentNumber = `INC-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
  }
});

emergencySchema.index({ severity: 1, status: 1, createdAt: -1 });

export const EmergencyIncident = mongoose.model<IEmergencyIncident>(
  'EmergencyIncident',
  emergencySchema
);
