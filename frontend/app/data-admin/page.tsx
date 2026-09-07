'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Database, Layers, CheckCircle2, AlertTriangle, ArrowRight,
  ShieldCheck, RefreshCw, FileText, UploadCloud, RotateCcw,
  Clock, GitPullRequest, Lock
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { RoleGuard } from '@/components/auth/RoleGuard';
import { UserRole } from '@/types';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useToast } from '@/context/ToastContext';
import { auditLogService } from '@/services/apiClient';

interface DatasetItem {
  id: string;
  source: string;
  filename: string;
  recordsCount: number;
  status: 'STAGED' | 'VALIDATED' | 'APPROVED' | 'ROLLED_BACK';
  version: string;
  importDate: string;
  validationScore: number;
}

export default function DataAdminPortalPage() {
  const { user } = useAuth();
  const { toast } = useToast();

  const [datasets, setDatasets] = useState<DatasetItem[]>([
    {
      id: 'ds-01',
      source: 'Medical Statistics Unit (MSU) Colombo',
      filename: 'Sri_Lanka_Bed_Census_2025_Final.csv',
      recordsCount: 642,
      status: 'APPROVED',
      version: 'v2025.1.0',
      importDate: '2026-08-20',
      validationScore: 99.4,
    },
    {
      id: 'ds-02',
      source: 'Epidemiology Unit Sri Lanka',
      filename: 'WER_Dengue_Epidemiology_W35_2026.json',
      recordsCount: 1240,
      status: 'VALIDATED',
      version: 'v2026.35.0',
      importDate: '2026-09-05',
      validationScore: 98.8,
    },
    {
      id: 'ds-03',
      source: 'Regional Directorate Trincomalee (RDHS)',
      filename: 'Kinniya_Hospital_Inventory_Batches.csv',
      recordsCount: 88,
      status: 'STAGED',
      version: 'v2026.09.1',
      importDate: '2026-09-07',
      validationScore: 96.2,
    },
  ]);

  const handleValidate = (id: string) => {
    setDatasets((prev) =>
      prev.map((d) => (d.id === id ? { ...d, status: 'VALIDATED' } : d))
    );
    toast.success('Validation Complete', 'No coordinate or duplicate anomalies detected.');
  };

  const handleRollback = (id: string, version: string) => {
    setDatasets((prev) =>
      prev.map((d) => (d.id === id ? { ...d, status: 'ROLLED_BACK' } : d))
    );
    auditLogService.log(
      'DATASET_ROLLED_BACK',
      'HOSPITAL',
      id,
      `Dataset ${version} rolled back by Data Admin ${user?.name || 'Saman Jayasuriya'}`
    );
    toast.success(`Dataset ${version} Rolled Back`, 'System restored to prior verified state.');
  };

  return (
    <RoleGuard allowedRoles={[UserRole.DATA_ADMIN, UserRole.SUPER_ADMIN, UserRole.MINISTRY_ADMIN]}>
      <div className="space-y-6 pb-12">
        {/* Header */}
        <div className="p-6 rounded-3xl bg-slate-900 text-white border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-blue-500/20 text-blue-400">
                <Database className="w-5 h-5" />
              </span>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
                National Health Data Ingestion Pipeline
              </h1>
              <Badge variant="teal">Medical Statistics Unit (MSU)</Badge>
            </div>
            <p className="text-xs text-slate-400">
              {user?.name || 'Saman Jayasuriya'} • National Health Data Pipeline • Scope: Central Repositories
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link href="/admin/data-quality">
              <Button variant="primary" size="sm" className="gap-1.5 text-xs font-semibold">
                <ShieldCheck className="w-4 h-4" /> Data Quality Intelligence
              </Button>
            </Link>
            <Link href="/admin/data">
              <Button variant="outline" size="sm" className="text-xs bg-slate-800 text-slate-200 border-slate-700">
                Import CSV / JSON
              </Button>
            </Link>
          </div>
        </div>

        {/* Section 66 Data Pipeline Scope Notice */}
        <div className="p-4 rounded-2xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/40 text-xs text-blue-900 dark:text-blue-200 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-blue-600 shrink-0" />
            <span>
              <strong>Section 66 Pipeline Protocol:</strong> Data administrators ingest, validate, deduplicate, and stage datasets. Publishing sensitive official national datasets requires Ministry approval before going live to public maps.
            </span>
          </div>
          <Badge variant="outline">PIPELINE_GUARD</Badge>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <span className="text-xs text-slate-500">Official Data Sources</span>
            <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">4</p>
            <span className="text-[11px] text-teal-600 font-medium">MSU, Epi Unit, NMRA, NBTS</span>
          </div>
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <span className="text-xs text-slate-500">Average Quality Score</span>
            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">98.1%</p>
            <span className="text-[11px] text-emerald-600 font-medium">Zero Spatial Collisions</span>
          </div>
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <span className="text-xs text-slate-500">Staged for Review</span>
            <p className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">1</p>
            <span className="text-[11px] text-amber-600 font-medium">Kinniya Depot Batches</span>
          </div>
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <span className="text-xs text-slate-500">Rollback Restores</span>
            <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">0</p>
            <span className="text-[11px] text-slate-500">Past 30 Days Clean</span>
          </div>
        </div>

        {/* Pipeline Datasets Table */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Layers className="w-5 h-5 text-blue-600" />
                Ingested Datasets &amp; Validation Versions
              </h2>
              <p className="text-xs text-slate-500">
                Data pipeline records from official Sri Lankan health authorities.
              </p>
            </div>
            <Badge variant="teal">Auto-Deduplication</Badge>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3">Source &amp; Dataset</th>
                  <th className="px-4 py-3">Version</th>
                  <th className="px-4 py-3">Records</th>
                  <th className="px-4 py-3">Quality Score</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {datasets.map((d) => (
                  <tr key={d.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <td className="px-4 py-3 space-y-0.5">
                      <p className="font-bold text-slate-900 dark:text-white">{d.source}</p>
                      <p className="font-mono text-[11px] text-slate-500">{d.filename}</p>
                    </td>
                    <td className="px-4 py-3 font-mono font-medium text-slate-700 dark:text-slate-300">
                      {d.version}
                    </td>
                    <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">
                      {d.recordsCount}
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-mono font-bold text-teal-600 dark:text-teal-400">
                        {d.validationScore}%
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        variant={
                          d.status === 'APPROVED'
                            ? 'teal'
                            : d.status === 'VALIDATED'
                            ? 'blue'
                            : d.status === 'ROLLED_BACK'
                            ? 'danger'
                            : 'amber'
                        }
                      >
                        {d.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {d.status === 'STAGED' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleValidate(d.id)}
                            className="text-xs"
                          >
                            Validate
                          </Button>
                        )}
                        {d.status === 'APPROVED' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRollback(d.id, d.version)}
                            className="text-xs text-rose-600 dark:text-rose-400"
                          >
                            Rollback
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </RoleGuard>
  );
}
