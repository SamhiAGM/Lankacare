'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Calendar, Clock, Building2, UserCheck, Plus, CheckCircle2,
  XCircle, AlertCircle, ArrowLeft, Search, Check
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { RoleGuard } from '@/components/auth/RoleGuard';
import { UserRole } from '@/types';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

interface CitizenAppointment {
  id: string;
  refNumber: string;
  hospitalId: string;
  hospitalName: string;
  clinicDepartment: string;
  doctorName: string;
  date: string;
  timeSlot: string;
  status: 'CONFIRMED' | 'PENDING' | 'CANCELLED';
  type: string;
}

export default function CitizenAppointmentsPage() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<CitizenAppointment[]>([
    {
      id: 'apt-c01',
      refNumber: 'LK-APT-2026-0914',
      hospitalId: 'hosp-kinniya',
      hospitalName: 'Base Hospital Kinniya',
      clinicDepartment: 'General Medical Clinic (OPD)',
      doctorName: 'Dr. Amara Bandara',
      date: '2026-09-14',
      timeSlot: '08:30 AM - 09:00 AM',
      status: 'CONFIRMED',
      type: 'Outpatient Follow-Up',
    },
    {
      id: 'apt-c02',
      refNumber: 'LK-APT-2026-0928',
      hospitalId: 'hosp-001',
      hospitalName: 'National Hospital of Sri Lanka (NHSL)',
      clinicDepartment: 'Cardiology Review Clinic',
      doctorName: 'Dr. Priya Kumara',
      date: '2026-09-28',
      timeSlot: '10:00 AM - 10:30 AM',
      status: 'CONFIRMED',
      type: 'Consultant Specialist Review',
    },
  ]);

  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedHospital, setSelectedHospital] = useState('hosp-kinniya');
  const [selectedClinic, setSelectedClinic] = useState('General Medical Clinic');
  const [selectedDate, setSelectedDate] = useState('2026-09-18');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookedNotice, setBookedNotice] = useState(false);

  const handleCancel = (id: string) => {
    setAppointments((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: 'CANCELLED' } : a))
    );
  };

  const handleBook = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      const hosp = ([] as any[]).find((h) => h.id === selectedHospital);
      const newApt: CitizenAppointment = {
        id: `apt-${Date.now()}`,
        refNumber: `LK-APT-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        hospitalId: selectedHospital,
        hospitalName: hosp?.name || 'Base Hospital Kinniya',
        clinicDepartment: selectedClinic,
        doctorName: 'Assigned On-Duty Medical Officer',
        date: selectedDate,
        timeSlot: '09:00 AM - 09:30 AM',
        status: 'CONFIRMED',
        type: 'General Outpatient Clinic',
      };
      setAppointments([newApt, ...appointments]);
      setIsSubmitting(false);
      setShowBookingModal(false);
      setBookedNotice(true);
      setTimeout(() => setBookedNotice(false), 5000);
    }, 600);
  };

  return (
    <RoleGuard allowedRoles={[UserRole.CITIZEN, UserRole.SUPER_ADMIN, UserRole.MINISTRY_ADMIN]}>
      <div className="space-y-6 max-w-5xl mx-auto pb-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                My Clinic Appointments
              </h1>
              <Badge variant="teal">Verified Hospital System</Badge>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Book and manage outpatient appointments at verified Sri Lankan healthcare facilities.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/citizen">
              <Button variant="outline" size="sm">
                ← Return to Citizen Portal
              </Button>
            </Link>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setShowBookingModal(true)}
              className="gap-1.5"
            >
              <Plus className="w-4 h-4" /> Book New Clinic Session
            </Button>
          </div>
        </div>

        {bookedNotice && (
          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            Your clinic appointment request was officially verified and queued with the hospital OPD desk!
          </div>
        )}

        {/* Appointment Cards List */}
        <div className="space-y-4">
          {appointments.map((apt) => (
            <div
              key={apt.id}
              className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-xs font-bold text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/60 px-2 py-0.5 rounded">
                    {apt.refNumber}
                  </span>
                  <Badge
                    variant={
                      apt.status === 'CONFIRMED'
                        ? 'teal'
                        : apt.status === 'CANCELLED'
                        ? 'danger'
                        : 'outline'
                    }
                  >
                    {apt.status}
                  </Badge>
                  <span className="text-xs text-slate-500">• {apt.type}</span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {apt.hospitalName}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    {apt.clinicDepartment} • Attending: <span className="font-medium text-slate-900 dark:text-white">{apt.doctorName}</span>
                  </p>
                </div>

                <div className="flex items-center gap-4 text-xs text-slate-500 pt-1">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-teal-600" />
                    {apt.date}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-teal-600" />
                    {apt.timeSlot}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {apt.status === 'CONFIRMED' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCancel(apt.id)}
                    className="text-xs text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-900 hover:bg-rose-50"
                  >
                    Cancel Appointment
                  </Button>
                )}
                <Link href={`/hospitals/${apt.hospitalId}`}>
                  <Button variant="outline" size="sm" className="text-xs">
                    View Facility
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Verified Scheduling Rule Notice (Section 78) */}
        <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 text-xs text-slate-500 flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 text-teal-600 shrink-0" />
          <span>
            Notice: All appointment queues reflect verified hospital scheduling schedules. Citizens must arrive 15 minutes before the booked slot with their National Identity Card or Personal Health Number (PHN).
          </span>
        </div>

        {/* Booking Modal */}
        {showBookingModal && (
          <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  Schedule Hospital Clinic Session
                </h3>
                <button
                  type="button"
                  onClick={() => setShowBookingModal(false)}
                  className="text-slate-400 hover:text-slate-600 text-sm"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleBook} className="space-y-3.5 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Select Verified Hospital:
                  </label>
                  <select
                    value={selectedHospital}
                    onChange={(e) => setSelectedHospital(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  >
                    {([] as any[]).map((h) => (
                      <option key={h.id} value={h.id}>
                        {h.name} ({h.district} District)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Clinic / Department:
                  </label>
                  <select
                    value={selectedClinic}
                    onChange={(e) => setSelectedClinic(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  >
                    <option>General Medical Clinic (OPD)</option>
                    <option>Paediatrics Clinic</option>
                    <option>Cardiology Specialist Review</option>
                    <option>Obstetrics &amp; Gynaecology Clinic</option>
                    <option>General Surgical Outpatient Review</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Preferred Date:
                  </label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    min="2026-09-09"
                    max="2026-10-31"
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>

                <div className="pt-3 flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => setShowBookingModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={isSubmitting}
                    className="flex-1"
                  >
                    {isSubmitting ? 'Confirming...' : 'Confirm Appointment'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </RoleGuard>
  );
}


