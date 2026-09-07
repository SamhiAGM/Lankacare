'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Compass, Calendar, GitPullRequest, UserCheck, ShieldAlert,
  Siren, Bug, ArrowRight, Building2, MapPin, Search, CheckCircle2,
  FileText, HeartPulse, Stethoscope, ChevronRight, Lock
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { initialHospitals } from '@/services/mockData';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { RoleGuard } from '@/components/auth/RoleGuard';
import { UserRole } from '@/types';

export default function CitizenPortalPage() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredHospitals = initialHospitals.filter(
    (h) =>
      h.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      h.district.toLowerCase().includes(searchTerm.toLowerCase())
  ).slice(0, 4);

  return (
    <RoleGuard allowedRoles={[UserRole.CITIZEN, UserRole.SUPER_ADMIN, UserRole.MINISTRY_ADMIN]}>
      <div className="space-y-8 pb-12">
        {/* Welcome Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-teal-900 via-slate-900 to-slate-950 text-white p-6 sm:p-10 border border-teal-800/40 shadow-xl">
          <div className="relative z-10 max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 border border-teal-500/30 text-teal-300 text-xs font-semibold">
              <HeartPulse className="w-3.5 h-3.5" />
              Democratic Socialist Republic of Sri Lanka • Public Citizen Health Portal
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Ayubowan, {user?.name || 'Citizen'}
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              Your official gateway to Sri Lanka healthcare services. Search verified hospitals, book outpatient clinic appointments, track inter-hospital referrals, and access verified public health guidance.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <Link href="/find-care">
                <Button variant="primary" className="gap-2 bg-teal-500 hover:bg-teal-600 text-white font-semibold">
                  <Compass className="w-4 h-4" /> Find Nearest Care
                </Button>
              </Link>
              <Link href="/emergency">
                <Button variant="danger" className="gap-2 font-bold shadow-md shadow-rose-950/50">
                  <Siren className="w-4 h-4" /> 1990 Suwa Seriya Emergency
                </Button>
              </Link>
            </div>
          </div>
          <div className="absolute right-0 top-0 bottom-0 w-96 bg-[radial-gradient(circle_at_center,rgba(20,184,166,0.15),transparent_70%)] pointer-events-none" />
        </div>

        {/* Public Health Alerts Ticker */}
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 flex items-start gap-3">
          <Bug className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div className="flex-1 text-xs">
            <span className="font-bold text-amber-900 dark:text-amber-200 uppercase tracking-wide">
              Official Health Notice: National Dengue Surveillance
            </span>
            <p className="text-amber-800 dark:text-amber-300 mt-0.5 leading-relaxed">
              Inter-monsoon rain periods require 30-minute weekly cleanups of residential standing water. Report mosquito breeding premises or visit your nearest MOH/RDHS clinic if high fever persists &gt;48 hours.
            </p>
          </div>
          <Link href="/dengue">
            <span className="text-xs font-bold text-amber-700 dark:text-amber-300 hover:underline shrink-0">
              View Guidelines →
            </span>
          </Link>
        </div>

        {/* Quick Action Portals Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            href="/citizen/profile"
            className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-teal-500 hover:shadow-lg transition-all group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <UserCheck className="w-5 h-5" />
            </div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">My Health Profile</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              View your PHN, blood group, allergies, and official health interactions.
            </p>
            <span className="text-xs font-semibold text-teal-600 dark:text-teal-400 mt-3 inline-flex items-center gap-1">
              View Profile <ChevronRight className="w-3.5 h-3.5" />
            </span>
          </Link>

          <Link
            href="/citizen/appointments"
            className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-teal-500 hover:shadow-lg transition-all group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Calendar className="w-5 h-5" />
            </div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">Clinic Appointments</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Schedule or reschedule verified clinic sessions at government hospitals.
            </p>
            <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 mt-3 inline-flex items-center gap-1">
              Manage Appointments <ChevronRight className="w-3.5 h-3.5" />
            </span>
          </Link>

          <Link
            href="/citizen/referrals"
            className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-teal-500 hover:shadow-lg transition-all group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <GitPullRequest className="w-5 h-5" />
            </div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">Referral Tracker</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Track inter-facility transfer requests and specialist consult statuses.
            </p>
            <span className="text-xs font-semibold text-purple-600 dark:text-purple-400 mt-3 inline-flex items-center gap-1">
              Track Referrals <ChevronRight className="w-3.5 h-3.5" />
            </span>
          </Link>

          <Link
            href="/citizen/health-information"
            className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-teal-500 hover:shadow-lg transition-all group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <FileText className="w-5 h-5" />
            </div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">Health Education Center</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Verified immunization guidelines, maternal/child care, and NCD prevention.
            </p>
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mt-3 inline-flex items-center gap-1">
              Browse Topics <ChevronRight className="w-3.5 h-3.5" />
            </span>
          </Link>
        </div>

        {/* Hospital Search & Directory Snippet */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Find Sri Lankan Healthcare Facilities
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Verified Base, District General, and Provincial hospitals across all 25 districts.
              </p>
            </div>
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search hospital or district..."
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-teal-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
            {filteredHospitals.map((hosp) => (
              <div
                key={hosp.id}
                className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex items-start justify-between gap-3"
              >
                <div className="min-w-0 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900 dark:text-white truncate">
                      {hosp.name}
                    </span>
                    <Badge variant="teal">{hosp.officialCategory?.replace(/_/g, ' ') || 'HOSPITAL'}</Badge>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                    {hosp.district} District • {hosp.region} Province
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Emergency: {hosp.emergencyAvailable ? 'Available 24/7' : 'Standard Working Hours'} • Tel: {hosp.phone || 'RDHS Directed'}
                  </p>
                </div>
                <Link href={`/hospitals/${hosp.id}`}>
                  <Button variant="outline" size="sm" className="shrink-0 text-xs">
                    View Details
                  </Button>
                </Link>
              </div>
            ))}
          </div>

          <div className="flex justify-end pt-2">
            <Link href="/hospitals">
              <span className="text-xs font-bold text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1">
                View All National Hospitals Directory ({initialHospitals.length}+ facilities) →
              </span>
            </Link>
          </div>
        </div>

        {/* Section 56 Strict Citizen Privacy Demarcation */}
        <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 flex items-start gap-3 text-xs text-slate-600 dark:text-slate-400">
          <Lock className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
          <div className="space-y-1 leading-relaxed">
            <span className="font-bold text-slate-800 dark:text-slate-200">
              Healthcare Privacy &amp; Access Boundaries Notice (Section 56):
            </span>
            <p>
              As a public citizen user, you have authorized access to your own personal health record, appointments, referrals, and public healthcare maps. Access to other patients, internal clinical notes, duty rosters, internal pharmacy storehouses, blood bank inventory, and ministry confidential data is strictly restricted by Express API permissions.
            </p>
          </div>
        </div>
      </div>
    </RoleGuard>
  );
}
