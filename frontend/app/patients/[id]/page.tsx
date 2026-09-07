'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import {
  Users, ArrowLeft, Heart, ShieldAlert, Calendar, GitPullRequest,
  Syringe, FileText, Phone, MapPin, CreditCard, Activity,
  AlertCircle, CheckCircle2, Clock, Printer, Plus
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Tabs } from '@/components/ui/Tabs';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { getPatients, getAppointments, getReferrals } from '@/services/apiClient';
import { Patient, Appointment, Referral } from '@/types';
import { formatDate } from '@/lib/utils';

export default function PatientProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const { id } = resolvedParams;

  const [patient, setPatient] = useState<Patient | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [activeTab, setActiveTab] = useState('clinical');

  useEffect(() => {
    const pList = getPatients();
    const found = pList.find((p) => p.id === id) || pList[0];
    if (found) {
      setPatient(found);
      const apts = getAppointments().filter((a) => a.patientId === found.id);
      setAppointments(apts);
      const refs = getReferrals().filter((r) => r.patientId === found.id);
      setReferrals(refs);
    }
  }, [id]);

  if (!patient) {
    return (
      <div className="py-20 text-center">
        <Users className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
        <h2 className="text-base font-bold text-slate-700 dark:text-slate-300">Patient Record Not Found</h2>
        <Link href="/patients" className="mt-4 inline-block">
          <Button variant="outline" size="sm">Return to Patient Registry</Button>
        </Link>
      </div>
    );
  }

  const tabs = [
    { id: 'clinical', label: 'Clinical Summary & Vitals' },
    { id: 'appointments', label: `Appointments (${appointments.length})` },
    { id: 'referrals', label: `Hospital Referrals (${referrals.length})` },
    { id: 'vaccines', label: 'Immunization Record' },
  ];

  return (
    <div className="space-y-6">
      {/* Back Navigation Bar */}
      <div className="flex items-center justify-between">
        <Link
          href="/patients"
          className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 font-semibold"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Patient Directory
        </Link>
        <Button variant="outline" size="sm" onClick={() => window.print()} className="gap-1.5">
          <Printer className="w-3.5 h-3.5" /> Print Medical Summary
        </Button>
      </div>

      {/* Patient Header Card */}
      <Card className="p-6">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 text-teal-600 dark:text-teal-400 flex items-center justify-center font-black text-xl shrink-0 shadow-sm">
              {patient.name.split(' ')[0][0]}
              {patient.name.split(' ')[1] ? patient.name.split(' ')[1][0] : ''}
            </div>
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-xs font-bold text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950 px-2 py-0.5 rounded">
                  {patient.phn}
                </span>
                <Badge variant="rose">Blood Group: {patient.bloodGroup}</Badge>
                <span className="text-xs text-slate-400">• NIC: {patient.nic}</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-50 tracking-tight">
                {patient.name}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400 pt-1">
                <span>DOB: {formatDate(patient.dateOfBirth)} ({patient.gender})</span>
                <span>• Phone: {patient.phone}</span>
                <span>• Region: {patient.region}</span>
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs space-y-1">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Emergency Contact</p>
            <p className="font-bold text-slate-800 dark:text-slate-200">{patient.emergencyContact.name}</p>
            <p className="text-slate-500">{patient.emergencyContact.relationship} • {patient.emergencyContact.phone}</p>
          </div>
        </div>
      </Card>

      {/* Critical Allergy & Conditions Alert Banner */}
      {patient.allergies && patient.allergies.length > 0 && patient.allergies[0] !== 'None known' && (
        <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 flex items-center gap-3 text-xs text-rose-800 dark:text-rose-200">
          <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0" />
          <div>
            <span className="font-bold">CRITICAL ALLERGY ALERT: </span>
            <span>Patient exhibits documented hypersensitivity to: <strong>{patient.allergies.join(', ')}</strong>. Exercise caution during prescription.</span>
          </div>
        </div>
      )}

      {/* Tabs */}
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {/* Tab 1: Clinical Summary & Vitals */}
      {activeTab === 'clinical' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Chronic Health Profile & Diagnosis</CardTitle>
              <CardDescription>Managed conditions and clinical risk factors</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              <div>
                <p className="font-bold text-slate-700 dark:text-slate-300 mb-1.5">Documented Chronic Illnesses:</p>
                {patient.chronicConditions && patient.chronicConditions.length > 0 && patient.chronicConditions[0] !== 'None' ? (
                  <div className="flex flex-wrap gap-2">
                    {patient.chronicConditions.map((c) => (
                      <span key={c} className="px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 font-semibold">
                        {c}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-400">No chronic comorbidities registered.</p>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
                <p className="font-bold text-slate-700 dark:text-slate-300">Baseline Clinical Vitals (Latest Encounter):</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-center">
                  <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 border">
                    <p className="text-[10px] text-slate-400">Blood Pressure</p>
                    <p className="font-bold text-sm text-slate-800 dark:text-slate-200">128/82 mmHg</p>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 border">
                    <p className="text-[10px] text-slate-400">Resting Pulse</p>
                    <p className="font-bold text-sm text-emerald-600">74 bpm</p>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 border">
                    <p className="text-[10px] text-slate-400">Body Mass Index</p>
                    <p className="font-bold text-sm text-slate-800 dark:text-slate-200">23.8 (Normal)</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Permanent Residential & Facility Registration</CardTitle>
              <CardDescription>Jurisdictional Medical Officer of Health (MOH) area</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              <div className="flex justify-between p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                <span className="text-slate-500">Residential Address:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200 text-right">{patient.address}</span>
              </div>
              <div className="flex justify-between p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                <span className="text-slate-500">MOH Health Division:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{patient.region} Province Division</span>
              </div>
              <div className="flex justify-between p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                <span className="text-slate-500">Total Encounters Logged:</span>
                <span className="font-bold text-teal-600">{patient.recentVisitsCount || 4} Hospital Visits</span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tab 2: Appointment Records */}
      {activeTab === 'appointments' && (
        <Card>
          <CardHeader>
            <CardTitle>Outpatient & Consultation History</CardTitle>
            <CardDescription>Scheduled and completed clinical appointments</CardDescription>
          </CardHeader>
          <CardContent>
            {appointments.length === 0 ? (
              <EmptyState
                icon={Calendar}
                title="No appointments logged for this patient"
                description="Book an appointment through the National Appointment Scheduling workflow."
                actionLabel="Book Appointment"
                onAction={() => window.location.href = '/appointments'}
              />
            ) : (
              <div className="space-y-3">
                {appointments.map((apt) => (
                  <div
                    key={apt.id}
                    className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-teal-600">{apt.appointmentNumber}</span>
                      <Badge variant={apt.status === 'CONFIRMED' ? 'emerald' : apt.status === 'COMPLETED' ? 'teal' : 'amber'}>
                        {apt.status}
                      </Badge>
                    </div>
                    <p className="font-bold text-sm text-slate-900 dark:text-slate-100">
                      Consultant: {apt.doctorName} ({apt.specialty})
                    </p>
                    <p className="text-slate-500">{apt.hospitalName} • {apt.department}</p>
                    <div className="flex items-center gap-4 text-[11px] text-slate-400 pt-1">
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> Date: {apt.date} at {apt.timeSlot}</span>
                    </div>
                    {apt.clinicalNotes && (
                      <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border text-xs text-slate-600 dark:text-slate-300">
                        <strong>Doctor Clinical Notes:</strong> {apt.clinicalNotes}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Tab 3: Referrals */}
      {activeTab === 'referrals' && (
        <Card>
          <CardHeader>
            <CardTitle>Inter-Facility Transfer & Referral Records</CardTitle>
            <CardDescription>Hospital-to-hospital specialized transfers and consultations</CardDescription>
          </CardHeader>
          <CardContent>
            {referrals.length === 0 ? (
              <EmptyState
                icon={GitPullRequest}
                title="No inter-hospital referrals active"
                description="Specialist referrals are initiated by medical practitioners through the Referral portal."
              />
            ) : (
              <div className="space-y-3">
                {referrals.map((ref) => (
                  <div
                    key={ref.id}
                    className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-teal-600">{ref.referralNumber}</span>
                      <Badge variant={ref.priority === 'CRITICAL' ? 'rose' : 'amber'}>
                        {ref.priority} Priority
                      </Badge>
                    </div>
                    <p className="font-bold text-sm text-slate-900 dark:text-slate-100">
                      {ref.referringHospitalName} → {ref.receivingHospitalName}
                    </p>
                    <p className="text-teal-600 dark:text-teal-400 font-semibold">{ref.requiredSpecialty}</p>
                    <p className="text-slate-600 dark:text-slate-300">{ref.clinicalReason}</p>
                    <div className="flex items-center justify-between pt-1 text-[11px] text-slate-400">
                      <span>Status: <strong className="text-emerald-600">{ref.status}</strong></span>
                      <span>Referred on: {formatDate(ref.createdAt)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Tab 4: Immunization Record */}
      {activeTab === 'vaccines' && (
        <Card>
          <CardHeader>
            <CardTitle>National Immunization & Vaccination History</CardTitle>
            <CardDescription>Childhood EPI and adult booster records verified by MOH</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700 text-slate-400">
                    <th className="py-2.5">Vaccine Formulation</th>
                    <th className="py-2.5">Dose / Schedule</th>
                    <th className="py-2.5">Administered Date</th>
                    <th className="py-2.5">Administering Center</th>
                    <th className="py-2.5 text-right">Verification</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {[
                    { name: 'BCG (Tuberculosis)', dose: 'Single Dose', date: 'At Birth', facility: 'De Soysa Hospital for Women' },
                    { name: 'Pentavalent (DTP-HepB-Hib)', dose: 'Dose 1, 2, 3', date: 'Infancy Routine', facility: 'MOH Office Maharagama' },
                    { name: 'Measles-Rubella (MR)', dose: 'Dose 1 & 2', date: 'Childhood Schedule', facility: 'MOH Office Maharagama' },
                    { name: 'COVID-19 Bivalent Booster', dose: 'Booster 2', date: '2024-03-12', facility: 'NHSL OPD Clinic' },
                    { name: 'Tetanus Toxoid (TT)', dose: 'Adult Booster', date: '2025-08-10', facility: 'Kalubowila Teaching Hospital' },
                  ].map((v, idx) => (
                    <tr key={idx}>
                      <td className="py-2.5 font-bold text-slate-900 dark:text-slate-100">{v.name}</td>
                      <td className="py-2.5 text-slate-500">{v.dose}</td>
                      <td className="py-2.5 text-slate-600 dark:text-slate-300">{v.date}</td>
                      <td className="py-2.5 text-slate-500">{v.facility}</td>
                      <td className="py-2.5 text-right">
                        <Badge variant="emerald" size="sm">MOH Verified</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
