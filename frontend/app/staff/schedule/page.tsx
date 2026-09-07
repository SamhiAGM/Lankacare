'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Calendar, Clock, AlertTriangle, CheckCircle2, UserCheck, Plus,
  Filter, Building2, Search, ArrowRight, ShieldCheck, Users
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { EmptyState } from '@/components/ui/EmptyState';
import { dutyRosterService, staffService, getHospitals } from '@/services/apiClient';
import { DutyRosterEntry, StaffRole, DutyRosterStatus } from '@/types';

export default function NationalStaffSchedulePage() {
  const hospitals = useMemo(() => getHospitals(), []);
  const allRosters = useMemo(() => dutyRosterService.getAll(), []);
  const allStaff = useMemo(() => staffService.getAll(), []);

  const [selectedHospital, setSelectedHospital] = useState<string>('ALL');
  const [selectedRole, setSelectedRole] = useState<string>('ALL');
  const [selectedShift, setSelectedShift] = useState<string>('ALL');
  const [searchStaff, setSearchStaff] = useState('');

  const filteredRosters = useMemo(() => {
    return allRosters.filter((r: DutyRosterEntry) => {
      if (selectedHospital !== 'ALL' && r.hospitalId !== selectedHospital) return false;
      if (selectedRole !== 'ALL' && (r.staffRole || r.role) !== selectedRole) return false;
      if (selectedShift !== 'ALL' && r.shiftType !== selectedShift) return false;
      if (searchStaff.trim()) {
        const q = searchStaff.toLowerCase();
        if (!r.staffName.toLowerCase().includes(q) && !r.department.toLowerCase().includes(q)) {
          return false;
        }
      }
      return true;
    });
  }, [allRosters, selectedHospital, selectedRole, selectedShift, searchStaff]);

  return (
    <div className="space-y-6">
      {/* Top Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-teal-600 dark:text-teal-400 uppercase tracking-wider mb-1">
            <Calendar className="w-4 h-4" /> National Health Workforce Roster
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-50 tracking-tight">
            Sri Lanka Healthcare Staff Roster & Scheduling
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Centralized shift schedule for Doctors, Medical Officers, Nurses, Pharmacists, and Paramedical Staff across Sri Lanka.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/hospitals/kinniya/duty-roster">
            <Button variant="outline" size="sm" className="gap-1.5 text-xs">
              <Building2 className="w-3.5 h-3.5 text-teal-600" /> Kinniya Roster
            </Button>
          </Link>
          <Link href="/staff">
            <Button variant="outline" size="sm" className="gap-1.5 text-xs">
              <Users className="w-3.5 h-3.5 text-teal-600" /> Staff Directory
            </Button>
          </Link>
        </div>
      </div>

      {/* Control Filters */}
      <Card className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search staff name or department..."
              value={searchStaff}
              onChange={(e) => setSearchStaff(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
            />
          </div>

          <Select
            value={selectedHospital}
            onChange={(e) => setSelectedHospital(e.target.value)}
            options={[
              { value: 'ALL', label: 'All Sri Lankan Hospitals' },
              ...hospitals.map(h => ({ value: h.id, label: h.name }))
            ]}
          />

          <Select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            options={[
              { value: 'ALL', label: 'All Healthcare Roles' },
              { value: StaffRole.DOCTOR, label: 'Doctor / Consultant' },
              { value: StaffRole.MEDICAL_OFFICER, label: 'Medical Officer (MO)' },
              { value: StaffRole.NURSE, label: 'Nursing Officer' },
              { value: StaffRole.PHARMACIST, label: 'Pharmacist' },
              { value: StaffRole.LABORATORY_SCIENTIST, label: 'Lab Scientist / Technician' },
              { value: StaffRole.PUBLIC_HEALTH_INSPECTOR, label: 'PHI' },
              { value: StaffRole.AMBULANCE_DRIVER_PARAMEDIC, label: 'Ambulance Driver / Paramedic' },
            ]}
          />

          <Select
            value={selectedShift}
            onChange={(e) => setSelectedShift(e.target.value)}
            options={[
              { value: 'ALL', label: 'All Shifts' },
              { value: 'MORNING', label: 'Morning (06:00 - 14:00)' },
              { value: 'EVENING', label: 'Evening (14:00 - 22:00)' },
              { value: 'NIGHT', label: 'Night (22:00 - 06:00)' },
              { value: 'ON_CALL', label: 'On Call (24 Hours)' },
            ]}
          />
        </div>
      </Card>

      {/* Roster Listing */}
      <Card className="p-4">
        {filteredRosters.length === 0 ? (
          <EmptyState
            icon={Calendar}
            title="No duty roster shifts match the criteria"
            description="Adjust your filters or visit an individual hospital's duty roster manager."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700 text-slate-400">
                  <th className="py-3 px-3">Date</th>
                  <th className="py-3 px-3">Hospital Institution</th>
                  <th className="py-3 px-3">Healthcare Professional</th>
                  <th className="py-3 px-3">Role</th>
                  <th className="py-3 px-3">Department</th>
                  <th className="py-3 px-3">Shift Type</th>
                  <th className="py-3 px-3">Shift Hours</th>
                  <th className="py-3 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredRosters.map((r: DutyRosterEntry) => (
                  <tr key={r.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                    <td className="py-3 px-3 font-mono font-semibold text-slate-900 dark:text-slate-100">
                      {r.date}
                    </td>
                    <td className="py-3 px-3">
                      <Link
                        href={r.hospitalId === 'hosp-kinniya' ? '/hospitals/kinniya' : `/hospitals/${r.hospitalId}`}
                        className="font-bold text-teal-600 dark:text-teal-400 hover:underline"
                      >
                        {r.hospitalName}
                      </Link>
                    </td>
                    <td className="py-3 px-3 font-bold text-slate-900 dark:text-slate-100">
                      {r.staffName}
                    </td>
                    <td className="py-3 px-3">
                      <Badge variant="teal" size="sm">{(r.staffRole || r.role || 'STAFF').replace('_', ' ')}</Badge>
                    </td>
                    <td className="py-3 px-3 text-slate-600 dark:text-slate-300">
                      {r.department}
                    </td>
                    <td className="py-3 px-3">
                      <Badge
                        variant={r.shiftType === 'NIGHT' ? 'blue' : r.shiftType === 'EVENING' ? 'amber' : 'emerald'}
                        size="sm"
                      >
                        {r.shiftType}
                      </Badge>
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-500">
                      {r.startTime} — {r.endTime}
                    </td>
                    <td className="py-3 px-3">
                      <Badge variant={r.status === 'ON_DUTY' ? 'emerald' : 'teal'} size="sm">
                        {r.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
