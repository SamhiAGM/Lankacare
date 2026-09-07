'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  MapPin, Building2, Bug, ShieldAlert, ArrowLeft,
  ChevronRight, Phone, Stethoscope, AlertTriangle, Layers
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { RoleGuard } from '@/components/auth/RoleGuard';
import { UserRole } from '@/types';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { initialHospitals } from '@/services/mockData';

export default function DistrictHealthMapPage() {
  const { user } = useAuth();
  const district = user?.scope?.district || 'Trincomalee';

  const facilities = [
    {
      id: 'hosp-kinniya',
      name: 'Base Hospital Kinniya',
      category: 'Base Hospital Type B',
      lat: 8.4975,
      lng: 81.1895,
      beds: 142,
      icu: 'Operational',
      emergency: '24/7 ETU',
      dengueAlert: 'MODERATE',
    },
    {
      id: 'hosp-trinco-dgh',
      name: 'District General Hospital Trincomalee',
      category: 'District General Hospital',
      lat: 8.5874,
      lng: 81.2152,
      beds: 410,
      icu: 'Operational (8 Beds)',
      emergency: '24/7 Critical Care',
      dengueAlert: 'HIGH',
    },
    {
      id: 'hosp-muthur',
      name: 'Base Hospital Muthur',
      category: 'Base Hospital Type B',
      lat: 8.4552,
      lng: 81.2678,
      beds: 88,
      icu: 'Stabilization Unit',
      emergency: 'Day & Evening OPD',
      dengueAlert: 'NORMAL',
    },
  ];

  const [selectedFacility, setSelectedFacility] = useState(facilities[0]);

  return (
    <RoleGuard allowedRoles={[UserRole.DISTRICT_ADMIN, UserRole.SUPER_ADMIN, UserRole.MINISTRY_ADMIN]}>
      <div className="space-y-6 pb-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                {district} District GIS Health Map
              </h1>
              <Badge variant="teal">RDHS Geographic Command</Badge>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Georeferenced distribution of institutional capacity, PHI cluster alerts, and patient transfer routes.
            </p>
          </div>
          <Link href="/district-officer">
            <Button variant="outline" size="sm">
              ← Return to District Portal
            </Button>
          </Link>
        </div>

        {/* Map Canvas & Interactive Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Simulated Interactive Vector Map Viewport */}
          <div className="lg:col-span-2 rounded-3xl bg-slate-900 border border-slate-800 p-6 relative overflow-hidden min-h-[480px] flex flex-col justify-between shadow-xl">
            {/* Map Header Overlay */}
            <div className="flex items-center justify-between z-10">
              <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/80 backdrop-blur-md text-xs text-white">
                <span className="font-bold text-teal-400">Target Region:</span> Eastern Province • {district} RDHS
              </div>
              <div className="p-2 rounded-xl bg-slate-800/80 border border-slate-700/80 text-[11px] text-slate-300">
                Lat: 8.5874° N, Lon: 81.2152° E
              </div>
            </div>

            {/* Visual Vector Grid & Facility Markers */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
              <div className="w-[500px] h-[500px] border border-teal-500 rounded-full animate-pulse" />
              <div className="w-[300px] h-[300px] border border-teal-500/60 rounded-full absolute" />
            </div>

            {/* Interactive Node Pins */}
            <div className="relative z-10 flex-1 flex flex-col justify-around py-8 px-4">
              {facilities.map((fac) => {
                const isSelected = selectedFacility.id === fac.id;
                return (
                  <button
                    key={fac.id}
                    onClick={() => setSelectedFacility(fac)}
                    className={`flex items-center gap-3 p-3 rounded-2xl transition-all cursor-pointer text-left w-fit ${
                      isSelected
                        ? 'bg-teal-600 text-white shadow-lg shadow-teal-900/60 scale-105 ring-2 ring-white/30'
                        : 'bg-slate-800/80 hover:bg-slate-700/90 text-slate-200 border border-slate-700'
                    }`}
                  >
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm ${
                        isSelected ? 'bg-white text-teal-700' : 'bg-teal-500/20 text-teal-400'
                      }`}
                    >
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-bold text-xs">{fac.name}</p>
                      <p className="text-[10px] opacity-80">{fac.beds} Beds • {fac.emergency}</p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Map Footer Legend */}
            <div className="flex items-center justify-between text-[11px] text-slate-400 z-10 border-t border-slate-800 pt-3">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-teal-500" /> Operational Facility
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Dengue Surveillance Cluster
                </span>
              </div>
              <span className="font-mono">Survey Datum: SLD99 / EPSG:5235</span>
            </div>
          </div>

          {/* Facility Details Panel */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
            <div className="space-y-1">
              <Badge variant="teal">{selectedFacility.category}</Badge>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {selectedFacility.name}
              </h3>
              <p className="text-xs text-slate-500">
                Coordinates: {selectedFacility.lat}° N, {selectedFacility.lng}° E
              </p>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 flex items-center justify-between">
                <span className="text-slate-500">Reported Bed Capacity:</span>
                <span className="font-bold text-slate-900 dark:text-white">{selectedFacility.beds} Inpatient Beds</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 flex items-center justify-between">
                <span className="text-slate-500">Emergency &amp; ETU:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">{selectedFacility.emergency}</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 flex items-center justify-between">
                <span className="text-slate-500">Dengue Cluster Risk:</span>
                <Badge variant={selectedFacility.dengueAlert === 'HIGH' ? 'danger' : 'amber'}>
                  {selectedFacility.dengueAlert}
                </Badge>
              </div>
            </div>

            <div className="pt-3">
              <Link href={`/hospitals/${selectedFacility.id}`}>
                <Button variant="primary" className="w-full text-xs justify-center gap-1.5">
                  Launch Hospital Workspace <ChevronRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </RoleGuard>
  );
}
