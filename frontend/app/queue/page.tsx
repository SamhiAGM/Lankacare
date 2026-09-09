'use client';

import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { queueManagementService, getHospitals } from '@/services/apiClient';
import { Hospital } from '@/types';
import { Users, Clock, Building2, ShieldAlert, ArrowRight, Activity, Search } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { SourceBadge } from '@/components/ui/SourceBadge';
import { Badge } from '@/components/ui/Badge';
import Link from 'next/link';

export default function QueueStatusPage() {
  const { t } = useLanguage();
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [selectedHospital, setSelectedHospital] = useState<string>('');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('OPD');
  const [queueStatus, setQueueStatus] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // For dropdown population
    setHospitals(getHospitals());
  }, []);

  const fetchQueueStatus = async () => {
    if (!selectedHospital) {
      setError('Please select a hospital');
      return;
    }
    setError('');
    setIsLoading(true);
    try {
      const res = await queueManagementService.getPublicStatus(selectedHospital, selectedDepartment);
      setQueueStatus(res.data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch queue status');
      setQueueStatus(null);
    } finally {
      setIsLoading(false);
    }
  };

  const departments = ['OPD', 'Dental', 'Eye', 'ETU', 'Pharmacy'];

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Header Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-blue-950 via-slate-900 to-slate-950 p-6 sm:p-8 text-white border border-blue-900/40 shadow-xl space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-300 text-xs font-semibold">
          <Activity className="w-3.5 h-3.5 text-blue-400" />
          <span>Real-time Crowd Monitoring</span>
        </div>

        <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
          Hospital Queue Status
        </h1>

        <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
          Check live wait times and crowd levels at verified healthcare facilities before you travel.
          Reduce unnecessary waiting and help distribute patient loads effectively.
        </p>

        <div className="flex flex-wrap items-center gap-2 pt-1">
          <SourceBadge type="VERIFIED_OFFICIAL" size="sm" />
        </div>
      </div>

      <Card className="p-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Select Healthcare Facility
            </label>
            <select
              value={selectedHospital}
              onChange={(e) => setSelectedHospital(e.target.value)}
              className="w-full h-10 px-3 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100"
            >
              <option value="">-- Choose a Hospital --</option>
              {hospitals.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Select Department
            </label>
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="w-full h-10 px-3 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100"
            >
              {departments.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          <Button 
            variant="primary" 
            onClick={fetchQueueStatus} 
            disabled={isLoading || !selectedHospital}
            className="w-full h-10"
          >
            {isLoading ? 'Checking...' : 'Check Status'}
          </Button>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-lg bg-rose-50 text-rose-700 text-sm flex items-center gap-2">
            <ShieldAlert className="w-4 h-4" /> {error}
          </div>
        )}
      </Card>

      {queueStatus && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 animate-in fade-in slide-in-from-bottom-4">
          <Card className="p-6 text-center space-y-2 border-slate-200 dark:border-slate-800">
            <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto mb-2">
              <Users className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-slate-500">Currently Waiting</p>
            <p className="text-3xl font-black text-slate-900 dark:text-white font-mono">
              {queueStatus.currentCount}
            </p>
            <p className="text-xs text-slate-400">Patients in queue</p>
          </Card>

          <Card className="p-6 text-center space-y-2 border-slate-200 dark:border-slate-800">
            <div className="w-12 h-12 rounded-full bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 flex items-center justify-center mx-auto mb-2">
              <Clock className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-slate-500">Est. Wait Time</p>
            <p className="text-3xl font-black text-slate-900 dark:text-white font-mono">
              {queueStatus.estimatedWaitMinutes} <span className="text-lg">min</span>
            </p>
            <p className="text-xs text-slate-400">Average time to service</p>
          </Card>

          <Card className="p-6 text-center space-y-2 border-slate-200 dark:border-slate-800">
            <div className="w-12 h-12 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto mb-2">
              <Activity className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-slate-500">Crowd Level</p>
            <div className="pt-1">
              <Badge 
                variant={queueStatus.status === 'SEVERE_CROWDING' ? 'rose' : queueStatus.status === 'HEAVY_CROWD' ? 'amber' : 'emerald'}
                className="text-sm px-3 py-1"
              >
                {queueStatus.status.replace('_', ' ')}
              </Badge>
            </div>
            <p className="text-xs text-slate-400 mt-2">Latest telemetry</p>
          </Card>
        </div>
      )}
    </div>
  );
}
