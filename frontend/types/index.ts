export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  MINISTRY_ADMIN = 'MINISTRY_ADMIN',
  MINISTRY_OFFICER = 'MINISTRY_OFFICER',
  DATA_ADMIN = 'DATA_ADMIN',
  PROVINCIAL_ADMIN = 'PROVINCIAL_ADMIN',
  DISTRICT_ADMIN = 'DISTRICT_ADMIN',
  HOSPITAL_ADMIN = 'HOSPITAL_ADMIN',
  DOCTOR = 'DOCTOR',
  NURSE = 'NURSE',
  HEALTH_WORKER = 'HEALTH_WORKER',
  PHARMACIST = 'PHARMACIST',
  CITIZEN = 'CITIZEN',
}

export type Permission =
  | 'hospital.read'
  | 'hospital.create'
  | 'hospital.update'
  | 'hospital.delete'
  | 'patient.read'
  | 'patient.create'
  | 'patient.update'
  | 'admission.read'
  | 'admission.create'
  | 'admission.update'
  | 'discharge.read'
  | 'discharge.create'
  | 'discharge.update'
  | 'medicine.read'
  | 'medicine.inventory.read'
  | 'medicine.inventory.update'
  | 'blood.read'
  | 'blood.inventory.read'
  | 'blood.inventory.update'
  | 'staff.read'
  | 'staff.create'
  | 'staff.update'
  | 'roster.read'
  | 'roster.create'
  | 'roster.update'
  | 'referral.read'
  | 'referral.create'
  | 'referral.update'
  | 'analytics.read'
  | 'publicHealth.read'
  | 'publicHealth.create'
  | 'publicHealth.update'
  | 'data.import'
  | 'data.validate'
  | 'data.approve'
  | 'data.publish'
  | 'audit.read'
  | 'system.manage';

export type ScopeLevel = 'NATIONAL' | 'PROVINCE' | 'DISTRICT' | 'HOSPITAL' | 'DEPARTMENT';

export interface UserScope {
  level: ScopeLevel;
  province?: SriLankaRegion;
  district?: string;
  hospitalId?: string;
  department?: string;
}

export interface BreakGlassRecord {
  id: string;
  userId: string;
  userName: string;
  doctorSlmc?: string;
  targetPatientId: string;
  patientName: string;
  patientHospitalId: string;
  doctorHospitalId: string;
  reason: string;
  emergencyJustification: string;
  timestamp: string;
  expiresAt: string;
  active: boolean;
}


export enum SriLankaHospitalCategory {
  NATIONAL_HOSPITAL = 'NATIONAL_HOSPITAL',
  TEACHING_HOSPITAL = 'TEACHING_HOSPITAL',
  PROVINCIAL_GENERAL = 'PROVINCIAL_GENERAL',
  DISTRICT_GENERAL = 'DISTRICT_GENERAL',
  BASE_HOSPITAL_A = 'BASE_HOSPITAL_A',
  BASE_HOSPITAL_B = 'BASE_HOSPITAL_B',
  SPECIALIZED_HOSPITAL = 'SPECIALIZED_HOSPITAL',
  DIVISIONAL_HOSPITAL = 'DIVISIONAL_HOSPITAL',
  PRIMARY_CARE_UNIT = 'PRIMARY_CARE_UNIT',
}

export enum HospitalType {
  GENERAL = 'GENERAL',
  TEACHING = 'TEACHING',
  SPECIALIZED = 'SPECIALIZED',
  DISTRICT = 'DISTRICT',
  PROVINCIAL = 'PROVINCIAL',
  PRIVATE = 'PRIVATE',
  CLINIC = 'CLINIC',
}

export type VerificationStatus = 'VERIFIED' | 'PENDING' | 'HISTORICAL';
export type SourceType =
  | 'OFFICIAL_GOVERNMENT'
  | 'EPIDEMIOLOGY_UNIT'
  | 'AUTHORIZED_PUBLIC_HEALTH'
  | 'COMMUNITY_REPORTED';

