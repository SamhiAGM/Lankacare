import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from the root .env
dotenv.config({ path: path.join(__dirname, '../../.env') });

import { User } from '../src/models/User';
import { Hospital } from '../src/models/Hospital';
import { Doctor } from '../src/models/Doctor';
import { Patient } from '../src/models/Patient';
import { Appointment } from '../src/models/Appointment';
import { Referral } from '../src/models/Referral';
import { Medicine, MedicineInventory } from '../src/models/Medicine';
import { DiseaseReport } from '../src/models/DiseaseReport';
import { EmergencyIncident } from '../src/models/EmergencyIncident';
import { HealthCampaign } from '../src/models/HealthCampaign';
import { Complaint } from '../src/models/Complaint';
import { Announcement } from '../src/models/Announcement';
import { Notification } from '../src/models/Notification';
import { AuditLog } from '../src/models/AuditLog';

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ministry-health';

async function cleanup() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB. Starting cleanup of ALL dummy/demo data...');

  try {
    // Delete demo users and all fake data
    await User.deleteMany({ $or: [{ isDemo: true }, { email: { $regex: '@example.com' } }] });
    await Doctor.deleteMany({ isDemo: true });
    await Patient.deleteMany({ isDemo: true });
    await Appointment.deleteMany({ isDemo: true });
    await Referral.deleteMany({ isDemo: true });
    await MedicineInventory.deleteMany({ isDemo: true });
    await DiseaseReport.deleteMany({ isDemo: true });
    await EmergencyIncident.deleteMany({ isDemo: true });
    await HealthCampaign.deleteMany({ isDemo: true });
    await Complaint.deleteMany({ isDemo: true });
    await Announcement.deleteMany({ isDemo: true });
    await Notification.deleteMany({ isDemo: true });
    await AuditLog.deleteMany({});
    
    // Note: We don't delete Medicine master data or Hospitals if they are real
    // but we can delete fake ones:
    await Hospital.deleteMany({ isDemo: true });

    console.log('Cleanup completed successfully. All fake data removed.');
  } catch (error) {
    console.error('Error during cleanup:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB.');
  }
}

cleanup();
