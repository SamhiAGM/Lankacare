'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  GitPullRequest, Plus, Search, Filter, CheckCircle2, XCircle,
  Clock, ArrowRight, Building2, UserCheck, AlertTriangle, Printer,
  FileText, ShieldAlert, ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Tabs } from '@/components/ui/Tabs';
import { Input, Textarea, Select } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { EmptyState } from '@/components/ui/EmptyState';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import {
  getReferrals, referralService, getHospitals, getDoctors, getPatients
} from '@/services/apiClient';
import { Referral, ReferralPriority, ReferralStatus, UserRole } from '@/types';
import { formatDate } from '@/lib/utils';

export default function ReferralsPage() {
  const { user } = useAuth();
  const { toast } = useToast();

  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [search, setSearch] = useState('');
  const [activePriority, setActivePriority] = useState('ALL');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Selected Referral Slip / Timeline Modal
  const [selectedReferral, setSelectedReferral] = useState<Referral | null>(null);

  const hospitals = useMemo(() => getHospitals(), []);
  const doctors = useMemo(() => getDoctors(), []);
  const patients = useMemo(() => getPatients(), []);

  const [refForm, setRefForm] = useState({
    patientId: patients[0]?.id || '',
    patientName: patients[0]?.name || '',
    patientAge: 42,
    patientGender: 'Male',
    referringDoctorId: doctors[0]?.id || '',
    referringDoctorName: doctors[0]?.name || '',
    referringHospitalId: hospitals[1]?.id || hospitals[0]?.id || '',
    referringHospitalName: hospitals[1]?.name || hospitals[0]?.name || '',
    receivingHospitalId: hospitals[0]?.id || '',
    receivingHospitalName: hospitals[0]?.name || '',
    department: 'Cardiology',
    requiredSpecialty: 'Interventional Cardiology',
    priority: ReferralPriority.URGENT,
    clinicalReason: '',
    clinicalSummary: '',
  });

  useEffect(() => {
    setReferrals(getReferrals());
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!refForm.clinicalReason || !refForm.clinicalSummary) {
      toast.error('Please enter the clinical reason and summary');
      return;
    }

    const refHosp = hospitals.find((h) => h.id === refForm.referringHospitalId) || hospitals[0];
    const recHosp = hospitals.find((h) => h.id === refForm.receivingHospitalId) || hospitals[1];
    const pat = patients.find((p) => p.id === refForm.patientId) || patients[0];

    setIsSubmitting(true);
    try {
      const created = await referralService.create({
        patientId: pat.id,
        patientName: pat.name,
        patientAge: 45,
        patientGender: pat.gender,
        referringDoctorId: user?.id || 'doc-001',
        referringDoctorName: user?.name || 'Dr. Amara Bandara',
        referringHospitalId: refHosp.id,
        referringHospitalName: refHosp.name,
        receivingHospitalId: recHosp.id,
        receivingHospitalName: recHosp.name,
        department: refForm.department,
        requiredSpecialty: refForm.requiredSpecialty,
        priority: refForm.priority,
        status: ReferralStatus.PENDING,
        clinicalReason: refForm.clinicalReason,
        clinicalSummary: refForm.clinicalSummary,
      });

      setReferrals(getReferrals());
      toast.success(
        `Referral ${created.referralNumber} submitted to ${recHosp.name}`,
        'Transfer Initiated'
      );
      setIsCreateOpen(false);
    } catch {
      toast.error('Failed to create referral');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusChange = async (id: string, newStatus: ReferralStatus) => {
    try {
      await referralService.updateStatus(id, newStatus);
      setReferrals(getReferrals());
      toast.success(`Referral updated to ${newStatus}`);
      if (selectedReferral && selectedReferral.id === id) {
        setSelectedReferral((prev) => (prev ? { ...prev, status: newStatus } : null));
      }
    } catch {
      toast.error('Failed to update referral');
    }
  };

  const filteredReferrals = useMemo(() => {
    return referrals.filter((r) => {
      const matchPriority = activePriority === 'ALL' || r.priority === activePriority;
      const matchSearch =
        r.patientName.toLowerCase().includes(search.toLowerCase()) ||
        r.referralNumber.toLowerCase().includes(search.toLowerCase()) ||
        r.receivingHospitalName.toLowerCase().includes(search.toLowerCase()) ||
        r.requiredSpecialty.toLowerCase().includes(search.toLowerCase());
      return matchPriority && matchSearch;
    });
  }, [referrals, activePriority, search]);

  const canCreateReferral =
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
              National Inter-Facility Referral Coordination
            </h1>
            <Badge variant="teal">{filteredReferrals.length} Active Referrals</Badge>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Real-time tertiary care referral routing, specialist transfer triage, and clinical handover management.
          </p>
        </div>

        {canCreateReferral && (
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsCreateOpen(true)}
            className="gap-1.5"
          >
            <Plus className="w-4 h-4" /> Initiate Patient Referral
          </Button>
        )}
      </div>

      {/* Priority Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="relative flex items-center w-full sm:max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by referral #, patient name, specialty, or hospital..."
            className="w-full h-9 pl-9 pr-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {['ALL', 'CRITICAL', 'URGENT', 'NORMAL'].map((pri) => (
            <button
              key={pri}
              onClick={() => setActivePriority(pri)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                activePriority === pri
                  ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              {pri}
            </button>
          ))}
        </div>
      </div>

      {/* Referrals Cards Grid */}
      {filteredReferrals.length === 0 ? (
        <EmptyState
          icon={GitPullRequest}
          title="No referrals found"
          description="There are currently no patient transfers matching your query."
          actionLabel="Create Referral"
          onAction={() => setIsCreateOpen(true)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredReferrals.map((ref) => {
            const isCritical = ref.priority === 'CRITICAL';
            const isUrgent = ref.priority === 'URGENT';

            return (
              <div
                key={ref.id}
                className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950 px-2 py-0.5 rounded">
                      {ref.referralNumber}
                    </span>
                    <Badge
                      variant={isCritical ? 'rose' : isUrgent ? 'amber' : 'teal'}
                      pulse={isCritical}
                    >
                      {ref.priority}
                    </Badge>
                  </div>

                  <div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                      {ref.patientName} ({ref.patientAge}y, {ref.patientGender})
                    </h3>
                    <p className="text-xs text-teal-600 dark:text-teal-400 font-semibold mt-0.5">
                      Required: {ref.requiredSpecialty}
                    </p>
                  </div>

                  {/* Transfer Route */}
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-2 text-xs">
                    <div className="flex items-center justify-between text-slate-700 dark:text-slate-200">
                      <span className="text-slate-400">From:</span>
                      <strong className="truncate max-w-[170px]">{ref.referringHospitalName}</strong>
                    </div>
                    <div className="flex items-center justify-between text-slate-700 dark:text-slate-200">
                      <span className="text-slate-400">To:</span>
                      <strong className="text-teal-600 truncate max-w-[170px]">{ref.receivingHospitalName}</strong>
                    </div>
                    <p className="text-[11px] text-slate-500 line-clamp-2 pt-1 border-t border-slate-200 dark:border-slate-700">
                      <strong>Reason: </strong>{ref.clinicalReason}
                    </p>
                  </div>

                  {/* Visual Status Progression Timeline */}
                  <div className="space-y-1 pt-1">
                    <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      <span>Status</span>
                      <span className="text-teal-600">{ref.status}</span>
                    </div>
                    <div className="grid grid-cols-4 gap-1">
                      {['PENDING', 'ACCEPTED', 'IN_PROGRESS', 'COMPLETED'].map((st, i) => {
                        const statusOrder = ['PENDING', 'ACCEPTED', 'IN_PROGRESS', 'COMPLETED'];
                        const currentIndex = statusOrder.indexOf(ref.status);
                        const isDone = currentIndex >= i;
                        return (
                          <div
                            key={st}
                            className={`h-1.5 rounded-full ${isDone ? 'bg-teal-600' : 'bg-slate-200 dark:bg-slate-700'}`}
                            title={st}
                          />
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                  <button
                    onClick={() => setSelectedReferral(ref)}
                    className="text-xs font-bold text-teal-600 dark:text-teal-400 hover:underline cursor-pointer"
                  >
                    View Official Slip →
                  </button>

                  {ref.status === 'PENDING' && (
                    <div className="flex items-center gap-1.5">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleStatusChange(ref.id, ReferralStatus.REJECTED)}
                        className="text-rose-600 text-xs px-2"
                      >
                        Reject
                      </Button>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleStatusChange(ref.id, ReferralStatus.ACCEPTED)}
                        className="text-xs px-2.5"
                      >
                        Accept
                      </Button>
                    </div>
                  )}

                  {ref.status === 'ACCEPTED' && (
                    <Button
                      variant="navy"
                      size="sm"
                      onClick={() => handleStatusChange(ref.id, ReferralStatus.IN_PROGRESS)}
                      className="text-xs"
                    >
                      Arrange Transfer
                    </Button>
                  )}

                  {ref.status === 'IN_PROGRESS' && (
                    <Button
                      variant="success"
                      size="sm"
                      onClick={() => handleStatusChange(ref.id, ReferralStatus.COMPLETED)}
                      className="text-xs"
                    >
                      Complete Transfer
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* New Referral Modal */}
      {isCreateOpen && (
        <Modal
          isOpen={isCreateOpen}
          onClose={() => setIsCreateOpen(false)}
          title="Initiate Inter-Hospital Patient Referral"
          description="Submit an official electronic transfer request to tertiary facilities under MoH clinical protocol."
          size="lg"
        >
          <form onSubmit={handleCreate} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                label="Select Patient"
                value={refForm.patientId}
                onChange={(e) => setRefForm({ ...refForm, patientId: e.target.value })}
                options={patients.map((p) => ({ value: p.id, label: `${p.name} (${p.phn})` }))}
                required
              />

              <Select
                label="Referral Priority Triage"
                value={refForm.priority}
                onChange={(e) => setRefForm({ ...refForm, priority: e.target.value as any })}
                options={[
                  { value: ReferralPriority.NORMAL, label: 'Normal (Elective Transfer)' },
                  { value: ReferralPriority.URGENT, label: 'Urgent (Within 24-48 Hours)' },
                  { value: ReferralPriority.CRITICAL, label: 'Critical (Immediate Emergency Transfer)' },
                ]}
                required
              />

              <Select
                label="Referring Hospital (Origin)"
                value={refForm.referringHospitalId}
                onChange={(e) => setRefForm({ ...refForm, referringHospitalId: e.target.value })}
                options={hospitals.map((h) => ({ value: h.id, label: h.name }))}
                required
              />

              <Select
                label="Receiving Hospital (Destination)"
                value={refForm.receivingHospitalId}
                onChange={(e) => setRefForm({ ...refForm, receivingHospitalId: e.target.value })}
                options={hospitals.map((h) => ({ value: h.id, label: `${h.name} (${h.region})` }))}
                required
              />

              <Input
                label="Clinical Department"
                placeholder="e.g. Cardiology, Neurology, Pediatric Surgery"
                value={refForm.department}
                onChange={(e) => setRefForm({ ...refForm, department: e.target.value })}
                required
              />

              <Input
                label="Required Sub-Specialty"
                placeholder="e.g. Interventional Cardiology, 3T MRI Neuro-imaging"
                value={refForm.requiredSpecialty}
                onChange={(e) => setRefForm({ ...refForm, requiredSpecialty: e.target.value })}
                required
              />
            </div>

            <Input
              label="Primary Clinical Indication / Reason for Referral"
              placeholder="e.g. Unstable angina refractory to therapy; coronary angiography urgently indicated"
              value={refForm.clinicalReason}
              onChange={(e) => setRefForm({ ...refForm, clinicalReason: e.target.value })}
              required
            />

            <Textarea
              label="Comprehensive Clinical Summary & Diagnostic History"
              placeholder="Include relevant vitals, lab findings (ECG, Troponin, FBC), active pharmacotherapy, and urgency justification..."
              value={refForm.clinicalSummary}
              onChange={(e) => setRefForm({ ...refForm, clinicalSummary: e.target.value })}
              rows={4}
              required
            />

            <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-100 dark:border-slate-800">
              <Button
                variant="outline"
                size="sm"
                type="button"
                onClick={() => setIsCreateOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                type="submit"
                isLoading={isSubmitting}
              >
                Submit Electronic Referral Slip
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Official Referral Slip / Timeline Details Modal */}
      {selectedReferral && (
        <Modal
          isOpen={!!selectedReferral}
          onClose={() => setSelectedReferral(null)}
          title={`Ministry of Health Referral Slip — ${selectedReferral.referralNumber}`}
          description={`Issued: ${formatDate(selectedReferral.createdAt)} • Priority: ${selectedReferral.priority}`}
          size="lg"
        >
          <div className="space-y-4 text-xs text-slate-700 dark:text-slate-300">
            {/* Visual Workflow Steps Banner */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-3">
                Referral Pipeline Status
              </p>
              <div className="flex items-center justify-between text-center relative">
                {[
                  { label: 'Referral Created', done: true },
                  { label: 'Hospital Review', done: selectedReferral.status !== 'PENDING' },
                  { label: 'Accepted / Triage', done: selectedReferral.status === 'ACCEPTED' || selectedReferral.status === 'IN_PROGRESS' || selectedReferral.status === 'COMPLETED' },
                  { label: 'Transfer Completed', done: selectedReferral.status === 'COMPLETED' },
                ].map((step, idx) => (
                  <div key={step.label} className="flex-1 flex flex-col items-center">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white mb-1 ${
                        step.done ? 'bg-teal-600' : 'bg-slate-300 dark:bg-slate-700 text-slate-500'
                      }`}
                    >
                      {step.done ? '✓' : idx + 1}
                    </div>
                    <span className="text-[10px] font-semibold text-slate-600 dark:text-slate-400">
                      {step.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Patient & Facility Information */}
            <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700">
              <div>
                <p className="text-[10px] text-slate-400">Patient Name</p>
                <p className="font-bold text-slate-900 dark:text-white">{selectedReferral.patientName}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400">Demographics</p>
                <p className="font-semibold">{selectedReferral.patientAge} Years • {selectedReferral.patientGender}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400">Referring Facility</p>
                <p className="font-semibold">{selectedReferral.referringHospitalName}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400">Receiving Facility</p>
                <p className="font-semibold text-teal-600">{selectedReferral.receivingHospitalName}</p>
              </div>
            </div>

            {/* Clinical Details */}
            <div className="space-y-2">
              <h4 className="font-bold text-slate-900 dark:text-slate-100">Clinical Reason:</h4>
              <p className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border">
                {selectedReferral.clinicalReason}
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="font-bold text-slate-900 dark:text-slate-100">Clinical Summary & Diagnostic Findings:</h4>
              <p className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border leading-relaxed">
                {selectedReferral.clinicalSummary}
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.print()}
                className="gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" /> Print Official Referral Slip
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setSelectedReferral(null)}
              >
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
