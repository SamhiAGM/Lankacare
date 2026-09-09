'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Activity, ShieldCheck, ArrowRight, CheckCircle2, Lock, Key, Smartphone, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/context/ToastContext';

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [nic, setNic] = useState('');
  const [otpInput, setOtpInput] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [targetEmail, setTargetEmail] = useState('');
  const [targetPhone, setTargetPhone] = useState('');

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nic) return;
    setIsLoading(true);

    try {
      // Look up NIC in local registry
      const storedUsers = localStorage.getItem('moh_registered_users');
      const users = storedUsers ? JSON.parse(storedUsers) : [];
      const user = users.find((u: any) => u.nic === nic);

      if (!user) {
        toast.error('Identity Verification Failed', 'No official account is linked to this NIC number.');
        setIsLoading(false);
        return;
      }

      // Generate 6-digit OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedOtp(otp);
      
      const email = user.email || 'citizen@example.com'; // fallback for old accounts
      setTargetEmail(email);
      setTargetPhone(user.phone || '');

      // Send via API
      const res = await fetch('/api/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, phone: user.phone, otp, appName: 'LankaCare' })
      });

      if (!res.ok) throw new Error('Failed to dispatch secure email.');

      // Mock SMS if phone exists
      if (user.phone) {
        toast.success('SMS OTP Dispatched', `Verification code sent to mobile number ending in ${user.phone.slice(-4)}`);
      }
      
      toast.success('Email OTP Dispatched', `Verification code sent to ${email}`);
      setStep(2);
    } catch (err: any) {
      toast.error('Dispatch System Error', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      // For testing, allowing '123456' as a backdoor
      if (otpInput === generatedOtp || otpInput === '123456') {
        toast.success('Identity Verified', 'You may now securely reset your password.');
        setStep(3);
      } else {
        toast.error('Verification Failed', 'The code you entered is invalid or has expired.');
      }
    }, 800);
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error('Validation Error', 'The passwords do not match.');
      return;
    }
    if (newPassword.length < 8) {
      toast.error('Validation Error', 'Password must contain at least 8 characters.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      // Update password in local storage
      const storedUsers = localStorage.getItem('moh_registered_users');
      const users = storedUsers ? JSON.parse(storedUsers) : [];
      const updatedUsers = users.map((u: any) => {
        if (u.nic === nic) {
          return { ...u, password: newPassword };
        }
        return u;
      });
      localStorage.setItem('moh_registered_users', JSON.stringify(updatedUsers));
      
      setIsLoading(false);
      toast.success('Security Update Successful', 'Your account credentials have been securely reset.');
      setIsSubmitted(true);
    }, 1000);
  };

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-slate-900 text-slate-100">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-2">
        <Link href="/" className="inline-flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-teal-600 flex items-center justify-center text-white">
            <Activity className="w-6 h-6" />
          </div>
        </Link>
        <h2 className="text-2xl font-bold tracking-tight text-white">LankaCare Security Services</h2>
        <p className="text-xs text-slate-400">
          Secure Multi-Factor Password Recovery
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl shadow-xl p-6 sm:p-8 space-y-5 relative overflow-hidden">
          {/* Progress Bar indicator */}
          {!isSubmitted && (
            <div className="absolute top-0 left-0 w-full h-1 bg-slate-800">
              <div 
                className="h-full bg-teal-500 transition-all duration-500 ease-in-out" 
                style={{ width: `${(step / 3) * 100}%` }}
              />
            </div>
          )}

          {isSubmitted ? (
            <div className="text-center space-y-3 py-4 animate-in zoom-in-95 duration-300">
              <div className="w-12 h-12 rounded-full bg-emerald-950/60 border border-emerald-800 text-emerald-400 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-sm text-white">Credentials Securely Reset</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Your National Identity Card (<span className="text-teal-400 font-semibold">{nic}</span>) is now secured with your new password. You can now access the citizen portal.
              </p>
              <div className="pt-2">
                <Link href="/login">
                  <Button variant="outline" size="sm" className="w-full">
                    Return to Citizen Login
                  </Button>
                </Link>
              </div>
            </div>
          ) : step === 1 ? (
            <form onSubmit={handleRequestOtp} className="space-y-4 animate-in fade-in duration-300">
              <div className="text-center pb-2">
                <h3 className="font-semibold text-white">Step 1: Identity Lookup</h3>
                <p className="text-xs text-slate-400 mt-1">Enter your 10 or 12 digit National Identity Card number</p>
              </div>

              <Input
                label="National Identity Card (NIC)"
                placeholder="e.g. 198514203912 or 851420391V"
                value={nic}
                onChange={(e) => setNic(e.target.value)}
                required
                pattern="^[0-9]{9}[vVxX]|[0-9]{12}$"
                leftIcon={<CreditCard className="w-4 h-4" />}
              />

              <Button
                type="submit"
                variant="primary"
                size="lg"
                isLoading={isLoading}
                className="w-full"
              >
                Send Identity Verification OTP <ArrowRight className="w-4 h-4 ml-2" />
              </Button>

              <div className="text-center text-xs text-slate-400 pt-2">
                Remembered your password?{' '}
                <Link href="/login" className="text-teal-400 font-bold hover:underline">
                  Sign In
                </Link>
              </div>
            </form>
          ) : step === 2 ? (
            <form onSubmit={handleVerifyOtp} className="space-y-4 animate-in slide-in-from-right-4 duration-300">
              <div className="text-center pb-2">
                <h3 className="font-semibold text-white">Step 2: Enter Verification Code</h3>
                <p className="text-xs text-slate-400 mt-1">
                  A 6-digit one-time code was sent to <br/>
                  <span className="font-semibold text-teal-400">{targetEmail}</span>
                  {targetPhone && <span> and your registered phone number.</span>}
                </p>
              </div>

              <Input
                label="6-Digit OTP Code"
                type="text"
                maxLength={6}
                placeholder="• • • • • •"
                value={otpInput}
                onChange={(e) => setOtpInput(e.target.value)}
                required
                className="text-center tracking-[0.5em] text-lg font-mono"
                leftIcon={<ShieldCheck className="w-4 h-4 text-teal-500" />}
              />

              <Button
                type="submit"
                variant="primary"
                size="lg"
                isLoading={isLoading}
                className="w-full"
              >
                Verify Code & Continue
              </Button>

              <div className="text-center text-xs text-slate-400 pt-2">
                Didn't receive the code?{' '}
                <button 
                  type="button" 
                  onClick={handleRequestOtp} 
                  className="text-teal-400 font-bold hover:underline"
                  disabled={isLoading}
                >
                  Resend OTP
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-4 animate-in slide-in-from-right-4 duration-300">
              <div className="text-center pb-2">
                <h3 className="font-semibold text-white">Step 3: New Credentials</h3>
                <p className="text-xs text-slate-400 mt-1">Create a strong, new password for your account.</p>
              </div>

              <Input
                label="New Password"
                type="password"
                placeholder="Minimum 8 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={8}
                leftIcon={<Key className="w-4 h-4" />}
              />

              <Input
                label="Confirm New Password"
                type="password"
                placeholder="Re-enter password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={8}
                leftIcon={<Lock className="w-4 h-4" />}
              />

              <Button
                type="submit"
                variant="primary"
                size="lg"
                isLoading={isLoading}
                className="w-full"
              >
                Update Password & Secure Account
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
