import { User, UserRole, Permission, UserScope, BreakGlassRecord, Patient } from '@/types';
import { auditLogService } from '@/services/apiClient';

// ─────────────────────────────────────────────────────────────────────────────
// 🇱🇰 ROLE-BASED GRANULAR PERMISSIONS MATRIX (Least Privilege Architecture)
// ─────────────────────────────────────────────────────────────────────────────

export const ROLE_DEFAULT_PERMISSIONS: Record<UserRole, Permission[]> = {
  [UserRole.CITIZEN]: [
    'hospital.read',
    'publicHealth.read',
  ],
  [UserRole.DOCTOR]: [
    'hospital.read',
    'patient.read',
    'patient.create',
    'patient.update',
    'admission.read',
    'admission.create',
    'admission.update',
    'discharge.read',
    'discharge.create',
    'discharge.update',
    'roster.read',
    'referral.read',
    'referral.create',
    'referral.update',
    'blood.read',
  ],
  [UserRole.NURSE]: [
    'hospital.read',
    'patient.read',
    'patient.update',
    'admission.read',
    'discharge.read',
    'roster.read',
    'referral.read',
    'blood.read',
  ],
  [UserRole.HEALTH_WORKER]: [
    'hospital.read',
    'patient.read',
    'admission.read',
    'roster.read',
  ],
  [UserRole.PHARMACIST]: [
    'hospital.read',
    'medicine.read',
    'medicine.inventory.read',
    'medicine.inventory.update',
  ],
  [UserRole.HOSPITAL_ADMIN]: [
    'hospital.read',
    'hospital.update',
    'patient.read',
    'admission.read',
    'admission.create',
    'discharge.read',
    'discharge.create',
    'medicine.read',
    'medicine.inventory.read',
    'blood.read',
    'staff.read',
    'staff.create',
    'staff.update',
    'roster.read',
    'roster.create',
    'roster.update',
    'referral.read',
    'analytics.read',
  ],
  [UserRole.DISTRICT_ADMIN]: [
    'hospital.read',
    'analytics.read',
    'publicHealth.read',
    'publicHealth.create',
    'referral.read',
  ],
  [UserRole.PROVINCIAL_ADMIN]: [
    'hospital.read',
    'analytics.read',
    'publicHealth.read',
    'referral.read',
    'staff.read',
  ],
  [UserRole.MINISTRY_OFFICER]: [
    'hospital.read',
    'analytics.read',
    'publicHealth.read',
    'referral.read',
    'medicine.read',
    'blood.read',
    'staff.read',
    'audit.read',
  ],
  [UserRole.MINISTRY_ADMIN]: [
    'hospital.read',
    'hospital.create',
    'hospital.update',
    'hospital.delete',
    'data.approve',
    'data.publish',
    'publicHealth.create',
    'publicHealth.update',
    'audit.read',
  ],
  [UserRole.DATA_ADMIN]: [
    'data.import',
    'data.validate',
    'data.approve',
    'analytics.read',
    'audit.read',
  ],
  [UserRole.SUPER_ADMIN]: [
    // Technical administration only; ZERO clinical patient access per Section 67
    'system.manage',
    'audit.read',
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// 🇱🇰 PERMISSION EVALUATION ENGINE
// ─────────────────────────────────────────────────────────────────────────────

export function hasPermission(
  user: User | null,
  permission: Permission,
  targetScope?: Partial<UserScope>
): boolean {
  if (!user) return false;

  // Technical system admins never receive patient clinical permissions
  if (user.role === UserRole.SUPER_ADMIN && permission.startsWith('patient.')) {
    return false;
  }

  // Get active permissions
  const activePermissions = user.permissions || ROLE_DEFAULT_PERMISSIONS[user.role] || [];
  if (!activePermissions.includes(permission)) {
    return false;
  }

  // If a location scope check is required
  if (targetScope && user.scope) {
    return isWithinLocationScope(user.scope, targetScope);
  }

  return true;
}

// ─────────────────────────────────────────────────────────────────────────────
// 🇱🇰 HIERARCHICAL LOCATION SCOPE CHECKER
// ─────────────────────────────────────────────────────────────────────────────

export function isWithinLocationScope(
  userScope: UserScope,
  targetScope: Partial<UserScope>
): boolean {
  switch (userScope.level) {
    case 'NATIONAL':
      return true;

    case 'PROVINCE':
      if (targetScope.province && targetScope.province !== userScope.province) {
        return false;
      }
      return true;

    case 'DISTRICT':
      if (
        targetScope.district &&
        targetScope.district.trim().toLowerCase() !== userScope.district?.trim().toLowerCase()
      ) {
        return false;
      }
      return true;

    case 'HOSPITAL':
      if (targetScope.hospitalId && targetScope.hospitalId !== userScope.hospitalId) {
        return false;
      }
      return true;

    case 'DEPARTMENT':
      if (targetScope.hospitalId && targetScope.hospitalId !== userScope.hospitalId) {
        return false;
      }
      if (
        targetScope.department &&
        userScope.department &&
        targetScope.department.toLowerCase() !== userScope.department.toLowerCase()
      ) {
        return false;
      }
      return true;

    default:
      return false;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 🇱🇰 PATIENT ACCESS CONTROLLER & BREAK-GLASS VERIFICATION
// ─────────────────────────────────────────────────────────────────────────────

const BREAK_GLASS_STORAGE_KEY = 'moh_active_break_glass';

export function getActiveBreakGlassRecords(): BreakGlassRecord[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(BREAK_GLASS_STORAGE_KEY);
    if (!raw) return [];
    const list: BreakGlassRecord[] = JSON.parse(raw);
    const now = new Date().toISOString();
    return list.filter((r) => r.active && r.expiresAt > now);
  } catch {
    return [];
  }
}

export function saveBreakGlassRecord(record: BreakGlassRecord): void {
  if (typeof window === 'undefined') return;
  const current = getActiveBreakGlassRecords();
  current.unshift(record);
  localStorage.setItem(BREAK_GLASS_STORAGE_KEY, JSON.stringify(current.slice(0, 50)));
}

export function canAccessPatient(
  user: User | null,
  patient: Patient,
  patientHospitalId?: string
): { allowed: boolean; requiresBreakGlass?: boolean; reason?: string } {
  if (!user) {
    return { allowed: false, reason: 'Authentication required' };
  }

  // 1. Citizen Access Rule: Only own record
  if (user.role === UserRole.CITIZEN) {
    if (patient.id === user.id || patient.email === user.email) {
      return { allowed: true };
    }
    return {
      allowed: false,
      reason: 'Citizen users are strictly forbidden from viewing another patient record.',
    };
  }

  // 2. System Administrator Rule: Zero Clinical Access
  if (user.role === UserRole.SUPER_ADMIN) {
    return {
      allowed: false,
      reason: 'System Administrators do not have clinical access per Least Privilege Architecture (Section 67).',
    };
  }

  // 3. Clinical Staff & Doctors
  if (
    user.role === UserRole.DOCTOR ||
    user.role === UserRole.NURSE ||
    user.role === UserRole.HEALTH_WORKER
  ) {
    // If patient is in the doctor's assigned hospital
    if (!patientHospitalId || !user.hospitalId || user.hospitalId === patientHospitalId) {
      return { allowed: true };
    }

    // Check if an active Break-Glass override exists for this user & patient
    const activeGrants = getActiveBreakGlassRecords();
    const hasEmergencyGrant = activeGrants.some(
      (g) => g.userId === user.id && g.targetPatientId === patient.id
    );

    if (hasEmergencyGrant) {
      return { allowed: true };
    }

    return {
      allowed: false,
      requiresBreakGlass: true,
      reason: `Patient is admitted at a different facility (${patientHospitalId}). Urgent emergency clinical access requires Break-Glass authorization with audit justification.`,
    };
  }

  // 4. Hospital Admin: Can view patients in their own hospital only
  if (user.role === UserRole.HOSPITAL_ADMIN) {
    if (patientHospitalId && user.hospitalId && user.hospitalId !== patientHospitalId) {
      return {
        allowed: false,
        reason: 'Hospital Administrators can only access operational records of their assigned hospital.',
      };
    }
    return { allowed: true };
  }

  // 5. Ministry & Regional Officers: Allowed de-identified or authorized clinical overview
  if (
    user.role === UserRole.MINISTRY_OFFICER ||
    user.role === UserRole.MINISTRY_ADMIN ||
    user.role === UserRole.PROVINCIAL_ADMIN ||
    user.role === UserRole.DISTRICT_ADMIN
  ) {
    return { allowed: true };
  }

  return { allowed: false, reason: 'Insufficient privileges to access patient clinical record.' };
}

// ─────────────────────────────────────────────────────────────────────────────
// 🇱🇰 BREAK-GLASS EMERGENCY ACCESS EXECUTION (Section 75)
// ─────────────────────────────────────────────────────────────────────────────

export function executeBreakGlassAccess(params: {
  user: User;
  patientId: string;
  patientName: string;
  patientHospitalId: string;
  reason: string;
  emergencyJustification: string;
}): BreakGlassRecord {
  const expiresAt = new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(); // 4-hour emergency window
  const record: BreakGlassRecord = {
    id: `bg-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    userId: params.user.id,
    userName: params.user.name,
    doctorSlmc: (params.user as unknown as { slmcNumber?: string }).slmcNumber,
    targetPatientId: params.patientId,
    patientName: params.patientName,
    patientHospitalId: params.patientHospitalId,
    doctorHospitalId: params.user.hospitalId || 'hosp-unknown',
    reason: params.reason,
    emergencyJustification: params.emergencyJustification,
    timestamp: new Date().toISOString(),
    expiresAt,
    active: true,
  };

  saveBreakGlassRecord(record);

  // Write immutable audit event
  auditLogService.log(
    'BREAK_GLASS_ACCESS',
    'PATIENT',
    params.patientId,
    `EMERGENCY ACCESS OVERRIDE: ${params.reason} | Justification: ${params.emergencyJustification} | Granted to: ${params.user.name} (${params.user.role}) | Expires: ${expiresAt}`,
    params.patientHospitalId
  );

  return record;
}

// ─────────────────────────────────────────────────────────────────────────────
// 🇱🇰 ROLE REDIRECT URL DETERMINATION (Section 88)
// ─────────────────────────────────────────────────────────────────────────────

export function getRoleHomeUrl(role: UserRole): string {
  switch (role) {
    case UserRole.CITIZEN:
      return '/citizen';
    case UserRole.DOCTOR:
      return '/doctor';
    case UserRole.NURSE:
    case UserRole.HEALTH_WORKER:
      return '/staff';
    case UserRole.PHARMACIST:
      return '/pharmacist';
    case UserRole.HOSPITAL_ADMIN:
      return '/hospital-admin';
    case UserRole.DISTRICT_ADMIN:
      return '/district-officer';
    case UserRole.PROVINCIAL_ADMIN:
      return '/provincial-officer';
    case UserRole.MINISTRY_OFFICER:
      return '/ministry';
    case UserRole.MINISTRY_ADMIN:
      return '/ministry-admin';
    case UserRole.DATA_ADMIN:
      return '/data-admin';
    case UserRole.SUPER_ADMIN:
      return '/system-admin';
    default:
      return '/citizen';
  }
}
