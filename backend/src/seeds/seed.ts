/**
 * ================================================================
 * MINISTRY OF HEALTH DIGITAL HEALTH PLATFORM — DATABASE SEEDER
 * ================================================================
 * ⚠️  WARNING: ALL DATA BELOW IS DEMO/SAMPLE DATA
 * ⚠️  DO NOT USE IN PRODUCTION
 * ⚠️  Run with: npm run seed
 * ================================================================
 */

import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import { User } from '../models/User';
import { Hospital } from '../models/Hospital';
import { Doctor } from '../models/Doctor';
import { Patient } from '../models/Patient';
import { Appointment } from '../models/Appointment';
import { Referral } from '../models/Referral';
import { Medicine, MedicineInventory } from '../models/Medicine';
import { DiseaseReport } from '../models/DiseaseReport';
import { EmergencyIncident } from '../models/EmergencyIncident';
import { HealthCampaign } from '../models/HealthCampaign';
import { Complaint } from '../models/Complaint';
import { Announcement } from '../models/Announcement';
import { Notification } from '../models/Notification';

import {
  UserRole, HospitalType, HospitalStatus, SriLankaRegion,
  AppointmentStatus, AppointmentType, ReferralPriority, ReferralStatus,
  MedicineStatus, AlertLevel, EmergencySeverity, EmergencyStatus,
  ComplaintStatus, ComplaintPriority, AnnouncementCategory, AuditAction,
} from '../types/enums';
import { AuditLog } from '../models/AuditLog';

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ministry-health';

const log = (msg: string) => console.log(`[SEED] ${msg}`);

