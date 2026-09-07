'use client';

import React from 'react';
import Link from 'next/link';
import {
  Activity, Database, ShieldAlert, Cpu, HardDrive,
  RefreshCw, CheckCircle2, AlertTriangle, Lock, ShieldCheck,
  Server, KeyRound, Radio
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { RoleGuard } from '@/components/auth/RoleGuard';
import { UserRole } from '@/types';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

export default function SystemAdminPortalPage() {
  const { user } = useAuth();

  const services = [
    { name: 'Express API Server (Port 5000)', status: 'HEALTHY', latency: '24ms', uptime: '99.98%' },
    { name: 'MongoDB Replica Primary', status: 'HEALTHY', latency: '4ms', uptime: '100%' },
    { name: 'JWT Auth & Refresh Vault', status: 'HEALTHY', latency: '12ms', uptime: '99.99%' },
    { name: '1990 Suwa Seriya Telemetry Bus', status: 'ONLINE', latency: '68ms', uptime: '99.95%' },
    { name: 'NMRA Master Drug Registry Sync', status: 'ONLINE', latency: '110ms', uptime: '99.80%' },
    { name: 'Epidemiology Unit Geo-Feed', status: 'HEALTHY', latency: '45ms', uptime: '99.90%' },
  ];

  const securityEvents = [
    {
      time: '10 mins ago',
      type: 'BREAK_GLASS_ACCESS',
      actor: 'Dr. Amara Bandara',
      target: 'Patient Emergency Record (pat-005)',
      status: 'VERIFIED_AUDITED',
    },
    {
      time: '32 mins ago',
      type: 'CROSS_SCOPE_REJECTED',
      actor: 'Hospital Admin Kinniya',
      target: 'HOSPITAL_B_PATIENTS (403 Blocked)',
      status: 'BLOCKED_BY_RBAC',
    },
    {
      time: '1 hour ago',
      type: 'ROLE_MODIFIED',
      actor: 'Ministry Admin Nirosha Perera',
      target: 'User Dr. Ruwan Gunawardana -> DISTRICT_ADMIN',
      status: 'AUDITED',
    },
  ];

  return (
    <RoleGuard allowedRoles={[UserRole.SUPER_ADMIN]}>
      <div className="space-y-6 pb-12">
        {/* Header */}
        <div className="p-6 rounded-3xl bg-slate-900 text-white border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-purple-500/20 text-purple-400">
                <Server className="w-5 h-5" />
              </span>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
                System Administrator Operations &amp; Infrastructure
              </h1>
              <Badge variant="teal">Super Admin Root</Badge>
            </div>
            <p className="text-xs text-slate-400">
              {user?.name || 'Dinesh Alahakoon'} • Information Infrastructure &amp; Cybersecurity Division • Ministry of Health
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link href="/admin/permissions">
              <Button variant="primary" size="sm" className="gap-1.5 text-xs bg-purple-600 hover:bg-purple-700 font-semibold">
                <ShieldCheck className="w-4 h-4" /> Permission Audit Trail
              </Button>
            </Link>
            <Link href="/settings">
              <Button variant="outline" size="sm" className="text-xs bg-slate-800 text-slate-200 border-slate-700">
                System Configuration
              </Button>
            </Link>
          </div>
        </div>

        {/* Section 67 & 93 Strict Separation of Tech Admin vs Medical Data */}
        <div className="p-4 rounded-2xl bg-rose-50/60 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 text-xs text-rose-900 dark:text-rose-200 flex items-start gap-3">
          <Lock className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="space-y-1 leading-relaxed">
            <span className="font-bold uppercase tracking-wider">
              Section 67 Critical Privacy Rule: Technical Admin ≠ Clinical Access
            </span>
            <p>
              System Administrators supervise infrastructure, server telemetry, API gateways, database health, and security logs. System Administrators are <strong>strictly forbidden</strong> from querying or inspecting individual patient medical charts, clinical consultation notes, or private blood group dossiers. Least privilege is cryptographically enforced.
            </p>
          </div>
        </div>

        {/* System Infrastructure Telemetry Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <span className="text-xs text-slate-500">API Gateway Status</span>
            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">Operational</p>
            <span className="text-[11px] text-slate-500">Average latency: 24ms</span>
          </div>
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <span className="text-xs text-slate-500">Database Engine</span>
            <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">MongoDB 8.0</p>
            <span className="text-[11px] text-teal-600 font-medium">3-Node Replica Connected</span>
          </div>
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <span className="text-xs text-slate-500">Active Token Sessions</span>
            <p className="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-1">324</p>
            <span className="text-[11px] text-slate-500">0 Compromised Sessions</span>
          </div>
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <span className="text-xs text-slate-500">Security Violations Blocked</span>
            <p className="text-2xl font-bold text-rose-600 dark:text-rose-400 mt-1">12</p>
            <span className="text-[11px] text-rose-600 font-medium">Cross-Scope Attempts Denied</span>
          </div>
        </div>

        {/* Server & Integration Statuses */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-teal-600" />
              API Gateway &amp; Integration Health Matrix
            </h2>
            <Badge variant="teal">Real-Time Heartbeat</Badge>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3">Service / Component</th>
                  <th className="px-4 py-3">Latency</th>
                  <th className="px-4 py-3">30-Day Uptime</th>
                  <th className="px-4 py-3">Health Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {services.map((srv, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <td className="px-4 py-3 font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                      <Radio className="w-3.5 h-3.5 text-emerald-500" />
                      {srv.name}
                    </td>
                    <td className="px-4 py-3 font-mono text-slate-600 dark:text-slate-300">{srv.latency}</td>
                    <td className="px-4 py-3 font-mono font-bold text-teal-600">{srv.uptime}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold text-[10px]">
                        {srv.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Security & Access Event Stream */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-purple-600" />
              Security Telemetry &amp; Access Control Stream
            </h2>
            <Link href="/admin/permissions">
              <span className="text-xs font-semibold text-teal-600 hover:underline">
                View Full Audit Ledger →
              </span>
            </Link>
          </div>

          <div className="space-y-2.5">
            {securityEvents.map((ev, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 flex items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-purple-600 dark:text-purple-400">
                      {ev.type}
                    </span>
                    <span className="text-[10px] text-slate-400">• {ev.time}</span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300">
                    Actor: <span className="font-semibold text-slate-900 dark:text-white">{ev.actor}</span> → Target: {ev.target}
                  </p>
                </div>
                <Badge
                  variant={
                    ev.status === 'BLOCKED_BY_RBAC'
                      ? 'danger'
                      : ev.status === 'VERIFIED_AUDITED'
                      ? 'amber'
                      : 'teal'
                  }
                >
                  {ev.status}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      </div>
    </RoleGuard>
  );
}
