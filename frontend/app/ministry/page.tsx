'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Activity, MapPin, Building2, GitPullRequest, Pill,
  Users, ShieldAlert, FileBarChart2, ShieldCheck, Download,
  CheckCircle2, AlertTriangle, Eye, Edit, Layers
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { RoleGuard } from '@/components/auth/RoleGuard';
import { UserRole } from '@/types';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useToast } from '@/context/ToastContext';

export default function MinistryOfficerPortalPage() {
  const { user } = useAuth();
  const { toast } = useToast();

  const handleExport = (reportName: string) => {
    toast.success(
      `Official Ministry Digest Exported`,
      `Downloaded: ${reportName} (Signed with Ministry cryptographic hash)`
    );
  };

  return (
    <RoleGuard allowedRoles={[UserRole.MINISTRY_OFFICER, UserRole.MINISTRY_ADMIN, UserRole.SUPER_ADMIN]}>
      <div className="space-y-6 pb-12">
        {/* Header */}
        <div className="p-6 rounded-3xl bg-slate-900 text-white border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400">
                <Activity className="w-5 h-5" />
              </span>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
                Ministry of Health — Directorate of Medical Services
              </h1>
              <Badge variant="teal">National Executive Oversight</Badge>
            </div>
            <p className="text-xs text-slate-400">
              Dr. Priya Kumara • National Health Coordination Command • Suwasiripaya, Colombo 10
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleExport('National_Bed_Capacity_Census_2026.pdf')}
              className="gap-1.5 text-xs bg-slate-800 text-slate-200 border-slate-700"
            >
              <Download className="w-4 h-4 text-teal-400" /> Export National Census
            </Button>
            <Link href="/map">
              <Button variant="primary" size="sm" className="text-xs bg-cyan-600 hover:bg-cyan-700 font-semibold gap-1.5">
                <MapPin className="w-4 h-4" /> National GIS Map
              </Button>
            </Link>
          </div>
        </div>

        {/* Section 64 Permission Demarcation Notice */}
        <div className="p-4 rounded-2xl bg-cyan-50/60 dark:bg-cyan-950/30 border border-cyan-200 dark:border-cyan-900/40 text-xs text-cyan-900 dark:text-cyan-200 flex items-center justify-between gap-3">
          <div>
            <strong>Section 64 Principle (Ministry Officer ≠ Super Admin):</strong> Ministry Officers have national-level <strong>VIEW, ANALYZE, and EXPORT</strong> privileges across all 9 provinces and 25 districts, but system configuration changes and destructive deletions require separate Ministry Administrator credentials.
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-mono text-[10px] font-bold">VIEW: GRANTED</span>
            <span className="px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-mono text-[10px] font-bold">EXPORT: GRANTED</span>
            <span className="px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-mono text-[10px]">DELETE: RESTRICTED</span>
          </div>
        </div>

        {/* National Macro Health Indicators */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <span className="text-xs text-slate-500">Total Registered Hospitals</span>
            <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">640+</p>
            <span className="text-[11px] text-teal-600 font-medium">9 Provinces • 25 Districts</span>
          </div>
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <span className="text-xs text-slate-500">National Bed Occupancy</span>
            <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">81.4%</p>
            <span className="text-[11px] text-amber-600 font-medium">85,200 Reported Total Beds</span>
          </div>
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <span className="text-xs text-slate-500">Active Disease Surveillance</span>
            <p className="text-2xl font-bold text-rose-600 dark:text-rose-400 mt-1">1,240</p>
            <span className="text-[11px] text-rose-600 font-medium">Weekly Dengue Notified</span>
          </div>
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <span className="text-xs text-slate-500">National Blood Bank Reserve</span>
            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">Adequate (8.4 Days)</p>
            <span className="text-[11px] text-emerald-600 font-medium">NBTS Central Registry</span>
          </div>
        </div>

        {/* 4 National Command Workstreams */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Workstream 1: Inter-Hospital Referral Hub */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <GitPullRequest className="w-5 h-5 text-purple-600" />
                Inter-Facility Referral Logistics
              </h2>
              <Badge variant="teal">National Grid</Badge>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-900 dark:text-white">Active Inter-Province Transfers</p>
                  <p className="text-slate-500">Eastern → Western specialized triage</p>
                </div>
                <span className="font-mono font-bold text-purple-600">38 Cases Active</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-900 dark:text-white">Cardiac Catheterization Transfers</p>
                  <p className="text-slate-500">Base Hospitals → NHSL &amp; Teaching Centers</p>
                </div>
                <span className="font-mono font-bold text-teal-600">14 In Transit</span>
              </div>
            </div>

            <div className="pt-2">
              <Link href="/referrals">
                <Button variant="outline" size="sm" className="w-full text-xs">
                  Review Referral Command Center →
                </Button>
              </Link>
            </div>
          </div>

          {/* Workstream 2: National Medicine & Supplies Intelligence */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Pill className="w-5 h-5 text-orange-600" />
                Essential Medicine Shortage Escalations
              </h2>
              <Badge variant="amber">MSD Synchronized</Badge>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="p-3 rounded-xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 flex items-center justify-between">
                <div>
                  <p className="font-bold text-amber-900 dark:text-amber-200">Insulin Soluble 100IU/ml</p>
                  <p className="text-amber-800 dark:text-amber-300">Kinniya &amp; Batticaloa depots reporting low buffer</p>
                </div>
                <Badge variant="amber">LOW BUFFER</Badge>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-900 dark:text-white">Amoxicillin 500mg Capsules</p>
                  <p className="text-slate-500">Central Colombo warehouse dispatched to Eastern Province</p>
                </div>
                <Badge variant="teal">DISPATCHED</Badge>
              </div>
            </div>

            <div className="pt-2">
              <Link href="/medicines">
                <Button variant="outline" size="sm" className="w-full text-xs">
                  Inspect National Medicine Radar →
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </RoleGuard>
  );
}
