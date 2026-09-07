'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  ShieldAlert, AlertTriangle, TrendingUp, TrendingDown, Plus,
  Activity, Users, MapPin, CheckCircle2, AlertOctagon, Info
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { Input, Select } from '@/components/ui/Input';
import { EmptyState } from '@/components/ui/EmptyState';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { getDiseaseReports, surveillanceService } from '@/services/apiClient';
import { DiseaseReport, AlertLevel, SriLankaRegion, UserRole } from '@/types';
import { formatNumber } from '@/lib/utils';
import {
  ResponsiveContainer, LineChart, Line, BarChart, Bar,
  XAxis, YAxis, Tooltip, CartesianGrid, Legend, PieChart, Pie, Cell
} from 'recharts';

export default function SurveillancePage() {
  const { user } = useAuth();
  const { toast } = useToast();

  const [reports, setReports] = useState<DiseaseReport[]>([]);
  const [selectedAlert, setSelectedAlert] = useState('ALL');
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [newReport, setNewReport] = useState({
    diseaseName: '',
    category: 'Vector-borne Viral Infection',
    casesReported: 100,
    activeCases: 40,
    recovered: 58,
    deaths: 2,
    region: SriLankaRegion.WESTERN,
    alertLevel: AlertLevel.ORANGE,
    growthRate: 12.5,
    trend: 'INCREASING' as const,
    thresholdLimit: 200,
    isThresholdBreached: false,
  });

  useEffect(() => {
    setReports(getDiseaseReports());
  }, []);

  const totalCases = reports.reduce((acc, r) => acc + r.casesReported, 0);
  const totalActive = reports.reduce((acc, r) => acc + r.activeCases, 0);
  const totalDeaths = reports.reduce((acc, r) => acc + r.deaths, 0);
  const breachedCount = reports.filter((r) => r.isThresholdBreached).length;

  const filteredReports = useMemo(() => {
    if (selectedAlert === 'ALL') return reports;
    return reports.filter((r) => r.alertLevel === selectedAlert);
  }, [reports, selectedAlert]);

  // Epidemic curves over past 6 weeks (Weekly incidence)
  const epidemicTrendData = [
    { week: 'Wk 31', Dengue: 2800, Flu: 1400, Leptospirosis: 480, COVID: 520 },
    { week: 'Wk 32', Dengue: 3200, Flu: 1520, Leptospirosis: 530, COVID: 480 },
    { week: 'Wk 33', Dengue: 3950, Flu: 1610, Leptospirosis: 690, COVID: 410 },
    { week: 'Wk 34', Dengue: 4400, Flu: 1680, Leptospirosis: 780, COVID: 380 },
    { week: 'Wk 35', Dengue: 4620, Flu: 1600, Leptospirosis: 830, COVID: 350 },
    { week: 'Wk 36 (Current)', Dengue: 4820, Flu: 1640, Leptospirosis: 890, COVID: 320 },
  ];

  // Cases by Province breakdown
  const regionalDistributionData = [
    { region: 'Western', Cases: 5140 },
    { region: 'Sabaragamuwa', Cases: 890 },
    { region: 'Central', Cases: 1640 },
    { region: 'Southern', Cases: 1120 },
    { region: 'North Western', Cases: 780 },
    { region: 'Eastern', Cases: 420 },
    { region: 'Northern', Cases: 310 },
  ];

  const handleCreateReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReport.diseaseName) return;
    setIsSubmitting(true);
    try {
      const isBreached = newReport.casesReported > newReport.thresholdLimit;
      const created = await surveillanceService.create({
        ...newReport,
        isThresholdBreached: isBreached,
      });
      setReports(getDiseaseReports());
      toast.success(
        `Surveillance entry logged for ${created.diseaseName} (${created.alertLevel})`,
        'Epidemic Telemetry Logged'
      );
      setIsReportOpen(false);
    } catch {
      toast.error('Failed to log disease report');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Official Disclaimer Banner Required by Prompt */}
      <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 flex items-center justify-between gap-3 text-xs text-amber-800 dark:text-amber-200">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-amber-600 shrink-0" />
          <span className="font-semibold">
            Demo / Sample Data Notice: The figures and epidemiological curves presented on this surveillance portal are demonstration models simulated for platform evaluation.
          </span>
        </div>
        <Badge variant="amber">Demo / Sample Data</Badge>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-50 tracking-tight">
              National Disease Surveillance & Outbreak Center
            </h1>
            <Badge variant="teal">Epidemiological Unit</Badge>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Real-time multi-pathogen monitoring, threshold limit anomaly detection, and regional vector control coordination.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => setIsReportOpen(true)}
          className="gap-1.5"
        >
          <Plus className="w-4 h-4" /> Log Surveillance Data
        </Button>
      </div>

      {/* Threshold Breach Warning Bar */}
      {breachedCount > 0 && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-rose-700 dark:text-rose-300 font-bold text-xs sm:text-sm">
              <AlertOctagon className="w-5 h-5 text-rose-600 animate-pulse" />
              <span>Administrative Threshold Limits Breached ({breachedCount} Conditions)</span>
            </div>
            <Badge variant="rose">Red Alert Generated</Badge>
          </div>
          <p className="text-xs text-rose-800 dark:text-rose-200 leading-relaxed">
            Western Province Dengue incidences (4,820 cases) have exceeded the epidemic baseline limit of 3,000 cases. Special High-Dependency Units (HDUs) activated.
          </p>
        </div>
      )}

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 space-y-1">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Total Reported Cases</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-50">{formatNumber(totalCases)}</p>
          <p className="text-[10px] text-slate-400">Current Epidemic Year</p>
        </Card>

        <Card className="p-4 space-y-1">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Active Hospitalized Cases</p>
          <p className="text-2xl font-bold text-rose-600 dark:text-rose-400">{formatNumber(totalActive)}</p>
          <p className="text-[10px] text-slate-400">Under Inpatient Management</p>
        </Card>

        <Card className="p-4 space-y-1">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Breached Thresholds</p>
          <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{breachedCount}</p>
          <p className="text-[10px] text-slate-400">Exceeding Epidemic Baseline</p>
        </Card>

        <Card className="p-4 space-y-1">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Reported Mortality</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-50">{totalDeaths}</p>
          <p className="text-[10px] text-slate-400">Case Fatality Rate &lt; 0.38%</p>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Epidemic Curves Line Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Epidemic Curves Over Time (Weekly Incidence)</CardTitle>
            <CardDescription>Comparative weekly trajectory of Dengue, Flu, Leptospirosis, and COVID-19</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-72 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={epidemicTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
                  <XAxis dataKey="week" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 11 }} />
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
                  <Line type="monotone" dataKey="Dengue" stroke="#ef4444" strokeWidth={2.5} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="Flu" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="Leptospirosis" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="COVID" stroke="#10b981" strokeWidth={1.5} dot={{ r: 2 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Regional Distribution Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Active Pathogen Burden by Province</CardTitle>
            <CardDescription>Total reported cases across regional MOH jurisdictions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-72 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={regionalDistributionData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
                  <XAxis dataKey="region" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderRadius: '8px',
                      border: '1px solid #334155',
                      color: '#fff',
                      fontSize: '11px',
                    }}
                  />
                  <Bar dataKey="Cases" fill="#0d9488" radius={[4, 4, 0, 0]}>
                    {regionalDistributionData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.region === 'Western' ? '#ef4444' : '#0d9488'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Disease Outbreak Registry Table */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
            Active Disease Surveillance Registry
          </h3>

          <div className="flex items-center gap-1.5 text-xs">
            {['ALL', 'RED', 'ORANGE', 'YELLOW', 'GREEN'].map((lvl) => (
              <button
                key={lvl}
                onClick={() => setSelectedAlert(lvl)}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                  selectedAlert === lvl
                    ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 font-semibold">
              <tr>
                <th className="p-3.5">Condition / Pathogen</th>
                <th className="p-3.5">Category</th>
                <th className="p-3.5">Province</th>
                <th className="p-3.5">Reported vs Threshold</th>
                <th className="p-3.5">Trajectory</th>
                <th className="p-3.5">Alert Tier</th>
                <th className="p-3.5 text-right">Outcome Stats</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {filteredReports.map((d) => (
                <tr key={d.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                  <td className="p-3.5">
                    <p className="font-bold text-slate-900 dark:text-slate-100">{d.diseaseName}</p>
                    <p className="text-[10px] text-slate-500">Active: {d.activeCases.toLocaleString()}</p>
                  </td>
                  <td className="p-3.5 text-slate-600 dark:text-slate-300">{d.category}</td>
                  <td className="p-3.5 font-medium">{d.region}</td>
                  <td className="p-3.5">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 font-bold">
                        <span className={d.isThresholdBreached ? 'text-rose-600' : 'text-slate-800 dark:text-slate-200'}>
                          {d.casesReported.toLocaleString()}
                        </span>
                        <span className="text-slate-400 font-normal">/ {d.thresholdLimit.toLocaleString()} limit</span>
                      </div>
                      <div className="w-28 bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${d.isThresholdBreached ? 'bg-rose-500' : 'bg-teal-500'}`}
                          style={{ width: `${Math.min(100, (d.casesReported / d.thresholdLimit) * 100)}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="p-3.5">
                    <span
                      className={`inline-flex items-center gap-1 font-semibold ${
                        d.growthRate > 0 ? 'text-rose-600' : 'text-emerald-600'
                      }`}
                    >
                      {d.growthRate > 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                      {d.growthRate > 0 ? `+${d.growthRate}%` : `${d.growthRate}%`}
                    </span>
                  </td>
                  <td className="p-3.5">
                    <Badge
                      variant={d.alertLevel === 'RED' ? 'rose' : d.alertLevel === 'ORANGE' ? 'amber' : 'emerald'}
                      pulse={d.alertLevel === 'RED'}
                    >
                      Level {d.alertLevel}
                    </Badge>
                  </td>
                  <td className="p-3.5 text-right">
                    <p className="text-emerald-600 font-bold">{d.recovered.toLocaleString()} Recovered</p>
                    <p className="text-rose-500 text-[10px]">{d.deaths} Mortality</p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Log Surveillance Data Modal */}
      {isReportOpen && (
        <Modal
          isOpen={isReportOpen}
          onClose={() => setIsReportOpen(false)}
          title="Record Epidemiological Surveillance Data"
          description="Log active infection counts and notify regional medical officers of emerging outbreaks."
          size="lg"
        >
          <form onSubmit={handleCreateReport} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Disease / Pathogen Name"
                placeholder="e.g. Japanese Encephalitis"
                value={newReport.diseaseName}
                onChange={(e) => setNewReport({ ...newReport, diseaseName: e.target.value })}
                required
              />

              <Input
                label="Pathogen Classification / Category"
                placeholder="e.g. Vector-borne Flavivirus"
                value={newReport.category}
                onChange={(e) => setNewReport({ ...newReport, category: e.target.value })}
                required
              />

              <Select
                label="Province Jurisdiction"
                value={newReport.region}
                onChange={(e) => setNewReport({ ...newReport, region: e.target.value as any })}
                options={Object.values(SriLankaRegion).map((r) => ({ value: r, label: r }))}
              />

              <Select
                label="Alert Level Tier"
                value={newReport.alertLevel}
                onChange={(e) => setNewReport({ ...newReport, alertLevel: e.target.value as any })}
                options={[
                  { value: AlertLevel.GREEN, label: 'GREEN — Baseline Control' },
                  { value: AlertLevel.YELLOW, label: 'YELLOW — Elevated Monitoring' },
                  { value: AlertLevel.ORANGE, label: 'ORANGE — High Risk Outbreak' },
                  { value: AlertLevel.RED, label: 'RED — Epidemic Emergency' },
                ]}
              />

              <Input
                label="Total Cumulative Cases"
                type="number"
                value={newReport.casesReported}
                onChange={(e) => setNewReport({ ...newReport, casesReported: parseInt(e.target.value) || 0 })}
                required
              />

              <Input
                label="Active Hospitalized Cases"
                type="number"
                value={newReport.activeCases}
                onChange={(e) => setNewReport({ ...newReport, activeCases: parseInt(e.target.value) || 0 })}
                required
              />

              <Input
                label="Recovered Cases"
                type="number"
                value={newReport.recovered}
                onChange={(e) => setNewReport({ ...newReport, recovered: parseInt(e.target.value) || 0 })}
                required
              />

              <Input
                label="Epidemic Threshold Limit"
                type="number"
                value={newReport.thresholdLimit}
                onChange={(e) => setNewReport({ ...newReport, thresholdLimit: parseInt(e.target.value) || 0 })}
                required
              />
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
              <Button variant="outline" size="sm" type="button" onClick={() => setIsReportOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" type="submit" isLoading={isSubmitting}>
                Submit Telemetry Record
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