export interface SourcedEntity {
  sourceName: string;
  sourceUrl: string;
  sourceType: SourceType;
  publishedDate?: string;
  retrievedDate: string;
  verificationStatus: VerificationStatus;
  dataVersion: string;
}

export interface Hospital extends SourcedEntity {
  id: string;
  name: string;
  nameSi?: string;
  nameTa?: string;
  code: string;
  type: HospitalType;
  officialCategory: SriLankaHospitalCategory | string;
  categoryLabel?: string;
  status: HospitalStatus;
  region: SriLankaRegion;
  district: string;
  address: string;
  phone?: string | null;
  email?: string | null;
  website?: string | null;
  totalBeds: number;
  availableBeds: number | null; // null if live telemetry is unavailable
  reportingYear?: number; // e.g. 2025
  icuBedsTotal: number;
  icuBedsAvailable: number | null;
  emergencyAvailable: boolean;
  departments: string[];
  doctorsCount?: number | null;
  rating?: number;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

export enum HospitalStatus {
  OPERATIONAL = 'OPERATIONAL',
  PARTIAL = 'PARTIAL',
  EMERGENCY_ONLY = 'EMERGENCY_ONLY',
  CLOSED = 'CLOSED',
}

export enum SriLankaRegion {
  WESTERN = 'WESTERN',
  CENTRAL = 'CENTRAL',
  SOUTHERN = 'SOUTHERN',
  NORTHERN = 'NORTHERN',
  EASTERN = 'EASTERN',
  NORTH_WESTERN = 'NORTH_WESTERN',
  NORTH_CENTRAL = 'NORTH_CENTRAL',
  UVA = 'UVA',
  SABARAGAMUWA = 'SABARAGAMUWA',
}

export enum AppointmentStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  NO_SHOW = 'NO_SHOW',
}

export enum AppointmentType {
  CONSULTATION = 'CONSULTATION',
  FOLLOW_UP = 'FOLLOW_UP',
  EMERGENCY = 'EMERGENCY',
  ROUTINE = 'ROUTINE',
  SPECIALIST = 'SPECIALIST',
}

export enum ReferralPriority {
  NORMAL = 'NORMAL',
  URGENT = 'URGENT',
  CRITICAL = 'CRITICAL',
}

export enum ReferralStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export enum MedicineStatus {
  AVAILABLE = 'AVAILABLE',
  LOW_STOCK = 'LOW_STOCK',
  CRITICAL = 'CRITICAL',
  OUT_OF_STOCK = 'OUT_OF_STOCK',
  EXPIRED = 'EXPIRED',
}

export enum AlertLevel {
  GREEN = 'GREEN',
  YELLOW = 'YELLOW',
  ORANGE = 'ORANGE',
  RED = 'RED',
}

export enum EmergencySeverity {
  LOW = 'LOW',
  MODERATE = 'MODERATE',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

export enum EmergencyStatus {
  ACTIVE = 'ACTIVE',
  RESPONDING = 'RESPONDING',
  RESOLVED = 'RESOLVED',
  CLOSED = 'CLOSED',
}

export enum ComplaintStatus {
  SUBMITTED = 'SUBMITTED',
  UNDER_REVIEW = 'UNDER_REVIEW',
  ASSIGNED = 'ASSIGNED',
  IN_PROGRESS = 'IN_PROGRESS',
  RESOLVED = 'RESOLVED',
  CLOSED = 'CLOSED',
}

export enum ComplaintPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

export enum AnnouncementCategory {
  MINISTRY_NOTICE = 'MINISTRY_NOTICE',
  PUBLIC_HEALTH_ALERT = 'PUBLIC_HEALTH_ALERT',
  POLICY_UPDATE = 'POLICY_UPDATE',
  EMERGENCY_NOTICE = 'EMERGENCY_NOTICE',
  CAMPAIGN = 'CAMPAIGN',
  GENERAL = 'GENERAL',
}

export enum NotificationPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

export interface User {
  id: string;
  name: string;
  email: string;
  dateOfBirth?: string;
  role: UserRole;
  phone?: string;
  organization?: string;
  hospitalId?: string;
  department?: string;
  avatar?: string;
  isVerified?: boolean;
  scope?: UserScope;
  permissions?: Permission[];
  activeRole?: UserRole;
  assignedRoles?: UserRole[];
}


export interface Doctor {
  id: string;
  name: string;
  slmcNumber: string;
  specialty: string;
  department: string;
  hospitalId: string;
  hospitalName: string;
  email: string;
  phone: string;
  experienceYears: number;
  qualifications: string[];
  availability: {
    days: string[];
    hours: string;
  };
  rating?: number;
  activeAppointments?: number;
}

export interface Patient {
  id: string;
  phn: string; // Personal Health Number
  nic: string;
  name: string;
  dateOfBirth: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  bloodGroup: string;
  phone: string;
  email?: string;
  address: string;
  region: SriLankaRegion;
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
  };
  allergies?: string[];
  chronicConditions?: string[];
  recentVisitsCount?: number;
}

