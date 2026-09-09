'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  UserCheck, Search, Filter, Stethoscope, Building2, Calendar,
  Clock, Phone, Mail, Award, Star, CheckCircle2, ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card, CardContent } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { EmptyState } from '@/components/ui/EmptyState';
import { getDoctors, getHospitals } from '@/services/apiClient';
import { Doctor } from '@/types';

import { useAuth } from '@/context/AuthContext';
import { UserRole } from '@/types';

export default function StaffDirectoryPage() {
  const { user } = useAuth();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [search, setSearch] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('ALL');
  const [selectedHospital, setSelectedHospital] = useState('ALL');
  const [activeDoctor, setActiveDoctor] = useState<Doctor | null>(null);

  const isNurseOrWorker = user?.role === UserRole.NURSE || user?.role === UserRole.HEALTH_WORKER;
  const [viewMode, setViewMode] = useState<'WARD' | 'DIRECTORY'>(isNurseOrWorker ? 'WARD' : 'DIRECTORY');

  useEffect(() => {
    setDoctors(getDoctors());
  }, []);

  const specialties = useMemo(() => {
    const list = Array.from(new Set(doctors.map((d) => d.specialty)));
    return ['ALL', ...list];
  }, [doctors]);

  const hospitalsList = useMemo(() => {
    const list = Array.from(new Set(doctors.map((d) => d.hospitalName)));
    return ['ALL', ...list];
  }, [doctors]);

  const filteredDoctors = useMemo(() => {
    return doctors.filter((doc) => {
      const matchSearch =
        doc.name.toLowerCase().includes(search.toLowerCase()) ||
        doc.specialty.toLowerCase().includes(search.toLowerCase()) ||
        doc.slmcNumber.toLowerCase().includes(search.toLowerCase()) ||
        doc.hospitalName.toLowerCase().includes(search.toLowerCase());
      const matchSpecialty =
        selectedSpecialty === 'ALL' || doc.specialty === selectedSpecialty;
      const matchHospital =
        selectedHospital === 'ALL' || doc.hospitalName === selectedHospital;
      return matchSearch && matchSpecialty && matchHospital;
    });
  }, [doctors, search, selectedSpecialty, selectedHospital]);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-50 tracking-tight">
              {viewMode === 'WARD' ? 'Nurse & Healthcare Worker Ward Workspace' : 'Medical Doctors & Consultant Staff Directory'}
            </h1>
            <Badge variant="teal">{viewMode === 'WARD' ? 'Section 58 Portal' : `${filteredDoctors.length} Registered`}</Badge>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {viewMode === 'WARD'
              ? `${user?.organization || 'Base Hospital Kinniya'} • ${user?.department || 'Ward 3 (Female Medical)'} • Sister-in-Charge Duty Desk`
              : 'Official SLMC-accredited clinical medical officers, surgeons, and department chairs across Sri Lanka.'}
          </p>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === 'WARD' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setViewMode('WARD')}
            className="text-xs"
          >
            Ward Workspace
          </Button>
          <Button
            variant={viewMode === 'DIRECTORY' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setViewMode('DIRECTORY')}
            className="text-xs"
          >
            Staff Directory
          </Button>
        </div>
      </div>

      {viewMode === 'WARD' && (
        <div className="space-y-6">
          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <span className="text-xs text-slate-500">Admitted Ward Patients</span>
              <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">24</p>
              <span className="text-[11px] text-teal-600 font-medium">Ward 3 Capacity: 26</span>
            </div>
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <span className="text-xs text-slate-500">Pending Medication Doses</span>
              <p className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">8</p>
              <span className="text-[11px] text-amber-600 font-medium">12:00 PM Afternoon Round</span>
            </div>
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <span className="text-xs text-slate-500">My Shift Status</span>
              <p className="text-base font-bold text-emerald-600 dark:text-emerald-400 mt-1">Morning (On Duty)</p>
              <span className="text-[11px] text-slate-500">07:00 - 15:00 Shift</span>
            </div>
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <span className="text-xs text-slate-500">Planned Discharges</span>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">3</p>
              <span className="text-[11px] text-blue-600 font-medium">Awaiting Consultant Sign-Off</span>
            </div>
          </div>

          {/* Active Ward Patients */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-teal-600" />
                  Ward 3 Patient Roster &amp; Nursing Administration
                </h2>
                <p className="text-xs text-slate-500">Bed allocations, vital signs schedules, and medication charts.</p>
              </div>
              <Link href="/staff/schedule">
                <Button variant="outline" size="sm" className="text-xs">
                  Inspect Ward Roster →
                </Button>
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase tracking-wider">
                  <tr>
                    <th className="px-4 py-3">Bed No</th>
                    <th className="px-4 py-3">Patient Name</th>
                    <th className="px-4 py-3">PHN Number</th>
                    <th className="px-4 py-3">Blood Group</th>
                    <th className="px-4 py-3">Next Vitals Due</th>
                    <th className="px-4 py-3">Nursing Task Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {([] as any[]).slice(0, 4).map((p, idx) => (
                    <tr key={p.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                      <td className="px-4 py-3 font-mono font-bold text-teal-600 dark:text-teal-400">
                        Bed 0{idx + 1}
                      </td>
                      <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">
                        {p.name}
                      </td>
                      <td className="px-4 py-3 font-mono text-slate-500">
                        {p.phn}
                      </td>
                      <td className="px-4 py-3 font-extrabold text-rose-600">
                        {p.bloodGroup || 'B+'}
                      </td>
                      <td className="px-4 py-3 font-mono text-slate-600 dark:text-slate-300">
                        12:00 PM (BP &amp; SpO2)
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[10px] font-semibold">
                          Vitals Stable
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {viewMode === 'DIRECTORY' && (
        <>

      {/* Filters Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-3 w-full md:w-auto flex-1">
          <div className="relative flex items-center w-full max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by doctor name, SLMC reg, specialty..."
              className="w-full h-9 pl-9 pr-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div className="w-48 hidden sm:block">
            <select
              value={selectedSpecialty}
              onChange={(e) => setSelectedSpecialty(e.target.value)}
              className="w-full h-9 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-2.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="ALL">All Clinical Specialties</option>
              {specialties.filter((s) => s !== 'ALL').map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div className="w-48 hidden sm:block">
            <select
              value={selectedHospital}
              onChange={(e) => setSelectedHospital(e.target.value)}
              className="w-full h-9 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-2.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="ALL">All Hospitals</option>
              {hospitalsList.filter((h) => h !== 'ALL').map((h) => (
                <option key={h} value={h}>{h}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Doctors Grid */}
      {filteredDoctors.length === 0 ? (
        <EmptyState
          icon={UserCheck}
          title="No medical practitioners match your search"
          description="Try broadening your search term or resetting the specialty filter."
          actionLabel="Clear Filters"
          onAction={() => {
            setSearch('');
            setSelectedSpecialty('ALL');
            setSelectedHospital('ALL');
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDoctors.map((doc) => (
            <Card key={doc.id} className="hover:shadow-md transition-all flex flex-col justify-between group">
              <CardContent className="p-5 space-y-4 flex-1 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center font-black text-sm border border-teal-200/60 dark:border-teal-800 shrink-0">
                        {doc.name.split(' ')[1] ? doc.name.split(' ')[1][0] : 'D'}
                      </div>
                      <div>
                        <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-slate-100 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                          {doc.name}
                        </h3>
                        <p className="text-xs text-teal-600 dark:text-teal-400 font-semibold">{doc.specialty}</p>
                        <span className="text-[10px] text-slate-400 font-mono">{doc.slmcNumber}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-500 dark:text-slate-400 pt-1">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{doc.hospitalName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{doc.availability.days.join(', ')} • {doc.availability.hours}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Award className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{doc.experienceYears} Years Clinical Experience</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 mt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <button
                    onClick={() => setActiveDoctor(doc)}
                    className="text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-teal-600 transition-colors cursor-pointer"
                  >
                    View Schedule
                  </button>
                  <Link href="/appointments">
                    <Button variant="primary" size="sm" className="gap-1 text-xs">
                      Book Appointment →
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Doctor Schedule Modal */}
      {activeDoctor && (
        <Modal
          isOpen={!!activeDoctor}
          onClose={() => setActiveDoctor(null)}
          title={activeDoctor.name}
          description={`${activeDoctor.specialty} • ${activeDoctor.hospitalName}`}
          size="md"
        >
          <div className="space-y-4 text-xs text-slate-700 dark:text-slate-300">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-400">SLMC Registration:</span>
                <span className="font-bold text-slate-900 dark:text-white font-mono">{activeDoctor.slmcNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Department:</span>
                <span className="font-semibold">{activeDoctor.department}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Academic Qualifications:</span>
                <span className="font-semibold">{activeDoctor.qualifications.join(', ')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Experience:</span>
                <span className="font-semibold">{activeDoctor.experienceYears} Years</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-teal-50/50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 space-y-2">
              <h4 className="font-bold text-teal-800 dark:text-teal-300 text-xs flex items-center gap-1.5">
                <Calendar className="w-4 h-4" /> Weekly Outpatient Clinic Hours
              </h4>
              <p className="text-xs">
                Clinic Days: <strong className="text-slate-900 dark:text-white">{activeDoctor.availability.days.join(', ')}</strong>
              </p>
              <p className="text-xs">
                Consultation Slot: <strong className="text-slate-900 dark:text-white">{activeDoctor.availability.hours}</strong>
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <Button variant="outline" size="sm" onClick={() => setActiveDoctor(null)}>
                Close
              </Button>
              <Link href="/appointments">
                <Button variant="primary" size="sm">
                  Proceed to Book Appointment
                </Button>
              </Link>
            </div>
          </div>
        </Modal>
      )}
      </>
      )}
    </div>
  );
}


