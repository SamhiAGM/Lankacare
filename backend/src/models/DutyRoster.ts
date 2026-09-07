import mongoose, { Document, Schema } from 'mongoose';

export interface IDutyRoster extends Document {
  hospitalId: string;
  hospitalName: string;
  staffId: string;
  staffName: string;
  staffRole: string;
  department: string;
  date: string;
  shiftType: string;
  startTime: string;
  endTime: string;
  status: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const dutyRosterSchema = new Schema<IDutyRoster>(
  {
    hospitalId: { type: String, required: true, index: true },
    hospitalName: { type: String, required: true },
    staffId: { type: String, required: true, index: true },
    staffName: { type: String, required: true },
    staffRole: { type: String, required: true },
    department: { type: String, required: true },
    date: { type: String, required: true, index: true },
    shiftType: { type: String, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    status: { type: String, default: 'SCHEDULED' },
    notes: { type: String },
  },
  { timestamps: true }
);

dutyRosterSchema.index({ staffId: 1, date: 1, shiftType: 1 });

export default mongoose.models.DutyRoster || mongoose.model<IDutyRoster>('DutyRoster', dutyRosterSchema);
