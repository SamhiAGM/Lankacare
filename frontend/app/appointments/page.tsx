'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  Calendar, Clock, UserCheck, Building2, Plus, Search, Filter,
  CheckCircle2, XCircle, FileText, Check, ArrowRight, User
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Tabs } from '@/components/ui/Tabs';
import { Modal } from '@/components/ui/Modal';
import { EmptyState } from '@/components/ui/EmptyState';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import {
  getAppointments, appointmentService, getHospitals, getDoctors, getPatients
} from '@/services/apiClient';
import { Appointment, AppointmentStatus, AppointmentType, UserRole } from '@/types';
import { formatDate } from '@/lib/utils';

export default function AppointmentsPage() {
  const { user } = useAuth();
  const { toast } = useToast();

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [activeTab, setActiveTab] = useState('ALL');
  const [search, setSearch] = useState('');

  // Booking Wizard Modal State
  const [isBookOpen, setIsBookOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingStep, setBookingStep] = useState(1);

  const hospitals = useMemo(() => getHospitals(), []);
  const doctors = useMemo(() => getDoctors(), []);
  const patients = useMemo(() => getPatients(), []);

  const [bookForm, setBookForm] = useState({
    hospitalId: hospitals[0]?.id || '',
    department: 'Cardiology',
    doctorId: doctors[0]?.id || '',
    patientId: patients[0]?.id || '',
    patientName: patients[0]?.name || '',
    patientPhone: patients[0]?.phone || '',
    date: '2026-09-20',
    timeSlot: '09:30 AM',
    type: AppointmentType.CONSULTATION,
    symptoms: '',
  });

  // Doctor Complete/Action Modal State
  const [selectedApt, setSelectedApt] = useState<Appointment | null>(null);
  const [doctorNotes, setDoctorNotes] = useState('');
  const [isCompleting, setIsCompleting] = useState(false);

  useEffect(() => {
    setAppointments(getAppointments());
  }, []);

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const selectedHosp = hospitals.find((h) => h.id === bookForm.hospitalId) || hospitals[0];
    const selectedDoc = doctors.find((d) => d.id === bookForm.doctorId) || doctors[0];

    setIsSubmitting(true);
    try {
      const created = await appointmentService.create({
        patientId: bookForm.patientId,
        patientName: bookForm.patientName || user?.name || 'Citizen Patient',
        patientPhone: bookForm.patientPhone || user?.phone || '+94 77 123 4567',
        doctorId: selectedDoc.id,
        doctorName: selectedDoc.name,
        specialty: selectedDoc.specialty,
        hospitalId: selectedHosp.id,
        hospitalName: selectedHosp.name,
        department: selectedDoc.department || bookForm.department,
        date: bookForm.date,
        timeSlot: bookForm.timeSlot,
        type: bookForm.type,
        status: AppointmentStatus.CONFIRMED,
        symptoms: bookForm.symptoms,
      });

      setAppointments(getAppointments());
      toast.success(
        `Consultation booked with ${created.doctorName} for ${created.date}`,
        'Appointment Confirmed'
      );
      setIsBookOpen(false);
      setBookingStep(1);
    } catch {
      toast.error('Failed to book appointment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusUpdate = async (id: string, newStatus: AppointmentStatus, notes?: string) => {
    try {
      await appointmentService.updateStatus(id, newStatus, notes);
      setAppointments(getAppointments());
      toast.success(`Appointment marked as ${newStatus}`);
      setSelectedApt(null);
    } catch {
      toast.error('Failed to update status');
    }
  };

  const tabs = [
    { id: 'ALL', label: 'All Appointments', count: appointments.length },
    { id: 'CONFIRMED', label: 'Confirmed', count: appointments.filter((a) => a.status === 'CONFIRMED').length },
    { id: 'PENDING', label: 'Pending Review', count: appointments.filter((a) => a.status === 'PENDING').length },
    { id: 'COMPLETED', label: 'Completed', count: appointments.filter((a) => a.status === 'COMPLETED').length },
    { id: 'CANCELLED', label: 'Cancelled', count: appointments.filter((a) => a.status === 'CANCELLED').length },
  ];

  const filteredAppointments = useMemo(() => {
    return appointments.filter((apt) => {
      const matchTab = activeTab === 'ALL' || apt.status === activeTab;
      const matchSearch =
        apt.patientName.toLowerCase().includes(search.toLowerCase()) ||
        apt.doctorName.toLowerCase().includes(search.toLowerCase()) ||
        apt.hospitalName.toLowerCase().includes(search.toLowerCase()) ||
        apt.appointmentNumber.toLowerCase().includes(search.toLowerCase());
      return matchTab && matchSearch;
    });
  }, [appointments, activeTab, search]);

  const canManageAppointments =
    user?.role === UserRole.DOCTOR ||
    user?.role === UserRole.HOSPITAL_ADMIN ||
    user?.role === UserRole.MINISTRY_ADMIN ||
    user?.role === UserRole.SUPER_ADMIN;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-50 tracking-tight">
              Clinical Appointments & Outpatient Schedule
            </h1>
            <Badge variant="teal">{filteredAppointments.length} Appointments</Badge>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Centralized outpatient booking, doctor clinic queues, and consultation completion workflows.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => {
            setBookingStep(1);
            setIsBookOpen(true);
          }}
          className="gap-1.5"
        >
          <Plus className="w-4 h-4" /> Book New Appointment
        </Button>
      </div>

      {/* Status Tabs */}
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {/* Search */}
      <div className="flex items-center gap-3 bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="relative flex items-center w-full max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by appointment #, patient name, doctor, or hospital..."
            className="w-full h-9 pl-9 pr-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>
      </div>

      {/* Appointments List */}
      {filteredAppointments.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title="No appointments found"
          description="There are currently no clinical appointments matching your selected status filter."
          actionLabel="Book New Appointment"
          onAction={() => setIsBookOpen(true)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredAppointments.map((apt) => (
            <div
              key={apt.id}
              className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950 px-2 py-0.5 rounded">
                    {apt.appointmentNumber}
                  </span>
                  <Badge
                    variant={
                      apt.status === 'CONFIRMED'
                        ? 'emerald'
                        : apt.status === 'PENDING'
                        ? 'amber'
                        : apt.status === 'COMPLETED'
                        ? 'teal'
                        : 'rose'
                    }
                    size="sm"
                  >
                    {apt.status}
                  </Badge>
                </div>

                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                    {apt.doctorName}
                  </h3>
                  <p className="text-xs text-teal-600 dark:text-teal-400 font-semibold">{apt.specialty}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">{apt.hospitalName} • {apt.department}</p>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-1 text-xs">
                  <div className="flex items-center justify-between text-slate-700 dark:text-slate-200">
                    <span className="text-slate-500">Patient:</span>
                    <strong className="font-bold">{apt.patientName}</strong>
                  </div>
                  <div className="flex items-center justify-between text-slate-700 dark:text-slate-200">
                    <span className="text-slate-500">Date & Slot:</span>
                    <span className="font-medium">{formatDate(apt.date)} at {apt.timeSlot}</span>
                  </div>
                  {apt.symptoms && (
                    <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-200 dark:border-slate-700">
                      <strong>Reason:</strong> {apt.symptoms}
                    </div>
                  )}
                </div>

                {apt.clinicalNotes && (
                  <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-[11px] text-emerald-900 dark:text-emerald-200 space-y-0.5">
                    <span className="font-bold">Doctor Notes: </span>
                    <span>{apt.clinicalNotes}</span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                {apt.status !== 'COMPLETED' && apt.status !== 'CANCELLED' && canManageAppointments ? (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleStatusUpdate(apt.id, AppointmentStatus.CANCELLED)}
                      className="text-rose-600 hover:bg-rose-50 border-rose-200 text-xs"
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="success"
                      size="sm"
                      onClick={() => {
                        setSelectedApt(apt);
                        setDoctorNotes(apt.clinicalNotes || '');
                      }}
                      className="text-xs gap-1"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" /> Mark Completed
                    </Button>
                  </>
                ) : (
                  <span className="text-[11px] text-slate-400 italic">
                    {apt.status === 'COMPLETED' ? 'Consultation completed' : 'Booking closed'}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Booking Wizard Modal */}
      {isBookOpen && (
        <Modal
          isOpen={isBookOpen}
          onClose={() => setIsBookOpen(false)}
          title="Book Outpatient Consultation"
          description="Schedule a specialist consultation with automated national health slot allocation."
          size="lg"
        >
          <form onSubmit={handleBookingSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                label="Healthcare Facility / Hospital"
                value={bookForm.hospitalId}
                onChange={(e) => setBookForm({ ...bookForm, hospitalId: e.target.value })}
                options={hospitals.map((h) => ({ value: h.id, label: `${h.name} (${h.region})` }))}
                required
              />

              <Select
                label="Specialist Doctor"
                value={bookForm.doctorId}
                onChange={(e) => setBookForm({ ...bookForm, doctorId: e.target.value })}
                options={doctors.map((d) => ({ value: d.id, label: `${d.name} — ${d.specialty}` }))}
                required
              />

              <Input
                label="Preferred Consultation Date"
                type="date"
                value={bookForm.date}
                onChange={(e) => setBookForm({ ...bookForm, date: e.target.value })}
                required
              />

              <Select
                label="Clinic Time Slot"
                value={bookForm.timeSlot}
                onChange={(e) => setBookForm({ ...bookForm, timeSlot: e.target.value })}
                options={[
                  { value: '08:30 AM', label: '08:30 AM - Morning Slot 1' },
                  { value: '09:30 AM', label: '09:30 AM - Morning Slot 2' },
                  { value: '11:00 AM', label: '11:00 AM - Morning Slot 3' },
                  { value: '01:30 PM', label: '01:30 PM - Afternoon Slot 1' },
                  { value: '03:00 PM', label: '03:00 PM - Afternoon Slot 2' },
                ]}
                required
              />

              <Input
                label="Patient Full Name"
                placeholder="e.g. Sunil Wickramasinghe"
                value={bookForm.patientName}
                onChange={(e) => setBookForm({ ...bookForm, patientName: e.target.value })}
                required
              />

              <Input
                label="Contact Mobile (SMS Confirmation)"
                placeholder="+94 77 234 5678"
                value={bookForm.patientPhone}
                onChange={(e) => setBookForm({ ...bookForm, patientPhone: e.target.value })}
                required
              />
            </div>

            <Textarea
              label="Reason for Visit / Primary Symptoms"
              placeholder="Briefly describe symptoms (e.g., chest tightness on exertion for 2 weeks, post-surgery review)..."
              value={bookForm.symptoms}
              onChange={(e) => setBookForm({ ...bookForm, symptoms: e.target.value })}
              rows={3}
            />

            <div className="p-3 rounded-xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 text-[11px] text-teal-800 dark:text-teal-200">
              <span className="font-bold">Notice: </span>
              Government outpatient consultations are provided under the universal healthcare system. Please arrive 15 minutes prior to your allocated slot with your NIC and previous clinical records.
            </div>

            <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-100 dark:border-slate-800">
              <Button
                variant="outline"
                size="sm"
                type="button"
                onClick={() => setIsBookOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                type="submit"
                isLoading={isSubmitting}
              >
                Confirm Appointment Booking
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Doctor Encounter Completion Modal */}
      {selectedApt && (
        <Modal
          isOpen={!!selectedApt}
          onClose={() => setSelectedApt(null)}
          title={`Complete Clinical Encounter — ${selectedApt.appointmentNumber}`}
          description={`Patient: ${selectedApt.patientName} • Consultant: ${selectedApt.doctorName}`}
          size="md"
        >
          <div className="space-y-4 text-xs">
            <Textarea
              label="Doctor Clinical Findings & Prescribed Management"
              placeholder="Record clinical impressions, examination findings, and follow-up directives..."
              value={doctorNotes}
              onChange={(e) => setDoctorNotes(e.target.value)}
              rows={4}
              required
            />

            <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
              <Button variant="outline" size="sm" onClick={() => setSelectedApt(null)}>
                Cancel
              </Button>
              <Button
                variant="success"
                size="sm"
                onClick={() =>
                  handleStatusUpdate(selectedApt.id, AppointmentStatus.COMPLETED, doctorNotes)
                }
              >
                Save Clinical Notes & Mark Completed
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
