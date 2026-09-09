'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Lock, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/context/ToastContext';
import apiClient from '@/services/apiClient';
import Link from 'next/link';

export default function ResetPasswordPage() {
  const router = useRouter();
  const { toast } = useToast();
  
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    const token = sessionStorage.getItem('reset_token');
    if (!token) {
      router.push('/forgot-password');
    } else {
      setResetToken(token);
    }
  }, [router]);

  const validatePassword = (pass: string) => {
    if (pass.length < 12) return 'Password must be at least 12 characters long.';
    return '';
  };

  const getStrengthProgress = () => {
    let score = 0;
    if (newPassword.length >= 12) score += 25;
    if (/[A-Z]/.test(newPassword)) score += 25;
    if (/[a-z]/.test(newPassword)) score += 25;
    if (/[0-9!@#$%^&*]/.test(newPassword)) score += 25;
    return score;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const validationError = validatePassword(newPassword);
    if (validationError) {
      setError(validationError);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsLoading(true);

    try {
      await apiClient.post('/auth/reset-password', {
        resetToken,
        newPassword,
        confirmPassword
      });
      
      // Cleanup session state
      sessionStorage.removeItem('reset_token');
      sessionStorage.removeItem('reset_identifier');
      
      setIsSuccess(true);
      toast.success('Password Updated', 'Your password has been changed successfully.');
      
    } catch (err: any) {
      setError(err.response?.data?.message || 'Unable to reset password. The token may be expired.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-slate-900 text-slate-100 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-96 bg-gradient-to-b from-teal-500/10 to-transparent blur-3xl pointer-events-none" />
        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 relative z-10">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl shadow-2xl p-6 sm:p-10 backdrop-blur-md text-center space-y-6">
            <div className="w-16 h-16 bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-white">Password Reset Successful</h2>
              <p className="text-sm text-slate-400">
                Your password has been updated. For your security, existing sessions have been signed out.
              </p>
            </div>
            <Button
              variant="primary"
              size="lg"
              className="w-full"
              onClick={() => router.push('/login')}
            >
              Sign In to LankaCare
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-slate-900 text-slate-100 relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-96 bg-gradient-to-b from-teal-500/10 to-transparent blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-3 relative z-10">
        <div className="inline-flex items-center gap-2.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center text-white shadow-lg shadow-teal-900/50">
            <ShieldCheck className="w-7 h-7 stroke-[2.5]" />
          </div>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
          Create new password
        </h2>
        <p className="text-xs text-slate-400 max-w-xs mx-auto">
          Your new password must be at least 12 characters and different from previous passwords.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 relative z-10">
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl shadow-2xl p-6 sm:p-8 backdrop-blur-md space-y-6">
          
          {error && (
            <div className="p-3 rounded-lg bg-rose-950/60 border border-rose-800 text-rose-300 text-xs font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1">
              <Input
                label="New Password"
                type="password"
                placeholder="At least 12 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                leftIcon={<Lock className="w-4 h-4" />}
              />
              {newPassword && (
                <div className="pt-1 px-1">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Password Strength</span>
                    <span className="text-[10px] text-teal-400 font-semibold">{getStrengthProgress()}%</span>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-300 ${getStrengthProgress() < 50 ? 'bg-rose-500' : getStrengthProgress() < 100 ? 'bg-amber-400' : 'bg-teal-500'}`} 
                      style={{ width: `${getStrengthProgress()}%` }} 
                    />
                  </div>
                </div>
              )}
            </div>

            <Input
              label="Confirm Password"
              type="password"
              placeholder="Re-enter your new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              leftIcon={<Lock className="w-4 h-4" />}
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isLoading}
              className="w-full mt-2"
            >
              {isLoading ? 'Resetting...' : 'Reset Password'}
            </Button>
          </form>

          <div className="text-center pt-4 border-t border-slate-800 text-xs text-slate-500">
            Having trouble? <Link href="/contact" className="text-teal-400 hover:underline">Contact Support</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
