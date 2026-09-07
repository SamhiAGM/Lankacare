'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import {
  BedDouble, ArrowLeft, Filter, Plus, HeartPulse, User,
  CheckCircle2, AlertTriangle, RefreshCw, ShieldCheck
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { EmptyState } from '@/components/ui/EmptyState';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import {
  getHospitals, bedService, admissionService
} from '@/services/apiClient';
import { Hospital, HospitalBed, BedStatus, BedType } from '@/types';

export default function HospitalBedsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const { id } = resolvedParams;
  const { toast } = useToast();

  const [hospital, setHospital] = useState<Hospital | null>(null);
  const [beds, setBeds] = useState<HospitalBed[]>([]);
  const [selectedWard, setSelectedWard] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');

  // Allocate / Release Modal
  const [selectedBed, setSelectedBed] = useState<HospitalBed | null>(null);
  const [isAllocateOpen, setIsAllocateOpen] = useState(false);
  const [patientName, setPatientName] = useState('');
  const [patientNic, setPatientNic] = useState('');

  useEffect(() => {
    const list = getHospitals();
    const found = list.find((h) => h.id === id) || list[0];
    if (found) {
      setHospital(found);
      setBeds(bedService.getByHospital(found.id));
    }
  }, [id]);

  const reloadBeds = () => {
    if (hospital) {
      setBeds(bedService.getByHospital(hospital.id));
    }
  };

  const handleAllocate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBed) return;

    try {
      bedService.allocateBed(selectedBed.id, `pat-${Date.now()}`, patientName);
      toast.success(`Bed ${selectedBed.bedNumber} allocated to ${patientName}`, 'Bed Reserved');
      setIsAllocateOpen(false);
      setPatientName('');
      setPatientNic('');
      setSelectedBed(null);
      reloadBeds();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to allocate bed');
    }
  };

  const handleRelease = (bed: HospitalBed) => {
    try {
      bedService.releaseBed(bed.id);
      toast.success(`Bed ${bed.bedNumber} marked AVAILABLE`, 'Bed Released');
      reloadBeds();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to release bed');
    }
  };

  const handleSetStatus = (bedId: string, status: BedStatus) => {
    try {
      bedService.updateBedStatus(bedId, status);
      toast.success(`Bed status updated to ${status}`, 'Status Updated');
      reloadBeds();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to update bed status');
    }
  };

  if (!hospital) return null;

  const wards = Array.from(new Set(beds.map(b => b.wardName)));

  const filteredBeds = beds.filter(b => {
    if (selectedWard !== 'ALL' && b.wardName !== selectedWard) return false;
    if (selectedStatus !== 'ALL' && b.status !== selectedStatus) return false;
    return true;
  });

  const availableCount = beds.filter(b => b.status === BedStatus.AVAILABLE).length;
  const occupiedCount = beds.filter(b => b.status === BedStatus.OCCUPIED).length;
  const maintenanceCount = beds.filter(b => b.status === BedStatus.MAINTENANCE || b.status === BedStatus.CLEANING).length;

  return (
    <div className="space-y-6">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <Link
          href={hospital.id === 'hosp-kinniya' ? '/hospitals/kinniya' : `/hospitals/${hospital.id}`}
          className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 font-semibold"
        >
          <ArrowLeft className="w-4 h-4" /> Back to {hospital.name}
        </Link>
      </div>

      {/* Header Banner */}
      <Card className="p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge variant="teal">{hospital.type}</Badge>
              <Badge variant="emerald">Live Inpatient Census</Badge>
              <span className="text-xs text-slate-400 font-mono">• {hospital.code}</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-50">
              {hospital.name} — Ward Bed Registry
            </h1>
            <p className="text-xs text-slate-500">
              Real-time inpatient bed allocation with automated double-booking prevention.
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
            <div>
              <p className="text-[10px] text-slate-400">Available</p>
              <p className="font-bold text-base text-emerald-600 dark:text-emerald-400">{availableCount}</p>
            </div>
            <div className="h-8 w-px bg-slate-200 dark:bg-slate-700" />
            <div>
              <p className="text-[10px] text-slate-400">Occupied</p>
              <p className="font-bold text-base text-rose-600 dark:text-rose-400">{occupiedCount}</p>
            </div>
            <div className="h-8 w-px bg-slate-200 dark:bg-slate-700" />
            <div>
              <p className="text-[10px] text-slate-400">Sanitizing / Maint</p>
              <p className="font-bold text-base text-amber-600 dark:text-amber-400">{maintenanceCount}</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Filters */}
      <Card className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Select
            label="Filter by Ward"
            value={selectedWard}
            onChange={(e) => setSelectedWard(e.target.value)}
            options={[
              { value: 'ALL', label: 'All Registered Wards' },
              ...wards.filter((w): w is string => Boolean(w)).map(w => ({ value: w, label: w }))
            ]}
          />

          <Select
            label="Filter by Bed Status"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            options={[
              { value: 'ALL', label: 'All Bed Statuses' },
              { value: BedStatus.AVAILABLE, label: 'Available (Free)' },
              { value: BedStatus.OCCUPIED, label: 'Occupied' },
              { value: BedStatus.RESERVED, label: 'Reserved' },
              { value: BedStatus.CLEANING, label: 'Cleaning / Disinfection' },
              { value: BedStatus.MAINTENANCE, label: 'Maintenance' },
            ]}
          />

          <div className="flex items-end">
            <Button
              variant="outline"
              size="sm"
              onClick={() => { setSelectedWard('ALL'); setSelectedStatus('ALL'); }}
              className="w-full text-xs h-10"
            >
              Reset Filters
            </Button>
          </div>
        </div>
      </Card>

      {/* Visual Bed Grid */}
      <div className="space-y-6">
        {filteredBeds.length === 0 ? (
          <Card className="p-8">
            <EmptyState
              icon={BedDouble}
              title="No beds registered under this ward filter"
              description="Reset your filters or view the general ward census."
            />
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {filteredBeds.map((bed) => {
              const isAvailable = bed.status === BedStatus.AVAILABLE;
              const isOccupied = bed.status === BedStatus.OCCUPIED;
              const isMaint = bed.status === BedStatus.MAINTENANCE || bed.status === BedStatus.CLEANING;

              return (
                <Card
                  key={bed.id}
                  className={`p-4 transition-all border ${
                    isAvailable
                      ? 'border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/20 dark:bg-emerald-950/10'
                      : isOccupied
                      ? 'border-rose-200 dark:border-rose-900/50 bg-rose-50/20 dark:bg-rose-950/10'
                      : 'border-amber-200 dark:border-amber-900/50 bg-amber-50/20 dark:bg-amber-950/10'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono font-black text-base text-slate-900 dark:text-slate-100">
                      {bed.bedNumber}
                    </span>
                    <Badge
                      variant={isAvailable ? 'emerald' : isOccupied ? 'rose' : 'amber'}
                      size="sm"
                    >
                      {bed.status}
                    </Badge>
                  </div>

                  <div className="space-y-1 text-xs">
                    <p className="font-semibold text-slate-700 dark:text-slate-300">{bed.wardName}</p>
                    <div className="flex items-center gap-1 text-[11px] text-slate-500">
                      <span>Type:</span>
                      <Badge variant="teal" size="sm">{bed.bedType}</Badge>
                      {bed.hasOxygen && (
                        <Badge variant="blue" size="sm">O₂ Connected</Badge>
                      )}
                    </div>
                  </div>

                  {isOccupied && (
                    <div className="mt-3 p-2 rounded-lg bg-white dark:bg-slate-900 border border-rose-100 dark:border-rose-900/40 text-[11px] space-y-0.5">
                      <p className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1">
                        <User className="w-3 h-3 text-rose-500" /> {bed.currentPatientName || 'Inpatient'}
                      </p>
                      <p className="text-[10px] text-slate-400 font-mono">Assigned: {bed.lastUpdated}</p>
                    </div>
                  )}

                  <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2">
                    {isAvailable ? (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => { setSelectedBed(bed); setIsAllocateOpen(true); }}
                        className="w-full text-xs h-8"
                      >
                        Allocate Bed
                      </Button>
                    ) : isOccupied ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRelease(bed)}
                        className="w-full text-xs h-8 text-rose-600 hover:text-rose-700"
                      >
                        Discharge & Release
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSetStatus(bed.id, BedStatus.AVAILABLE)}
                        className="w-full text-xs h-8 text-emerald-600"
                      >
                        Mark Ready
                      </Button>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Allocate Bed Modal */}
      {isAllocateOpen && selectedBed && (
        <Modal
          isOpen={isAllocateOpen}
          onClose={() => { setIsAllocateOpen(false); setSelectedBed(null); }}
          title={`Allocate Bed ${selectedBed.bedNumber}`}
          description={`Assign inpatient to ${selectedBed.wardName} (${selectedBed.bedType}) with automatic bed locking.`}
          size="sm"
        >
          <form onSubmit={handleAllocate} className="space-y-4 text-xs">
            <Input
              label="Patient Full Name"
              value={patientName}
              onChange={(e) => setPatientName(e.target.value)}
              placeholder="e.g. Priyantha Silva"
              required
            />
            <Input
              label="Patient NIC / Health ID"
              value={patientNic}
              onChange={(e) => setPatientNic(e.target.value)}
              placeholder="e.g. 197834521890"
              required
            />

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <Button
                variant="outline"
                size="sm"
                type="button"
                onClick={() => { setIsAllocateOpen(false); setSelectedBed(null); }}
              >
                Cancel
              </Button>
              <Button variant="primary" size="sm" type="submit">
                Confirm & Lock Bed
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
