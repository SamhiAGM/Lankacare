'use client';

import React from 'react';
import Link from 'next/link';
import {
  Compass, Building2, MapPin, Activity, Bug,
  FileBarChart2, Users, Layers, Lock, ChevronRight, ArrowRight
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { RoleGuard } from '@/components/auth/RoleGuard';
import { UserRole } from '@/types';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { initialHospitals } from '@/services/mockData';

export default function ProvincialOfficerPortalPage() {
  const { user } = useAuth();
  const province = user?.scope?.province || 'EASTERN';

  // Districts within Eastern Province
  const easternDistricts = [
    {
      name: 'Trincomalee',
      hospitals: 14,
      beds: 640,
      occupancy: '78%',
      dengueCases: 42,
      risk: 'HIGH',
      keyFacility: 'Base Hospital Kinniya & DGH Trinco',
    },
    {
      name: 'Batticaloa',
      hospitals: 18,
      beds: 920,
      occupancy: '82%',
      dengueCases: 68,
      risk: 'CRITICAL',
      keyFacility: 'Batticaloa Teaching Hospital',
    },
    {
      name: 'Ampara',
      hospitals: 16,
      beds: 710,
      occupancy: '74%',
      dengueCases: 29,
      risk: 'MODERATE',
      keyFacility: 'DGH Ampara & Kalmunai Base Hospital',
    },
  ];

  return (
    <RoleGuard allowedRoles={[UserRole.PROVINCIAL_ADMIN, UserRole.SUPER_ADMIN, UserRole.MINISTRY_ADMIN]}>
      <div className="space-y-6 pb-12">
        {/* Header */}
        <div className="p-6 rounded-3xl bg-slate-900 text-white border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-sky-500/20 text-sky-400">
                <Compass className="w-5 h-5" />
              </span>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
                Provincial Directorate of Health Services (PDHS)
              </h1>
              <Badge variant="teal">{province} Province Oversight</Badge>
            </div>
            <p className="text-xs text-slate-400">
              Dr. Chandani Jayaratne (Provincial Director of Health Services) • Regional Health Command
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link href="/map">
              <Button variant="primary" size="sm" className="gap-1.5 text-xs bg-sky-600 hover:bg-sky-700 font-semibold">
                <MapPin className="w-4 h-4" /> Provincial GIS Map
              </Button>
            </Link>
            <Link href="/surveillance">
              <Button variant="outline" size="sm" className="text-xs bg-slate-800 text-slate-200 border-slate-700">
                <Activity className="w-4 h-4 text-teal-400" /> Epidemiological Trends
              </Button>
            </Link>
          </div>
        </div>

        {/* Scope Restriction Banner (Section 63) */}
        <div className="p-4 rounded-2xl bg-sky-50/60 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-900/60 text-xs text-sky-900 dark:text-sky-200 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-sky-600 shrink-0" />
            <span>
              <strong>Section 63 Provincial Scoping:</strong> Authorized for <strong>{province} Province</strong> (Trincomalee, Batticaloa, Ampara) only. Western, Southern, Central, Northern, and other provinces are restricted by authorization policy.
            </span>
          </div>
          <Badge variant="outline">PROVINCIAL_SCOPE_LOCKED</Badge>
        </div>

        {/* Overview Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <span className="text-xs text-slate-500">Supervised Districts</span>
            <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">3</p>
            <span className="text-[11px] text-teal-600 font-medium">Trincomalee, Batticaloa, Ampara</span>
          </div>
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <span className="text-xs text-slate-500">Total Provincial Beds</span>
            <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">2,270</p>
            <span className="text-[11px] text-teal-600 font-medium">79% Overall Bed Occupancy</span>
          </div>
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <span className="text-xs text-slate-500">Provincial Dengue Cases</span>
            <p className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">139</p>
            <span className="text-[11px] text-amber-600 font-medium">Cases Reported This Week</span>
          </div>
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <span className="text-xs text-slate-500">Active Public Facilities</span>
            <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">48</p>
            <span className="text-[11px] text-emerald-600 font-medium">DGHs, Base A/B, PMCUs</span>
          </div>
        </div>

        {/* Multi-District Comparison Table (Section 63) */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Layers className="w-5 h-5 text-sky-600" />
                Inter-District Comparative Performance ({province} Province)
              </h2>
              <p className="text-xs text-slate-500">
                Comparative metrics across the 3 authorized districts in Eastern Province.
              </p>
            </div>
            <Badge variant="teal">RDHS Synchronized</Badge>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3">District Authority</th>
                  <th className="px-4 py-3">Supervised Facilities</th>
                  <th className="px-4 py-3">Inpatient Beds</th>
                  <th className="px-4 py-3">Bed Occupancy</th>
                  <th className="px-4 py-3">Weekly Dengue</th>
                  <th className="px-4 py-3">Risk Level</th>
                  <th className="px-4 py-3">Key Facilities</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {easternDistricts.map((d) => (
                  <tr key={d.name} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">
                      {d.name} District
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                      {d.hospitals} Facilities
                    </td>
                    <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">
                      {d.beds}
                    </td>
                    <td className="px-4 py-3 text-teal-600 font-semibold">
                      {d.occupancy}
                    </td>
                    <td className="px-4 py-3 font-mono font-bold text-amber-600 dark:text-amber-400">
                      {d.dengueCases}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={d.risk === 'CRITICAL' ? 'danger' : d.risk === 'HIGH' ? 'amber' : 'teal'}>
                        {d.risk}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-slate-500">
                      {d.keyFacility}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </RoleGuard>
  );
}
