'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ShieldCheck, AlertTriangle, CheckCircle2, AlertOctagon,
  RefreshCw, Database, FileText, ArrowRight, ExternalLink,
  Layers, Check, XCircle, Info
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { SourceBadge } from '@/components/ui/SourceBadge';
import { dataAdminService, getDatasetImports, getHospitals } from '@/services/apiClient';
import { DataQualityReport, DatasetImportRecord } from '@/types';
import { formatSriLankanDate, formatSriLankanDateTime } from '@/lib/sriLankaGeo';

export default function DataQualityPage() {
  const [report, setReport] = useState<DataQualityReport | null>(null);
  const [history, setHistory] = useState<DatasetImportRecord[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const runAudit = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      const qReport = dataAdminService.calculateDataQualityReport();
      setReport(qReport);
      setHistory(getDatasetImports());
      setIsRefreshing(false);
    }, 200);
  };

  useEffect(() => {
    runAudit();
  }, []);

  if (!report) return null;

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* Header Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-teal-950 via-slate-900 to-slate-950 p-6 sm:p-8 text-white border border-teal-900/40 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-300 text-xs font-semibold">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
              <span>National Health Information Architecture Audit</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Data Quality & Dataset Freshness
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
              Live audit validation checking completeness, administrative province/district compliance,
              WGS84 coordinate bounds, and official source provenance across all records.
            </p>

            <div className="text-[11px] text-slate-400 pt-1">
              Last audited:{' '}
              <strong className="text-slate-200">
                {formatSriLankanDateTime(report.lastCalculated)}
              </strong>
            </div>
          </div>

          <Button
            variant="outline"
            size="md"
            onClick={runAudit}
            disabled={isRefreshing}
            className="border-teal-500/40 text-teal-200 hover:bg-teal-950/60 shrink-0"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Run Live Quality Audit
          </Button>
        </div>
      </div>

      {/* Main Score Display (Calculated from live database audit) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Overall Quality Score */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Data Quality Score
            </span>
            <SourceBadge
              type="SYSTEM_CALCULATED"
              customText="✦ Calculated"
              size="sm"
              showDetails={false}
            />
          </div>

          <div className="flex items-baseline gap-2">
            <span
              className={`text-4xl sm:text-5xl font-black font-mono tracking-tight ${
                report.overallScore >= 90
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : report.overallScore >= 75
                  ? 'text-amber-500'
                  : 'text-rose-500'
              }`}
            >
              {report.overallScore}%
            </span>
            <span className="text-xs text-slate-400 font-semibold">/ 100%</span>
          </div>

          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
            Calculated across {report.totalRecords} healthcare facilities using 6-point verification rules.
          </p>
        </div>

        {/* Geographic Integrity */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Administrative Compliance
          </span>
          <div className="text-3xl font-bold text-slate-900 dark:text-white font-mono">
            {report.validDistrictsScore}%
          </div>
          <div className="space-y-1 text-[11px] text-slate-500">
            <div className="flex justify-between">
              <span>9 Provinces Valid:</span>
              <strong className="text-emerald-600">{report.validProvincesScore}%</strong>
            </div>
            <div className="flex justify-between">
              <span>25 Districts Valid:</span>
              <strong className="text-emerald-600">{report.validDistrictsScore}%</strong>
            </div>
          </div>
        </div>

        {/* Spatial Coordinates Bounds */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Coordinate Accuracy
          </span>
          <div className="text-3xl font-bold text-slate-900 dark:text-white font-mono">
            {report.validCoordinatesScore}%
          </div>
          <p className="text-[11px] text-slate-500">
            WGS84 lat (5.8° - 9.9°N) & lng (79.5° - 82.0°E) inside Sri Lanka territory.
          </p>
        </div>

        {/* Source Provenance */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Official Sourcing
          </span>
          <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 font-mono">
            {report.verifiedSourceScore}%
          </div>
          <p className="text-[11px] text-slate-500">
            Linked to Ministry of Health or Epidemiology Unit authoritative endpoints.
          </p>
        </div>
      </div>

      {/* Sourced Datasets Table (Requirement 27) */}
      <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Official Sourced Datasets Register
            </h3>
            <p className="text-xs text-slate-500">
              Freshness, reporting periods, and verification status of imported government tables.
            </p>
          </div>

          <Link href="/admin/data">
            <Button variant="outline" size="sm">
              <Database className="w-3.5 h-3.5 mr-1" /> Manage Datasets
            </Button>
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="text-[11px] font-bold text-slate-400 uppercase bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="py-2.5 px-3">Dataset Name</th>
                <th className="py-2.5 px-3">Official Source</th>
                <th className="py-2.5 px-3">Reporting Period</th>
                <th className="py-2.5 px-3">Published Date</th>
                <th className="py-2.5 px-3">Last Synchronized</th>
                <th className="py-2.5 px-3 text-right">Records</th>
                <th className="py-2.5 px-3">Verification Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {history.map((ds) => (
                <tr key={ds.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td className="py-3 px-3 font-bold text-slate-900 dark:text-white">
                    {ds.datasetName}
                    <span className="block text-[10px] font-mono text-slate-400">
                      v{ds.version}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <a
                      href={ds.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-teal-600 dark:text-teal-400 font-medium hover:underline inline-flex items-center gap-1"
                    >
                      {ds.sourceName} <ExternalLink className="w-3 h-3" />
                    </a>
                  </td>
                  <td className="py-3 px-3 text-slate-600 dark:text-slate-300">
                    {ds.reportingPeriod}
                  </td>
                  <td className="py-3 px-3 text-slate-500 font-mono">{ds.publishedDate}</td>
                  <td className="py-3 px-3 text-slate-500 font-mono">
                    {formatSriLankanDate(ds.importedAt)}
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-bold text-slate-900 dark:text-white">
                    {ds.recordCount}
                  </td>
                  <td className="py-3 px-3">
                    <SourceBadge
                      type="VERIFIED_OFFICIAL"
                      sourceName={ds.sourceName}
                      sourceUrl={ds.sourceUrl}
                      publishedDate={ds.publishedDate}
                      reportingPeriod={ds.reportingPeriod}
                      size="sm"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Identified Data Quality Issues List */}
      <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-3">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Info className="w-4 h-4 text-teal-600" />
          <span>Detailed Data Quality Audit Log ({report.issues.length} notifications)</span>
        </h3>

        {report.issues.length === 0 ? (
          <div className="p-4 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>All records satisfy 100% of Sri Lanka administrative and geographic rules.</span>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-64 overflow-y-auto">
            {report.issues.map((iss, i) => (
              <div key={i} className="py-2.5 flex items-start justify-between text-xs">
                <div className="space-y-0.5">
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {iss.recordName}
                  </span>
                  <p className="text-slate-500 text-[11px]">{iss.message}</p>
                </div>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    iss.severity === 'ERROR'
                      ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                      : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                  }`}
                >
                  {iss.severity}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
