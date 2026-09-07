'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import {
  BedDouble, ArrowLeft, Plus, Clock, FileText, CheckCircle2,
  AlertTriangle, UserCheck, Stethoscope, ArrowRight, ShieldCheck
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { EmptyState } from '@/components/ui/EmptyState';
import { useToast } from '@/context/ToastContext';
import { admissionService, getPatients } from '@/services/apiClient';
import { PatientAdmission, Patient } from '@/types';

export default function PatientAdmissionsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const { id } = resolvedParams;
  const { toast } = useToast();

  const [patient, setPatient] = useState<Patient | null>(null);
  const [admissions, setAdmissions] = useState<PatientAdmission[]>([]);

  // Movement Modal
  const [isMoveOpen, setIsMoveOpen] = useState(false);
  const [selectedAdmissionId, setSelectedAdmissionId] = useState<string | null>(null);
  const [moveForm, setMoveForm] = useState({
    fromWard: '',
    toWard: '',
    toBedId: '',
    reason: '',
  });

  useEffect(() => {
    const pList = getPatients();
    const found = pList.find(p => p.id === id) || pList[0];
    if (found) {
      setPatient(found);
      const adms = admissionService.getByPatient(found.id);
      setAdmissions(adms);
    }
  }, [id]);

  const reload = () => {
    if (patient) {
      setAdmissions(admissionService.getByPatient(patient.id));
    }
  };

  const handleAddMovement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAdmissionId) return;

    try {
      admissionService.addMovement(selectedAdmissionId, {
        type: 'WARD_TRANSFER',
        fromWard: moveForm.fromWard,
        toWard: moveForm.toWard,
        toBedId: moveForm.toBedId,
        reason: moveForm.reason,
      });
      toast.success(`Patient movement to ${moveForm.toWard} recorded`, 'Ward Transfer Complete');
      setIsMoveOpen(false);
      setMoveForm({ fromWard: '', toWard: '', toBedId: '', reason: '' });
      reload();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to record movement');
    }
  };

  if (!patient) return null;

  return (
    <div className="space-y-6">
      {/* Back link */}
      <div className="flex items-center justify-between">
        <Link
          href={`/patients/${patient.id}`}
          className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 font-semibold"
        >
          <ArrowLeft className="w-4 h-4" /> Back to {patient.name}&apos;s Health Record
        </Link>
      </div>

      {/* Header Banner */}
      <Card className="p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge variant="teal">Electronic Inpatient Log</Badge>
              <span className="text-xs text-slate-400 font-mono font-bold">• NIC: {patient.nic}</span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-slate-50">
              {patient.name} — Hospital Admissions & Movement Timeline
            </h1>
            <p className="text-xs text-slate-500">
              Audited inpatient care episodes, ward transfers, locked bed telemetry, and clinical discharge summaries.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="emerald" size="sm" className="text-xs">
              Blood Group: {patient.bloodGroup || 'O+'} (Verified)
            </Badge>
          </div>
        </div>
      </Card>

      {/* Admissions List */}
      <div className="space-y-6">
        {admissions.length === 0 ? (
          <Card className="p-8">
            <EmptyState
              icon={BedDouble}
              title="No inpatient admissions recorded for this citizen"
              description="New admissions can be initiated from any hospital detail portal with automatic bed locking."
            />
          </Card>
        ) : (
          admissions.map((adm) => (
            <Card key={adm.id} className="p-6 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-black text-slate-900 dark:text-slate-100">
                      {adm.hospitalName}
                    </h3>
                    <Badge variant={adm.admissionType === 'EMERGENCY' ? 'rose' : 'teal'} size="sm">
                      {adm.admissionType}
                    </Badge>
                    <Badge variant={adm.status === 'ADMITTED' ? 'emerald' : 'gray'} size="sm">
                      {adm.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-500">
                    Admission ID: <span className="font-mono text-slate-700 dark:text-slate-300 font-semibold">{adm.id}</span> • Admitted: <span className="font-mono">{adm.admittedAt}</span>
                  </p>
                </div>

                {adm.status === 'ADMITTED' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedAdmissionId(adm.id);
                      setMoveForm({ fromWard: adm.wardName || adm.ward || 'General Ward', toWard: '', toBedId: '', reason: '' });
                      setIsMoveOpen(true);
                    }}
                    className="gap-1.5 text-xs"
                  >
                    <Plus className="w-3.5 h-3.5" /> Transfer Ward
                  </Button>
                )}
              </div>

              {/* Diagnosis & Attending Doctor */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60">
                  <p className="text-[10px] text-slate-400">Admitting Diagnosis</p>
                  <p className="font-bold text-slate-900 dark:text-slate-100 mt-0.5">{adm.admittingDiagnosis}</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60">
                  <p className="text-[10px] text-slate-400">Assigned Ward & Bed</p>
                  <p className="font-bold text-teal-600 dark:text-teal-400 mt-0.5">
                    {adm.wardName} • Bed #{adm.bedId}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60">
                  <p className="text-[10px] text-slate-400">Attending Consultant / MO</p>
                  <p className="font-bold text-slate-900 dark:text-slate-100 mt-0.5">{adm.attendingDoctorName}</p>
                </div>
              </div>

              {/* Internal Movement Timeline */}
              <div className="space-y-3 pt-2">
                <h4 className="font-bold text-xs text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-teal-600" /> Ward Movement & Clinical Timeline
                </h4>

                <div className="relative pl-6 space-y-4 before:content-[''] before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
                  {/* Intake Event */}
                  <div className="relative text-xs space-y-0.5">
                    <span className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-teal-500 border-2 border-white dark:border-slate-900" />
                    <p className="font-bold text-slate-900 dark:text-slate-100">
                      Admitted to {adm.wardName} (Bed {adm.bedId})
                    </p>
                    <p className="text-[11px] text-slate-400 font-mono">{adm.admittedAt}</p>
                  </div>

                  {/* Movements */}
                  {adm.movements?.map((m) => (
                    <div key={m.id} className="relative text-xs space-y-0.5">
                      <span className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-blue-500 border-2 border-white dark:border-slate-900" />
                      <p className="font-bold text-slate-900 dark:text-slate-100">
                        Transferred: {m.fromWard} → {m.toWard} (Bed {m.toBedId})
                      </p>
                      <p className="text-slate-500 text-[11px]">{m.reason}</p>
                      <p className="text-[10px] text-slate-400 font-mono">{m.timestamp}</p>
                    </div>
                  ))}

                  {/* Discharge Event */}
                  {adm.status === 'DISCHARGED' && adm.dischargeSummary && (
                    <div className="relative text-xs space-y-1">
                      <span className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900" />
                      <p className="font-bold text-emerald-600 dark:text-emerald-400">
                        Discharged from Inpatient Care • Bed {adm.bedId} Released
                      </p>
                      <p className="text-slate-600 dark:text-slate-300 text-[11px]">
                        {adm.dischargeSummary.summary}
                      </p>
                      <p className="text-[10px] text-slate-400 font-mono">{adm.dischargeSummary.dischargedAt}</p>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Ward Transfer Modal */}
      {isMoveOpen && (
        <Modal
          isOpen={isMoveOpen}
          onClose={() => setIsMoveOpen(false)}
          title="Record Inpatient Ward Transfer"
          description="Log internal ward transfer and update bed telemetry."
          size="sm"
        >
          <form onSubmit={handleAddMovement} className="space-y-4 text-xs">
            <Input
              label="From Ward"
              value={moveForm.fromWard}
              disabled
            />
            <Input
              label="Destination Ward"
              value={moveForm.toWard}
              onChange={(e) => setMoveForm({ ...moveForm, toWard: e.target.value })}
              placeholder="e.g. Surgical High Dependency Unit (HDU)"
              required
            />
            <Input
              label="New Bed ID"
              value={moveForm.toBedId}
              onChange={(e) => setMoveForm({ ...moveForm, toBedId: e.target.value })}
              placeholder="e.g. HDU-03"
              required
            />
            <Input
              label="Clinical Transfer Reason"
              value={moveForm.reason}
              onChange={(e) => setMoveForm({ ...moveForm, reason: e.target.value })}
              placeholder="e.g. Post-operative intensive monitoring"
              required
            />

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <Button variant="outline" size="sm" type="button" onClick={() => setIsMoveOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" type="submit">
                Confirm Transfer
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
