'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  Users, Search, Plus, UserCheck, Phone, CreditCard,
  HeartPulse, FileText, ArrowRight, ShieldCheck
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { EmptyState } from '@/components/ui/EmptyState';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { getPatients, patientService } from '@/services/apiClient';
import { Patient, SriLankaRegion, UserRole } from '@/types';

export default function PatientsDirectoryPage() {
  const { user } = useAuth();
  const { toast } = useToast();

  const [patients, setPatients] = useState<Patient[]>([]);
  const [search, setSearch] = useState('');
  const [selectedBlood, setSelectedBlood] = useState('ALL');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [newPatient, setNewPatient] = useState({
    name: '',
    nic: '',
    dateOfBirth: '1990-01-01',
    gender: 'MALE' as const,
    bloodGroup: 'O+',
    phone: '',
    address: '',
    region: SriLankaRegion.WESTERN,
    emergencyName: '',
    emergencyRelationship: 'Spouse',
    emergencyPhone: '',
    allergies: 'None known',
    chronicConditions: 'None',
  });

  useEffect(() => {
    setPatients(getPatients());
  }, []);

  const filteredPatients = useMemo(() => {
    return patients.filter((p) => {
      const matchSearch =
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.phn.toLowerCase().includes(search.toLowerCase()) ||
        p.nic.includes(search);
      const matchBlood = selectedBlood === 'ALL' || p.bloodGroup === selectedBlood;
      return matchSearch && matchBlood;
    });
  }, [patients, search, selectedBlood]);

  const handleCreatePatient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPatient.name || !newPatient.nic) {
      toast.error('Please enter patient name and NIC');
      return;
    }
    setIsSubmitting(true);
    try {
      const created = await patientService.create({
        name: newPatient.name,
        nic: newPatient.nic,
        dateOfBirth: newPatient.dateOfBirth,
        gender: newPatient.gender,
        bloodGroup: newPatient.bloodGroup,
        phone: newPatient.phone,
        address: newPatient.address,
        region: newPatient.region,
        emergencyContact: {
          name: newPatient.emergencyName || 'Family Member',
          relationship: newPatient.emergencyRelationship,
          phone: newPatient.emergencyPhone,
        },
        allergies: newPatient.allergies.split(',').map((a) => a.trim()),
        chronicConditions: newPatient.chronicConditions.split(',').map((c) => c.trim()),
      });
      setPatients(getPatients());
      toast.success(`${created.name} enrolled in EHR registry`, 'PHN Generated');
      setIsCreateOpen(false);
    } catch {
      toast.error('Failed to enroll patient');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-50 tracking-tight">
              Centralized Patient & EHR Registry
            </h1>
            <Badge variant="teal">{filteredPatients.length} Active Records</Badge>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Personal Health Number (PHN) electronic health records, encounter summaries, and clinical safety profiles.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => setIsCreateOpen(true)}
          className="gap-1.5"
        >
          <Plus className="w-4 h-4" /> Enroll New Patient
        </Button>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row items-center gap-3 bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="relative flex items-center w-full sm:max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by patient name, PHN (e.g. PHN-2024-884920), or NIC..."
            className="w-full h-9 pl-9 pr-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>

        <div className="w-36">
          <select
            value={selectedBlood}
            onChange={(e) => setSelectedBlood(e.target.value)}
            className="w-full h-9 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-2.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <option value="ALL">All Blood Groups</option>
            {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((bg) => (
              <option key={bg} value={bg}>{bg}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Patient List */}
      {filteredPatients.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No patient records found"
          description="Try searching with a different name, national identity card number, or PHN."
          actionLabel="Clear Search"
          onAction={() => setSearch('')}
        />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 font-semibold">
              <tr>
                <th className="p-3.5">Patient Name & Demographics</th>
                <th className="p-3.5">PHN (Personal Health Number)</th>
                <th className="p-3.5">National ID (NIC)</th>
                <th className="p-3.5">Blood Group</th>
                <th className="p-3.5">Province</th>
                <th className="p-3.5">Known Allergies</th>
                <th className="p-3.5 text-right">EHR Profile</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {filteredPatients.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                  <td className="p-3.5">
                    <p className="font-bold text-slate-900 dark:text-slate-100">{p.name}</p>
                    <p className="text-[10px] text-slate-500">{p.gender} • DOB: {p.dateOfBirth}</p>
                  </td>
                  <td className="p-3.5 font-mono font-semibold text-teal-600 dark:text-teal-400">
                    {p.phn}
                  </td>
                  <td className="p-3.5 font-mono text-slate-700 dark:text-slate-300">
                    {p.nic}
                  </td>
                  <td className="p-3.5">
                    <Badge variant="rose" size="sm">{p.bloodGroup}</Badge>
                  </td>
                  <td className="p-3.5 text-slate-600 dark:text-slate-400">{p.region}</td>
                  <td className="p-3.5">
                    {p.allergies && p.allergies.length > 0 && p.allergies[0] !== 'None known' ? (
                      <span className="text-rose-600 dark:text-rose-400 font-medium">
                        {p.allergies.join(', ')}
                      </span>
                    ) : (
                      <span className="text-slate-400">None logged</span>
                    )}
                  </td>
                  <td className="p-3.5 text-right">
                    <Link href={`/patients/${p.id}`}>
                      <Button variant="outline" size="sm" className="gap-1 text-xs">
                        Open EHR <ArrowRight className="w-3.5 h-3.5" />
                      </Button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Patient Registration Modal */}
      {isCreateOpen && (
        <Modal
          isOpen={isCreateOpen}
          onClose={() => setIsCreateOpen(false)}
          title="Enroll Citizen into Central EHR Registry"
          description="Generates an official Personal Health Number (PHN) synchronized across government healthcare facilities."
          size="lg"
        >
          <form onSubmit={handleCreatePatient} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Full Legal Name"
                placeholder="e.g. Kasun Chathuranga"
                value={newPatient.name}
                onChange={(e) => setNewPatient({ ...newPatient, name: e.target.value })}
                required
              />
              <Input
                label="NIC / Passport Number"
                placeholder="e.g. 199023405190"
                value={newPatient.nic}
                onChange={(e) => setNewPatient({ ...newPatient, nic: e.target.value })}
                required
              />
              <Input
                label="Date of Birth"
                type="date"
                value={newPatient.dateOfBirth}
                onChange={(e) => setNewPatient({ ...newPatient, dateOfBirth: e.target.value })}
                required
              />
              <Select
                label="Gender"
                value={newPatient.gender}
                onChange={(e) => setNewPatient({ ...newPatient, gender: e.target.value as any })}
                options={[
                  { value: 'MALE', label: 'Male' },
                  { value: 'FEMALE', label: 'Female' },
                  { value: 'OTHER', label: 'Other' },
                ]}
              />
              <Select
                label="Blood Group"
                value={newPatient.bloodGroup}
                onChange={(e) => setNewPatient({ ...newPatient, bloodGroup: e.target.value })}
                options={['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'].map((b) => ({ value: b, label: b }))}
              />
              <Select
                label="Province of Residence"
                value={newPatient.region}
                onChange={(e) => setNewPatient({ ...newPatient, region: e.target.value as any })}
                options={Object.values(SriLankaRegion).map((r) => ({ value: r, label: r }))}
              />
              <Input
                label="Mobile Phone"
                placeholder="+94 77 123 4567"
                value={newPatient.phone}
                onChange={(e) => setNewPatient({ ...newPatient, phone: e.target.value })}
                required
              />
              <Input
                label="Emergency Contact Name"
                placeholder="Next of kin"
                value={newPatient.emergencyName}
                onChange={(e) => setNewPatient({ ...newPatient, emergencyName: e.target.value })}
                required
              />
            </div>

            <Input
              label="Permanent Residential Address"
              placeholder="Street, City, Postal Code"
              value={newPatient.address}
              onChange={(e) => setNewPatient({ ...newPatient, address: e.target.value })}
              required
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Known Drug / Food Allergies"
                placeholder="e.g. Penicillin, NSAIDs, Sulfa"
                value={newPatient.allergies}
                onChange={(e) => setNewPatient({ ...newPatient, allergies: e.target.value })}
              />
              <Input
                label="Chronic Medical Conditions"
                placeholder="e.g. Type 2 Diabetes, Asthma"
                value={newPatient.chronicConditions}
                onChange={(e) => setNewPatient({ ...newPatient, chronicConditions: e.target.value })}
              />
            </div>

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
                Enroll Patient & Issue PHN
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
