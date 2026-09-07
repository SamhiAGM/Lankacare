'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Syringe, ShieldCheck, Search, Plus, QrCode, ArrowRight,
  CheckCircle2, Users, Calendar, Award, BarChart3
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { getVaccinations } from '@/services/apiClient';
import { VaccinationRecord, UserRole } from '@/types';
import { formatNumber } from '@/lib/utils';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip,
  CartesianGrid, Legend
} from 'recharts';

export default function VaccinationsPage() {
  const { user } = useAuth();
  const { toast } = useToast();

  const [programs, setPrograms] = useState<VaccinationRecord[]>([]);
  const [certNic, setCertNic] = useState('');
  const [verifiedCert, setVerifiedCert] = useState<any>(null);
  const [isCertModalOpen, setIsCertModalOpen] = useState(false);

  useEffect(() => {
    setPrograms(getVaccinations());
  }, []);

  const totalDoses = programs.reduce((acc, p) => acc + p.dosesAdministered, 0);
  const totalTarget = programs.reduce((acc, p) => acc + p.totalTarget, 0);
  const avgCoverage = 94.2;

  // Regional coverage chart data
  const regionalCoverageData = [
    { province: 'Western', EPI: 98.2, HPV: 92.5, COVID: 78.4 },
    { province: 'Central', EPI: 97.4, HPV: 91.0, COVID: 72.1 },
    { province: 'Southern', EPI: 97.8, HPV: 93.2, COVID: 74.0 },
    { province: 'Northern', EPI: 96.9, HPV: 89.5, COVID: 68.2 },
    { province: 'North Western', EPI: 97.1, HPV: 90.4, COVID: 70.5 },
    { province: 'Sabaragamuwa', EPI: 97.5, HPV: 89.8, COVID: 69.1 },
    { province: 'Uva', EPI: 96.8, HPV: 88.7, COVID: 66.5 },
    { province: 'North Central', EPI: 97.6, HPV: 90.1, COVID: 69.4 },
    { province: 'Eastern', EPI: 96.4, HPV: 88.0, COVID: 65.2 },
  ];

  const handleLookupCert = (e: React.FormEvent) => {
    e.preventDefault();
    if (!certNic) return;
    setVerifiedCert({
      name: 'Sunil Wickramasinghe',
      nic: certNic,
      phn: 'PHN-2024-884920',
      doses: [
        { name: 'COVID-19 Bivalent Booster', date: '2024-03-12', batch: 'COV-8819', facility: 'NHSL OPD' },
        { name: 'Tetanus Toxoid Booster', date: '2025-08-10', batch: 'TT-4412', facility: 'Kalubowila Teaching' },
        { name: 'Influenza Annual', date: '2026-05-18', batch: 'INF-9012', facility: 'MOH Office Maharagama' },
      ],
      qrCodeUrl: 'MOH-DIGITAL-CERT-VALID',
    });
    setIsCertModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-50 tracking-tight">
              National Immunization & Vaccination Programs
            </h1>
            <Badge variant="teal">Childhood EPI & Public Health</Badge>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Democratic Socialist Republic of Sri Lanka • Epidemiological Unit Immunization Division
          </p>
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 space-y-1">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Total Doses Administered</p>
          <p className="text-2xl font-bold text-teal-600 dark:text-teal-400">{formatNumber(totalDoses)}</p>
          <p className="text-[10px] text-slate-400">Recorded across 9 Provinces</p>
        </Card>

        <Card className="p-4 space-y-1">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">National EPI Coverage</p>
          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">97.5%</p>
          <p className="text-[10px] text-slate-400">Childhood Target Exceeded</p>
        </Card>

        <Card className="p-4 space-y-1">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Active Campaigns</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-50">{programs.length}</p>
          <p className="text-[10px] text-slate-400">EPI, HPV, Flu, COVID Booster</p>
        </Card>

        <Card className="p-4 space-y-1">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Target Population</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-50">{formatNumber(totalTarget)}</p>
          <p className="text-[10px] text-slate-400">Eligible Citizens</p>
        </Card>
      </div>

      {/* Regional Comparison Chart & Citizen Certificate Lookup */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Regional Coverage Chart (2 cols) */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Provincial Vaccination Coverage Comparison (%)</CardTitle>
            <CardDescription>Childhood EPI vs Adolescent HPV vs COVID-19 Booster</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-72 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={regionalCoverageData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
                  <XAxis dataKey="province" tick={{ fontSize: 10 }} />
                  <YAxis domain={[50, 100]} tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderRadius: '8px',
                      border: '1px solid #334155',
                      color: '#fff',
                      fontSize: '11px',
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                  <Bar dataKey="EPI" fill="#0d9488" radius={[4, 4, 0, 0]} name="Childhood EPI %" />
                  <Bar dataKey="HPV" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="School HPV %" />
                  <Bar dataKey="COVID" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Adult COVID Booster %" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Citizen Certificate Verification Card (1 col) */}
        <Card className="flex flex-col justify-between p-6">
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 text-teal-600 dark:text-teal-400 flex items-center justify-center font-bold">
              <QrCode className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Digital Vaccination Certificate
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                Lookup official immunization certificates with verifiable cryptographic QR signature issued by the Ministry of Health.
              </p>
            </div>

            <form onSubmit={handleLookupCert} className="space-y-3 pt-2">
              <Input
                label="National ID (NIC) / Passport"
                placeholder="e.g. 198514203912"
                value={certNic}
                onChange={(e) => setCertNic(e.target.value)}
                required
              />
              <Button variant="primary" size="sm" type="submit" className="w-full">
                Verify Immunization Certificate →
              </Button>
            </form>
          </div>

          <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-400 text-center">
            Valid for international travel & WHO yellow card compliance
          </div>
        </Card>
      </div>

      {/* Active Vaccination Programs List */}
      <div className="space-y-3">
        <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
          Ongoing National Immunization Programs
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {programs.map((prg) => (
            <div
              key={prg.id}
              className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3 shadow-xs"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <Badge variant="teal" size="sm">EPI Program</Badge>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 mt-1">
                    {prg.programName}
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">Target: {prg.targetGroup}</p>
                </div>
                <span className="text-lg font-extrabold text-teal-600 dark:text-teal-400">
                  {prg.coveragePercentage}%
                </span>
              </div>

              <div className="space-y-1.5 pt-1">
                <div className="flex justify-between text-xs text-slate-500">
                  <span>Vaccinated: <strong>{formatNumber(prg.totalVaccinated)}</strong></span>
                  <span>Target: <strong>{formatNumber(prg.totalTarget)}</strong></span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-teal-600 h-full rounded-full"
                    style={{ width: `${prg.coveragePercentage}%` }}
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between text-[11px] text-slate-400">
                <span>Doses Administered: {formatNumber(prg.dosesAdministered)}</span>
                <span>Active through: {prg.endDate}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Certificate Modal */}
      {isCertModalOpen && verifiedCert && (
        <Modal
          isOpen={isCertModalOpen}
          onClose={() => setIsCertModalOpen(false)}
          title="Digital Health Immunization Certificate"
          description="Official Ministry of Health Electronic Immunization Record"
          size="md"
        >
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Holder Name</p>
                <p className="font-bold text-base text-slate-900 dark:text-white">{verifiedCert.name}</p>
                <p className="text-slate-500 font-mono text-[11px]">NIC: {verifiedCert.nic} • {verifiedCert.phn}</p>
              </div>
              <div className="w-16 h-16 rounded-xl bg-white dark:bg-slate-900 border flex flex-col items-center justify-center text-center p-1 text-[8px] font-mono">
                <QrCode className="w-8 h-8 text-teal-600" />
                <span>MOH VERIFIED</span>
              </div>
            </div>

            <div>
              <p className="font-bold text-slate-800 dark:text-slate-200 mb-2">Verified Doses Administered:</p>
              <div className="space-y-2">
                {verifiedCert.doses.map((d: any, idx: number) => (
                  <div key={idx} className="p-2.5 rounded-lg border bg-white dark:bg-slate-900 flex justify-between items-center">
                    <div>
                      <p className="font-bold text-slate-900 dark:text-slate-100">{d.name}</p>
                      <p className="text-[10px] text-slate-400">{d.facility} • Batch: {d.batch}</p>
                    </div>
                    <span className="text-slate-600 dark:text-slate-300 font-medium">{d.date}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <Button variant="outline" size="sm" onClick={() => window.print()}>
                Print Certificate
              </Button>
              <Button variant="primary" size="sm" onClick={() => setIsCertModalOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
