'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ShieldCheck, Users, Building2, MapPin, Search, Edit,
  CheckCircle2, AlertTriangle, Clock, ArrowLeft, Plus, Lock,
  FileBarChart2, RefreshCw
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { RoleGuard } from '@/components/auth/RoleGuard';
import { UserRole, Permission, UserScope, SriLankaRegion } from '@/types';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ROLE_DEFAULT_PERMISSIONS } from '@/lib/rbac';
import { auditLogService, getAuditLogs } from '@/services/apiClient';
import { useToast } from '@/context/ToastContext';

interface UserPermissionRecord {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  organization: string;
  scope: UserScope;
  permissions: Permission[];
}

export default function PermissionManagementPage() {
  const { user } = useAuth();
  const { toast } = useToast();

  const [usersList, setUsersList] = useState<UserPermissionRecord[]>([
    {
      id: 'user-01',
      name: 'Dr. K. M. Nafeel',
      email: 'hospital@example.com',
      role: UserRole.HOSPITAL_ADMIN,
      organization: 'Base Hospital Kinniya',
      scope: { level: 'HOSPITAL', hospitalId: 'hosp-kinniya', district: 'Trincomalee', province: SriLankaRegion.EASTERN },
      permissions: ROLE_DEFAULT_PERMISSIONS[UserRole.HOSPITAL_ADMIN],
    },
    {
      id: 'user-02',
      name: 'Dr. Ruwan Gunawardana',
      email: 'trinco.rdhs@example.com',
      role: UserRole.DISTRICT_ADMIN,
      organization: 'Regional Directorate of Health Services — Trincomalee',
      scope: { level: 'DISTRICT', district: 'Trincomalee', province: SriLankaRegion.EASTERN },
      permissions: ROLE_DEFAULT_PERMISSIONS[UserRole.DISTRICT_ADMIN],
    },
    {
      id: 'user-03',
      name: 'Dr. Chandani Jayaratne',
      email: 'eastern.pdhs@example.com',
      role: UserRole.PROVINCIAL_ADMIN,
      organization: 'Provincial Directorate of Health Services — Eastern Province',
      scope: { level: 'PROVINCE', province: SriLankaRegion.EASTERN },
      permissions: ROLE_DEFAULT_PERMISSIONS[UserRole.PROVINCIAL_ADMIN],
    },
    {
      id: 'user-04',
      name: 'Dr. Priya Kumara',
      email: 'ministry.officer@example.com',
      role: UserRole.MINISTRY_OFFICER,
      organization: 'Ministry of Health — Directorate of Medical Services',
      scope: { level: 'NATIONAL' },
      permissions: ROLE_DEFAULT_PERMISSIONS[UserRole.MINISTRY_OFFICER],
    },
    {
      id: 'user-05',
      name: 'Dr. Amara Bandara',
      email: 'doctor@example.com',
      role: UserRole.DOCTOR,
      organization: 'Base Hospital Kinniya',
      scope: { level: 'HOSPITAL', hospitalId: 'hosp-kinniya', department: 'General Medicine', district: 'Trincomalee', province: SriLankaRegion.EASTERN },
      permissions: ROLE_DEFAULT_PERMISSIONS[UserRole.DOCTOR],
    },
    {
      id: 'user-06',
      name: 'M. Farhan',
      email: 'pharmacist@example.com',
      role: UserRole.PHARMACIST,
      organization: 'Base Hospital Kinniya — Pharmacy Depot',
      scope: { level: 'HOSPITAL', hospitalId: 'hosp-kinniya', department: 'Pharmacy', district: 'Trincomalee', province: SriLankaRegion.EASTERN },
      permissions: ROLE_DEFAULT_PERMISSIONS[UserRole.PHARMACIST],
    },
  ]);

  const [search, setSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserPermissionRecord | null>(null);
  const [targetRole, setTargetRole] = useState<UserRole>(UserRole.DOCTOR);
  const [changeReason, setChangeReason] = useState('Official Ministry gazetted appointment transfer');
  const [showModal, setShowModal] = useState(false);

  // Load live audit logs from auditLogService
  const [auditLogs, setAuditLogs] = useState(getAuditLogs().slice(0, 8));

  const filteredUsers = usersList.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.organization.toLowerCase().includes(search.toLowerCase()) ||
      u.role.toLowerCase().includes(search.toLowerCase())
  );

  const handleOpenEdit = (rec: UserPermissionRecord) => {
    setSelectedUser(rec);
    setTargetRole(rec.role);
    setShowModal(true);
  };

  const handleSaveRoleChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    const oldRole = selectedUser.role;
    const newRole = targetRole;

    // Update state
    setUsersList((prev) =>
      prev.map((u) =>
        u.id === selectedUser.id
          ? { ...u, role: newRole, permissions: ROLE_DEFAULT_PERMISSIONS[newRole] }
          : u
      )
    );

    // Section 91: Record Permission Audit Entry
    const logEntry = auditLogService.log(
      'ROLE_MODIFIED',
      'STAFF',
      selectedUser.id,
      `ROLE CHANGED from ${oldRole} to ${newRole} by Administrator ${user?.name || 'Nirosha Perera'} (${user?.role}). Reason: ${changeReason}`,
      selectedUser.scope.hospitalId,
      selectedUser.organization
    );

    setAuditLogs(getAuditLogs().slice(0, 8));
    setShowModal(false);
    toast.success(
      `Role Updated: ${selectedUser.name} → ${newRole}`,
      `Audit entry created: ${logEntry.id}`
    );
  };

  return (
    <RoleGuard allowedRoles={[UserRole.MINISTRY_ADMIN, UserRole.SUPER_ADMIN]}>
      <div className="space-y-6 pb-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                Permission &amp; Location Scope Management
              </h1>
              <Badge variant="teal">Sections 90 &amp; 91</Badge>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Configure user roles, geographic access scopes, and inspect the immutable permission modification audit trail.
            </p>
          </div>
          <Link href="/ministry-admin">
            <Button variant="outline" size="sm">
              ← Return to Governance Portal
            </Button>
          </Link>
        </div>

        {/* User Scope & Permissions Matrix */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-teal-600" />
              Authorized Personnel &amp; Scopes (Section 90)
            </h2>
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search user, role, org..."
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3">Officer Name</th>
                  <th className="px-4 py-3">Assigned Role</th>
                  <th className="px-4 py-3">Organization</th>
                  <th className="px-4 py-3">Location Scope</th>
                  <th className="px-4 py-3">Granular Permissions</th>
                  <th className="px-4 py-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">
                      {u.name}
                      <p className="text-[11px] font-mono text-slate-400 font-normal">{u.email}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono text-[10px] font-bold text-teal-600 dark:text-teal-400">
                        {u.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                      {u.organization}
                    </td>
                    <td className="px-4 py-3">
                      <div className="space-y-0.5 font-mono text-[11px]">
                        <span className="font-bold text-slate-900 dark:text-white">
                          Level: {u.scope.level}
                        </span>
                        {u.scope.district && (
                          <p className="text-slate-500">District: {u.scope.district}</p>
                        )}
                        {u.scope.hospitalId && (
                          <p className="text-teal-600">Facility: {u.scope.hospitalId}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {u.permissions.slice(0, 3).map((p, i) => (
                          <span
                            key={i}
                            className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] font-mono text-slate-600 dark:text-slate-400"
                          >
                            {p}
                          </span>
                        ))}
                        {u.permissions.length > 3 && (
                          <span className="text-[10px] text-slate-400">
                            +{u.permissions.length - 3} more
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenEdit(u)}
                        className="text-xs gap-1"
                      >
                        <Edit className="w-3.5 h-3.5" /> Modify Role
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 91 Permission Audit Trail */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-purple-600" />
              Permission Modification Audit Trail (Section 91)
            </h2>
            <Badge variant="outline">Cryptographically Logged</Badge>
          </div>

          <div className="space-y-2.5">
            {auditLogs.map((log) => (
              <div
                key={log.id}
                className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-purple-600 dark:text-purple-400">
                      {log.action}
                    </span>
                    <span className="text-slate-400 font-mono text-[10px]">
                      {new Date(log.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-slate-700 dark:text-slate-300">{log.details}</p>
                </div>
                <div className="text-right shrink-0 text-[11px] text-slate-400">
                  Target: <span className="font-mono font-semibold text-slate-600 dark:text-slate-300">{log.targetRecordId}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Role Edit Modal */}
        {showModal && selectedUser && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  Modify Officer Role &amp; Access Scope
                </h3>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="text-slate-400 hover:text-slate-600 text-sm"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSaveRoleChange} className="space-y-3.5 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Officer Account:
                  </label>
                  <input
                    type="text"
                    value={`${selectedUser.name} (${selectedUser.email})`}
                    disabled
                    className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Select New Role Assignment:
                  </label>
                  <select
                    value={targetRole}
                    onChange={(e) => setTargetRole(e.target.value as UserRole)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  >
                    {Object.values(UserRole).map((r) => (
                      <option key={r} value={r}>
                        {r.replace(/_/g, ' ')}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Mandatory Audit Justification (Section 91):
                  </label>
                  <textarea
                    rows={3}
                    value={changeReason}
                    onChange={(e) => setChangeReason(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                    required
                  />
                </div>

                <div className="pt-3 flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => setShowModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" variant="primary" className="flex-1">
                    Save &amp; Log Audit
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
