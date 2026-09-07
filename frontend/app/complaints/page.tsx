'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  MessageSquareQuote, Plus, Search, Filter, CheckCircle2, Clock,
  Building2, AlertTriangle, ArrowRight, ShieldCheck, FileCheck
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Tabs } from '@/components/ui/Tabs';
import { Modal } from '@/components/ui/Modal';
import { Input, Textarea, Select } from '@/components/ui/Input';
import { EmptyState } from '@/components/ui/EmptyState';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { getComplaints, complaintService, getHospitals } from '@/services/apiClient';
import { Complaint, ComplaintStatus, ComplaintPriority, UserRole } from '@/types';
import { formatDate } from '@/lib/utils';

export default function ComplaintsPage() {
  const { user } = useAuth();
  const { toast } = useToast();

  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [activeTab, setActiveTab] = useState('ALL');
  const [search, setSearch] = useState('');

  // Submit Modal State
  const [isSubmitOpen, setIsSubmitOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Admin Resolve Modal State
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [assignDept, setAssignDept] = useState('');

  const hospitals = useMemo(() => getHospitals(), []);

  const [form, setForm] = useState({
    citizenName: user?.name || '',
    citizenPhone: user?.phone || '+94 77 123 4567',
    citizenEmail: user?.email || 'citizen@example.com',
    category: 'Hospital Service & Waiting Times',
    hospitalId: hospitals[0]?.id || '',
    subject: '',
    description: '',
    priority: ComplaintPriority.MEDIUM,
  });

  useEffect(() => {
    setComplaints(getComplaints());
  }, []);

  const handleSubmitComplaint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.subject || !form.description) {
      toast.error('Please enter the complaint subject and details');
      return;
    }
    const hosp = hospitals.find((h) => h.id === form.hospitalId);

    setIsSubmitting(true);
    try {
      const created = await complaintService.create({
        ...form,
        hospitalName: hosp?.name,
        status: ComplaintStatus.SUBMITTED,
      });
      setComplaints(getComplaints());
      toast.success(
        `Ticket ${created.ticketNumber} lodged successfully. Track status on this page.`,
        'Grievance Registered'
      );
      setIsSubmitOpen(false);
    } catch {
      toast.error('Failed to submit complaint');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: ComplaintStatus, notes?: string) => {
    try {
      await complaintService.updateStatus(id, newStatus, notes);
      setComplaints(getComplaints());
      toast.success(`Complaint status transitioned to ${newStatus}`);
      setSelectedComplaint(null);
    } catch {
      toast.error('Failed to update complaint status');
    }
  };

  const tabs = [
    { id: 'ALL', label: 'All Tickets', count: complaints.length },
    { id: 'SUBMITTED', label: 'Submitted', count: complaints.filter((c) => c.status === 'SUBMITTED').length },
    { id: 'UNDER_REVIEW', label: 'Under Review', count: complaints.filter((c) => c.status === 'UNDER_REVIEW').length },
    { id: 'IN_PROGRESS', label: 'In Progress', count: complaints.filter((c) => c.status === 'IN_PROGRESS').length },
    { id: 'RESOLVED', label: 'Resolved', count: complaints.filter((c) => c.status === 'RESOLVED').length },
  ];

  const filteredComplaints = useMemo(() => {
    return complaints.filter((c) => {
      const matchTab = activeTab === 'ALL' || c.status === activeTab;
      const matchSearch =
        c.subject.toLowerCase().includes(search.toLowerCase()) ||
        c.ticketNumber.toLowerCase().includes(search.toLowerCase()) ||
        c.citizenName.toLowerCase().includes(search.toLowerCase()) ||
        (c.hospitalName && c.hospitalName.toLowerCase().includes(search.toLowerCase()));
      return matchTab && matchSearch;
    });
  }, [complaints, activeTab, search]);

  const canResolve =
    user?.role === UserRole.SUPER_ADMIN ||
    user?.role === UserRole.MINISTRY_ADMIN ||
    user?.role === UserRole.HOSPITAL_ADMIN;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-50 tracking-tight">
              Public Complaints & Service Request Tracking
            </h1>
            <Badge variant="teal">{filteredComplaints.length} Tickets</Badge>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Official Ministry grievance redressal pipeline ensuring quality care, medicine availability, and administrative accountability.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => setIsSubmitOpen(true)}
          className="gap-1.5"
        >
          <Plus className="w-4 h-4" /> Lodge Service Grievance
        </Button>
      </div>

      {/* Tabs */}
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {/* Search */}
      <div className="flex items-center gap-3 bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="relative flex items-center w-full max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by ticket # (e.g. TKT-2026-8891), citizen name, or subject..."
            className="w-full h-9 pl-9 pr-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>
      </div>

      {/* Complaints Grid */}
      {filteredComplaints.length === 0 ? (
        <EmptyState
          icon={MessageSquareQuote}
          title="No grievances matching query"
          description="There are currently no complaints filed under this category."
          actionLabel="Submit Feedback"
          onAction={() => setIsSubmitOpen(true)}
        />
      ) : (
        <div className="space-y-4">
          {filteredComplaints.map((c) => {
            const workflowSteps = [
              'SUBMITTED',
              'UNDER_REVIEW',
              'ASSIGNED',
              'IN_PROGRESS',
              'RESOLVED',
              'CLOSED',
            ];
            const currentIndex = workflowSteps.indexOf(c.status);

            return (
              <div
                key={c.id}
                className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4 shadow-xs"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950 px-2 py-0.5 rounded">
                        {c.ticketNumber}
                      </span>
                      <Badge
                        variant={c.priority === 'HIGH' || c.priority === 'URGENT' ? 'rose' : 'amber'}
                      >
                        {c.priority} Priority
                      </Badge>
                      <span className="text-[11px] text-slate-400">• {c.category}</span>
                    </div>
                    <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
                      {c.subject}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Complainant: <strong>{c.citizenName}</strong> • Facility: <strong>{c.hospitalName || 'National Level'}</strong>
                    </p>
                  </div>

                  <Badge
                    variant={c.status === 'RESOLVED' ? 'emerald' : c.status === 'IN_PROGRESS' ? 'teal' : 'amber'}
                  >
                    {c.status.replace('_', ' ')}
                  </Badge>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                  {c.description}
                </p>

                {/* Visual Pipeline Progress Tracker */}
                <div className="space-y-1.5 pt-1">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Redressal Progress:
                  </p>
                  <div className="grid grid-cols-6 gap-1 text-center">
                    {workflowSteps.map((step, idx) => {
                      const isPastOrCurrent = currentIndex >= idx;
                      return (
                        <div key={step} className="space-y-1">
                          <div
                            className={`h-2 rounded-full ${
                              isPastOrCurrent ? 'bg-teal-600' : 'bg-slate-200 dark:bg-slate-700'
                            }`}
                          />
                          <p className="text-[9px] font-semibold text-slate-400 truncate hidden sm:block">
                            {step.replace('_', ' ')}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {c.resolutionNotes && (
                  <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-900 dark:text-emerald-200 space-y-0.5">
                    <span className="font-bold">Official Ministry Resolution: </span>
                    <span>{c.resolutionNotes}</span>
                  </div>
                )}

                {/* Actions */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-[11px] text-slate-400">
                    Filed on: {formatDate(c.createdAt)}
                  </span>

                  {canResolve && c.status !== 'RESOLVED' && c.status !== 'CLOSED' && (
                    <div className="flex items-center gap-2">
                      {c.status === 'SUBMITTED' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleUpdateStatus(c.id, ComplaintStatus.UNDER_REVIEW)}
                          className="text-xs"
                        >
                          Mark Under Review →
                        </Button>
                      )}
                      {c.status === 'UNDER_REVIEW' && (
                        <Button
                          variant="navy"
                          size="sm"
                          onClick={() => handleUpdateStatus(c.id, ComplaintStatus.IN_PROGRESS)}
                          className="text-xs"
                        >
                          Assign & Start Progress →
                        </Button>
                      )}
                      {c.status === 'IN_PROGRESS' && (
                        <Button
                          variant="success"
                          size="sm"
                          onClick={() => {
                            setSelectedComplaint(c);
                            setResolutionNotes('');
                          }}
                          className="text-xs"
                        >
                          Resolve Grievance ✓
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Citizen Lodge Complaint Modal */}
      {isSubmitOpen && (
        <Modal
          isOpen={isSubmitOpen}
          onClose={() => setIsSubmitOpen(false)}
          title="Lodge Citizen Service Grievance"
          description="Submitted directly to the Ministry of Health Public Grievance Division."
          size="lg"
        >
          <form onSubmit={handleSubmitComplaint} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Complainant Full Name"
                value={form.citizenName}
                onChange={(e) => setForm({ ...form, citizenName: e.target.value })}
                required
              />

              <Input
                label="Mobile Phone"
                value={form.citizenPhone}
                onChange={(e) => setForm({ ...form, citizenPhone: e.target.value })}
                required
              />

              <Select
                label="Grievance Category"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                options={[
                  { value: 'Medicine Availability', label: 'Medicine / Pharmaceutical Depletion' },
                  { value: 'Hospital Service & Waiting Times', label: 'Hospital Service & Waiting Times' },
                  { value: 'Staff Conduct', label: 'Healthcare Worker / Staff Conduct' },
                  { value: 'Facility & Cleanliness', label: 'Hospital Facility & Cleanliness' },
                  { value: 'Appointment Scheduling', label: 'Appointment Scheduling Issue' },
                  { value: 'Other Public Health Issue', label: 'Other Public Health Service Issue' },
                ]}
              />

              <Select
                label="Healthcare Facility / Hospital Involved"
                value={form.hospitalId}
                onChange={(e) => setForm({ ...form, hospitalId: e.target.value })}
                options={hospitals.map((h) => ({ value: h.id, label: h.name }))}
              />
            </div>

            <Input
              label="Subject / Summary of Issue"
              placeholder="e.g. Salbutamol inhaler out of stock at OPD pharmacy counter"
              value={form.subject}
              onChange={(e) => setForm({ ...form, subject: e.target.value })}
              required
            />

            <Textarea
              label="Comprehensive Grievance Narrative"
              placeholder="Detail the sequence of events, ward/counter number, dates, staff involved, and impact on patient care..."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={4}
              required
            />

            <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
              <Button variant="outline" size="sm" type="button" onClick={() => setIsSubmitOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" type="submit" isLoading={isSubmitting}>
                Lodge Grievance Ticket
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Admin Resolve Complaint Modal */}
      {selectedComplaint && (
        <Modal
          isOpen={!!selectedComplaint}
          onClose={() => setSelectedComplaint(null)}
          title={`Resolve Grievance — ${selectedComplaint.ticketNumber}`}
          description={`Complainant: ${selectedComplaint.citizenName} • Subject: ${selectedComplaint.subject}`}
          size="md"
        >
          <div className="space-y-4 text-xs">
            <Textarea
              label="Official Ministry Redressal & Resolution Notes"
              placeholder="Document corrective actions taken, stock replenished, disciplinary steps, or administrative remedy provided..."
              value={resolutionNotes}
              onChange={(e) => setResolutionNotes(e.target.value)}
              rows={4}
              required
            />

            <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
              <Button variant="outline" size="sm" onClick={() => setSelectedComplaint(null)}>
                Cancel
              </Button>
              <Button
                variant="success"
                size="sm"
                onClick={() =>
                  handleUpdateStatus(selectedComplaint.id, ComplaintStatus.RESOLVED, resolutionNotes)
                }
              >
                Mark Ticket Resolved & Notify Citizen
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
