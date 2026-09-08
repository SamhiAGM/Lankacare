'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Activity, Lock, ArrowRight, UserCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { UserRole } from '@/types';

import { getRoleHomeUrl } from '@/lib/rbac';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const { toast } = useToast();

  const [nic, setNic] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCitizenLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nic || !password) {
      setError('Please enter your National Identity Card (NIC) number and password');
      return;
    }

    const isNIC = /^[0-9]{9}[vVxX]|[0-9]{12}$/.test(nic);
    if (!isNIC) {
      setError('Invalid NIC format. Use 9 digits + V or 12 digits.');
      return;
    }

    setError('');
    setIsLoading(true);
    try {
      await login(nic, password);
      toast.success('Signed in successfully', 'Welcome to Citizen Portal');
      router.push(getRoleHomeUrl(UserRole.CITIZEN));
    } catch (err: any) {
      setError(err.message || 'Invalid NIC or password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-slate-900 text-slate-100 relative overflow-hidden">
      {/* Subtle Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-96 bg-gradient-to-b from-teal-500/10 to-transparent blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-3 relative z-10">
        <Link href="/" className="inline-flex items-center gap-2.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center text-white shadow-lg shadow-teal-900/50">
            <Activity className="w-7 h-7 stroke-[2.5]" />
          </div>
        </Link>
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
          Ministry of Health
        </h2>
        <p className="text-xs text-slate-400 max-w-xs mx-auto">
          Centralized Digital Health Coordination Portal • Democratic Socialist Republic of Sri Lanka
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-2xl px-4 relative z-10">
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl shadow-2xl p-6 sm:p-8 backdrop-blur-md space-y-6">
          
          {error && (
            <div className="p-3 rounded-lg bg-rose-950/60 border border-rose-800 text-rose-300 text-xs font-medium">
              {error}
            </div>
          )}

          <div className="space-y-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="text-center space-y-2 pb-2">
              <h3 className="text-lg font-semibold text-white">Citizen Portal Access</h3>
              <p className="text-xs text-slate-400">
                Please enter your National Identity Card (NIC) number and password to view your health records, prescriptions, and appointments.
              </p>
            </div>

            <form onSubmit={handleCitizenLogin} className="space-y-4">
              <Input
                label="National Identity Card (NIC)"
                type="text"
                placeholder="e.g. 199012345678 or 901234567V"
                value={nic}
                onChange={(e) => setNic(e.target.value)}
                required
                leftIcon={<UserCircle2 className="w-4 h-4" />}
              />

              <Input
                label="Password"
                type="password"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                leftIcon={<Lock className="w-4 h-4" />}
              />

              <Button
                type="submit"
                variant="primary"
                size="lg"
                isLoading={isLoading}
                className="w-full"
              >
                Access Citizen Portal <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </form>

            <div className="text-center text-xs text-slate-400 pt-2 border-t border-slate-800 mt-6 pt-4">
              Are you a citizen without an account?{' '}
              <Link href="/register" className="text-teal-400 font-bold hover:underline">
                Register with National ID
              </Link>
            </div>
          </div>
        </div>

        {/* Government Disclaimer */}
        <p className="mt-6 text-center text-[11px] text-slate-500">
          Authorized personnel only. All access attempts are monitored and recorded under the Computer Crime Act No. 24 of 2007.
        </p>
      </div>
    </div>
  );
}
