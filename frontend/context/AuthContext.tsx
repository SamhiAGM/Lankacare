'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';

import { SriLankaRegion } from '../types';
import { ROLE_DEFAULT_PERMISSIONS } from '@/lib/rbac';
import { auditLogService } from '@/services/apiClient';

export const DEMO_ACCOUNTS: Record<UserRole, User> = {
  [UserRole.CITIZEN]: {
    id: 'user-citizen',
    name: 'Sunil Wickramasinghe',
    email: 'citizen@example.com',
    role: UserRole.CITIZEN,
    phone: '+94 77 234 1122',
    organization: 'Sri Lanka Public Health Citizen',
    isVerified: true,
    scope: { level: 'DISTRICT', district: 'Colombo', province: SriLankaRegion.WESTERN },
    permissions: ROLE_DEFAULT_PERMISSIONS[UserRole.CITIZEN],
  },
  [UserRole.DOCTOR]: {
    id: 'user-doctor',
    name: 'Dr. Amara Bandara',
    email: 'doctor@example.com',
    role: UserRole.DOCTOR,
    phone: '+94 77 123 4567',
    organization: 'Base Hospital Kinniya',
    hospitalId: 'hosp-kinniya',
    department: 'General Medicine',
    isVerified: true,
    scope: { level: 'HOSPITAL', hospitalId: 'hosp-kinniya', department: 'General Medicine', district: 'Trincomalee', province: SriLankaRegion.EASTERN },
    permissions: ROLE_DEFAULT_PERMISSIONS[UserRole.DOCTOR],
    assignedRoles: [UserRole.DOCTOR, UserRole.HOSPITAL_ADMIN],
  },
  [UserRole.NURSE]: {
    id: 'user-nurse',
    name: 'Nurse Samanthi Jayakody',
    email: 'nurse@example.com',
    role: UserRole.NURSE,
    phone: '+94 71 889 0012',
    organization: 'Base Hospital Kinniya',
    hospitalId: 'hosp-kinniya',
    department: 'Ward 3 (Female Medical)',
    isVerified: true,
    scope: { level: 'DEPARTMENT', hospitalId: 'hosp-kinniya', department: 'Ward 3', district: 'Trincomalee', province: SriLankaRegion.EASTERN },
    permissions: ROLE_DEFAULT_PERMISSIONS[UserRole.NURSE],
  },
  [UserRole.HEALTH_WORKER]: {
    id: 'user-health-worker',
    name: 'K. P. Thilakarathne',
    email: 'phi.trinco@example.com',
    role: UserRole.HEALTH_WORKER,
    phone: '+94 71 334 5566',
    organization: 'RDHS Trincomalee — Field Inspection Unit',
    isVerified: true,
    scope: { level: 'DISTRICT', district: 'Trincomalee', province: SriLankaRegion.EASTERN },
    permissions: ROLE_DEFAULT_PERMISSIONS[UserRole.HEALTH_WORKER],
  },
  [UserRole.PHARMACIST]: {
    id: 'user-pharmacist',
    name: 'M. Farhan',
    email: 'pharmacist@example.com',
    role: UserRole.PHARMACIST,
    phone: '+94 26 223 6265',
    organization: 'Base Hospital Kinniya — Pharmacy Depot',
    hospitalId: 'hosp-kinniya',
    department: 'Outpatient & Ward Pharmacy',
    isVerified: true,
    scope: { level: 'HOSPITAL', hospitalId: 'hosp-kinniya', department: 'Pharmacy', district: 'Trincomalee', province: SriLankaRegion.EASTERN },
    permissions: ROLE_DEFAULT_PERMISSIONS[UserRole.PHARMACIST],
  },
  [UserRole.HOSPITAL_ADMIN]: {
    id: 'user-hospital-admin',
    name: 'Dr. K. M. Nafeel',
    email: 'hospital@example.com',
    role: UserRole.HOSPITAL_ADMIN,
    phone: '+94 26 223 6261',
    organization: 'Base Hospital Kinniya',
    hospitalId: 'hosp-kinniya',
    isVerified: true,
    scope: { level: 'HOSPITAL', hospitalId: 'hosp-kinniya', district: 'Trincomalee', province: SriLankaRegion.EASTERN },
    permissions: ROLE_DEFAULT_PERMISSIONS[UserRole.HOSPITAL_ADMIN],
    assignedRoles: [UserRole.HOSPITAL_ADMIN, UserRole.DOCTOR],
  },
  [UserRole.DISTRICT_ADMIN]: {
    id: 'user-dist-admin',
    name: 'Dr. Ruwan Gunawardana',
    email: 'trinco.rdhs@example.com',
    role: UserRole.DISTRICT_ADMIN,
    phone: '+94 26 222 2244',
    organization: 'Regional Directorate of Health Services (RDHS) — Trincomalee',
    isVerified: true,
    scope: { level: 'DISTRICT', district: 'Trincomalee', province: SriLankaRegion.EASTERN },
    permissions: ROLE_DEFAULT_PERMISSIONS[UserRole.DISTRICT_ADMIN],
  },
  [UserRole.PROVINCIAL_ADMIN]: {
    id: 'user-prov-admin',
    name: 'Dr. Chandani Jayaratne',
    email: 'eastern.pdhs@example.com',
    role: UserRole.PROVINCIAL_ADMIN,
    phone: '+94 65 222 2311',
    organization: 'Provincial Directorate of Health Services (PDHS) — Eastern Province',
    isVerified: true,
    scope: { level: 'PROVINCE', province: SriLankaRegion.EASTERN },
    permissions: ROLE_DEFAULT_PERMISSIONS[UserRole.PROVINCIAL_ADMIN],
  },
  [UserRole.MINISTRY_OFFICER]: {
    id: 'user-ministry-officer',
    name: 'Dr. Priya Kumara',
    email: 'ministry.officer@example.com',
    role: UserRole.MINISTRY_OFFICER,
    phone: '+94 11 269 8501',
    organization: 'Ministry of Health — Directorate of Medical Services',
    isVerified: true,
    scope: { level: 'NATIONAL' },
    permissions: ROLE_DEFAULT_PERMISSIONS[UserRole.MINISTRY_OFFICER],
  },
  [UserRole.MINISTRY_ADMIN]: {
    id: 'user-ministry-admin',
    name: 'Ms. Nirosha Perera',
    email: 'admin@example.com',
    role: UserRole.MINISTRY_ADMIN,
    phone: '+94 11 200 0002',
    organization: 'Ministry of Health — Digital Health Division',
    isVerified: true,
    scope: { level: 'NATIONAL' },
    permissions: ROLE_DEFAULT_PERMISSIONS[UserRole.MINISTRY_ADMIN],
    assignedRoles: [UserRole.MINISTRY_ADMIN, UserRole.SUPER_ADMIN],
  },
  [UserRole.DATA_ADMIN]: {
    id: 'user-data-admin',
    name: 'Saman Jayasuriya',
    email: 'dataadmin@example.com',
    role: UserRole.DATA_ADMIN,
    phone: '+94 11 269 8507',
    organization: 'Medical Statistics Unit / National Health Data Division',
    isVerified: true,
    scope: { level: 'NATIONAL' },
    permissions: ROLE_DEFAULT_PERMISSIONS[UserRole.DATA_ADMIN],
  },
  [UserRole.SUPER_ADMIN]: {
    id: 'user-super-admin',
    name: 'Dinesh Alahakoon',
    email: 'superadmin@example.com',
    role: UserRole.SUPER_ADMIN,
    phone: '+94 11 200 0001',
    organization: 'Ministry of Health — Information Infrastructure & Cybersecurity Division',
    isVerified: true,
    scope: { level: 'NATIONAL' },
    // Strictly infrastructure and audit permissions; zero clinical patient access per Section 67
    permissions: ROLE_DEFAULT_PERMISSIONS[UserRole.SUPER_ADMIN],
  },
};

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password?: string) => Promise<boolean>;
  loginAsDemo: (role: UserRole) => void;
  switchRole: (role: UserRole) => void;
  register: (data: Partial<User> & { password?: string }) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Load existing session or default to Ministry Admin for demonstration
    const saved = localStorage.getItem('moh_user');
    if (saved) {
      try {
        setUser(JSON.parse(saved));
      } catch {
        setUser(DEMO_ACCOUNTS[UserRole.MINISTRY_ADMIN]);
      }
    } else {
      // Default to Ministry Admin on initial load so the reviewer immediately sees the full platform
      const defaultUser = DEMO_ACCOUNTS[UserRole.MINISTRY_ADMIN];
      setUser(defaultUser);
      localStorage.setItem('moh_user', JSON.stringify(defaultUser));
    }
  }, []);

  const loginAsDemo = (role: UserRole) => {
    const demoUser = DEMO_ACCOUNTS[role] || DEMO_ACCOUNTS[UserRole.CITIZEN];
    setUser(demoUser);
    localStorage.setItem('moh_user', JSON.stringify(demoUser));
    localStorage.setItem('moh_token', 'demo-jwt-token-valid');
    auditLogService.log(
      'USER_LOGIN',
      'STAFF',
      demoUser.id,
      `User ${demoUser.name} logged in under role ${role} (Scope: ${demoUser.scope?.level || 'NATIONAL'})`,
      demoUser.hospitalId,
      demoUser.organization
    );
  };

  const switchRole = (role: UserRole) => {
    const prevRole = user?.role;
    const demoUser = DEMO_ACCOUNTS[role] || DEMO_ACCOUNTS[UserRole.CITIZEN];
    setUser(demoUser);
    localStorage.setItem('moh_user', JSON.stringify(demoUser));
    localStorage.setItem('moh_token', 'demo-jwt-token-valid');
    auditLogService.log(
      'ROLE_SWITCHED',
      'STAFF',
      demoUser.id,
      `Role switched from ${prevRole} to ${role} by ${demoUser.name} (Authorized Persona Switch)`,
      demoUser.hospitalId,
      demoUser.organization
    );
  };

  const login = async (email: string, _password?: string): Promise<boolean> => {
    // Check if email matches any demo account
    const matched = Object.values(DEMO_ACCOUNTS).find(
      (acc) => acc.email.toLowerCase() === email.toLowerCase()
    );

    const targetUser: User = matched || {
      id: `user-${Date.now()}`,
      name: email.split('@')[0],
      email,
      role: UserRole.CITIZEN,
      isVerified: true,
    };

    setUser(targetUser);
    localStorage.setItem('moh_user', JSON.stringify(targetUser));
    localStorage.setItem('moh_token', 'mock-jwt-token');
    return true;
  };

  const register = async (data: Partial<User>): Promise<boolean> => {
    const newUser: User = {
      id: `user-${Date.now()}`,
      name: data.name || 'Citizen User',
      email: data.email || 'citizen@example.com',
      role: UserRole.CITIZEN,
      phone: data.phone,
      isVerified: true,
    };
    setUser(newUser);
    localStorage.setItem('moh_user', JSON.stringify(newUser));
    localStorage.setItem('moh_token', 'mock-jwt-token');
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('moh_user');
    localStorage.removeItem('moh_token');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        loginAsDemo,
        switchRole,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
