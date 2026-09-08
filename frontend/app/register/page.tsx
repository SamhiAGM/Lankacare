'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Activity, User, Mail, Phone, Lock, CreditCard, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    nic: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    const isNIC = /^[0-9]{9}[vVxX]|[0-9]{12}$/.test(formData.nic);
    if (!isNIC) {
      setError('Invalid NIC format. Use 9 digits + V or 12 digits.');
      return;
    }

    setError('');
    setIsLoading(true);
    try {
      await register({
        name: formData.name,
        nic: formData.nic,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
      });
      toast.success('Registration completed', 'Citizen Account Created');
      router.push('/citizen'); // Assuming the home URL for citizen is /citizen
    } catch (err: any) {
      setError(err.message || 'Failed to create account. Please check your information.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-slate-900 text-slate-100">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-2">
        <Link href="/" className="inline-flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-teal-600 flex items-center justify-center text-white">
            <Activity className="w-6 h-6" />
          </div>
        </Link>
        <h2 className="text-2xl font-bold tracking-tight text-white">
          Citizen Health Portal Registration
        </h2>
        <p className="text-xs text-slate-400">
          Create your digital citizen health profile to book appointments and track records.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl shadow-xl p-6 sm:p-8 space-y-5">
          {error && (
            <div className="p-3 rounded-lg bg-rose-950/60 border border-rose-800 text-rose-300 text-xs font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <Input
              label="Full Name (as on NIC)"
              placeholder="e.g. Sunil Wickramasinghe"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              leftIcon={<User className="w-4 h-4" />}
            />

            <Input
              label="National Identity Card (NIC) / Passport"
              placeholder="e.g. 198514203912 or 851420391V"
              value={formData.nic}
              onChange={(e) => setFormData({ ...formData, nic: e.target.value })}
              required
              leftIcon={<CreditCard className="w-4 h-4" />}
            />

            <Input
              label="Email Address"
              type="email"
              placeholder="sunil@example.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              leftIcon={<Mail className="w-4 h-4" />}
            />

            <Input
              label="Mobile Number (for SMS confirmation)"
              placeholder="+94 77 234 5678"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              required
              leftIcon={<Phone className="w-4 h-4" />}
            />

            <Input
              label="Password"
              type="password"
              placeholder="Minimum 8 characters"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
              leftIcon={<Lock className="w-4 h-4" />}
            />

            <Input
              label="Confirm Password"
              type="password"
              placeholder="Re-enter password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              required
              leftIcon={<Lock className="w-4 h-4" />}
            />

            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                isLoading={isLoading}
                className="w-full"
              >
                Create Digital Health Profile <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </form>

          <div className="text-center text-xs text-slate-400 pt-2 border-t border-slate-800">
            Already registered?{' '}
            <Link href="/login" className="text-teal-400 font-bold hover:underline">
              Sign In to your account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