export interface Appointment {
  id: string;
  appointmentNumber: string;
  patientId: string;
  patientName: string;
  patientPhone: string;
  doctorId: string;
  doctorName: string;
  specialty: string;
  hospitalId: string;
  hospitalName: string;
  department: string;
  date: string;
  timeSlot: string;
  time?: string;
  queueNumber?: number | string;
  type: AppointmentType;
  status: AppointmentStatus;
  symptoms?: string;
  clinicalNotes?: string;
  prescriptionSummary?: string;
  createdAt: string;
}

export interface Referral {
  id: string;
  referralNumber: string;
  patientId: string;
  patientName: string;
  patientAge: number;
  patientGender: string;
  referringDoctorId: string;
  referringDoctorName: string;
  referringHospitalId: string;
  referringHospitalName: string;
  receivingHospitalId: string;
  receivingHospitalName: string;
  department: string;
  requiredSpecialty: string;
  priority: ReferralPriority;
  status: ReferralStatus;
  clinicalReason: string;
  clinicalSummary: string;
  appointmentDate?: string;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Medicine {
  id: string;
  code: string;
  name: string;
  genericName: string;
  category: string;
  dosageForm: string;
  strength: string;
  stockQuantity: number;
  reorderLevel: number;
  hospitalId: string;
  hospitalName: string;
  region: SriLankaRegion;
  batchNumber: string;
  expiryDate: string;
  status: MedicineStatus;
  lastRestocked: string;
}

export interface VaccinationRecord {
  id: string;
  programName: string;
  targetGroup: string;
  totalTarget: number;
  totalVaccinated: number;
  coveragePercentage: number;
  dosesAdministered: number;
  status: 'ACTIVE' | 'UPCOMING' | 'COMPLETED';
  startDate: string;
  endDate: string;
  regionsCovered: string[];
}

export interface DiseaseReport {
  id: string;
  diseaseName: string;
  category: string;
  casesReported: number;
  activeCases: number;
  recovered: number;
  deaths: number;
  region: SriLankaRegion;
  alertLevel: AlertLevel;
  growthRate: number; // e.g. +14.2%
  trend: 'INCREASING' | 'STABLE' | 'DECREASING';
  thresholdLimit: number;
  isThresholdBreached: boolean;
  lastUpdated: string;
}

export interface EmergencyIncident {
  id: string;
  incidentNumber: string;
  title: string;
  description: string;
  type: string;
  severity: EmergencySeverity;
  status: EmergencyStatus;
  region: SriLankaRegion;
  location: string;
  callerName?: string;
  callerPhone?: string;
  affectedCount: number;
  assignedHospitalId?: string;
  assignedHospitalName?: string;
  dispatchedAmbulances: number;
  reportedAt: string;
  resolvedAt?: string;
}

export interface HealthCampaign {
  id: string;
  title: string;
  tagline: string;
  description: string;
  category: string;
  startDate: string;
  endDate: string;
  targetPopulation: number;
  currentReach: number;
  progressPercentage: number;
  regions: SriLankaRegion[];
  bannerUrl?: string;
  keyMessages: string[];
  status: 'ACTIVE' | 'PLANNED' | 'CONCLUDED';
}

export interface Complaint {
  id: string;
  ticketNumber: string;
  citizenName: string;
  citizenPhone: string;
  citizenEmail: string;
  category: string;
  hospitalId?: string;
  hospitalName?: string;
  subject: string;
  description: string;
  priority: ComplaintPriority;
  status: ComplaintStatus;
  assignedDepartment?: string;
  resolutionNotes?: string;
  createdAt: string;
  resolvedAt?: string;
}

export interface Announcement {
  id: string;
  title: string;
  summary: string;
  content: string;
  category: AnnouncementCategory;
  priority: 'NORMAL' | 'HIGH' | 'CRITICAL';
  publishedAt: string;
  department: string;
  author: string;
  isPinned: boolean;
  attachments?: string[];
}

export interface SystemNotification {
  id: string;
  title: string;
  message: string;
  priority: NotificationPriority;
  category: string;
  read: boolean;
  createdAt: string;
  actionUrl?: string;
}

export interface HealthSystemStatus {
  apiGateway: 'OPERATIONAL' | 'DEGRADED' | 'OUTAGE';
  database: 'OPERATIONAL' | 'DEGRADED' | 'OUTAGE';
  notificationEngine: 'OPERATIONAL' | 'DEGRADED' | 'OUTAGE';
  hospitalNetwork: 'OPERATIONAL' | 'DEGRADED' | 'OUTAGE';
  lastChecked: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// 🇱🇰 SRI LANKA DENGUE & COMMUNITY SURVEILLANCE
// ─────────────────────────────────────────────────────────────────────────────

export type DengueReportStatus = 'REPORTED' | 'ASSIGNED' | 'INVESTIGATING' | 'ACTION_TAKEN' | 'RESOLVED';

export interface CommunityDengueReport {
  id: string;
  reportNumber: string;
  district: string;
  gnDivision: string;
  locationAddress: string;
  breedingSiteType:
    | 'DISCARDED_CONTAINERS'
    | 'WATER_STORAGE'
    | 'ROOF_GUTTER'
    | 'CONSTRUCTION_SITE'
    | 'TYRES'
    | 'NATURAL_POOL'
    | 'OTHER';
  description: string;
  photoUrl?: string;
  reporterName?: string;
  reporterPhone?: string;
  status: DengueReportStatus;
  assignedPHIOffice?: string;
  investigationDate?: string;
  actionTakenNotes?: string;
  resolvedAt?: string;
  reportedAt: string;
}

export interface DistrictDengueStats {
  district: string;
  province: string;
  casesThisWeek: number;
  casesPreviousWeek: number;
  cumulativeYearCases: number;
  riskLevel: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  isCalculatedRisk: boolean; // Flagged as SYSTEM CALCULATED
  reportingPeriod: string;
  source: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// 🇱🇰 DATA PIPELINE, VERSIONING & QUALITY SCORE
// ─────────────────────────────────────────────────────────────────────────────

export interface DatasetImportRecord {
  id: string;
  datasetName: string;
  sourceName: string;
  sourceUrl: string;
  reportingPeriod: string;
  publishedDate: string;
  importedAt: string;
  importedBy: string;
  recordCount: number;
  validCount: number;
  errorCount: number;
  status: 'PENDING_APPROVAL' | 'APPROVED' | 'ROLLED_BACK' | 'REJECTED';
  version: string;
  changes: {
    added: number;
    updated: number;
    removed: number;
    unchanged: number;
  };
}

export interface DataQualityReport {
  overallScore: number; // 0-100 calculated from live database audit
  totalRecords: number;
  validProvincesScore: number;
  validDistrictsScore: number;
  validCoordinatesScore: number;
  completeContactScore: number;
  verifiedSourceScore: number;
  officialCategoryScore: number;
  issues: Array<{
    recordId: string;
    recordName: string;
    field: string;
    severity: 'WARNING' | 'ERROR';
    message: string;
  }>;
  lastCalculated: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// 🇱🇰 GENERALIZED HEALTHCARE WORKFORCE & DUTY ROSTER MODELS
// ─────────────────────────────────────────────────────────────────────────────

export enum StaffRole {
  DOCTOR = 'DOCTOR',
  MEDICAL_OFFICER = 'MEDICAL_OFFICER',
  NURSE = 'NURSE',
  NURSING_ASSISTANT = 'NURSING_ASSISTANT',
  PHARMACIST = 'PHARMACIST',
  LABORATORY_SCIENTIST = 'LABORATORY_SCIENTIST',
  RADIOGRAPHER = 'RADIOGRAPHER',
  PHYSIOTHERAPIST = 'PHYSIOTHERAPIST',
  PUBLIC_HEALTH_INSPECTOR = 'PUBLIC_HEALTH_INSPECTOR',
  ADMINISTRATIVE_OFFICER = 'ADMINISTRATIVE_OFFICER',
  AMBULANCE_DRIVER_PARAMEDIC = 'AMBULANCE_DRIVER_PARAMEDIC',
  SUPPORT_STAFF = 'SUPPORT_STAFF',
}

export interface StaffMember {
  id: string; // Internal ID
  staffId: string; // Hospital Staff ID e.g. STF-BHK-0042
  name: string;
  role: StaffRole;
  department: string;
  hospitalId: string;
  hospitalName: string;
  employmentStatus?: 'PERMANENT' | 'CONTRACT' | 'TRAINEE' | 'VISITING';
  slmcNumber?: string;
  contactPhone?: string;
  phone?: string;
  email?: string;
  active?: boolean;
  supervisor?: string;
  shiftPreference?: string;
  verificationStatus?: 'OFFICIALLY_VERIFIED' | 'AUTHORIZED_INTERNAL' | 'TEST_DATA';
}

export type DutyRosterStatus =
  | 'SCHEDULED'
  | 'ON_DUTY'
  | 'OFF_DUTY'
  | 'COMPLETED'
  | 'LEAVE'
  | 'TRAINING'
  | 'SICK_LEAVE'
  | 'SWAPPED';

export const DutyRosterStatus = {
  SCHEDULED: 'SCHEDULED' as DutyRosterStatus,
  ON_DUTY: 'ON_DUTY' as DutyRosterStatus,
  OFF_DUTY: 'OFF_DUTY' as DutyRosterStatus,
  COMPLETED: 'COMPLETED' as DutyRosterStatus,
  LEAVE: 'LEAVE' as DutyRosterStatus,
  TRAINING: 'TRAINING' as DutyRosterStatus,
  SICK_LEAVE: 'SICK_LEAVE' as DutyRosterStatus,
  SWAPPED: 'SWAPPED' as DutyRosterStatus,
};

export interface DutyRosterEntry {
  id: string;
  hospitalId: string;
  hospitalName: string;
  department: string;
  staffId: string;
  staffName: string;
  role: StaffRole;
  date: string; // YYYY-MM-DD
  shiftName?: string; // e.g. 'Morning', 'Evening', 'Night', 'On-Call', 'Custom'
  shiftType?: 'MORNING' | 'EVENING' | 'NIGHT' | 'ON_CALL' | 'OFF_DUTY';
  staffRole?: StaffRole;
  startTime: string; // '06:00'
  endTime: string; // '14:00'
  status: DutyRosterStatus;
  notes?: string;
}

export interface ShiftConflictResult {
  hasConflict: boolean;
  conflictingEntries: DutyRosterEntry[];
  reason?: string;
  message?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// 🇱🇰 HOSPITAL BED MANAGEMENT & ALLOCATION
// ─────────────────────────────────────────────────────────────────────────────

export type BedStatus =
  | 'AVAILABLE'
  | 'OCCUPIED'
  | 'MAINTENANCE'
  | 'RESERVED'
  | 'CLEANING'
  | 'OUT_OF_SERVICE';

export const BedStatus = {
  AVAILABLE: 'AVAILABLE' as BedStatus,
  OCCUPIED: 'OCCUPIED' as BedStatus,
  MAINTENANCE: 'MAINTENANCE' as BedStatus,
  RESERVED: 'RESERVED' as BedStatus,
  CLEANING: 'CLEANING' as BedStatus,
  OUT_OF_SERVICE: 'OUT_OF_SERVICE' as BedStatus,
};

export type BedType =
  | 'GENERAL'
  | 'ICU'
  | 'HDU'
  | 'ETU'
  | 'SURGICAL'
  | 'PEDIATRIC'
  | 'MATERNITY'
  | 'ISOLATION';

export const BedType = {
  GENERAL: 'GENERAL' as BedType,
  ICU: 'ICU' as BedType,
  HDU: 'HDU' as BedType,
  ETU: 'ETU' as BedType,
  SURGICAL: 'SURGICAL' as BedType,
  PEDIATRIC: 'PEDIATRIC' as BedType,
  MATERNITY: 'MATERNITY' as BedType,
  ISOLATION: 'ISOLATION' as BedType,
};

export interface HospitalBed {
  id: string;
  hospitalId: string;
  hospitalName: string;
  ward: string;
  wardName?: string;
  bedNumber: string;
  type?: BedType;
  bedType?: BedType;
  status: BedStatus;
  currentPatientId?: string | null;
  currentPatientName?: string | null;
  currentAdmissionId?: string | null;
  lastCleaned?: string;
  hasOxygen?: boolean;
  hasVentilator?: boolean;
  lastUpdated?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// 🇱🇰 PATIENT ADMISSION, MOVEMENT & DISCHARGE WORKFLOW
// ─────────────────────────────────────────────────────────────────────────────

export type AdmissionStatus = 'ADMITTED' | 'TRANSFERRED' | 'DISCHARGED';

export interface PatientMovementRecord {
  id: string;
  timestamp: string; // Exact Asia/Colombo formatted string
  type: 'ADMISSION' | 'WARD_TRANSFER' | 'DEPT_TRANSFER' | 'HOSPITAL_TRANSFER' | 'DISCHARGE';
  fromLocation?: string;
  toLocation?: string;
  fromWard?: string;
  toWard?: string;
  toBedId?: string;
  notes?: string;
  reason?: string;
  authorizedBy?: string;
}

export interface PatientAdmission {
  id: string; // Admission ID e.g. ADM-2026-00412
  admissionNumber?: string;
  patientId: string;
  patientName: string;
  patientNic?: string;
  phn?: string;
  hospitalId: string;
  hospitalName: string;
  ward?: string;
  wardName?: string;
  department?: string;
  bedNumber?: string;
  bedId?: string;
  admissionDate?: string; // YYYY-MM-DD
  admissionTime?: string; // HH:MM AM/PM in Asia/Colombo
  admittedTimestamp?: string; // ISO 8601
  admittedAt?: string;
  reason?: string;
  admittingDiagnosis?: string;
  admissionType?: 'EMERGENCY' | 'ELECTIVE' | 'TRANSFER' | string;
  referringFacility?: string;
  admittingDoctorId?: string;
  admittingDoctorName?: string;
  attendingDoctorId?: string;
  attendingDoctorName?: string;
  attendingTeam?: string;
  status: AdmissionStatus;
  movements?: PatientMovementRecord[];
  dischargeSummary?: {
    dischargedAt: string;
    summary: string;
    followUpInstructions?: string;
    dischargingDoctorId?: string;
  };
  notes?: string;
}

export interface PatientDischargeRecord {
  id: string;
  admissionId: string;
  patientId: string;
  patientName: string;
  hospitalId: string;
  hospitalName: string;
  dischargeDate: string;
  dischargeTime: string;
  dischargedTimestamp: string;
  dischargingDoctorId: string;
  dischargingDoctorName: string;
  department: string;
  outcome: 'RECOVERED' | 'IMPROVED' | 'TRANSFERRED_OUT' | 'AGAINST_MEDICAL_ADVICE' | 'DECEASED';
  followUpInstructions: string;
  referralDestination?: string;
  bedFreed: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// 🇱🇰 BLOOD GROUP VALIDATION & BLOOD INVENTORY
// ─────────────────────────────────────────────────────────────────────────────

export type BloodGroup = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-' | 'UNKNOWN' | 'NOT_RECORDED';

export interface BloodGroupVerification {
  bloodGroup: BloodGroup;
  verificationSource: 'LABORATORY_VERIFIED' | 'BLOOD_BANK_CARD' | 'SELF_REPORTED' | 'UNVERIFIED';
  verifiedAt?: string;
  verifiedBy?: string;
  labReportId?: string;
}

export type BloodComponent =
  | 'WHOLE_BLOOD'
  | 'PACKED_RED_CELLS'
  | 'PLATELETS'
  | 'FRESH_FROZEN_PLASMA'
  | 'CRYOPRECIPITATE';

export interface BloodInventory {
  id: string;
  hospitalId: string;
  hospitalName: string;
  bloodGroup: BloodGroup;
  component: BloodComponent;
  quantityUnits: number;
  minimumThreshold: number;
  status: 'AVAILABLE' | 'LOW_STOCK' | 'CRITICAL' | 'OUT_OF_STOCK' | 'LIVE_UNAVAILABLE';
  lastUpdated: string;
  source: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// 🇱🇰 HOSPITAL-LEVEL MEDICINE INVENTORY & SHORTAGE ALERTS
// ─────────────────────────────────────────────────────────────────────────────

export interface HospitalMedicineInventory {
  id: string;
  hospitalId: string;
  hospitalName: string;
  medicineId: string;
  medicineCode?: string;
  medicineName?: string;
  genericName: string;
  brandName?: string;
  dosageForm?: string;
  strength?: string;
  quantity?: number | null; // null if live stock is not publicly available or authorized
  stockQuantity?: number;
  unit: string;
  minimumThreshold?: number;
  maximumCapacity?: number;
  batchNumber?: string | null;
  expiryDate?: string | null;
  storageLocation?: string;
  stockStatus?: 'AVAILABLE' | 'LOW_STOCK' | 'CRITICAL' | 'OUT_OF_STOCK' | 'UNKNOWN';
  status?: string;
  isLiveStockAvailable?: boolean;
  lastUpdated: string;
  source?: string;
}

export interface MedicineShortageAlert {
  id: string;
  hospitalId: string;
  hospitalName: string;
  medicineCode: string;
  genericName: string;
  quantity: number | null;
  minimumThreshold: number;
  severity: 'LOW_STOCK' | 'CRITICAL';
  createdAt: string;
  district: string;
  province: SriLankaRegion;
}

// ─────────────────────────────────────────────────────────────────────────────
// 🇱🇰 SECURITY & CLINICAL AUDIT TRAIL
// ─────────────────────────────────────────────────────────────────────────────

export interface AuditLogRecord {
  id: string;
  userId: string;
  userName: string;
  role: UserRole;
  action: string; // e.g. 'PATIENT_VIEWED', 'ADMISSION_CREATED', 'PATIENT_DISCHARGED', 'BED_ASSIGNED', 'BLOOD_GROUP_VERIFIED', 'MEDICINE_STOCK_UPDATED', 'STAFF_SCHEDULE_CHANGED'
  targetRecordId: string;
  targetRecordType: 'PATIENT' | 'ADMISSION' | 'BED' | 'MEDICINE' | 'STAFF' | 'ROSTER' | 'HOSPITAL' | 'BLOOD_GROUP';
  hospitalId?: string;
  hospitalName?: string;
  timestamp: string;
  ipAddress?: string;
  details?: string;
}

