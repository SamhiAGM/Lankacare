'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Activity, Mail, ArrowLeft, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/context/ToastContext';
import apiClient from '@/services/apiClient';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [identifier, setIdentifier] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier) {
      setError('Please enter your email or mobile number.');
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      const res = await apiClient.post('/auth/forgot-password', { identifier });
      
      // We always show success to prevent enumeration, as long as no rate limit / server error occurs
      toast.success(
        'Code Sent', 
        res.data?.message || 'If an account exists, a verification code will be sent.'
      );
      
      // We pass the identifier via query param or sessionStorage so verify page knows it
      sessionStorage.setItem('reset_identifier', identifier);
      router.push('/verify-otp');
      
    } catch (err: any) {
      setError(err.response?.data?.message || 'Unable to process your request. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-slate-900 text-slate-100 relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-96 bg-gradient-to-b from-teal-500/10 to-transparent blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-3 relative z-10">
        <Link href="/" className="inline-flex items-center gap-2.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center text-white shadow-lg shadow-teal-900/50">
            <Activity className="w-7 h-7 stroke-[2.5]" />
          </div>
        </Link>
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
          Forgot your password?
        </h2>
        <p className="text-xs text-slate-400 max-w-xs mx-auto">
          Enter your registered email address or Sri Lankan mobile number and we'll send you a verification code.
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
            <Input
              label="Email or Mobile Number"
              type="text"
              placeholder="e.g. user@example.com or 0771234567"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              required
              leftIcon={<Mail className="w-4 h-4" />}
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isLoading}
              className="w-full"
            >
              {isLoading ? 'Sending...' : (
                <>
                  Send verification code <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </form>

          <div className="text-center pt-4 border-t border-slate-800">
            <Link 
              href="/login" 
              className="inline-flex items-center text-sm font-medium text-slate-400 hover:text-teal-400 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-1.5" />
              Back to sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