async function seed() {
  await mongoose.connect(MONGO_URI);
  log('Connected to MongoDB');

  // Clear existing demo data
  log('Clearing existing demo data...');
  await Promise.all([
    User.deleteMany({ $or: [{ isDemo: true }, { email: { $regex: '@example.com' } }] }),
    Hospital.deleteMany({ isDemo: true }),
    Doctor.deleteMany({ isDemo: true }),
    Patient.deleteMany({ isDemo: true }),
    Appointment.deleteMany({ isDemo: true }),
    Referral.deleteMany({ isDemo: true }),
    Medicine.deleteMany({}),
    MedicineInventory.deleteMany({ isDemo: true }),
    DiseaseReport.deleteMany({ isDemo: true }),
    EmergencyIncident.deleteMany({ isDemo: true }),
    HealthCampaign.deleteMany({ isDemo: true }),
    Complaint.deleteMany({ isDemo: true }),
    Announcement.deleteMany({ isDemo: true }),
    AuditLog.deleteMany({}),
  ]);

  // ── DEMO ACCOUNTS ────────────────────────────────────────────────────────────
  log('Creating demo user accounts...');
  const [superAdmin, ministryAdmin, hospitalAdmin, doctorUser, citizenUser] = await Promise.all([
    User.create({
      name: 'Dr. Priya Kumara',
      email: 'superadmin@example.com',
      password: process.env.DEMO_SUPER_ADMIN_PASSWORD || 'SuperAdmin@123',
      role: UserRole.SUPER_ADMIN,
      phone: '+94 11 200 0001',
      organization: 'Ministry of Health — Sri Lanka',
      isVerified: true,
      isActive: true,
    }),
    User.create({
      name: 'Ms. Nirosha Perera',
      email: 'admin@example.com',
      password: process.env.DEMO_MINISTRY_ADMIN_PASSWORD || 'MinistryAdmin@123',
      role: UserRole.MINISTRY_ADMIN,
      phone: '+94 11 200 0002',
      organization: 'Ministry of Health — Digital Division',
      isVerified: true,
      isActive: true,
    }),
    User.create({
      name: 'Mr. Kamal Silva',
      email: 'hospital@example.com',
      password: process.env.DEMO_HOSPITAL_ADMIN_PASSWORD || 'HospitalAdmin@123',
      role: UserRole.HOSPITAL_ADMIN,
      phone: '+94 11 200 0003',
      organization: 'National Hospital of Sri Lanka',
      isVerified: true,
      isActive: true,
    }),
    User.create({
      name: 'Dr. Amara Bandara',
      email: 'doctor@example.com',
      password: process.env.DEMO_DOCTOR_PASSWORD || 'Doctor@123',
      role: UserRole.DOCTOR,
      phone: '+94 77 200 0004',
      organization: 'National Hospital of Sri Lanka',
      isVerified: true,
      isActive: true,
    }),
    User.create({
      name: 'Mr. Saman Wickrama',
      email: 'citizen@example.com',
      password: process.env.DEMO_CITIZEN_PASSWORD || 'Citizen@123',
      role: UserRole.CITIZEN,
      phone: '+94 77 200 0005',
      isVerified: true,
      isActive: true,
    }),
  ]);

  log('✓ Demo accounts created');

  // ── HOSPITALS ─────────────────────────────────────────────────────────────────
  log('Creating hospitals...');
  const hospitalData = [
    {
      name: 'National Hospital of Sri Lanka',
      type: HospitalType.TEACHING,
      region: SriLankaRegion.WESTERN,
      address: { street: 'Regent Street', city: 'Colombo', district: 'Colombo', postalCode: '01000' },
      coordinates: { lat: 6.9218, lng: 79.8737 },
      totalBeds: 3000, availableBeds: 423, icuBeds: 120, availableIcuBeds: 18,
      emergencyAvailable: true, status: HospitalStatus.OPERATIONAL,
      phone: '+94 11 269 1111', email: 'nhsl@health.gov.lk',
      departments: ['Cardiology', 'Neurology', 'Oncology', 'Orthopedics', 'Pediatrics', 'General Medicine', 'Emergency', 'Surgery', 'Obstetrics', 'ICU'],
      establishedYear: 1864, accreditation: 'ISO 9001:2015',
      adminUser: hospitalAdmin._id,
    },
    {
      name: 'Colombo South Teaching Hospital',
      type: HospitalType.TEACHING,
      region: SriLankaRegion.WESTERN,
      address: { street: 'Hospital Road', city: 'Kalubowila', district: 'Colombo', postalCode: '10280' },
      coordinates: { lat: 6.8518, lng: 79.8721 },
      totalBeds: 1450, availableBeds: 312, icuBeds: 60, availableIcuBeds: 12,
      emergencyAvailable: true, status: HospitalStatus.OPERATIONAL,
      phone: '+94 11 251 5122', departments: ['General Medicine', 'Surgery', 'Pediatrics', 'Obstetrics', 'ICU', 'Emergency'],
    },
    {
      name: 'Teaching Hospital Kandy',
      type: HospitalType.TEACHING,
      region: SriLankaRegion.CENTRAL,
      address: { street: 'William Gopallawa Mawatha', city: 'Kandy', district: 'Kandy', postalCode: '20000' },
      coordinates: { lat: 7.2906, lng: 80.6337 },
      totalBeds: 2000, availableBeds: 280, icuBeds: 80, availableIcuBeds: 8,
      emergencyAvailable: true, status: HospitalStatus.OPERATIONAL,
      phone: '+94 81 223 3337', departments: ['Cardiology', 'Orthopedics', 'General Medicine', 'Pediatrics', 'Emergency', 'Surgery'],
    },
    {
      name: 'Teaching Hospital Karapitiya',
      type: HospitalType.TEACHING,
      region: SriLankaRegion.SOUTHERN,
      address: { street: 'Karapitiya Road', city: 'Galle', district: 'Galle', postalCode: '80000' },
      coordinates: { lat: 6.0535, lng: 80.2210 },
      totalBeds: 1200, availableBeds: 190, icuBeds: 48, availableIcuBeds: 6,
      emergencyAvailable: true, status: HospitalStatus.OPERATIONAL,
      phone: '+94 91 223 0661', departments: ['General Medicine', 'Surgery', 'Pediatrics', 'Emergency', 'Orthopedics'],
    },
    {
      name: 'Jaffna Teaching Hospital',
      type: HospitalType.TEACHING,
      region: SriLankaRegion.NORTHERN,
      address: { street: 'Hospital Road', city: 'Jaffna', district: 'Jaffna', postalCode: '40000' },
      coordinates: { lat: 9.6615, lng: 80.0255 },
      totalBeds: 850, availableBeds: 120, icuBeds: 30, availableIcuBeds: 4,
      emergencyAvailable: true, status: HospitalStatus.OPERATIONAL,
      phone: '+94 21 222 2261', departments: ['General Medicine', 'Surgery', 'Pediatrics', 'Emergency'],
    },
    {
      name: 'District General Hospital Ratnapura',
      type: HospitalType.DISTRICT,
      region: SriLankaRegion.SABARAGAMUWA,
      address: { street: 'Hospital Road', city: 'Ratnapura', district: 'Ratnapura', postalCode: '70000' },
      coordinates: { lat: 6.6828, lng: 80.4018 },
      totalBeds: 600, availableBeds: 95, icuBeds: 20, availableIcuBeds: 3,
      emergencyAvailable: true, status: HospitalStatus.OPERATIONAL,
      phone: '+94 45 222 2261', departments: ['General Medicine', 'Surgery', 'Pediatrics', 'Emergency'],
    },
    {
      name: 'District General Hospital Anuradhapura',
      type: HospitalType.DISTRICT,
      region: SriLankaRegion.NORTH_CENTRAL,
      address: { street: 'Maithripala Senanayake Mawatha', city: 'Anuradhapura', district: 'Anuradhapura', postalCode: '50000' },
      coordinates: { lat: 8.3114, lng: 80.4037 },
      totalBeds: 750, availableBeds: 110, icuBeds: 25, availableIcuBeds: 5,
      emergencyAvailable: true, status: HospitalStatus.OPERATIONAL,
      phone: '+94 25 222 2261', departments: ['General Medicine', 'Surgery', 'Pediatrics', 'Emergency', 'Orthopedics'],
    },
    {
      name: 'Teaching Hospital Batticaloa',
      type: HospitalType.TEACHING,
      region: SriLankaRegion.EASTERN,
      address: { street: 'Bar Road', city: 'Batticaloa', district: 'Batticaloa', postalCode: '30000' },
      coordinates: { lat: 7.7102, lng: 81.6924 },
      totalBeds: 700, availableBeds: 85, icuBeds: 22, availableIcuBeds: 3,
      emergencyAvailable: true, status: HospitalStatus.OPERATIONAL,
      phone: '+94 65 222 2261', departments: ['General Medicine', 'Surgery', 'Pediatrics', 'Emergency'],
    },
    {
      name: 'Kurunegala District General Hospital',
      type: HospitalType.DISTRICT,
      region: SriLankaRegion.NORTH_WESTERN,
      address: { street: 'Colombo Road', city: 'Kurunegala', district: 'Kurunegala', postalCode: '60000' },
      coordinates: { lat: 7.4818, lng: 80.3609 },
      totalBeds: 800, availableBeds: 145, icuBeds: 28, availableIcuBeds: 7,
      emergencyAvailable: true, status: HospitalStatus.OPERATIONAL,
      phone: '+94 37 222 2261', departments: ['General Medicine', 'Surgery', 'Pediatrics', 'Emergency', 'Cardiology'],
    },
    {
      name: 'Base Hospital Badulla',
      type: HospitalType.DISTRICT,
      region: SriLankaRegion.UVA,
      address: { street: 'Bank Road', city: 'Badulla', district: 'Badulla', postalCode: '90000' },
      coordinates: { lat: 6.9934, lng: 81.0550 },
      totalBeds: 450, availableBeds: 72, icuBeds: 16, availableIcuBeds: 2,
      emergencyAvailable: true, status: HospitalStatus.PARTIAL,
      phone: '+94 55 222 2261', departments: ['General Medicine', 'Surgery', 'Emergency'],
    },
    {
      name: 'Sri Jayewardenepura General Hospital',
      type: HospitalType.GENERAL,
      region: SriLankaRegion.WESTERN,
      address: { street: 'Kotte Road', city: 'Nugegoda', district: 'Colombo', postalCode: '10250' },
      coordinates: { lat: 6.8778, lng: 79.9169 },
      totalBeds: 500, availableBeds: 88, icuBeds: 20, availableIcuBeds: 4,
      emergencyAvailable: true, status: HospitalStatus.OPERATIONAL,
      phone: '+94 11 278 0200', departments: ['General Medicine', 'Surgery', 'Pediatrics', 'Emergency', 'Cardiology', 'Neurology'],
    },
    {
      name: 'Polonnaruwa District General Hospital',
      type: HospitalType.DISTRICT,
      region: SriLankaRegion.NORTH_CENTRAL,
      address: { street: 'Hospital Road', city: 'Polonnaruwa', district: 'Polonnaruwa', postalCode: '51000' },
      coordinates: { lat: 7.9403, lng: 81.0188 },
      totalBeds: 380, availableBeds: 55, icuBeds: 12, availableIcuBeds: 1,
      emergencyAvailable: false, status: HospitalStatus.EMERGENCY_ONLY,
      phone: '+94 27 222 2261', departments: ['General Medicine', 'Emergency'],
    },
  ];

  const hospitals = await Hospital.insertMany(
    hospitalData.map((h) => ({ ...h, isDemo: true }))
  );

  // Update hospital admin's hospitalId
  await User.findByIdAndUpdate(hospitalAdmin._id, { hospitalId: hospitals[0]._id });
  await Hospital.findByIdAndUpdate(hospitals[0]._id, { adminUser: hospitalAdmin._id });

  log(`✓ ${hospitals.length} hospitals created`);

  // ── DOCTOR USERS ──────────────────────────────────────────────────────────────
  log('Creating doctors...');
  const doctorUserData = [
    { name: 'Dr. Amara Bandara', email: 'doctor@example.com', specialty: 'Cardiology', dept: 'Cardiology', licNo: 'SLMC-12345', exp: 15, hospital: hospitals[0] },
    { name: 'Dr. Roshan Fernando', email: 'dr.roshan@example.com', specialty: 'Neurology', dept: 'Neurology', licNo: 'SLMC-12346', exp: 12, hospital: hospitals[0] },
    { name: 'Dr. Preethi Jayasinghe', email: 'dr.preethi@example.com', specialty: 'Pediatrics', dept: 'Pediatrics', licNo: 'SLMC-12347', exp: 8, hospital: hospitals[0] },
    { name: 'Dr. Mahesh Gunawardena', email: 'dr.mahesh@example.com', specialty: 'Orthopedics', dept: 'Orthopedics', licNo: 'SLMC-12348', exp: 10, hospital: hospitals[1] },
    { name: 'Dr. Sandya Wickramasinghe', email: 'dr.sandya@example.com', specialty: 'General Medicine', dept: 'General Medicine', licNo: 'SLMC-12349', exp: 7, hospital: hospitals[1] },
    { name: 'Dr. Dinesh Ranawaka', email: 'dr.dinesh@example.com', specialty: 'Surgery', dept: 'Surgery', licNo: 'SLMC-12350', exp: 18, hospital: hospitals[2] },
    { name: 'Dr. Chamari Dissanayake', email: 'dr.chamari@example.com', specialty: 'Obstetrics', dept: 'Obstetrics', licNo: 'SLMC-12351', exp: 11, hospital: hospitals[2] },
    { name: 'Dr. Lasantha Mendis', email: 'dr.lasantha@example.com', specialty: 'Emergency Medicine', dept: 'Emergency', licNo: 'SLMC-12352', exp: 9, hospital: hospitals[3] },
    { name: 'Dr. Nirmal Perera', email: 'dr.nirmal@example.com', specialty: 'Oncology', dept: 'Oncology', licNo: 'SLMC-12353', exp: 14, hospital: hospitals[0] },
    { name: 'Dr. Tharindi Rajapaksa', email: 'dr.tharindi@example.com', specialty: 'Dermatology', dept: 'General Medicine', licNo: 'SLMC-12354', exp: 6, hospital: hospitals[4] },
    { name: 'Dr. Asanka Kumara', email: 'dr.asanka@example.com', specialty: 'Psychiatry', dept: 'General Medicine', licNo: 'SLMC-12355', exp: 9, hospital: hospitals[5] },
    { name: 'Dr. Sachini Marasinghe', email: 'dr.sachini@example.com', specialty: 'Endocrinology', dept: 'General Medicine', licNo: 'SLMC-12356', exp: 7, hospital: hospitals[6] },
    { name: 'Dr. Bandu Hettiarachchi', email: 'dr.bandu@example.com', specialty: 'Nephrology', dept: 'General Medicine', licNo: 'SLMC-12357', exp: 13, hospital: hospitals[7] },
    { name: 'Dr. Ruwan Senanayake', email: 'dr.ruwan@example.com', specialty: 'Gastroenterology', dept: 'General Medicine', licNo: 'SLMC-12358', exp: 11, hospital: hospitals[8] },
    { name: 'Dr. Deepika Wijeratne', email: 'dr.deepika@example.com', specialty: 'Cardiology', dept: 'Cardiology', licNo: 'SLMC-12359', exp: 16, hospital: hospitals[9] },
  ];

  const availability = [
    { day: 'MONDAY', startTime: '08:00', endTime: '12:00', maxAppointments: 20 },
    { day: 'WEDNESDAY', startTime: '08:00', endTime: '12:00', maxAppointments: 20 },
    { day: 'FRIDAY', startTime: '08:00', endTime: '12:00', maxAppointments: 20 },
  ];

  // Create user accounts for doctors (skip the pre-existing doctorUser)
  const doctorUserRecords = [
    doctorUser, // existing demo doctor
  ];

  for (let i = 1; i < doctorUserData.length; i++) {
    const d = doctorUserData[i];
    const u = await User.create({
      name: d.name, email: d.email,
      password: 'Doctor@123', role: UserRole.DOCTOR,
      isVerified: true, isActive: true,
      organization: d.hospital.name,
    });
    doctorUserRecords.push(u);
  }

  const doctors = await Doctor.insertMany(
    doctorUserData.map((d, i) => ({
      user: doctorUserRecords[i]._id,
      hospital: d.hospital._id,
      department: d.dept,
      specialty: d.specialty,
      licenseNumber: d.licNo,
      qualification: 'MBBS, MD',
      experience: d.exp,
      consultationFee: 500 + Math.floor(Math.random() * 1500),
      availability,
      isAvailable: true,
      rating: 3.5 + Math.random() * 1.5,
      totalReviews: Math.floor(Math.random() * 200) + 50,
      isDemo: true,
    }))
  );

  // Link demo doctor user to their profile
  await User.findByIdAndUpdate(doctorUser._id, { hospitalId: hospitals[0]._id });

  log(`✓ ${doctors.length} doctors created`);

  // ── PATIENTS ──────────────────────────────────────────────────────────────────
  log('Creating patients...');
  const patientData = [
    { natId: 'NIC-198506121234', name: 'Saman Wickrama', dob: '1985-06-12', gender: 'MALE', blood: 'O+', phone: '+94 77 200 0005', city: 'Colombo', district: 'Colombo' },
    { natId: 'NIC-199203081567', name: 'Nilmini Perera', dob: '1992-03-08', gender: 'FEMALE', blood: 'A+', phone: '+94 71 234 5678', city: 'Kandy', district: 'Kandy' },
    { natId: 'NIC-197811254321', name: 'Bandara Rajapaksa', dob: '1978-11-25', gender: 'MALE', blood: 'B+', phone: '+94 72 345 6789', city: 'Galle', district: 'Galle' },
    { natId: 'NIC-200501152341', name: 'Thilini Jayasinghe', dob: '2005-01-15', gender: 'FEMALE', blood: 'AB-', phone: '+94 76 456 7890', city: 'Jaffna', district: 'Jaffna' },
    { natId: 'NIC-196812078765', name: 'Sirisena Kumara', dob: '1968-12-07', gender: 'MALE', blood: 'A-', phone: '+94 74 567 8901', city: 'Kurunegala', district: 'Kurunegala' },
    { natId: 'NIC-199507302109', name: 'Dilini Fernando', dob: '1995-07-30', gender: 'FEMALE', blood: 'O-', phone: '+94 70 678 9012', city: 'Ratnapura', district: 'Ratnapura' },
    { natId: 'NIC-198204184532', name: 'Pradeep Silva', dob: '1982-04-18', gender: 'MALE', blood: 'B-', phone: '+94 77 789 0123', city: 'Badulla', district: 'Badulla' },
    { natId: 'NIC-197302279876', name: 'Kamani Wickramasinghe', dob: '1973-02-27', gender: 'FEMALE', blood: 'O+', phone: '+94 71 890 1234', city: 'Anuradhapura', district: 'Anuradhapura' },
    { natId: 'NIC-199901063210', name: 'Ruwan Dissanayake', dob: '1999-01-06', gender: 'MALE', blood: 'A+', phone: '+94 72 901 2345', city: 'Matara', district: 'Matara' },
    { natId: 'NIC-198809221543', name: 'Sunethra Gunawardena', dob: '1988-09-22', gender: 'FEMALE', blood: 'AB+', phone: '+94 76 012 3456', city: 'Batticaloa', district: 'Batticaloa' },
    { natId: 'NIC-196510058901', name: 'Ranatunga Jayawardena', dob: '1965-10-05', gender: 'MALE', blood: 'B+', phone: '+94 74 123 4567', city: 'Colombo', district: 'Colombo' },
    { natId: 'NIC-200308194325', name: 'Himashi Rajapaksa', dob: '2003-08-19', gender: 'FEMALE', blood: 'O+', phone: '+94 70 234 5678', city: 'Negombo', district: 'Gampaha' },
    { natId: 'NIC-197705173456', name: 'Chamara Marasinghe', dob: '1977-05-17', gender: 'MALE', blood: 'A-', phone: '+94 77 345 6789', city: 'Trincomalee', district: 'Trincomalee' },
    { natId: 'NIC-199106269870', name: 'Sanduni Hettiarachchi', dob: '1991-06-26', gender: 'FEMALE', blood: 'O+', phone: '+94 71 456 7890', city: 'Polonnaruwa', district: 'Polonnaruwa' },
    { natId: 'NIC-198312116543', name: 'Nalin Senanayake', dob: '1983-12-11', gender: 'MALE', blood: 'B+', phone: '+94 72 567 8901', city: 'Kegalle', district: 'Kegalle' },
  ];

  const patients = await Patient.insertMany(
    patientData.map((p) => ({
      nationalId: p.natId,
      name: p.name,
      dateOfBirth: new Date(p.dob),
      gender: p.gender,
      bloodType: p.blood,
      phone: p.phone,
      address: { street: '123 Main Road', city: p.city, district: p.district },
      emergencyContact: { name: 'Emergency Contact', relationship: 'Spouse', phone: '+94 77 000 0000' },
      registeredBy: citizenUser._id,
      chronicConditions: Math.random() > 0.7 ? ['Diabetes', 'Hypertension'] : [],
      allergies: Math.random() > 0.8 ? ['Penicillin'] : [],
      isDemo: true,
    }))
  );

  log(`✓ ${patients.length} patients created`);

  // ── APPOINTMENTS ──────────────────────────────────────────────────────────────
  log('Creating appointments...');
  const appointmentStatuses = Object.values(AppointmentStatus);
  const timeSlots = ['08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30'];

  const appointments = await Appointment.insertMany(
    Array.from({ length: 25 }, (_, i) => {
      const daysOffset = Math.floor(Math.random() * 60) - 30;
      const apptDate = new Date();
      apptDate.setDate(apptDate.getDate() + daysOffset);
      return {
        patient: patients[i % patients.length]._id,
        doctor: doctors[i % doctors.length]._id,
        hospital: hospitals[i % hospitals.length]._id,
        department: 'General Medicine',
        appointmentDate: apptDate,
        timeSlot: timeSlots[i % timeSlots.length],
        type: AppointmentType.CONSULTATION,
        status: appointmentStatuses[i % appointmentStatuses.length],
        reason: ['Routine checkup', 'Chest pain', 'Fever', 'Headache', 'Diabetes follow-up'][i % 5],
        notes: i % 3 === 0 ? 'Patient requires fasting blood test before appointment.' : undefined,
        bookedBy: citizenUser._id,
        isDemo: true,
      };
    })
  );

  log(`✓ ${appointments.length} appointments created`);

  // ── REFERRALS ─────────────────────────────────────────────────────────────────
  log('Creating referrals...');
  const referrals = await Referral.insertMany(
    Array.from({ length: 12 }, (_, i) => ({
      patient: patients[i % patients.length]._id,
      referringDoctor: doctors[i % doctors.length]._id,
      referringHospital: hospitals[i % (hospitals.length - 2)]._id,
      receivingHospital: hospitals[0]._id,
      department: ['Cardiology', 'Neurology', 'Oncology', 'Orthopedics'][i % 4],
      requiredSpecialty: ['Cardiologist', 'Neurologist', 'Oncologist', 'Orthopedic Surgeon'][i % 4],
      priority: [ReferralPriority.NORMAL, ReferralPriority.URGENT, ReferralPriority.CRITICAL][i % 3],
      reason: 'Requires specialist consultation',
      clinicalSummary: 'Patient presents with symptoms requiring specialist evaluation and management.',
      status: [ReferralStatus.PENDING, ReferralStatus.ACCEPTED, ReferralStatus.COMPLETED, ReferralStatus.IN_PROGRESS][i % 4],
      timeline: [
        { status: 'PENDING', note: 'Referral created.', updatedBy: doctorUser._id, timestamp: new Date() },
      ],
      isDemo: true,
    }))
  );

  log(`✓ ${referrals.length} referrals created`);

  // ── MEDICINES ─────────────────────────────────────────────────────────────────
  log('Creating medicine inventory...');
  const medicineList = [
    { name: 'Paracetamol 500mg', generic: 'Paracetamol', cat: 'Analgesic', form: 'Tablet', strength: '500mg' },
    { name: 'Amoxicillin 250mg', generic: 'Amoxicillin', cat: 'Antibiotic', form: 'Capsule', strength: '250mg' },
    { name: 'Metformin 500mg', generic: 'Metformin', cat: 'Antidiabetic', form: 'Tablet', strength: '500mg' },
    { name: 'Amlodipine 5mg', generic: 'Amlodipine', cat: 'Antihypertensive', form: 'Tablet', strength: '5mg' },
    { name: 'Atorvastatin 40mg', generic: 'Atorvastatin', cat: 'Lipid-lowering', form: 'Tablet', strength: '40mg' },
    { name: 'Omeprazole 20mg', generic: 'Omeprazole', cat: 'Antacid', form: 'Capsule', strength: '20mg' },
    { name: 'Salbutamol Inhaler', generic: 'Salbutamol', cat: 'Bronchodilator', form: 'Inhaler', strength: '100mcg' },
    { name: 'Insulin Glargine', generic: 'Insulin Glargine', cat: 'Antidiabetic', form: 'Injection', strength: '100 IU/mL', essential: true },
    { name: 'Morphine 10mg', generic: 'Morphine Sulfate', cat: 'Opioid Analgesic', form: 'Injection', strength: '10mg/mL', essential: true },
    { name: 'Ceftriaxone 1g', generic: 'Ceftriaxone', cat: 'Antibiotic', form: 'Injection', strength: '1g', essential: true },
    { name: 'Dexamethasone 4mg', generic: 'Dexamethasone', cat: 'Corticosteroid', form: 'Injection', strength: '4mg/mL' },
    { name: 'Furosemide 40mg', generic: 'Furosemide', cat: 'Diuretic', form: 'Tablet', strength: '40mg' },
    { name: 'Warfarin 5mg', generic: 'Warfarin', cat: 'Anticoagulant', form: 'Tablet', strength: '5mg', essential: true },
    { name: 'Ciprofloxacin 500mg', generic: 'Ciprofloxacin', cat: 'Antibiotic', form: 'Tablet', strength: '500mg' },
    { name: 'Diazepam 5mg', generic: 'Diazepam', cat: 'Anxiolytic', form: 'Tablet', strength: '5mg' },
    { name: 'Oral Rehydration Salts', generic: 'ORS', cat: 'Electrolyte', form: 'Powder', strength: '27.9g/sachet', essential: true },
    { name: 'Epinephrine 1mg', generic: 'Epinephrine', cat: 'Vasopressor', form: 'Injection', strength: '1mg/mL', essential: true },
    { name: 'Enalapril 5mg', generic: 'Enalapril', cat: 'Antihypertensive', form: 'Tablet', strength: '5mg' },
    { name: 'Prednisone 10mg', generic: 'Prednisone', cat: 'Corticosteroid', form: 'Tablet', strength: '10mg' },
    { name: 'Hydroxychloroquine 200mg', generic: 'Hydroxychloroquine', cat: 'Antimalarial', form: 'Tablet', strength: '200mg' },
  ];

  const medicines = await Medicine.insertMany(
    medicineList.map((m) => ({
      name: m.name, genericName: m.generic, category: m.cat,
      dosageForm: m.form, strength: m.strength, isEssential: m.essential || false,
    }))
  );

  // Create inventory for top 5 hospitals
  const inventoryItems = [];
  for (const hospital of hospitals.slice(0, 6)) {
    for (const medicine of medicines) {
      const qty = Math.floor(Math.random() * 500);
      const min = 50;
      inventoryItems.push({
        medicine: medicine._id,
        hospital: hospital._id,
        quantity: qty,
        minQuantity: min,
        unit: 'Units',
        expiryDate: new Date(Date.now() + Math.random() * 365 * 24 * 60 * 60 * 1000 * 2),
        lastUpdatedBy: hospitalAdmin._id,
        lastUpdatedAt: new Date(),
        isDemo: true,
      });
    }
  }

  await MedicineInventory.insertMany(inventoryItems);
  log(`✓ ${medicines.length} medicines and ${inventoryItems.length} inventory records created`);

  // ── DISEASE REPORTS ───────────────────────────────────────────────────────────
  log('Creating disease surveillance reports...');
  const diseases = [
    { name: 'Dengue Fever', cat: 'Vector-borne', alert: AlertLevel.RED },
    { name: 'Leptospirosis', cat: 'Bacterial', alert: AlertLevel.ORANGE },
    { name: 'COVID-19', cat: 'Respiratory', alert: AlertLevel.YELLOW },
    { name: 'Influenza', cat: 'Respiratory', alert: AlertLevel.YELLOW },
    { name: 'Typhoid', cat: 'Enteric', alert: AlertLevel.ORANGE },
    { name: 'Malaria', cat: 'Vector-borne', alert: AlertLevel.GREEN },
    { name: 'Cholera', cat: 'Enteric', alert: AlertLevel.GREEN },
    { name: 'Tuberculosis', cat: 'Respiratory', alert: AlertLevel.YELLOW },
  ];

  const diseaseReports = [];
  for (let i = 0; i < 30; i++) {
    const disease = diseases[i % diseases.length];
    const region = Object.values(SriLankaRegion)[i % 9];
    const confirmed = Math.floor(Math.random() * 200) + 5;
    const deaths = Math.floor(Math.random() * 5);
    const recoveries = Math.floor(confirmed * 0.7);
    const daysBack = Math.floor(Math.random() * 90);
    const reportDate = new Date();
    reportDate.setDate(reportDate.getDate() - daysBack);

    diseaseReports.push({
      disease: disease.name,
      category: disease.cat,
      region,
      reportDate,
      confirmedCases: confirmed,
      suspectedCases: Math.floor(confirmed * 1.5),
      deaths,
      recoveries,
      activeCases: confirmed - deaths - recoveries,
      alertLevel: disease.alert,
      trend: ['INCREASING', 'STABLE', 'DECREASING'][i % 3],
      reportedBy: ministryAdmin._id,
      hospitals: [hospitals[i % hospitals.length]._id],
      isDemo: true,
    });
  }

  await DiseaseReport.insertMany(diseaseReports);
  log(`✓ ${diseaseReports.length} disease reports created`);

  // ── EMERGENCY INCIDENTS ───────────────────────────────────────────────────────
  log('Creating emergency incidents...');
  const emergencyIncidents = await EmergencyIncident.insertMany([
    {
      title: 'Mass Casualty — Road Traffic Accident on A1 Highway',
      type: 'MASS_CASUALTY',
      severity: EmergencySeverity.CRITICAL,
      status: EmergencyStatus.RESPONDING,
      region: SriLankaRegion.WESTERN,
      hospital: hospitals[0]._id,
      description: 'Major road traffic accident involving 3 vehicles on A1 Highway near Kelaniya. Multiple casualties reported.',
      affectedPeople: 18,
      casualties: 3,
      timeline: [
        { action: 'INCIDENT_CREATED', note: 'Incident reported.', performedBy: superAdmin._id, timestamp: new Date() },
        { action: 'TEAMS_DISPATCHED', note: 'Emergency response teams dispatched.', performedBy: superAdmin._id, timestamp: new Date() },
      ],
      contactPerson: 'Inspector Gamage',
      contactPhone: '+94 11 000 0001',
      reportedBy: superAdmin._id,
      isDemo: true,
    },
    {
      title: 'Dengue Outbreak — Western Province',
      type: 'DISEASE_OUTBREAK',
      severity: EmergencySeverity.HIGH,
      status: EmergencyStatus.ACTIVE,
      region: SriLankaRegion.WESTERN,
      description: 'Significant increase in dengue cases reported across multiple districts in the Western Province.',
      affectedPeople: 342,
      casualties: 2,
      timeline: [
        { action: 'INCIDENT_CREATED', note: 'Outbreak declared.', performedBy: ministryAdmin._id, timestamp: new Date() },
      ],
      reportedBy: ministryAdmin._id,
      isDemo: true,
    },
    {
      title: 'Hospital Power Failure — Kandy',
      type: 'INFRASTRUCTURE_FAILURE',
      severity: EmergencySeverity.MODERATE,
      status: EmergencyStatus.RESOLVED,
      region: SriLankaRegion.CENTRAL,
      hospital: hospitals[2]._id,
      description: 'Complete power failure at Teaching Hospital Kandy affecting ICU and OT.',
      timeline: [
        { action: 'INCIDENT_CREATED', note: 'Power failure reported.', performedBy: hospitalAdmin._id, timestamp: new Date() },
        { action: 'STATUS_UPDATED_TO_RESOLVED', note: 'Power restored after 4 hours.', performedBy: hospitalAdmin._id, timestamp: new Date() },
      ],
      resolvedAt: new Date(),
      reportedBy: hospitalAdmin._id,
      isDemo: true,
    },
    {
      title: 'Flooding — Eastern Province Hospitals',
      type: 'FLOOD',
      severity: EmergencySeverity.HIGH,
      status: EmergencyStatus.RESPONDING,
      region: SriLankaRegion.EASTERN,
      description: 'Severe flooding affecting healthcare access in multiple districts of Eastern Province.',
      affectedPeople: 1200,
      timeline: [
        { action: 'INCIDENT_CREATED', note: 'Flood emergency declared.', performedBy: ministryAdmin._id, timestamp: new Date() },
      ],
      reportedBy: ministryAdmin._id,
      isDemo: true,
    },
    {
      title: 'Medicine Shortage — Insulin',
      type: 'OTHER',
      severity: EmergencySeverity.MODERATE,
      status: EmergencyStatus.ACTIVE,
      region: SriLankaRegion.NORTHERN,
      description: 'Critical shortage of insulin at Northern Province hospitals. Immediate resupply required.',
      timeline: [
        { action: 'INCIDENT_CREATED', note: 'Shortage reported.', performedBy: hospitalAdmin._id, timestamp: new Date() },
      ],
      reportedBy: hospitalAdmin._id,
      isDemo: true,
    },
  ]);

  log(`✓ ${emergencyIncidents.length} emergency incidents created`);

  // ── HEALTH CAMPAIGNS ──────────────────────────────────────────────────────────
  log('Creating health campaigns...');
  await HealthCampaign.insertMany([
    {
      title: 'National Dengue Prevention Campaign 2026',
      type: 'PREVENTION',
      description: 'A nationwide campaign to raise awareness about dengue prevention, promote clean environment practices, and reduce mosquito breeding sites.',
      objectives: ['Reduce dengue cases by 30%', 'Educate 2 million citizens', 'Eliminate breeding sites in high-risk areas'],
      startDate: new Date('2026-01-01'), endDate: new Date('2026-12-31'),
      targetPopulation: 'All Sri Lanka residents, especially in Western, Central, and Southern Provinces',
      targetCount: 2000000, reachedCount: 847000,
      regions: [SriLankaRegion.WESTERN, SriLankaRegion.CENTRAL, SriLankaRegion.SOUTHERN],
      status: 'ACTIVE',
      createdBy: ministryAdmin._id, isDemo: true,
    },
    {
      title: 'Maternal & Child Health Initiative',
      type: 'MATERNAL_HEALTH',
      description: 'Comprehensive program focusing on prenatal care, safe delivery, and postnatal support for mothers and newborns.',
      objectives: ['Reduce maternal mortality by 20%', 'Increase facility-based deliveries to 95%'],
      startDate: new Date('2026-03-01'), endDate: new Date('2027-02-28'),
      targetPopulation: 'Pregnant women and mothers with children under 5 years',
      targetCount: 150000, reachedCount: 42000,
      regions: Object.values(SriLankaRegion),
      status: 'ACTIVE',
      createdBy: ministryAdmin._id, isDemo: true,
    },
    {
      title: 'Diabetes & Hypertension Screening Program',
      type: 'SCREENING',
      description: 'Free screening for diabetes and hypertension targeting adults over 35 years across all provinces.',
      objectives: ['Screen 500,000 adults', 'Detect and manage undiagnosed cases'],
      startDate: new Date('2026-06-01'), endDate: new Date('2026-11-30'),
      targetPopulation: 'Adults aged 35 and above',
      targetCount: 500000, reachedCount: 123000,
      regions: [SriLankaRegion.WESTERN, SriLankaRegion.CENTRAL, SriLankaRegion.SOUTHERN, SriLankaRegion.NORTH_WESTERN],
      status: 'ACTIVE',
      createdBy: ministryAdmin._id, isDemo: true,
    },
    {
      title: 'National Mental Health Awareness Month',
      type: 'AWARENESS',
      description: 'Breaking the stigma around mental health through community outreach, school programs, and free counseling services.',
      objectives: ['Reach 1 million people', 'Train 500 community health workers', 'Establish helplines'],
      startDate: new Date('2026-10-01'), endDate: new Date('2026-10-31'),
      targetPopulation: 'General public, students, and healthcare workers',
      targetCount: 1000000, reachedCount: 0,
      regions: Object.values(SriLankaRegion),
      status: 'PLANNED',
      createdBy: ministryAdmin._id, isDemo: true,
    },
    {
      title: 'Childhood Immunization Campaign 2026',
      type: 'VACCINATION',
      description: 'Ensuring all children under 5 receive their complete vaccination schedule as per the National Immunization Programme.',
      objectives: ['Achieve 98% vaccination coverage', 'Zero vaccine-preventable deaths'],
      startDate: new Date('2026-01-01'), endDate: new Date('2026-12-31'),
      targetPopulation: 'Children under 5 years',
      targetCount: 450000, reachedCount: 389000,
      regions: Object.values(SriLankaRegion),
      status: 'ACTIVE',
      createdBy: ministryAdmin._id, isDemo: true,
    },
  ]);

  log('✓ Health campaigns created');

  // ── COMPLAINTS ────────────────────────────────────────────────────────────────
  log('Creating complaints...');
  await Complaint.insertMany([
    {
      submittedBy: citizenUser._id,
      type: 'HOSPITAL_SERVICE',
      hospital: hospitals[0]._id,
      subject: 'Long waiting time at outpatient department',
      description: 'I waited for 4+ hours at the OPD without being attended. The situation is very disorganized.',
      status: ComplaintStatus.IN_PROGRESS,
      priority: ComplaintPriority.HIGH,
      timeline: [{ status: 'SUBMITTED', note: 'Complaint received.', updatedBy: citizenUser._id, timestamp: new Date() }],
      isDemo: true,
    },
    {
      submittedBy: citizenUser._id,
      type: 'MEDICINE_AVAILABILITY',
      hospital: hospitals[3]._id,
      subject: 'Insulin not available at pharmacy',
      description: 'The hospital pharmacy has been out of insulin for 3 days. This is life-threatening for diabetic patients.',
      status: ComplaintStatus.UNDER_REVIEW,
      priority: ComplaintPriority.URGENT,
      timeline: [{ status: 'SUBMITTED', note: 'Complaint received.', updatedBy: citizenUser._id, timestamp: new Date() }],
      isDemo: true,
    },
    {
      submittedBy: citizenUser._id,
      type: 'APPOINTMENT_ISSUE',
      subject: 'Appointment cancelled without notice',
      description: 'My appointment was cancelled but I was not notified. I traveled 50km to find this out.',
      status: ComplaintStatus.RESOLVED,
      priority: ComplaintPriority.MEDIUM,
      timeline: [
        { status: 'SUBMITTED', note: 'Complaint received.', updatedBy: citizenUser._id, timestamp: new Date() },
        { status: 'RESOLVED', note: 'Hospital apologized and rescheduled the appointment.', updatedBy: ministryAdmin._id, timestamp: new Date() },
      ],
      resolutionNote: 'Appointment rescheduled and patient compensated with priority slot.',
      resolvedAt: new Date(),
      isDemo: true,
    },
  ]);

  log('✓ Complaints created');

  // ── ANNOUNCEMENTS ─────────────────────────────────────────────────────────────
  log('Creating announcements...');
  await Announcement.insertMany([
    {
      title: 'National Health Policy Update — Digital Health Integration 2026',
      category: AnnouncementCategory.POLICY_UPDATE,
      priority: 'HIGH',
      summary: 'The Ministry of Health announces the rollout of the National Digital Health Platform across all provincial hospitals.',
      content: 'The Ministry of Health is pleased to announce the nationwide rollout of the National Digital Health Platform. This initiative connects all government hospitals, clinics, and health centers through a centralized digital system...',
      author: superAdmin._id,
      isPublished: true,
      publishedAt: new Date(),
      tags: ['digital-health', 'policy', 'hospitals'],
      isDemo: true,
    },
    {
      title: 'Dengue Alert — Western Province',
      category: AnnouncementCategory.PUBLIC_HEALTH_ALERT,
      priority: 'URGENT',
      summary: 'The Ministry of Health declares a dengue alert for Western Province following a significant rise in cases.',
      content: 'The Ministry of Health urges all residents of the Western Province to take immediate preventive measures against dengue. Cases have risen by 45% in the past two weeks...',
      author: ministryAdmin._id,
      isPublished: true,
      publishedAt: new Date(),
      tags: ['dengue', 'western-province', 'alert'],
      isDemo: true,
    },
    {
      title: 'Free Health Screening — September 2026',
      category: AnnouncementCategory.CAMPAIGN,
      priority: 'MEDIUM',
      summary: 'Free health screenings for diabetes, hypertension, and cholesterol at all government hospitals this month.',
      content: 'As part of the National Non-Communicable Disease Prevention Programme, the Ministry of Health is offering free health screenings throughout September 2026...',
      author: ministryAdmin._id,
      isPublished: true,
      publishedAt: new Date(),
      tags: ['screening', 'free-health', 'NCD'],
      isDemo: true,
    },
    {
      title: 'Emergency Hotline Update',
      category: AnnouncementCategory.MINISTRY_NOTICE,
      priority: 'HIGH',
      summary: 'New 24/7 health emergency hotline: 1990',
      content: 'The Ministry of Health has launched a new 24/7 health emergency hotline. Citizens can dial 1990 for immediate health emergency assistance...',
      author: superAdmin._id,
      isPublished: true,
      publishedAt: new Date(),
      tags: ['emergency', 'hotline'],
      isDemo: true,
    },
    {
      title: 'COVID-19 Booster Dose Programme',
      category: AnnouncementCategory.CAMPAIGN,
      priority: 'MEDIUM',
      summary: 'Booster doses available at all government hospitals for eligible population groups.',
      content: 'The Ministry of Health announces the continuation of the COVID-19 Booster Dose Programme for immunocompromised individuals and healthcare workers...',
      author: ministryAdmin._id,
      isPublished: true,
      publishedAt: new Date(),
      tags: ['COVID-19', 'vaccination', 'booster'],
      isDemo: true,
    },
  ]);

  log('✓ Announcements created');

  // ── NOTIFICATIONS ─────────────────────────────────────────────────────────────
  log('Creating sample notifications...');
  await Notification.insertMany([
    {
      user: doctorUser._id,
      type: 'APPOINTMENT_NEW',
      title: 'New Appointment Booked',
      message: 'A new appointment has been booked for tomorrow at 09:00.',
      isRead: false,
      priority: 'MEDIUM',
      actionUrl: '/appointments',
    },
    {
      user: citizenUser._id,
      type: 'APPOINTMENT_CONFIRMED',
      title: 'Appointment Confirmed',
      message: 'Your appointment with Dr. Amara Bandara on September 10 has been confirmed.',
      isRead: false,
      priority: 'MEDIUM',
      actionUrl: '/appointments',
    },
    {
      user: ministryAdmin._id,
      type: 'EMERGENCY_INCIDENT',
      title: '🚨 CRITICAL Emergency Incident',
      message: 'Mass casualty incident reported on A1 Highway. Immediate response required.',
      isRead: false,
      priority: 'CRITICAL',
      actionUrl: '/emergency',
    },
    {
      user: hospitalAdmin._id,
      type: 'REFERRAL_RECEIVED',
      title: 'New Referral Received',
      message: 'A CRITICAL priority referral has been received for the Cardiology department.',
      isRead: false,
      priority: 'HIGH',
      actionUrl: '/referrals',
    },
  ]);

  log('✓ Notifications created');

  // ── AUDIT LOGS ────────────────────────────────────────────────────────────────
  log('Creating audit logs...');
  await AuditLog.insertMany([
    { user: superAdmin._id, action: AuditAction.USER_LOGIN, resource: 'User', ipAddress: '127.0.0.1' },
    { user: ministryAdmin._id, action: AuditAction.USER_LOGIN, resource: 'User', ipAddress: '127.0.0.1' },
    { user: hospitalAdmin._id, action: AuditAction.HOSPITAL_UPDATE, resource: 'Hospital', resourceId: hospitals[0]._id, ipAddress: '127.0.0.1' },
    { user: doctorUser._id, action: AuditAction.REFERRAL_CREATE, resource: 'Referral', ipAddress: '127.0.0.1' },
    { user: ministryAdmin._id, action: AuditAction.ANNOUNCEMENT_PUBLISH, resource: 'Announcement', ipAddress: '127.0.0.1' },
  ]);

  log('✓ Audit logs created');

  // ── SUMMARY ───────────────────────────────────────────────────────────────────
  console.log(`
╔══════════════════════════════════════════════════════════╗
║         DATABASE SEED COMPLETED SUCCESSFULLY             ║
╠══════════════════════════════════════════════════════════╣
║                                                          ║
║  ⚠️  ALL DATA IS DEMO/SAMPLE DATA                        ║
║  ⚠️  DO NOT USE IN PRODUCTION                            ║
║                                                          ║
║  DEMO ACCOUNTS:                                          ║
║  ─────────────────────────────────────────────────────   ║
║  Super Admin:    superadmin@example.com                  ║
║                  Password: SuperAdmin@123                ║
║  Ministry Admin: admin@example.com                       ║
║                  Password: MinistryAdmin@123             ║
║  Hospital Admin: hospital@example.com                    ║
║                  Password: HospitalAdmin@123             ║
║  Doctor:         doctor@example.com                      ║
║                  Password: Doctor@123                    ║
║  Citizen:        citizen@example.com                     ║
║                  Password: Citizen@123                   ║
║                                                          ║
╚══════════════════════════════════════════════════════════╝
  `);

  await mongoose.disconnect();
  log('Disconnected from MongoDB. Seed complete.');
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
