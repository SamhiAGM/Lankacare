'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import {
  Building2, BedDouble, Users, Pill, AlertTriangle, ArrowLeft,
  Calendar, Activity, HeartPulse, Clock, ShieldCheck, ExternalLink
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import {
  getHospitals, staffService, dutyRosterService, bedService,
  admissionService, hospitalInventoryService
} from '@/services/apiClient';
import { Hospital, HospitalStatus } from '@/types';

export default function HospitalDashboardPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const { id } = resolvedParams;

  const [hospital, setHospital] = useState<Hospital | null>(null);
  const [timeString, setTimeString] = useState('');

  useEffect(() => {
    const list = getHospitals();
    const found = list.find((h) => h.id === id) || list[0];
    if (found) setHospital(found);

    const updateTime = () => {
      const now = new Date();
      setTimeString(now.toLocaleTimeString('en-US', { timeZone: 'Asia/Colombo', hour12: true }));
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, [id]);

  if (!hospital) return null;

  const staff = staffService.getByHospital(hospital.id);
  const rosters = dutyRosterService.getByHospital(hospital.id);
  const beds = bedService.getByHospital(hospital.id);
  const admissions = admissionService.getByHospital(hospital.id);
  const inventory = hospitalInventoryService.getByHospital(hospital.id);
  const shortages = hospitalInventoryService.getShortageAlerts(hospital.id);

  const availableBeds = beds.filter(b => b.status === 'AVAILABLE').length;
  const occupiedBeds = beds.filter(b => b.status === 'OCCUPIED').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link
          href={hospital.id === 'hosp-kinniya' ? '/hospitals/kinniya' : `/hospitals/${hospital.id}`}
          className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 font-semibold"
        >
          <ArrowLeft className="w-4 h-4" /> Back to {hospital.name}
        </Link>
        <div className="flex items-center gap-2 text-xs font-mono text-slate-500">
          <Clock className="w-3.5 h-3.5 text-teal-600" />
          <span>Colombo Time: <strong>{timeString} (UTC+05:30)</strong></span>
        </div>
      </div>

      <Card className="p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge variant="teal">{hospital.type}</Badge>
              <Badge variant="emerald">Live Telemetry Dashboard</Badge>
              <span className="text-xs text-slate-400 font-mono">• {hospital.code}</span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-slate-50">
              {hospital.name} — Operational Analytics
            </h1>
            <p className="text-xs text-slate-500">
              Real-time synchronization across inpatient admissions, duty rosters, ward beds, and pharmacy stock.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link href={`/hospitals/${hospital.id}/beds`}>
              <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                <BedDouble className="w-3.5 h-3.5 text-teal-600" /> Bed Manager
              </Button>
            </Link>
            <Link href={`/hospitals/${hospital.id}/duty-roster`}>
              <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                <Calendar className="w-3.5 h-3.5 text-teal-600" /> Duty Roster
              </Button>
            </Link>
          </div>
        </div>
      </Card>

      {/* 4 Top KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 space-y-1">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Ward Beds Available</p>
          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            {availableBeds || hospital.availableBeds || hospital.totalBeds}
          </p>
          <p className="text-[10px] text-slate-400">Out of {hospital.totalBeds} total beds</p>
        </Card>

        <Card className="p-4 space-y-1">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Active Inpatients</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-50">
            {admissions.filter(a => a.status === 'ADMITTED').length || occupiedBeds}
          </p>
          <p className="text-[10px] text-slate-400">Receiving Ward Treatment</p>
        </Card>

        <Card className="p-4 space-y-1">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Staff On Duty Today</p>
          <p className="text-2xl font-bold text-teal-600 dark:text-teal-400">
            {rosters.length || staff.length}
          </p>
          <p className="text-[10px] text-slate-400">Across {hospital.departments.length} Units</p>
        </Card>

        <Card className="p-4 space-y-1">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Medicine Alerts</p>
          <p className="text-2xl font-bold text-amber-500">
            {shortages.length}
          </p>
          <p className="text-[10px] text-slate-400">Low Stock / Shortages</p>
        </Card>
      </div>

      {/* Grid of operational feeds */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Inpatients Preview */}
        <Card>
          <CardHeader>
            <CardTitle>Inpatient Intake & Bed Allocations</CardTitle>
            <CardDescription>Recent patient admissions locked to hospital beds</CardDescription>
          </CardHeader>
          <CardContent>
            {admissions.length === 0 ? (
              <p className="text-xs text-slate-500 py-4 text-center">No admissions logged yet.</p>
            ) : (
              <div className="space-y-2 text-xs">
                {admissions.slice(0, 5).map(adm => (
                  <div key={adm.id} className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 flex justify-between items-center">
                    <div>
                      <p className="font-bold text-slate-900 dark:text-slate-100">{adm.patientName}</p>
                      <p className="text-[11px] text-slate-500">{adm.admittingDiagnosis} • Bed {adm.bedId}</p>
                    </div>
                    <Badge variant={adm.status === 'ADMITTED' ? 'emerald' : 'gray'} size="sm">
                      {adm.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pharmacy Shortage Radar */}
        <Card>
          <CardHeader>
            <CardTitle>Pharmacy Shortage Telemetry</CardTitle>
            <CardDescription>Supplies tracked against Medical Supplies Division baseline</CardDescription>
          </CardHeader>
          <CardContent>
            {shortages.length === 0 ? (
              <p className="text-xs text-slate-500 py-4 text-center">
                All tracked medicines maintain adequate minimum reserve stock.
              </p>
            ) : (
              <div className="space-y-2 text-xs">
                {shortages.map((al, idx) => (
                  <div key={idx} className="p-3 rounded-lg bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/50 flex justify-between items-center">
                    <div>
                      <p className="font-bold text-slate-900 dark:text-slate-100">{al.genericName}</p>
                      <p className="text-[11px] text-rose-600">Stock: {al.quantity ?? 0} units (Min: {al.minimumThreshold})</p>
                    </div>
                    <Badge variant="rose" size="sm">{al.severity}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
