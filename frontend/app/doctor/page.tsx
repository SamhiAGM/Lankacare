'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Stethoscope, Users, Calendar, GitPullRequest, Activity,
  Clock, ShieldAlert, AlertTriangle, CheckCircle2, ChevronRight,
  FileText, Heart, Plus, Search, Lock, ShieldCheck
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { RoleGuard } from '@/components/auth/RoleGuard';
import { UserRole } from '@/types';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { initialPatients, initialAppointments, initialReferrals } from '@/services/mockData';
import { executeBreakGlassAccess, getActiveBreakGlassRecords } from '@/lib/rbac';
import { useToast } from '@/context/ToastContext';

export default function DoctorPortalPage() {
  const { user } = useAuth();
  const { toast } = useToast();

  const assignedHospitalId = user?.hospitalId || 'hosp-kinniya';
  const assignedHospitalName = user?.organization || 'Base Hospital Kinniya';
  const assignedDept = user?.department || 'General Medicine';

  // State for Break-Glass Drawer
  const [showBreakGlassModal, setShowBreakGlassModal] = useState(false);
  const [targetPatientId, setTargetPatientId] = useState('pat-005');
  const [emergencyReason, setEmergencyReason] = useState('Severe polytrauma resuscitation in ETU');
  const [emergencyJustification, setEmergencyJustification] = useState(
    'Patient unconscious, transferred without physical records; urgent cross-match and drug allergy verification required.'
  );
  const [activeBreakGlass, setActiveBreakGlass] = useState(getActiveBreakGlassRecords());

  // Filter scoped patients (patients in doctor's assigned hospital or with emergency break glass)
  const scopedPatients = initialPatients.slice(0, 4);

  // Today's appointments in doctor's clinic
  const doctorAppointments = initialAppointments.filter(
    (a) => a.doctorId === 'doc-001' || a.hospitalId === assignedHospitalId
  ).slice(0, 4);

  // Inbound & outbound referrals
  const doctorReferrals = initialReferrals.filter(
    (r) => r.referringHospitalId === assignedHospitalId || r.receivingHospitalId === assignedHospitalId
  ).slice(0, 3);

  const handleBreakGlassSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const patient = initialPatients.find((p) => p.id === targetPatientId) || {
      id: targetPatientId,
      name: 'Emergency Inpatient (NHSL)',
    };

    const record = executeBreakGlassAccess({
      user,
      patientId: targetPatientId,
      patientName: patient.name,
      patientHospitalId: 'hosp-001', // Out of scope NHSL
      reason: emergencyReason,
      emergencyJustification: emergencyJustification,
    });

    setActiveBreakGlass(getActiveBreakGlassRecords());
    setShowBreakGlassModal(false);
    toast.success(
      `Emergency Break-Glass Granted for ${patient.name}`,
      `Audited record created: ${record.id}`
    );
  };

  return (
    <RoleGuard allowedRoles={[UserRole.DOCTOR, UserRole.SUPER_ADMIN, UserRole.MINISTRY_ADMIN]}>
      <div className="space-y-6 pb-12">
        {/* Doctor Scope Header */}
        <div className="p-6 rounded-3xl bg-slate-900 text-white border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-teal-500/20 text-teal-400">
                <Stethoscope className="w-5 h-5" />
              </span>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
                Doctor Clinical Workspace
              </h1>
              <Badge variant="teal">SLMC Authorized</Badge>
            </div>
            <p className="text-xs text-slate-400">
              {user?.name || 'Dr. Amara Bandara'} • {assignedHospitalName} • Department of {assignedDept}
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant="danger"
              size="sm"
              onClick={() => setShowBreakGlassModal(true)}
              className="gap-2 shadow-md shadow-rose-950/40 font-semibold text-xs"
            >
              <AlertTriangle className="w-4 h-4" /> Break-Glass Emergency Access
            </Button>
            <Link href="/staff/schedule">
              <Button variant="outline" size="sm" className="text-xs gap-1.5 bg-slate-800 text-slate-200 border-slate-700">
                <Calendar className="w-4 h-4 text-teal-400" /> My Duty Roster
              </Button>
            </Link>
          </div>
        </div>

        {/* Active Break Glass Warning Banner if Active */}
        {activeBreakGlass.length > 0 && (
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0" />
              <div>
                <span className="font-bold">Active Break-Glass Authorization: </span>
                {activeBreakGlass.length} emergency override active (Expires in 4 hours). All chart reads and clinical edits are logged with Ministry audit trail.
              </div>
            </div>
            <span className="font-mono text-[10px] bg-amber-950 px-2 py-1 rounded text-amber-400 shrink-0">
              AUDIT_ACTIVE
            </span>
          </div>
        )}

        {/* Quick Operational Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <span className="text-xs text-slate-500">My Assigned Patients</span>
            <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">18</p>
            <span className="text-[11px] text-teal-600 font-medium">Inpatient Ward 3 &amp; ETU</span>
          </div>
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <span className="text-xs text-slate-500">Today&apos;s Clinic Queue</span>
            <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{doctorAppointments.length + 8}</p>
            <span className="text-[11px] text-blue-600 font-medium">OPD Session A (08:00 - 13:00)</span>
          </div>
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <span className="text-xs text-slate-500">Pending Referrals</span>
            <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{doctorReferrals.length}</p>
            <span className="text-[11px] text-purple-600 font-medium">1 Critical Transfer Required</span>
          </div>
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <span className="text-xs text-slate-500">Today&apos;s Shift</span>
            <p className="text-base font-bold text-emerald-600 dark:text-emerald-400 mt-1">On Duty (Morning)</p>
            <span className="text-[11px] text-slate-500">08:00 - 16:00 • No conflicts</span>
          </div>
        </div>

        {/* Scoped Patients List with Blood Group Badges */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-teal-600" />
                Assigned Inpatients &amp; Clinical Cases
              </h2>
              <p className="text-xs text-slate-500">
                Authorized patients in {assignedHospitalName} under Dr. Amara Bandara.
              </p>
            </div>
            <Link href="/patients">
              <Button variant="outline" size="sm" className="text-xs">
                View All Ward Patients →
              </Button>
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3">Patient ID</th>
                  <th className="px-4 py-3">Full Name</th>
                  <th className="px-4 py-3">Age / Gender</th>
                  <th className="px-4 py-3">Blood Group</th>
                  <th className="px-4 py-3">Assigned Ward</th>
                  <th className="px-4 py-3">Allergies</th>
                  <th className="px-4 py-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {scopedPatients.map((pat) => (
                  <tr key={pat.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <td className="px-4 py-3 font-mono font-medium text-teal-600 dark:text-teal-400">
                      {pat.phn}
                    </td>
                    <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">
                      {pat.name}
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                      39 / {pat.gender}
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 font-extrabold text-[11px]">
                        {pat.bloodGroup || 'O+'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                      Ward 3 • Bed 04
                    </td>
                    <td className="px-4 py-3">
                      {pat.allergies && pat.allergies.length > 0 ? (
                        <span className="text-amber-600 dark:text-amber-400 font-medium">
                          {pat.allergies[0]}
                        </span>
                      ) : (
                        <span className="text-slate-400">None Recorded</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <Link href={`/patients/${pat.id}/admissions`}>
                        <Button variant="outline" size="sm" className="text-xs">
                          Clinical Chart
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Referrals & Today's Appointments Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Section 1: Today's Clinic Appointments */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-600" /> Today&apos;s Clinic Appointments
              </h3>
              <Badge variant="outline">{doctorAppointments.length} In Queue</Badge>
            </div>

            <div className="space-y-2.5">
              {doctorAppointments.map((apt) => (
                <div
                  key={apt.id}
                  className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-0.5">
                    <p className="font-bold text-slate-900 dark:text-white">{apt.patientName}</p>
                    <p className="text-slate-500">{apt.department} • Time: 09:30 AM</p>
                  </div>
                  <Badge variant="teal">Verified Appointment</Badge>
                </div>
              ))}
            </div>
          </div>

          {/* Section 2: Active Inter-Hospital Referrals */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <GitPullRequest className="w-4 h-4 text-purple-600" /> Inter-Hospital Referrals
              </h3>
              <Link href="/referrals">
                <span className="text-xs text-teal-600 hover:underline">View All →</span>
              </Link>
            </div>

            <div className="space-y-2.5">
              {doctorReferrals.map((ref) => (
                <div
                  key={ref.id}
                  className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-0.5">
                    <p className="font-bold text-slate-900 dark:text-white">{ref.patientName}</p>
                    <p className="text-slate-500">
                      {ref.referringHospitalName} → {ref.receivingHospitalName}
                    </p>
                  </div>
                  <Badge variant={ref.priority === 'CRITICAL' ? 'danger' : 'teal'}>
                    {ref.priority}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Break-Glass Emergency Modal (Section 75) */}
        {showBreakGlassModal && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 border border-rose-300 dark:border-rose-900 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4">
              <div className="flex items-center gap-3 text-rose-600 dark:text-rose-400">
                <div className="w-10 h-10 rounded-2xl bg-rose-100 dark:bg-rose-950 flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Break-Glass Emergency Access Override
                  </h3>
                  <p className="text-xs text-slate-500">Section 75 Clinical Emergency Protocol</p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-xs text-rose-800 dark:text-rose-300 leading-relaxed">
                Emergency Break-Glass allows an authorized physician to urgently view patient charts outside their normal hospital scope. This triggers an immutable <span className="font-mono font-bold">BREAK_GLASS_ACCESS</span> event in the Ministry audit ledger.
              </div>

              <form onSubmit={handleBreakGlassSubmit} className="space-y-3.5 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Select Out-Of-Scope Patient:
                  </label>
                  <select
                    value={targetPatientId}
                    onChange={(e) => setTargetPatientId(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  >
                    <option value="pat-005">Kanthi Menike (NHSL - Cardiology Inpatient)</option>
                    <option value="pat-006">Mohamed Rizwan (Kandy DGH - ETU Inpatient)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Emergency Clinical Reason:
                  </label>
                  <input
                    type="text"
                    value={emergencyReason}
                    onChange={(e) => setEmergencyReason(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Clinical Justification (Mandatory for Audit):
                  </label>
                  <textarea
                    rows={3}
                    value={emergencyJustification}
                    onChange={(e) => setEmergencyJustification(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                    required
                  />
                </div>

                <div className="pt-3 flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => setShowBreakGlassModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="danger"
                    className="flex-1 font-bold shadow-md shadow-rose-950/40"
                  >
                    Confirm &amp; Log Emergency Access
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
