'use client';

import React from 'react';
import Link from 'next/link';
import { Activity, CheckCircle2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-slate-900 text-slate-100">
      <div className="sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl shadow-xl p-8 text-center space-y-4">
          <div className="w-14 h-14 rounded-full bg-emerald-950/60 border border-emerald-800 text-emerald-400 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-white">Email Address Verified</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            Your official Ministry of Health digital profile has been verified successfully. You can now access all clinical and administrative portals.
          </p>
          <div className="pt-3">
            <Link href="/login">
              <Button variant="primary" size="lg" className="w-full">
                Proceed to Sign In <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
