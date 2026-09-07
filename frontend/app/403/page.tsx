'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShieldAlert, ArrowLeft, Home, Mail, Lock, Building2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { getRoleHomeUrl } from '@/lib/rbac';
import { Button } from '@/components/ui/Button';

export default function AccessDeniedPage() {
  const router = useRouter();
  const { user } = useAuth();
  const homeUrl = user ? getRoleHomeUrl(user.role) : '/login';

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-xl shadow-slate-900/5 text-center">
        {/* Warning Icon Badge */}
        <div className="w-20 h-20 mx-auto rounded-3xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/60 flex items-center justify-center text-rose-600 dark:text-rose-400 mb-6 shadow-inner">
          <ShieldAlert className="w-10 h-10" />
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 text-xs font-bold tracking-wider uppercase mb-3">
          <Lock className="w-3.5 h-3.5" />
          HTTP 403 • Access Restricted
        </div>

        <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
          Access Restricted
        </h1>

        <p className="mt-3 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
          You do not have permission to access this healthcare system, facility, or clinical record. LankaCare enforces strict role-based and geographic least-privilege security.
        </p>

        {user && (
          <div className="mt-5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 text-left text-xs space-y-1 text-slate-600 dark:text-slate-300">
            <div className="flex items-center justify-between font-semibold text-slate-800 dark:text-slate-200">
              <span>Active Account</span>
              <span className="text-teal-600 dark:text-teal-400">{user.name}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Role</span>
              <span className="font-mono bg-slate-200 dark:bg-slate-700 px-1.5 py-0.5 rounded text-[11px]">
                {user.role}
              </span>
            </div>
            {user.organization && (
              <div className="flex items-center gap-1.5 pt-1 text-[11px] text-slate-500 truncate">
                <Building2 className="w-3 h-3 shrink-0" />
                <span className="truncate">{user.organization}</span>
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-6 flex flex-col gap-2.5">
          <Link href={homeUrl} className="w-full">
            <Button variant="primary" className="w-full justify-center gap-2">
              <Home className="w-4 h-4" />
              Go to My Authorized Portal
            </Button>
          </Link>

          <Button
            variant="outline"
            onClick={() => router.back()}
            className="w-full justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </Button>

          <a
            href="mailto:dhis-support@health.gov.lk?subject=LankaCare Access Authorization Request"
            className="text-xs text-slate-500 hover:text-teal-600 dark:hover:text-teal-400 flex items-center justify-center gap-1.5 pt-2 transition-colors"
          >
            <Mail className="w-3.5 h-3.5" />
            Contact Ministry Healthcare Administrator
          </a>
        </div>
      </div>
    </div>
  );
}
