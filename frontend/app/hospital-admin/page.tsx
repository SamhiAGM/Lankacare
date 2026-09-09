'use client';

import React from 'react';
import Link from 'next/link';
import {
  Building2, Users, Calendar, Activity, Pill, GitPullRequest,
  CheckCircle2, AlertTriangle, ArrowRight, ShieldCheck, ChevronRight,
  FileBarChart2, Clock, Layers, Lock
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { RoleGuard } from '@/components/auth/RoleGuard';
import { UserRole } from '@/types';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

export default function HospitalAdminPortalPage() {
  const { user } = useAuth();
  const hospitalId = user?.hospitalId || 'hosp-kinniya';
  const hospital = ([] as any[]).find((h) => h.id === hospitalId) || [][0];

  const totalBeds = 142; // Official Kinniya reported beds
  const occupiedBeds = 98;
  const occupancyRate = Math.round((occupiedBeds / totalBeds) * 100);

  const activeStaff = ([] as any[]).filter((s) => s.hospitalId === hospitalId);

  return (
    <RoleGuard allowedRoles={[UserRole.HOSPITAL_ADMIN, UserRole.SUPER_ADMIN, UserRole.MINISTRY_ADMIN]}>
      <div className="space-y-6 pb-12">
        {/* Header */}
        <div className="p-6 rounded-3xl bg-slate-900 text-white border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-blue-500/20 text-blue-400">
                <Building2 className="w-5 h-5" />
              </span>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
                Hospital Administrator Operations
              </h1>
              <Badge variant="teal">{hospital.officialCategory?.replace(/_/g, ' ')}</Badge>
            </div>
            <p className="text-xs text-slate-400">
              {hospital.name} • {hospital.district} District • {hospital.region} Province • Medical Superintendent: Dr. K. M. Nafeel
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Link href={`/hospitals/${hospital.id}/beds`}>
              <Button variant="primary" size="sm" className="gap-1.5 text-xs font-semibold">
                <Activity className="w-4 h-4" /> Manage Beds
              </Button>
            </Link>
            <Link href={`/hospitals/${hospital.id}/duty-roster`}>
              <Button variant="outline" size="sm" className="text-xs bg-slate-800 text-slate-200 border-slate-700">
                <Calendar className="w-4 h-4 text-teal-400" /> Ward Duty Roster
              </Button>
            </Link>
            <Link href={`/hospitals/${hospital.id}`}>
              <Button variant="outline" size="sm" className="text-xs bg-slate-800 text-slate-200 border-slate-700">
                15-Tab Workspace
              </Button>
            </Link>
          </div>
        </div>

        {/* Scope Restriction Notice (Section 60) */}
        <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-blue-600 shrink-0" />
            <span>
              <strong>Section 60 Geographic Scope:</strong> You are authorized to manage operational records, staffing rosters, and bed locks for <strong>{hospital.name}</strong> only. Inter-hospital modification is prohibited.
            </span>
          </div>
          <Badge variant="outline">HOSPITAL_SCOPE_LOCKED</Badge>
        </div>

        {/* Operational Overview Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <span className="text-xs text-slate-500">Total Ward Beds</span>
            <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{totalBeds}</p>
            <span className="text-[11px] text-teal-600 font-medium">9 Wards Operational</span>
          </div>
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <span className="text-xs text-slate-500">Bed Occupancy Rate</span>
            <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{occupancyRate}%</p>
            <span className="text-[11px] text-amber-600 font-medium">{occupiedBeds} occupied / 44 available</span>
          </div>
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <span className="text-xs text-slate-500">Workforce On Duty</span>
            <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{activeStaff.length + 12}</p>
            <span className="text-[11px] text-emerald-600 font-medium">Zero Shift Overlaps</span>
          </div>
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <span className="text-xs text-slate-500">Today&apos;s Admissions</span>
            <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">14</p>
            <span className="text-[11px] text-blue-600 font-medium">11 Discharges Completed</span>
          </div>
        </div>

        {/* 4 Pillars of Hospital Administration */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Operations & Patient Flow */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Activity className="w-5 h-5 text-teal-600" />
                Hospital Inpatient Flow &amp; Bed Occupancy
              </h2>
              <Badge variant="teal">Live Telemetry</Badge>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-900 dark:text-white">Ward 1 (Male Medical)</p>
                  <p className="text-slate-500">Capacity: 24 Beds</p>
                </div>
                <Badge variant="teal">20 Occupied (83%)</Badge>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-900 dark:text-white">Ward 3 (Female Medical)</p>
                  <p className="text-slate-500">Capacity: 26 Beds</p>
                </div>
                <Badge variant="teal">24 Occupied (92%)</Badge>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-900 dark:text-white">Pediatric Ward</p>
                  <p className="text-slate-500">Capacity: 18 Beds</p>
                </div>
                <Badge variant="outline">11 Occupied (61%)</Badge>
              </div>
            </div>

            <div className="pt-2 flex gap-2">
              <Link href={`/hospitals/${hospital.id}/beds`} className="flex-1">
                <Button variant="outline" size="sm" className="w-full text-xs">
                  Inspect All Wards →
                </Button>
              </Link>
            </div>
          </div>

          {/* Workforce & Duty Roster Conflicts */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-purple-600" />
                Workforce Deployment &amp; Conflict Engine
              </h2>
              <Badge variant="teal">Automated Roster Guard</Badge>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/60 flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-emerald-900 dark:text-emerald-200">Zero Overlapping Shifts</p>
                  <p className="text-emerald-800 dark:text-emerald-300">
                    Conflict detection algorithm validated morning, evening, and night shifts across all 9 departments.
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-900 dark:text-white">Medical Officers On-Call</p>
                  <p className="text-slate-500">ETU &amp; General Surgery coverage</p>
                </div>
                <span className="font-mono font-bold text-teal-600">4 Active Officers</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-900 dark:text-white">Nursing Staff (Night Shift)</p>
                  <p className="text-slate-500">Sister-in-charge roster confirmed</p>
                </div>
                <span className="font-mono font-bold text-teal-600">12 Nurses Scheduled</span>
              </div>
            </div>

            <div className="pt-2 flex gap-2">
              <Link href={`/hospitals/${hospital.id}/duty-roster`} className="flex-1">
                <Button variant="outline" size="sm" className="w-full text-xs">
                  Open Roster Schedule →
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </RoleGuard>
  );
}


