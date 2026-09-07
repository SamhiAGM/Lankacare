'use client';

import React from 'react';
import Link from 'next/link';
import {
  GitPullRequest, Building2, CheckCircle2, Clock, AlertCircle,
  ArrowRight, ShieldCheck, Lock, FileText
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { RoleGuard } from '@/components/auth/RoleGuard';
import { UserRole } from '@/types';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

export default function CitizenReferralsPage() {
  const { user } = useAuth();

  // Citizen's personal referral journey
  const myReferral = {
    id: 'ref-c701',
    refNumber: 'LK-REF-2026-0419',
    patientName: user?.name || 'Sunil Wickramasinghe',
    fromHospital: 'Base Hospital Kinniya',
    toHospital: 'National Hospital of Sri Lanka (NHSL)',
    department: 'Cardiology (Specialized Cardiac Catheterization)',
    submittedDate: '2026-09-02',
    currentStatus: 'ACCEPTED',
    assignedAppointmentDate: '2026-09-28',
    assignedClinicSlot: '10:00 AM, Room 4B',
    steps: [
      {
        title: 'Referral Submitted',
        date: '2026-09-02 • 10:15 AM',
        desc: 'Submitted by Medical Officer, Base Hospital Kinniya ETU',
        done: true,
      },
      {
        title: 'Received by Receiving Facility',
        date: '2026-09-02 • 11:30 AM',
        desc: 'Cardiology Intake Desk, National Hospital of Sri Lanka',
        done: true,
      },
      {
        title: 'Clinical Triaged & Accepted',
        date: '2026-09-03 • 02:45 PM',
        desc: 'Specialist consultant reviewed urgency and authorized transfer queue',
        done: true,
      },
      {
        title: 'Clinic Appointment Scheduled',
        date: '2026-09-04 • 09:00 AM',
        desc: 'Session assigned: 2026-09-28 at 10:00 AM',
        done: true,
      },
      {
        title: 'Specialist Review & Case Completion',
        date: 'Pending attendance',
        desc: 'Follow-up consultation and discharge disposition',
        done: false,
      },
    ],
  };

  return (
    <RoleGuard allowedRoles={[UserRole.CITIZEN, UserRole.SUPER_ADMIN, UserRole.MINISTRY_ADMIN]}>
      <div className="space-y-6 max-w-4xl mx-auto pb-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                My Inter-Hospital Referrals
              </h1>
              <Badge variant="teal">Personal Tracking Only</Badge>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Live status progression of your referral between Sri Lankan public healthcare facilities.
            </p>
          </div>
          <Link href="/citizen">
            <Button variant="outline" size="sm">
              ← Return to Citizen Portal
            </Button>
          </Link>
        </div>

        {/* Main Referral Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-slate-100 dark:border-slate-800">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm font-bold text-teal-600 dark:text-teal-400">
                  {myReferral.refNumber}
                </span>
                <Badge variant="teal">ACCEPTED &amp; SCHEDULED</Badge>
              </div>
              <p className="text-xs text-slate-500">
                Submitted on {myReferral.submittedDate}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-teal-50 dark:bg-teal-950/50 border border-teal-200 dark:border-teal-900/60 text-right sm:text-right">
              <p className="text-[11px] font-bold text-teal-800 dark:text-teal-300">Scheduled Date</p>
              <p className="text-sm font-extrabold text-teal-900 dark:text-white">
                {myReferral.assignedAppointmentDate}
              </p>
              <p className="text-[10px] text-teal-700 dark:text-teal-400">{myReferral.assignedClinicSlot}</p>
            </div>
          </div>

          {/* Transfer Route */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 text-xs">
            <div className="space-y-1">
              <span className="text-slate-400 uppercase font-semibold text-[10px]">Referring Origin Hospital:</span>
              <p className="font-bold text-slate-900 dark:text-white text-sm">{myReferral.fromHospital}</p>
              <p className="text-slate-500">Eastern Province, Trincomalee District</p>
            </div>
            <div className="space-y-1 sm:border-l sm:border-slate-200 sm:dark:border-slate-700/60 sm:pl-4">
              <span className="text-slate-400 uppercase font-semibold text-[10px]">Destination Specialty Center:</span>
              <p className="font-bold text-slate-900 dark:text-white text-sm">{myReferral.toHospital}</p>
              <p className="text-teal-600 dark:text-teal-400 font-medium">{myReferral.department}</p>
            </div>
          </div>

          {/* Progress Timeline (Section 79) */}
          <div className="space-y-4 pt-2">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Official Transfer Journey:
            </h3>

            <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 before:dark:bg-slate-800">
              {myReferral.steps.map((step, idx) => (
                <div key={idx} className="relative">
                  <div
                    className={`absolute -left-6 top-0.5 w-5 h-5 rounded-full flex items-center justify-center text-xs ${
                      step.done
                        ? 'bg-teal-600 text-white ring-4 ring-teal-100 dark:ring-teal-950'
                        : 'bg-slate-300 dark:bg-slate-700 text-slate-500'
                    }`}
                  >
                    {step.done ? '✓' : idx + 1}
                  </div>
                  <div>
                    <h4
                      className={`text-xs font-bold ${
                        step.done ? 'text-slate-900 dark:text-white' : 'text-slate-400'
                      }`}
                    >
                      {step.title}
                    </h4>
                    <p className="text-[11px] text-teal-600 dark:text-teal-400 font-mono mt-0.5">
                      {step.date}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Privacy Note: Section 79 */}
          <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 text-xs text-slate-500 flex items-start gap-2.5">
            <Lock className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
            <span>
              Section 79 Privacy Rule: For patient safety, clinical triage notes and internal doctor communications are restricted to attending physicians and are not exposed in the public tracking timeline.
            </span>
          </div>
        </div>
      </div>
    </RoleGuard>
  );
}
