'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  ShieldAlert, Bug, AlertTriangle, MapPin, Plus, CheckCircle2,
  Clock, Activity, ExternalLink, Calendar, Search, Filter,
  Layers, ChevronRight, UserCheck, AlertOctagon, Info
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { SourceBadge } from '@/components/ui/SourceBadge';
import { SriLankaMap } from '@/components/map/SriLankaMap';
import {
  getDistrictDengueStats, getCommunityDengueReports, dengueService
} from '@/services/apiClient';
import {
  DistrictDengueStats, CommunityDengueReport, DengueReportStatus
} from '@/types';
import {
  SRI_LANKA_DISTRICTS, formatSriLankanDate, formatSriLankanPhone
} from '@/lib/sriLankaGeo';
import { useToast } from '@/context/ToastContext';

export default function DengueSurveillancePage() {
  const { toast } = useToast();

  const [stats, setStats] = useState<DistrictDengueStats[]>([]);
  const [reports, setReports] = useState<CommunityDengueReport[]>([]);
  const [selectedDistrict, setSelectedDistrict] = useState<string>('ALL');
  const [selectedRisk, setSelectedRisk] = useState<string>('ALL');
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'epidemiological' | 'community'>('epidemiological');

  // New report form state
  const [newReport, setNewReport] = useState({
    district: 'Colombo',
    gnDivision: '',
    locationAddress: '',
    breedingSiteType: 'DISCARDED_CONTAINERS' as CommunityDengueReport['breedingSiteType'],
    description: '',
    photoUrl: '',
    reporterName: '',
    reporterPhone: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setStats(getDistrictDengueStats());
    setReports(getCommunityDengueReports());
  }, []);

  // Compute map data dictionary for Dengue mode
  const dengueMapData = useMemo(() => {
    const map: Record<string, { cases: number; risk: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL' }> = {};
    stats.forEach((s) => {
      map[s.district] = { cases: s.casesThisWeek, risk: s.riskLevel };
    });
    return map;
  }, [stats]);

  // Aggregate totals
  const totalWeeklyCases = stats.reduce((acc, s) => acc + s.casesThisWeek, 0);
  const totalCumulativeCases = stats.reduce((acc, s) => acc + s.cumulativeYearCases, 0);
  const criticalDistrictsCount = stats.filter((s) => s.riskLevel === 'CRITICAL' || s.riskLevel === 'HIGH').length;

  const filteredStats = useMemo(() => {
    return stats.filter((s) => {
      const matchDist = selectedDistrict === 'ALL' || s.district === selectedDistrict;
      const matchRisk = selectedRisk === 'ALL' || s.riskLevel === selectedRisk;
      return matchDist && matchRisk;
    });
  }, [stats, selectedDistrict, selectedRisk]);

  const handleSubmitReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReport.district || !newReport.locationAddress || !newReport.description) {
      toast.error('Please enter district, exact location and description.');
      return;
    }
    setIsSubmitting(true);
    try {
      const created = dengueService.submitCommunityReport(newReport);
      setReports(dengueService.getCommunityReports());
      toast.success(
        `Report ${created.reportNumber} registered and forwarded to local PHI Office.`,
        'Community Report Lodged'
      );
      setIsReportModalOpen(false);
      setNewReport({
        district: 'Colombo',
        gnDivision: '',
        locationAddress: '',
        breedingSiteType: 'DISCARDED_CONTAINERS',
        description: '',
        photoUrl: '',
        reporterName: '',
        reporterPhone: '',
      });
      setActiveTab('community');
    } catch {
      toast.error('Failed to lodge community report.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusProgression = (id: string, currentStatus: DengueReportStatus) => {
    const nextStatusMap: Record<DengueReportStatus, DengueReportStatus> = {
      REPORTED: 'ASSIGNED',
      ASSIGNED: 'INVESTIGATING',
      INVESTIGATING: 'ACTION_TAKEN',
      ACTION_TAKEN: 'RESOLVED',
      RESOLVED: 'RESOLVED',
    };
    const next = nextStatusMap[currentStatus];
    if (next !== currentStatus) {
      dengueService.updateReportStatus(
        id,
        next,
        'Divisional MOH PHI Vector Control Unit',
        'Premises inspected by Public Health Inspector. Necessary vector control action executed.'
      );
      setReports(dengueService.getCommunityReports());
      toast.info(`Report status updated to ${next}`, 'Workflow Progressed');
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-rose-950 via-slate-900 to-slate-950 p-6 sm:p-8 text-white border border-rose-900/40 shadow-xl">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-semibold">
            <Bug className="w-3.5 h-3.5 text-rose-400" />
            <span>Sri Lanka National Dengue Surveillance Unit</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            National Dengue Surveillance & Community Action
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            Weekly epidemiological notification data from the Sri Lanka Epidemiology Unit paired with
            citizen-driven mosquito breeding habitat reporting.
          </p>

          <div className="flex flex-wrap items-center gap-2 pt-1">
            <SourceBadge
              type="VERIFIED_OFFICIAL"
              sourceName="Epidemiology Unit Sri Lanka (epid.gov.lk)"
              sourceUrl="https://www.epid.gov.lk"
              publishedDate="September 2026"
              reportingPeriod="Week 36, 2026"
              size="sm"
            />
            <SourceBadge
              type="SYSTEM_CALCULATED"
              customText="✦ System-calculated risk indicator"
              size="sm"
            />
            <a
              href="https://www.epid.gov.lk"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-rose-300 hover:text-white font-semibold inline-flex items-center gap-1 ml-auto"
            >
              View Official Epidemiology Unit Bulletins <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Total National Weekly Cases
          </span>
          <div className="text-2xl sm:text-3xl font-black text-rose-600 dark:text-rose-400 font-mono">
            {totalWeeklyCases.toLocaleString()}
          </div>
          <p className="text-[11px] text-slate-500">
            Epidemiological Week 36 notification • +14.8% weekly trend
          </p>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Cumulative Year-to-Date Cases
          </span>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-mono">
            {totalCumulativeCases.toLocaleString()}
          </div>
          <p className="text-[11px] text-slate-500">
            Source: Epidemiology Unit Weekly Disease Surveillance Report
          </p>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            High-Vigilance Districts
          </span>
          <div className="text-2xl sm:text-3xl font-black text-amber-500 font-mono">
            {criticalDistrictsCount} of 25
          </div>
          <p className="text-[11px] text-amber-600 dark:text-amber-400 font-medium">
            Western Province and Kandy currently under elevated vector alert
          </p>
        </div>
      </div>

      {/* Mode Switcher Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('epidemiological')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
            activeTab === 'epidemiological'
              ? 'bg-teal-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          1. Official Epidemiological Surveillance
        </button>
        <button
          onClick={() => setActiveTab('community')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'community'
              ? 'bg-rose-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <span>2. Citizen Breeding Site Reports ({reports.length})</span>
          <span className="px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-200 text-[10px]">
            User Data
          </span>
        </button>

        <Button
          variant="danger"
          size="sm"
          className="ml-auto"
          onClick={() => setIsReportModalOpen(true)}
        >
          <Plus className="w-3.5 h-3.5 mr-1" /> Report Breeding Site
        </Button>
      </div>

      {/* TAB 1: OFFICIAL EPIDEMIOLOGICAL DATA & SRI LANKA DENGUE MAP */}
      {activeTab === 'epidemiological' && (
        <div className="space-y-6">
          {/* Interactive Sri Lanka Dengue Map */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-slate-900 dark:text-white">
                  Sri Lanka District Vector Risk Density
                </span>
                <SourceBadge
                  type="SYSTEM_CALCULATED"
                  customText="✦ System-calculated indicator"
                  size="sm"
                />
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Critical Risk
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> High Risk
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-yellow-500" /> Moderate
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Low
                </span>
              </div>
            </div>

            <SriLankaMap
              mode="dengue"
              dengueData={dengueMapData}
              selectedDistrict={selectedDistrict}
              onSelectDistrict={(d) => setSelectedDistrict(d)}
            />
          </div>

          {/* District Breakdown Table */}
          <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  District-wise Reported Cases (Week 36)
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Calculated indicator methodology: Based on weekly case rate per 100,000 population.
                  Not an official government legal classification.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={selectedRisk}
                  onChange={(e) => setSelectedRisk(e.target.value)}
                  className="h-8 px-2.5 rounded-md bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300"
                >
                  <option value="ALL">All Risk Indicators</option>
                  <option value="CRITICAL">Critical Risk</option>
                  <option value="HIGH">High Risk</option>
                  <option value="MODERATE">Moderate Risk</option>
                  <option value="LOW">Low Risk</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="text-[11px] font-bold text-slate-400 uppercase bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="py-2.5 px-3">District</th>
                    <th className="py-2.5 px-3">Province</th>
                    <th className="py-2.5 px-3 text-right">This Week</th>
                    <th className="py-2.5 px-3 text-right">Previous Week</th>
                    <th className="py-2.5 px-3 text-right">Cumulative 2026</th>
                    <th className="py-2.5 px-3">Risk Assessment</th>
                    <th className="py-2.5 px-3">Official Sourcing</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredStats.map((st) => (
                    <tr key={st.district} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                      <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-white">
                        {st.district}
                      </td>
                      <td className="py-2.5 px-3 text-slate-500 dark:text-slate-400">
                        {st.province}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-rose-600 dark:text-rose-400">
                        {st.casesThisWeek}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-slate-500">
                        {st.casesPreviousWeek}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-800 dark:text-slate-200">
                        {st.cumulativeYearCases.toLocaleString()}
                      </td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                            st.riskLevel === 'CRITICAL'
                              ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                              : st.riskLevel === 'HIGH'
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                              : st.riskLevel === 'MODERATE'
                              ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-300'
                              : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          }`}
                        >
                          {st.riskLevel}
                        </span>
                        <span className="block text-[9px] text-slate-400 mt-0.5">
                          ✦ System-calculated
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="text-[11px] text-slate-500 block truncate max-w-[160px]">
                          {st.source}
                        </span>
                        <span className="text-[10px] text-teal-600 dark:text-teal-400">
                          {st.reportingPeriod}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: CITIZEN COMMUNITY BREEDING SITE REPORTS (USER SUBMITTED) */}
      {activeTab === 'community' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 text-xs text-blue-900 dark:text-blue-200 flex items-start gap-2.5">
            <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <strong>User-Generated Operational Data Notice:</strong> The community reporting system
              allows citizens to report standing water and potential mosquito breeding habitats. Reports
              progress through five administrative verification stages:
              <strong className="text-teal-600 dark:text-teal-400">
                {' '}Reported → Assigned → Investigating → Action Taken → Resolved
              </strong>. This operational tracking data is kept strictly distinct from official epidemiological surveillance.
            </div>
          </div>

          <div className="space-y-3">
            {reports.map((rep) => {
              const statusColors: Record<DengueReportStatus, string> = {
                REPORTED: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
                ASSIGNED: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
                INVESTIGATING: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
                ACTION_TAKEN: 'bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300',
                RESOLVED: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
              };

              return (
                <div
                  key={rep.id}
                  className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 sm:p-5 shadow-xs space-y-3"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs font-bold text-slate-800 dark:text-slate-200">
                          {rep.reportNumber}
                        </span>
                        <SourceBadge type="USER_SUBMITTED" size="sm" showDetails={false} />
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            statusColors[rep.status]
                          }`}
                        >
                          Status: {rep.status.replace('_', ' ')}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                        {rep.breedingSiteType.replace('_', ' ')}: {rep.locationAddress}
                      </h4>
                      <p className="text-xs text-slate-500">
                        {rep.district} District • GN Division: {rep.gnDivision} • Reported: {formatSriLankanDate(rep.reportedAt)}
                      </p>
                    </div>

                    {/* Operational Progression Button for Demo / Field Workers */}
                    {rep.status !== 'RESOLVED' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleStatusProgression(rep.id, rep.status)}
                        className="text-xs"
                      >
                        Advance Workflow →
                      </Button>
                    )}
                  </div>

                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/60 p-3 rounded-lg border border-slate-200 dark:border-slate-700/60">
                    {rep.description}
                  </p>

                  <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500 pt-1 border-t border-slate-100 dark:border-slate-800">
                    <div>
                      {rep.assignedPHIOffice && (
                        <span>
                          Assigned PHI Office:{' '}
                          <strong className="text-slate-800 dark:text-slate-200">
                            {rep.assignedPHIOffice}
                          </strong>
                        </span>
                      )}
                    </div>
                    {rep.actionTakenNotes && (
                      <div className="text-teal-600 dark:text-teal-400 font-medium">
                        Action Notes: {rep.actionTakenNotes}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Community Report Modal */}
      <Modal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        title="Report Mosquito Breeding Site (Community Alert)"
        description="Lodge an operational community report for vector breeding hazards. Information will be routed to the respective Medical Officer of Health (MOH) Public Health Inspector."
      >
        <form onSubmit={handleSubmitReport} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              District *
            </label>
            <select
              value={newReport.district}
              onChange={(e) => setNewReport({ ...newReport, district: e.target.value })}
              className="w-full h-10 px-3 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100"
              required
            >
              {Object.keys(SRI_LANKA_DISTRICTS).map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Grama Niladhari (GN) Division / Town Area *
            </label>
            <input
              type="text"
              placeholder="e.g. Borella South, Hendala, Peradeniya"
              value={newReport.gnDivision}
              onChange={(e) => setNewReport({ ...newReport, gnDivision: e.target.value })}
              className="w-full h-10 px-3 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Precise Location / Landmark Address *
            </label>
            <input
              type="text"
              placeholder="e.g. Vacant land opposite Temple Road, behind school boundary wall"
              value={newReport.locationAddress}
              onChange={(e) => setNewReport({ ...newReport, locationAddress: e.target.value })}
              className="w-full h-10 px-3 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Type of Breeding Habitat *
            </label>
            <select
              value={newReport.breedingSiteType}
              onChange={(e) =>
                setNewReport({
                  ...newReport,
                  breedingSiteType: e.target.value as CommunityDengueReport['breedingSiteType'],
                })
              }
              className="w-full h-10 px-3 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100"
            >
              <option value="DISCARDED_CONTAINERS">Discarded Containers / Coconut Shells</option>
              <option value="TYRES">Abandoned Tyres</option>
              <option value="ROOF_GUTTER">Blocked Roof Gutters</option>
              <option value="CONSTRUCTION_SITE">Incomplete Construction Site / Flooded Sump</option>
              <option value="WATER_STORAGE">Uncovered Domestic Water Tank</option>
              <option value="NATURAL_POOL">Stagnant Natural Water Collection</option>
              <option value="OTHER">Other Health Concern</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Description & Larval Presence *
            </label>
            <textarea
              rows={3}
              placeholder="Describe the severity, duration of stagnant water, and approximate area affected..."
              value={newReport.description}
              onChange={(e) => setNewReport({ ...newReport, description: e.target.value })}
              className="w-full p-3 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Your Contact Number (Optional)
              </label>
              <input
                type="tel"
                placeholder="+94 7X XXX XXXX"
                value={newReport.reporterPhone}
                onChange={(e) => setNewReport({ ...newReport, reporterPhone: e.target.value })}
                className="w-full h-10 px-3 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Your Name (Optional)
              </label>
              <input
                type="text"
                placeholder="Name of reporting citizen"
                value={newReport.reporterName}
                onChange={(e) => setNewReport({ ...newReport, reporterName: e.target.value })}
                className="w-full h-10 px-3 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsReportModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="danger" size="sm" disabled={isSubmitting}>
              {isSubmitting ? 'Lodging Report...' : 'Submit Community Report'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
