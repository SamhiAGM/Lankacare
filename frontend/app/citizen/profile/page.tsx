'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { RoleGuard } from '@/components/auth/RoleGuard';
import { UserRole } from '@/types';
import {
  UserCheck, ShieldCheck, Heart, Calendar, GitPullRequest,
  Building2, Phone, Mail, MapPin, FileText, Lock, AlertCircle
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

export default function CitizenProfilePage() {
  const { user } = useAuth();

  // Masked mock citizen health profile
  const profile = {
    phn: 'PHN-WP-2026-0814',
    nic: '198723401129',
    name: user?.name || 'Sunil Wickramasinghe',
    email: user?.email || 'citizen@example.com',
    phone: user?.phone || '+94 77 234 1122',
    dateOfBirth: '1987-05-14',
    bloodGroup: 'B+',
    bloodGroupVerified: true,
    allergies: ['Penicillin (Moderate rash)'],
    chronicConditions: ['Mild Essential Hypertension'],
    primaryHospital: 'National Hospital of Sri Lanka (NHSL)',
    interactions: [
      {
        date: '2026-08-12',
        facility: 'Base Hospital Kinniya',
        department: 'Outpatient Department (OPD)',
        type: 'OPD Consultation',
        status: 'Completed',
      },
      {
        date: '2026-06-04',
        facility: 'National Hospital of Sri Lanka',
        department: 'Cardiology Clinic',
        type: 'Routine Follow-Up',
        status: 'Completed',
      },
    ],
  };

  return (
    <RoleGuard allowedRoles={[UserRole.CITIZEN, UserRole.SUPER_ADMIN, UserRole.MINISTRY_ADMIN]}>
      <div className="space-y-6 max-w-5xl mx-auto pb-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                Personal Health Profile
              </h1>
              <Badge variant="teal">Verified Citizen Record</Badge>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Protected health identifier and interaction record under Ministry of Health Sri Lanka.
            </p>
          </div>
          <Link href="/citizen">
            <Button variant="outline" size="sm">
              ← Return to Citizen Portal
            </Button>
          </Link>
        </div>

        {/* Identity & Blood Group Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Card 1: Citizen Identification */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center font-bold text-lg">
                {profile.name.charAt(0)}
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white truncate">
                  {profile.name}
                </h2>
                <p className="text-xs text-slate-500 font-mono">NIC: {profile.nic}</p>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Personal Health Number (PHN):</span>
                <span className="font-mono font-bold text-teal-600 dark:text-teal-400">{profile.phn}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Date of Birth:</span>
                <span className="font-medium text-slate-800 dark:text-slate-200">{profile.dateOfBirth} (Age: 39)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Contact:</span>
                <span className="text-slate-800 dark:text-slate-200">{profile.phone}</span>
              </div>
            </div>
          </div>

          {/* Card 2: Blood Group & Laboratory Verification */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Blood Group Record
              </span>
              <Heart className="w-4 h-4 text-rose-500" />
            </div>

            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900/60 flex items-center justify-center text-rose-600 dark:text-rose-400 font-extrabold text-2xl shadow-sm">
                {profile.bloodGroup}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  <ShieldCheck className="w-4 h-4" /> Lab Confirmed
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Verified by NHSL Central Pathology Laboratory. Safe for emergency pre-matching.
                </p>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500">
              National Blood Transfusion Service (NBTS) registry synchronized.
            </div>
          </div>

          {/* Card 3: Clinical Alerts & Allergies */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Allergies &amp; Chronic Notes
              </span>
              <AlertCircle className="w-4 h-4 text-amber-500" />
            </div>

            <div className="space-y-2">
              <p className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">Known Allergies:</p>
              <div className="flex flex-wrap gap-1.5">
                {profile.allergies.map((a, i) => (
                  <span key={i} className="px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 text-xs font-medium">
                    {a}
                  </span>
                ))}
              </div>
            </div>

            <div className="space-y-1 pt-1">
              <p className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">Monitored Conditions:</p>
              <p className="text-xs text-slate-600 dark:text-slate-400">{profile.chronicConditions.join(', ')}</p>
            </div>
          </div>
        </div>

        {/* Hospital Interaction History */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Building2 className="w-5 h-5 text-teal-600" />
              Recent Hospital Interactions
            </h2>
            <Badge variant="outline">Patient Access Scope</Badge>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 border-b border-slate-200 dark:border-slate-800 uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Healthcare Facility</th>
                  <th className="px-4 py-3">Department</th>
                  <th className="px-4 py-3">Interaction Type</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {profile.interactions.map((it, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <td className="px-4 py-3 font-mono font-medium text-slate-700 dark:text-slate-300">{it.date}</td>
                    <td className="px-4 py-3 font-semibold text-slate-900 dark:text-white">{it.facility}</td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{it.department}</td>
                    <td className="px-4 py-3 text-slate-700 dark:text-slate-300">{it.type}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-semibold text-[10px]">
                        {it.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Security Notice */}
        <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 text-xs text-slate-500 flex items-center gap-2.5">
          <Lock className="w-4 h-4 text-teal-600 shrink-0" />
          <span>
            Only your verified citizen account has permission to view this personal health dossier. Clinical changes require in-person SLMC-registered medical consultation.
          </span>
        </div>
      </div>
    </RoleGuard>
  );
}
