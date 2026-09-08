'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Activity, ShieldCheck, Lock, Mail, ArrowRight, UserCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { useAuth, DEMO_ACCOUNTS } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { UserRole } from '@/types';

import { getRoleHomeUrl } from '@/lib/rbac';

export default function LoginPage() {
  const router = useRouter();
  const { login, loginAsDemo } = useAuth();
  const { toast } = useToast();

  const [nic, setNic] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showStaffLogin, setShowStaffLogin] = useState(false);

  const handleCitizenLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nic || !password) {
      setError('Please enter your National Identity Card (NIC) number and password');
      return;
    }
    setError('');
    setIsLoading(true);
    try {
      // Pass the NIC and password to login
      await login(nic, password);
      toast.success('Signed in successfully', 'Welcome to Citizen Portal');
      router.push(getRoleHomeUrl(UserRole.CITIZEN));
    } catch {
      setError('Invalid NIC or password');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStandardLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter your email and password');
      return;
    }
    setError('');
    setIsLoading(true);
    try {
      await login(email, password);
      toast.success('Signed in successfully', 'Welcome back');
      // Matched account check or default to citizen
      const matched = Object.values(DEMO_ACCOUNTS).find(
        (acc) => acc.email.toLowerCase() === email.toLowerCase()
      );
      const targetRole = matched ? matched.role : UserRole.CITIZEN;
      router.push(getRoleHomeUrl(targetRole));
    } catch {
      setError('Invalid credentials');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = (role: UserRole) => {
    loginAsDemo(role);
    const roleName = role.replace('_', ' ');
    toast.success(`Logged in as ${roleName}`, 'Dedicated Portal Redirect');
    router.push(getRoleHomeUrl(role));
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

          {!showStaffLogin ? (
            // Citizen NIC Login View
            <div className="space-y-6 animate-in fade-in zoom-in-95 duration-200">
              <div className="text-center space-y-2 pb-2">
                <h3 className="text-lg font-semibold text-white">Citizen Portal Access</h3>
                <p className="text-xs text-slate-400">
                  Please enter your National Identity Card (NIC) number to view your health records, prescriptions, and appointments.
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

              <div className="text-center text-xs text-slate-400 pt-2 border-t border-slate-800 mt-6">
                Are you a citizen without an account?{' '}
                <Link href="/register" className="text-teal-400 font-bold hover:underline">
                  Register with National ID / PHN
                </Link>
              </div>

              <div className="flex justify-center pt-4">
                <button 
                  onClick={() => setShowStaffLogin(true)}
                  className="text-[11px] text-slate-500 hover:text-slate-300 font-medium tracking-wide flex items-center gap-1.5 transition-colors"
                >
                  <Lock className="w-3 h-3" /> Authorized Personnel / Staff Login
                </button>
              </div>
            </div>
          ) : (
            // Staff & Demo Login View
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <Lock className="w-4 h-4 text-teal-400" /> Authorized Personnel Portal
                </h3>
                <button 
                  onClick={() => setShowStaffLogin(false)}
                  className="text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-lg transition-colors"
                >
                  Return to Citizen Login
                </button>
              </div>

              {/* Quick Demo Sign-In Selector */}
              <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700/80 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-teal-400 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4" /> 1-Click Role-Based Portal Access
                  </span>
                  <Badge variant="teal">Demo Only</Badge>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Select any role to experience its dedicated, separate system portal:
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
                  {[
                    { role: UserRole.CITIZEN, label: 'Citizen Portal', desc: '/citizen' },
                    { role: UserRole.DOCTOR, label: 'Doctor Portal', desc: '/doctor' },
                    { role: UserRole.NURSE, label: 'Nurse / Staff', desc: '/staff' },
                    { role: UserRole.PHARMACIST, label: 'Pharmacist', desc: '/pharmacist' },
                    { role: UserRole.HOSPITAL_ADMIN, label: 'Hospital Admin', desc: '/hospital-admin' },
                    { role: UserRole.DISTRICT_ADMIN, label: 'District Officer', desc: '/district-officer' },
                    { role: UserRole.PROVINCIAL_ADMIN, label: 'Provincial Officer', desc: '/provincial-officer' },
                    { role: UserRole.MINISTRY_OFFICER, label: 'Ministry Officer', desc: '/ministry' },
                    { role: UserRole.MINISTRY_ADMIN, label: 'Ministry Admin', desc: '/ministry-admin' },
                    { role: UserRole.DATA_ADMIN, label: 'Data Admin', desc: '/data-admin' },
                    { role: UserRole.SUPER_ADMIN, label: 'System Admin', desc: '/system-admin' },
                  ].map((item) => (
                    <button
                      key={item.role}
                      type="button"
                      onClick={() => handleDemoLogin(item.role)}
                      className="p-2.5 rounded-xl bg-slate-900 border border-slate-700/80 hover:border-teal-500 hover:bg-slate-800/80 text-left transition-all group cursor-pointer"
                    >
                      <p className="text-xs font-bold text-white group-hover:text-teal-400 transition-colors">
                        {item.label}
                      </p>
                      <p className="text-[10px] text-slate-500 mt-0.5 truncate">{item.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="relative flex items-center justify-center">
                <div className="border-t border-slate-800 w-full" />
                <span className="bg-slate-900 px-3 text-[11px] text-slate-500 font-medium uppercase tracking-wider shrink-0">
                  Or Sign In With Email
                </span>
                <div className="border-t border-slate-800 w-full" />
              </div>

              {/* Standard Form */}
              <form onSubmit={handleStandardLogin} className="space-y-4">
                <Input
                  label="Official Email Address"
                  type="email"
                  placeholder="e.g. admin@health.gov.lk"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  leftIcon={<Mail className="w-4 h-4" />}
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

                <div className="flex items-center justify-between text-xs">
                  <label className="flex items-center gap-2 text-slate-400 cursor-pointer">
                    <input
                      type="checkbox"
                      defaultChecked
                      className="rounded border-slate-700 bg-slate-800 text-teal-600 focus:ring-teal-500"
                    />
                    Remember this terminal
                  </label>
                  <Link href="/forgot-password" className="text-teal-400 hover:underline">
                    Forgot password?
                  </Link>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  isLoading={isLoading}
                  className="w-full"
                >
                  Sign In to Portal <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </form>
            </div>
          )}
        </div>

        {/* Government Disclaimer */}
        <p className="mt-6 text-center text-[11px] text-slate-500">
          Authorized personnel only. All access attempts are monitored and recorded under the Computer Crime Act No. 24 of 2007.
        </p>
      </div>
    </div>
  );
}

