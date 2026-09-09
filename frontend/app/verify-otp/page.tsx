'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Activity, ArrowRight, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/context/ToastContext';
import apiClient from '@/services/apiClient';

export default function VerifyOtpPage() {
  const router = useRouter();
  const { toast } = useToast();
  
  const [identifier, setIdentifier] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState('');
  
  const [countdown, setCountdown] = useState(300); // 5 minutes
  const [resendCooldown, setResendCooldown] = useState(60); // 60 seconds
  
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    const savedIdentifier = sessionStorage.getItem('reset_identifier');
    if (!savedIdentifier) {
      router.push('/forgot-password');
    } else {
      setIdentifier(savedIdentifier);
    }
  }, [router]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(c => c - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) {
      // Handle paste
      const pastedOtp = value.slice(0, 6).split('');
      const newOtp = [...otp];
      for (let i = 0; i < pastedOtp.length; i++) {
        if (index + i < 6 && /^\d+$/.test(pastedOtp[i])) {
          newOtp[index + i] = pastedOtp[i];
        }
      }
      setOtp(newOtp);
      // Focus the next empty input or the last one
      const nextEmptyIndex = newOtp.findIndex(v => v === '');
      if (nextEmptyIndex !== -1 && inputRefs.current[nextEmptyIndex]) {
        inputRefs.current[nextEmptyIndex]?.focus();
      } else if (inputRefs.current[5]) {
        inputRefs.current[5]?.focus();
      }
      return;
    }

    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-advance
    if (value && index < 5 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const newOtp = [...otp];
      newOtp[index - 1] = '';
      setOtp(newOtp);
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    
    setIsResending(true);
    setError('');
    
    try {
      await apiClient.post('/auth/forgot-password', { identifier });
      toast.success('Code Resent', 'A new verification code has been sent.');
      setCountdown(300);
      setResendCooldown(60);
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Unable to resend code.');
    } finally {
      setIsResending(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpValue = otp.join('');
    
    if (otpValue.length !== 6) {
      setError('Please enter the complete 6-digit code.');
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      const res = await apiClient.post('/auth/verify-password-reset-otp', {
        identifier,
        otp: otpValue
      });
      
      sessionStorage.setItem('reset_token', res.data.resetToken);
      toast.success('Identity Verified', 'You can now reset your password.');
      router.push('/reset-password');
      
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid verification code.');
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-slate-900 text-slate-100 relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-96 bg-gradient-to-b from-teal-500/10 to-transparent blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-3 relative z-10">
        <div className="inline-flex items-center gap-2.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center text-white shadow-lg shadow-teal-900/50">
            <Activity className="w-7 h-7 stroke-[2.5]" />
          </div>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
          Verify your identity
        </h2>
        <p className="text-xs text-slate-400 max-w-xs mx-auto">
          We've sent a 6-digit code to your registered contact method.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 relative z-10">
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl shadow-2xl p-6 sm:p-8 backdrop-blur-md space-y-6">
          
          {error && (
            <div className="p-3 rounded-lg bg-rose-950/60 border border-rose-800 text-rose-300 text-xs font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex justify-between gap-2 max-w-xs mx-auto">
              {otp.map((digit, idx) => (
                <input
                  key={idx}
                  ref={(el) => { inputRefs.current[idx] = el; }}
                  type="text"
                  inputMode="numeric"
                  pattern="\d*"
                  maxLength={6} // allow paste
                  value={digit}
                  onChange={(e) => handleOtpChange(idx, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(idx, e)}
                  className="w-12 h-14 text-center text-xl font-bold bg-slate-950 border border-slate-800 rounded-xl focus:border-teal-500 focus:ring-1 focus:ring-teal-500 text-white transition-all outline-none"
                />
              ))}
            </div>
            
            <div className="text-center">
              <span className={`text-xs font-medium ${countdown > 60 ? 'text-slate-400' : 'text-amber-500 animate-pulse'}`}>
                Code expires in {formatTime(countdown)}
              </span>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isLoading}
              className="w-full"
              disabled={countdown === 0}
            >
              {isLoading ? 'Verifying...' : 'Verify Code'}
            </Button>
          </form>

          <div className="text-center pt-4 border-t border-slate-800 space-y-4">
            <div className="text-sm text-slate-400">
              Didn't receive the code?{' '}
              <button
                type="button"
                onClick={handleResend}
                disabled={resendCooldown > 0 || isResending}
                className="text-teal-400 font-medium hover:text-teal-300 disabled:text-slate-600 disabled:cursor-not-allowed transition-colors"
              >
                {isResending ? 'Resending...' : resendCooldown > 0 ? `Resend in ${formatTime(resendCooldown)}` : 'Resend OTP'}
              </button>
            </div>

            <Link 
              href="/forgot-password" 
              className="inline-flex items-center text-sm font-medium text-slate-400 hover:text-teal-400 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-1.5" />
              Use a different contact method
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
