'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import {
  Calendar, Clock, AlertTriangle, CheckCircle2, UserCheck, Plus,
  Trash2, ArrowLeft, Building2, Filter, ShieldCheck, Info
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
  getHospitals, dutyRosterService, staffService
} from '@/services/apiClient';
import {
  Hospital, DutyRosterEntry, StaffMember, StaffRole, DutyRosterStatus
} from '@/types';

export default function HospitalDutyRosterPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const { id } = resolvedParams;
  const { user } = useAuth();
  const { toast } = useToast();

  const [hospital, setHospital] = useState<Hospital | null>(null);
  const [rosters, setRosters] = useState<DutyRosterEntry[]>([]);
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [selectedShiftFilter, setSelectedShiftFilter] = useState<string>('ALL');
  const [selectedDeptFilter, setSelectedDeptFilter] = useState<string>('ALL');

  // New Roster Modal
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newEntry, setNewEntry] = useState({
    staffId: '',
    department: '',
    shiftType: 'MORNING' as 'MORNING' | 'EVENING' | 'NIGHT' | 'ON_CALL',
    date: new Date().toISOString().split('T')[0],
    startTime: '06:00',
    endTime: '14:00',
    notes: '',
  });
  const [conflictWarning, setConflictWarning] = useState<string | null>(null);

  useEffect(() => {
    const list = getHospitals();
    const found = list.find((h) => h.id === id) || list[0];
    if (found) {
      setHospital(found);
      setRosters(dutyRosterService.getByHospital(found.id));
      const sList = staffService.getByHospital(found.id);
      setStaffList(sList);
      if (found.departments.length > 0) {
        setNewEntry(prev => ({ ...prev, department: found.departments[0] }));
      }
    }
  }, [id]);

  const loadRoster = () => {
    if (hospital) {
      setRosters(dutyRosterService.getByHospital(hospital.id));
    }
  };

  // Preset shift hours
  const handleShiftTypeChange = (type: 'MORNING' | 'EVENING' | 'NIGHT' | 'ON_CALL') => {
    let start = '06:00';
    let end = '14:00';
    if (type === 'EVENING') {
      start = '14:00';
      end = '22:00';
    } else if (type === 'NIGHT') {
      start = '22:00';
      end = '06:00';
    } else if (type === 'ON_CALL') {
      start = '08:00';
      end = '08:00';
    }
    setNewEntry(prev => ({ ...prev, shiftType: type, startTime: start, endTime: end }));
    checkConflict(newEntry.staffId, newEntry.date, start, end);
  };

  const checkConflict = (staffId: string, date: string, start: string, end: string) => {
    if (!staffId) {
      setConflictWarning(null);
      return;
    }
    const conflict = staffService.detectShiftConflicts(staffId, date, start, end);
    if (conflict.hasConflict) {
      setConflictWarning(conflict.message || 'Shift conflict detected with existing schedule');
    } else {
      setConflictWarning(null);
    }
  };

  const handleCreateRoster = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hospital) return;

    const staff = staffList.find(s => s.id === newEntry.staffId);
    if (!staff) {
      toast.error('Please select a valid staff member');
      return;
    }

    try {
      dutyRosterService.addEntry({
        hospitalId: hospital.id,
        hospitalName: hospital.name,
        staffId: staff.id,
        staffName: staff.name,
        role: staff.role,
        staffRole: staff.role,
        department: newEntry.department || hospital.departments[0] || 'Outpatient Department',
        date: newEntry.date,
        shiftType: newEntry.shiftType,
        startTime: newEntry.startTime,
        endTime: newEntry.endTime,
        status: DutyRosterStatus.SCHEDULED,
        notes: newEntry.notes,
      });
      toast.success(`Shift scheduled for ${staff.name}`, 'Roster Updated');
      setIsAddOpen(false);
      setConflictWarning(null);
      loadRoster();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to add roster entry');
    }
  };

  const handleDelete = (rosterId: string) => {
    dutyRosterService.deleteEntry(rosterId);
    toast.success('Roster shift entry removed', 'Entry Deleted');
    loadRoster();
  };

  const filteredRosters = rosters.filter(r => {
    if (selectedShiftFilter !== 'ALL' && r.shiftType !== selectedShiftFilter) return false;
    if (selectedDeptFilter !== 'ALL' && r.department !== selectedDeptFilter) return false;
    return true;
  });

  if (!hospital) return null;

  return (
    <div className="space-y-6">
      {/* Top Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Link
            href={hospital.id === 'hosp-kinniya' ? '/hospitals/kinniya' : `/hospitals/${hospital.id}`}
            className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 font-semibold"
          >
            <ArrowLeft className="w-4 h-4" /> Back to {hospital.name}
          </Link>
          <span className="text-slate-300 dark:text-slate-700">|</span>
          <Link
            href="/staff/schedule"
            className="inline-flex items-center gap-1 text-xs text-teal-600 dark:text-teal-400 font-medium hover:underline"
          >
            National Staff Roster Overview
          </Link>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => setIsAddOpen(true)}
          className="gap-1.5 text-xs"
        >
          <Plus className="w-3.5 h-3.5" /> Schedule New Shift
        </Button>
      </div>

      {/* Header Banner */}
      <Card className="p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge variant="teal">{hospital.type}</Badge>
              <Badge variant="blue">MOH Duty Roster System</Badge>
              <span className="text-xs text-slate-400 font-mono">• {hospital.code}</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-50">
              {hospital.name} — Shift Duty Roster
            </h1>
            <p className="text-xs text-slate-500">
              Multi-department duty scheduling with automated shift conflict detection and Sri Lanka labor standards.
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
            <div>
              <p className="text-[10px] text-slate-400">Total Shifts Today</p>
              <p className="font-bold text-base text-slate-900 dark:text-slate-100">{rosters.length}</p>
            </div>
            <div className="h-8 w-px bg-slate-200 dark:bg-slate-700" />
            <div>
              <p className="text-[10px] text-slate-400">Staff Assigned</p>
              <p className="font-bold text-base text-teal-600 dark:text-teal-400">{new Set(rosters.map(r => r.staffId)).size}</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Filters Bar */}
      <Card className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Select
            label="Filter by Shift Type"
            value={selectedShiftFilter}
            onChange={(e) => setSelectedShiftFilter(e.target.value)}
            options={[
              { value: 'ALL', label: 'All Shifts (Morning, Evening, Night)' },
              { value: 'MORNING', label: 'Morning (06:00 - 14:00)' },
              { value: 'EVENING', label: 'Evening (14:00 - 22:00)' },
              { value: 'NIGHT', label: 'Night (22:00 - 06:00)' },
              { value: 'ON_CALL', label: 'On Call (24 Hours)' },
            ]}
          />

          <Select
            label="Filter by Clinical Department"
            value={selectedDeptFilter}
            onChange={(e) => setSelectedDeptFilter(e.target.value)}
            options={[
              { value: 'ALL', label: 'All Clinical Departments' },
              ...hospital.departments.map(d => ({ value: d, label: d }))
            ]}
          />

          <div className="flex items-end">
            <Button
              variant="outline"
              size="sm"
              onClick={() => { setSelectedShiftFilter('ALL'); setSelectedDeptFilter('ALL'); }}
              className="w-full text-xs h-10"
            >
              Reset Filters
            </Button>
          </div>
        </div>
      </Card>

      {/* Roster Table */}
      <Card className="p-4">
        {filteredRosters.length === 0 ? (
          <EmptyState
            icon={Calendar}
            title="No duty roster shifts match the current filter"
            description="Click Schedule New Shift to assign healthcare workers to shifts."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700 text-slate-400">
                  <th className="py-3 px-3">Date</th>
                  <th className="py-3 px-3">Shift Type</th>
                  <th className="py-3 px-3">Staff Member</th>
                  <th className="py-3 px-3">Role</th>
                  <th className="py-3 px-3">Department</th>
                  <th className="py-3 px-3">Hours (SL Time)</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredRosters.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                    <td className="py-3 px-3 font-mono font-semibold text-slate-800 dark:text-slate-200">
                      {r.date}
                    </td>
                    <td className="py-3 px-3">
                      <Badge
                        variant={r.shiftType === 'NIGHT' ? 'blue' : r.shiftType === 'EVENING' ? 'amber' : 'emerald'}
                        size="sm"
                      >
                        {r.shiftType}
                      </Badge>
                    </td>
                    <td className="py-3 px-3 font-bold text-slate-900 dark:text-slate-100">
                      {r.staffName}
                    </td>
                    <td className="py-3 px-3">
                      <Badge variant="gray" size="sm">{(r.staffRole || r.role || 'STAFF').replace('_', ' ')}</Badge>
                    </td>
                    <td className="py-3 px-3 text-slate-600 dark:text-slate-300">
                      {r.department}
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-500">
                      {r.startTime} — {r.endTime}
                    </td>
                    <td className="py-3 px-3">
                      <Badge variant={r.status === 'ON_DUTY' ? 'emerald' : 'teal'} size="sm">
                        {r.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => handleDelete(r.id)}
                        className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                        title="Remove Shift"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Schedule Shift Modal */}
      {isAddOpen && (
        <Modal
          isOpen={isAddOpen}
          onClose={() => { setIsAddOpen(false); setConflictWarning(null); }}
          title={`Schedule Shift at ${hospital.name}`}
          description="Assign healthcare personnel to morning, evening, or night shift with automated conflict checking."
          size="md"
        >
          <form onSubmit={handleCreateRoster} className="space-y-4 text-xs">
            <Select
              label="Select Healthcare Staff Member"
              value={newEntry.staffId}
              onChange={(e) => {
                const sid = e.target.value;
                setNewEntry(prev => ({ ...prev, staffId: sid }));
                checkConflict(sid, newEntry.date, newEntry.startTime, newEntry.endTime);
              }}
              options={[
                { value: '', label: '-- Select Staff Member --' },
                ...staffList.map(s => ({ value: s.id, label: `${s.name} (${s.role.replace('_', ' ')})` }))
              ]}
              required
            />

            <div className="grid grid-cols-2 gap-3">
              <Select
                label="Shift Type"
                value={newEntry.shiftType}
                onChange={(e) => handleShiftTypeChange(e.target.value as any)}
                options={[
                  { value: 'MORNING', label: 'Morning (06:00 - 14:00)' },
                  { value: 'EVENING', label: 'Evening (14:00 - 22:00)' },
                  { value: 'NIGHT', label: 'Night (22:00 - 06:00)' },
                  { value: 'ON_CALL', label: 'On Call (24 Hours)' },
                ]}
              />

              <Input
                label="Duty Date"
                type="date"
                value={newEntry.date}
                onChange={(e) => {
                  const d = e.target.value;
                  setNewEntry(prev => ({ ...prev, date: d }));
                  checkConflict(newEntry.staffId, d, newEntry.startTime, newEntry.endTime);
                }}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Start Time"
                type="time"
                value={newEntry.startTime}
                onChange={(e) => {
                  const st = e.target.value;
                  setNewEntry(prev => ({ ...prev, startTime: st }));
                  checkConflict(newEntry.staffId, newEntry.date, st, newEntry.endTime);
                }}
                required
              />
              <Input
                label="End Time"
                type="time"
                value={newEntry.endTime}
                onChange={(e) => {
                  const et = e.target.value;
                  setNewEntry(prev => ({ ...prev, endTime: et }));
                  checkConflict(newEntry.staffId, newEntry.date, newEntry.startTime, et);
                }}
                required
              />
            </div>

            <Select
              label="Assigned Clinical Department"
              value={newEntry.department}
              onChange={(e) => setNewEntry(prev => ({ ...prev, department: e.target.value }))}
              options={hospital.departments.map(d => ({ value: d, label: d }))}
              required
            />

            <Input
              label="Shift Notes / Instructions"
              value={newEntry.notes}
              onChange={(e) => setNewEntry(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="e.g. Ward rounds, ETU intake coverage"
            />

            {/* Conflict Alert Banner */}
            {conflictWarning && (
              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200 flex items-start gap-2 text-xs">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Shift Schedule Conflict Detected</p>
                  <p className="text-[11px]">{conflictWarning}</p>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-100 dark:border-slate-800">
              <Button
                variant="outline"
                size="sm"
                type="button"
                onClick={() => { setIsAddOpen(false); setConflictWarning(null); }}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                type="submit"
                disabled={Boolean(conflictWarning)}
              >
                Confirm & Add to Roster
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
