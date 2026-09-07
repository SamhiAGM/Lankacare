import mongoose, { Document, Schema } from 'mongoose';
import { AppointmentStatus, AppointmentType } from '../types/enums';

export interface IAppointment extends Document {
  patient: mongoose.Types.ObjectId;
  doctor: mongoose.Types.ObjectId;
  hospital: mongoose.Types.ObjectId;
  department: string;
  appointmentDate: Date;
  timeSlot: string;
  type: AppointmentType;
  status: AppointmentStatus;
  reason: string;
  notes?: string;
  doctorNotes?: string;
  bookedBy: mongoose.Types.ObjectId;
  isDemo: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const appointmentSchema = new Schema<IAppointment>(
  {
    patient: { type: Schema.Types.ObjectId, ref: 'Patient', required: true, index: true },
    doctor: { type: Schema.Types.ObjectId, ref: 'Doctor', required: true, index: true },
    hospital: { type: Schema.Types.ObjectId, ref: 'Hospital', required: true, index: true },
    department: { type: String, required: true },
    appointmentDate: { type: Date, required: true, index: true },
    timeSlot: { type: String, required: true },
    type: {
      type: String,
      enum: Object.values(AppointmentType),
      default: AppointmentType.CONSULTATION,
    },
    status: {
      type: String,
      enum: Object.values(AppointmentStatus),
      default: AppointmentStatus.PENDING,
      index: true,
    },
    reason: { type: String, required: true },
    notes: { type: String },
    doctorNotes: { type: String },
    bookedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    isDemo: { type: Boolean, default: false },
  },
  { timestamps: true }
);

appointmentSchema.index({ appointmentDate: 1, doctor: 1 });
appointmentSchema.index({ patient: 1, status: 1 });

export const Appointment = mongoose.model<IAppointment>('Appointment', appointmentSchema);
