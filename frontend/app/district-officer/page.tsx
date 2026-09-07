'use client';

import React from 'react';
import Link from 'next/link';
import {
  MapPin, Building2, Bug, GitPullRequest, Activity,
  Users, ShieldAlert, FileBarChart2, ArrowRight, Lock, CheckCircle2
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { RoleGuard } from '@/components/auth/RoleGuard';
import { UserRole } from '@/types';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { initialHospitals, initialDistrictDengueStats } from '@/services/mockData';

export default function DistrictOfficerPortalPage() {
  const { user } = useAuth();
  const districtName = user?.scope?.district || 'Trincomalee';

  // Filter institutions strictly to authorized district
  const districtHospitals = initialHospitals.filter(
    (h) => h.district.toLowerCase() === districtName.toLowerCase()
  );

  // District dengue statistics
  const dengueStat = initialDistrictDengueStats.find(
    (d) => d.district.toLowerCase() === districtName.toLowerCase()
  ) || {
    district: districtName,
    province: 'EASTERN',
    casesThisWeek: 42,
    casesPreviousWeek: 38,
    cumulativeYearCases: 618,
    riskLevel: 'HIGH' as const,
    isCalculatedRisk: true,
    reportingPeriod: 'Week 35, 2026',
    source: 'Epidemiology Unit Sri Lanka',
  };

  return (
    <RoleGuard allowedRoles={[UserRole.DISTRICT_ADMIN, UserRole.SUPER_ADMIN, UserRole.MINISTRY_ADMIN]}>
      <div className="space-y-6 pb-12">
        {/* Header */}
        <div className="p-6 rounded-3xl bg-slate-900 text-white border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400">
                <MapPin className="w-5 h-5" />
              </span>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
                Regional Directorate of Health Services (RDHS)
              </h1>
              <Badge variant="teal">{districtName} District Jurisdiction</Badge>
            </div>
            <p className="text-xs text-slate-400">
              Dr. Ruwan Gunawardana (RDHS {districtName}) • Eastern Province Health Administration
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link href="/district-officer/map">
              <Button variant="primary" size="sm" className="gap-1.5 text-xs bg-indigo-600 hover:bg-indigo-700 font-semibold">
                <MapPin className="w-4 h-4" /> Open District GIS Map
              </Button>
            </Link>
            <Link href="/dengue">
              <Button variant="outline" size="sm" className="text-xs bg-slate-800 text-slate-200 border-slate-700">
                <Bug className="w-4 h-4 text-amber-400" /> PHI Dengue Desk
              </Button>
            </Link>
          </div>
        </div>

        {/* Scope Restriction Banner (Section 61) */}
        <div className="p-4 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900/60 text-xs text-indigo-900 dark:text-indigo-200 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-indigo-600 shrink-0" />
            <span>
              <strong>Section 61 District Scoping:</strong> Authorized to supervise healthcare institutions and public health in <strong>{districtName} District</strong> only. Colombo, Kandy, Galle, or Jaffna institutional administration is strictly prohibited without ministerial promotion.
            </span>
          </div>
          <Badge variant="outline">DISTRICT_LOCK_ACTIVE</Badge>
        </div>

        {/* District Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <span className="text-xs text-slate-500">Supervised Hospitals</span>
            <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{districtHospitals.length}</p>
            <span className="text-[11px] text-teal-600 font-medium">Kinniya, DGH Trinco, Kantale</span>
          </div>
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <span className="text-xs text-slate-500">Weekly Dengue Cases</span>
            <p className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">{dengueStat.casesThisWeek}</p>
            <span className="text-[11px] text-amber-600 font-medium">Active PHI Surveillance Cluster</span>
          </div>
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <span className="text-xs text-slate-500">Total District Beds</span>
            <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">640</p>
            <span className="text-[11px] text-teal-600 font-medium">78% Aggregate Occupancy</span>
          </div>
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <span className="text-xs text-slate-500">MOH Health Units</span>
            <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">11</p>
            <span className="text-[11px] text-emerald-600 font-medium">All Field Teams Active</span>
          </div>
        </div>

        {/* Supervised Healthcare Facilities in District */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Building2 className="w-5 h-5 text-indigo-600" />
                Healthcare Institutions in {districtName} District
              </h2>
              <p className="text-xs text-slate-500">
                Authoritative public healthcare registry within Regional Directorate jurisdiction.
              </p>
            </div>
            <Link href="/district-officer/map">
              <Button variant="outline" size="sm" className="text-xs">
                View on District Map →
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {districtHospitals.map((hosp) => (
              <div
                key={hosp.id}
                className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-slate-900 dark:text-white">
                    {hosp.name}
                  </span>
                  <Badge variant="teal">{hosp.officialCategory?.replace(/_/g, ' ')}</Badge>
                </div>
                <p className="text-xs text-slate-500">
                  {hosp.address} • Tel: {hosp.phone || '+94 26 223 6261'}
                </p>
                <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-300">
                  <span>Reported Beds: <strong>{hosp.totalBeds}</strong></span>
                  <Link href={`/hospitals/${hosp.id}`}>
                    <span className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">
                      Facility Overview →
                    </span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </RoleGuard>
  );
}
