'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  User, Mail, Phone, Building2, Shield, Lock,
  CheckCircle2, Key, ShieldCheck, LogOut
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const { toast } = useToast();

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '+94 77 123 4567');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    setTimeout(() => {
      setIsUpdating(false);
      toast.success('User credentials and contact details saved', 'Profile Updated');
    }, 400);
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    toast.success('Password changed successfully', 'Security Token Renewed');
    setCurrentPassword('');
    setNewPassword('');
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-50 tracking-tight">
              User Profile & Identity Details
            </h1>
            <Badge variant="teal">{user?.role?.replace('_', ' ') || 'Citizen'}</Badge>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Official credentials registered with the Ministry of Health Electronic Directory.
          </p>
        </div>

        <Link href="/settings">
          <Button variant="outline" size="sm">
            Account Settings →
          </Button>
        </Link>
      </div>

      {/* User Card */}
      <Card className="p-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-teal-600 to-emerald-500 text-white flex items-center justify-center font-black text-3xl shadow-lg shadow-teal-900/30 shrink-0">
            {user?.name ? user.name[0] : 'U'}
          </div>
          <div className="space-y-1.5 flex-1">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">{user?.name}</h2>
              <Badge variant="emerald">Verified Active</Badge>
            </div>
            <p className="text-xs text-slate-500">{user?.email}</p>
            <p className="text-xs text-teal-600 dark:text-teal-400 font-semibold pt-1">
              {user?.organization || 'Ministry of Health — Sri Lanka'}
            </p>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Personal Details Form */}
        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
            <CardDescription>Update your registered phone number and legal name</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdateProfile} className="space-y-4 text-xs">
              <Input
                label="Full Legal Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                leftIcon={<User className="w-4 h-4" />}
              />

              <Input
                label="Official Email Address"
                value={user?.email || ''}
                disabled
                helperText="Email changes require administrative approval from the Ministry IT directorate."
                leftIcon={<Mail className="w-4 h-4" />}
              />

              <Input
                label="Contact Mobile"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                leftIcon={<Phone className="w-4 h-4" />}
              />

              <Button variant="primary" size="sm" type="submit" isLoading={isUpdating} className="w-full">
                Save Contact Updates
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Security / Password Form */}
        <Card>
          <CardHeader>
            <CardTitle>Security & Password</CardTitle>
            <CardDescription>Update your portal credentials and active tokens</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordChange} className="space-y-4 text-xs">
              <Input
                label="Current Password"
                type="password"
                placeholder="••••••••••••"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                leftIcon={<Lock className="w-4 h-4" />}
              />

              <Input
                label="New Password"
                type="password"
                placeholder="Minimum 8 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                leftIcon={<Key className="w-4 h-4" />}
              />

              <Button variant="navy" size="sm" type="submit" className="w-full">
                Update Password
              </Button>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                <Button
                  variant="outline"
                  size="sm"
                  type="button"
                  onClick={() => {
                    toast.info('Logged out from all 3 active mobile and desktop sessions');
                  }}
                  className="w-full text-rose-600 border-rose-200 dark:border-rose-900 hover:bg-rose-50"
                >
                  Terminate All Other Device Sessions
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
