'use client';

import React, { useState } from 'react';
import {
  Settings, Bell, Globe, Moon, Shield, Lock,
  Smartphone, Trash2, CheckCircle2, Sliders
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { useTheme } from '@/context/ThemeContext';
import { useLanguage } from '@/context/LanguageContext';
import { useToast } from '@/context/ToastContext';

export default function SettingsPage() {
  const { theme, toggleTheme, setTheme } = useTheme();
  const { language, setLanguage } = useLanguage();
  const { toast } = useToast();

  const [emailAlerts, setEmailAlerts] = useState(true);
  const [emergencySms, setEmergencySms] = useState(true);
  const [shortageNotifs, setShortageNotifs] = useState(true);

  const handleSavePreferences = () => {
    toast.success('Notification and accessibility preferences saved');
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-50 tracking-tight">
            System & Account Settings
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Configure visual preferences, multi-language toggles, and notification routing.
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Appearance & Language */}
        <Card>
          <CardHeader>
            <CardTitle>Interface & Accessibility Preferences</CardTitle>
            <CardDescription>Tailor color contrast, theme mode, and official language</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-xs">
            {/* Theme Toggle */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
              <div>
                <p className="font-bold text-slate-900 dark:text-slate-100">Display Theme</p>
                <p className="text-slate-500">Switch between standard government light theme and high-contrast dark mode</p>
              </div>
              <div className="flex items-center gap-1.5 border border-slate-300 dark:border-slate-700 rounded-lg p-1">
                <button
                  onClick={() => setTheme('light')}
                  className={`px-3 py-1 rounded-md font-bold transition-colors cursor-pointer ${
                    theme === 'light' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
                  }`}
                >
                  Light
                </button>
                <button
                  onClick={() => setTheme('dark')}
                  className={`px-3 py-1 rounded-md font-bold transition-colors cursor-pointer ${
                    theme === 'dark' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-500'
                  }`}
                >
                  Dark
                </button>
              </div>
            </div>

            {/* Language Selector */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
              <div>
                <p className="font-bold text-slate-900 dark:text-slate-100">National Language Selection</p>
                <p className="text-slate-500">Official language for system navigation and health notices</p>
              </div>
              <div className="w-48">
                <select
                  value={language}
                  onChange={(e) => {
                    setLanguage(e.target.value as any);
                    toast.success('Language preference updated');
                  }}
                  className="w-full h-9 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-2.5 text-xs text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-teal-500"
                >
                  <option value="en">English (Official)</option>
                  <option value="si">සිංහල (Sinhala)</option>
                  <option value="ta">தமிழ் (Tamil)</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notification Preferences */}
        <Card>
          <CardHeader>
            <CardTitle>Health Telemetry & Alert Channels</CardTitle>
            <CardDescription>Select which administrative and clinical notifications trigger alerts</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-xs">
            <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 cursor-pointer">
              <div>
                <p className="font-bold text-slate-900 dark:text-slate-100">Emergency 1990 Mass Casualty Strobe</p>
                <p className="text-slate-500">Display immediate top-bar visual beacon upon Level 1 critical trauma dispatch</p>
              </div>
              <input
                type="checkbox"
                checked={emergencySms}
                onChange={(e) => setEmergencySms(e.target.checked)}
                className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 cursor-pointer">
              <div>
                <p className="font-bold text-slate-900 dark:text-slate-100">Critical Pharmaceutical Shortage Alerts</p>
                <p className="text-slate-500">Notify immediately when hospital pharmacy falls below 30% reorder point</p>
              </div>
              <input
                type="checkbox"
                checked={shortageNotifs}
                onChange={(e) => setShortageNotifs(e.target.checked)}
                className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 cursor-pointer">
              <div>
                <p className="font-bold text-slate-900 dark:text-slate-100">Patient Appointment & Referral SMS</p>
                <p className="text-slate-500">Automated mobile notifications for scheduled consultations</p>
              </div>
              <input
                type="checkbox"
                checked={emailAlerts}
                onChange={(e) => setEmailAlerts(e.target.checked)}
                className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500"
              />
            </label>

            <div className="pt-2 flex justify-end">
              <Button variant="primary" size="sm" onClick={handleSavePreferences}>
                Save Preferences
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Security & Sessions */}
        <Card>
          <CardHeader>
            <CardTitle>Session Security & Privacy</CardTitle>
            <CardDescription>Audited authentication tokens and data protection</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-xs">
            <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-teal-600" /> Active Workplace Session
                </span>
                <Badge variant="emerald" size="sm">Current Terminal</Badge>
              </div>
              <p className="text-slate-500 text-[11px]">
                Chrome on Windows 11 • IP: 192.248.16.22 (Sri Lanka Government Network - LGN)
              </p>
            </div>

            <div className="pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => toast.info('All remote device tokens revoked')}
                className="text-rose-600 border-rose-200 dark:border-rose-900 hover:bg-rose-50"
              >
                Sign Out from All Other Registered Terminals
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
