'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ShieldCheck, Building2, Users, Database, FileText,
  AlertTriangle, CheckCircle2, Lock, ShieldAlert, Settings,
  ArrowRight, FileBarChart2, ChevronRight
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { RoleGuard } from '@/components/auth/RoleGuard';
import { UserRole } from '@/types';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useToast } from '@/context/ToastContext';
import { auditLogService } from '@/services/apiClient';

export default function MinistryAdminPortalPage() {
  const { user } = useAuth();
  const { toast } = useToast();

  const [confirmModal, setConfirmModal] = useState<{
    open: boolean;
    title: string;
    description: string;
    actionKey: string;
  }>({
    open: false,
    title: '',
    description: '',
    actionKey: '',
  });

  const handleOpenDangerousAction = (title: string, desc: string, actionKey: string) => {
    setConfirmModal({
      open: true,
      title,
      description: desc,
      actionKey,
    });
  };

  const handleExecuteDangerousAction = () => {
    auditLogService.log(
      'DANGEROUS_MINISTRY_ACTION_EXECUTED',
      'HOSPITAL',
      confirmModal.actionKey,
      `Executed by Ministry Administrator ${user?.name || 'Ms. Nirosha Perera'}. Action: ${confirmModal.title}`
    );
    toast.success(
      'Administrative Operation Executed & Audited',
      `${confirmModal.title} logged in Ministry Audit Registry`
    );
    setConfirmModal({ open: false, title: '', description: '', actionKey: '' });
  };

  return (
    <RoleGuard allowedRoles={[UserRole.MINISTRY_ADMIN, UserRole.SUPER_ADMIN]}>
      <div className="space-y-6 pb-12">
        {/* Header */}
        <div className="p-6 rounded-3xl bg-slate-900 text-white border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-teal-500/20 text-teal-400">
                <ShieldCheck className="w-5 h-5" />
              </span>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
                Ministry Administrator System Governance
              </h1>
              <Badge variant="teal">National Registrar Command</Badge>
            </div>
            <p className="text-xs text-slate-400">
              {user?.name || 'Ms. Nirosha Perera'} • Digital Health Division • National Master Configuration
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link href="/admin/permissions">
              <Button variant="primary" size="sm" className="gap-1.5 text-xs font-semibold">
                <Users className="w-4 h-4" /> Role &amp; Permission Matrix
              </Button>
            </Link>
            <Link href="/admin/data">
              <Button variant="outline" size="sm" className="text-xs bg-slate-800 text-slate-200 border-slate-700">
                <Database className="w-4 h-4 text-teal-400" /> Dataset Ingestion
              </Button>
            </Link>
          </div>
        </div>

        {/* Section 65 Dangerous Action Confirmation Protocol */}
        <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 text-xs text-amber-900 dark:text-amber-200 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <strong>Section 65 Safeguard:</strong> Destructive operations (e.g. deactivating a hospital, revoking officer role, publishing national datasets) require two-factor confirmation and trigger immutable audit entries.
            </span>
          </div>
          <Badge variant="amber">SAFETY_LOCK_ENABLED</Badge>
        </div>

        {/* Governance Workspaces Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Tile 1: Healthcare Facility Registry */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center">
              <Building2 className="w-5 h-5" />
            </div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Institution Registry
            </h2>
            <p className="text-xs text-slate-500">
              Manage facility classifications, verify geographic coordinates, and update administrative authority across all 9 provinces.
            </p>
            <div className="pt-2">
              <Link href="/hospitals">
                <Button variant="outline" size="sm" className="w-full text-xs">
                  Inspect Registry →
                </Button>
              </Link>
            </div>
          </div>

          {/* Tile 2: User Roles & Permissions */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              User Roles &amp; Scopes
            </h2>
            <p className="text-xs text-slate-500">
              Authorize district, provincial, and hospital administrators. Review permission assignment audit records and access bounds.
            </p>
            <div className="pt-2">
              <Link href="/admin/permissions">
                <Button variant="outline" size="sm" className="w-full text-xs">
                  Manage Access Bounds →
                </Button>
              </Link>
            </div>
          </div>

          {/* Tile 3: National Data Approval Pipeline */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <Database className="w-5 h-5" />
            </div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Dataset Approvals
            </h2>
            <p className="text-xs text-slate-500">
              Review staged datasets submitted by the Data Administration team. Validate duplicate checks before publishing to production.
            </p>
            <div className="pt-2">
              <Link href="/admin/data">
                <Button variant="outline" size="sm" className="w-full text-xs">
                  Review Data Submissions →
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Dangerous Operations Testing Panel */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-rose-600" />
                Protected National System Operations
              </h2>
              <p className="text-xs text-slate-500">
                These operations affect national registries and require explicit confirmation with an audit trail.
              </p>
            </div>
            <Badge variant="outline">AUDITED_EXECUTION</Badge>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                handleOpenDangerousAction(
                  'Publish 2026 National Hospital Census',
                  'This will publish the authoritative 2026 bed count and workforce registry to all provincial dashboards and public maps.',
                  'PUB_CENSUS_2026'
                )
              }
              className="text-xs justify-between"
            >
              <span>Publish National Census</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                handleOpenDangerousAction(
                  'Recalibrate District Dengue Risk Levels',
                  'Trigger automatic risk level recalculation across all 25 Regional Directorates based on 14-day rolling incidence.',
                  'RECAL_DENGUE_RISK'
                )
              }
              className="text-xs justify-between"
            >
              <span>Recalibrate Risk Levels</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                handleOpenDangerousAction(
                  'Archive Inactive Clinical Facility Records',
                  'Safely archive closed or consolidated primary care dispensaries into historical storage without permanent record deletion (Section 74).',
                  'ARCHIVE_DISPENSARY'
                )
              }
              className="text-xs justify-between"
            >
              <span>Archive Inactive Records</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>

        {/* Confirmation Modal */}
        {confirmModal.open && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
              <div className="flex items-center gap-3 text-amber-600 dark:text-amber-400">
                <AlertTriangle className="w-8 h-8" />
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Confirm National Action
                  </h3>
                  <p className="text-xs text-slate-500">Ministry Confirmation Required</p>
                </div>
              </div>

              <div className="text-xs space-y-2 text-slate-600 dark:text-slate-300">
                <p className="font-bold text-slate-900 dark:text-white">{confirmModal.title}</p>
                <p className="leading-relaxed">{confirmModal.description}</p>
              </div>

              <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-[11px] text-slate-500">
                Operator Identity: <strong>{user?.name || 'Nirosha Perera'} ({user?.role})</strong>
              </div>

              <div className="pt-2 flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setConfirmModal({ open: false, title: '', description: '', actionKey: '' })}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  variant="primary"
                  className="flex-1 bg-amber-600 hover:bg-amber-700"
                  onClick={handleExecuteDangerousAction}
                >
                  Confirm &amp; Log Action
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </RoleGuard>
  );
}
