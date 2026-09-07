'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Database, Upload, CheckCircle2, AlertTriangle, RefreshCw,
  FileSpreadsheet, ArrowLeft, Eye, ShieldCheck, History, Undo2,
  FileText, Plus, ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { SourceBadge } from '@/components/ui/SourceBadge';
import { dataAdminService, getHospitals } from '@/services/apiClient';
import { DatasetImportRecord, Hospital } from '@/types';
import { useToast } from '@/context/ToastContext';
import { formatSriLankanDate, formatSriLankanDateTime } from '@/lib/sriLankaGeo';

export default function AdminDataManagementPage() {
  const { toast } = useToast();

  const [history, setHistory] = useState<DatasetImportRecord[]>([]);
  const [activeTab, setActiveTab] = useState<'import' | 'history'>('import');

  // Form state
  const [datasetName, setDatasetName] = useState('Ministry of Health Facility Register 2025.2');
  const [sourceName, setSourceName] = useState('Ministry of Health Sri Lanka');
  const [sourceUrl, setSourceUrl] = useState('https://www.health.gov.lk');
  const [reportingPeriod, setReportingPeriod] = useState('Annual Health Bulletin 2025');
  const [rawJson, setRawJson] = useState('');
  const [previewRecords, setPreviewRecords] = useState<Partial<Hospital>[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    setHistory(dataAdminService.getHistory());
  }, []);

  const handleSampleLoad = () => {
    const sampleData: Partial<Hospital>[] = [
      {
        name: 'Base Hospital Homagama',
        nameSi: 'මූලික රෝහල හෝමාගම',
        code: 'BH-HOM-32',
        officialCategory: 'Base Hospital (Type A)',
        categoryLabel: 'Base Hospital (Type A)',
        district: 'Colombo',
        region: 'WESTERN' as any,
        address: 'High Level Road, Homagama',
        phone: '+94 11 285 5261',
        totalBeds: 380,
        departments: ['General Medicine', 'General Surgery', 'Pediatrics', 'Obstetrics & Gynecology'],
        coordinates: { latitude: 6.8415, longitude: 80.0034 },
      },
      {
        name: 'Divisional Hospital Divulapitiya',
        nameSi: 'ප්‍රාදේශීය රෝහල දිවුලපිටිය',
        code: 'DH-DIV-33',
        officialCategory: 'Divisional Hospital',
        categoryLabel: 'Divisional Hospital (Type A)',
        district: 'Gampaha',
        region: 'WESTERN' as any,
        address: 'Mirigama Road, Divulapitiya',
        phone: '+94 31 224 6261',
        totalBeds: 120,
        departments: ['Outpatient Care (OPD)', 'Primary Maternal Clinic', 'Emergency Treatment Unit'],
        coordinates: { latitude: 7.2182, longitude: 80.0152 },
      },
      {
        name: 'Base Hospital Mahiyanganaya',
        nameSi: 'මූලික රෝහල මහියංගනය',
        code: 'BH-MAH-34',
        officialCategory: 'Base Hospital (Type B)',
        categoryLabel: 'Base Hospital (Type B)',
        district: 'Badulla',
        region: 'UVA' as any,
        address: 'Padiyatalawa Road, Mahiyanganaya',
        phone: '+94 55 225 7261',
        totalBeds: 240,
        departments: ['General Medicine', 'Surgery', 'Pediatrics', 'Snakebite Management'],
        coordinates: { latitude: 7.3182, longitude: 81.0024 },
      },
    ];
    setRawJson(JSON.stringify(sampleData, null, 2));
    setPreviewRecords(sampleData);
    toast.info('Sample official government facility records loaded into staging area.', 'Staging Ready');
  };

  const handleParseJson = () => {
    try {
      const parsed = JSON.parse(rawJson);
      if (Array.isArray(parsed)) {
        setPreviewRecords(parsed);
        toast.success(`Successfully parsed ${parsed.length} records.`, 'Validation Passed');
      } else {
        toast.error('JSON input must be an array of hospital objects.');
      }
    } catch {
      toast.error('Invalid JSON formatting. Please check syntax.');
    }
  };

  const handleExecuteImport = () => {
    if (previewRecords.length === 0) {
      toast.error('No staged records to import. Please paste JSON or load sample data.');
      return;
    }
    setIsProcessing(true);
    try {
      const { record, added } = dataAdminService.importDataset(
        datasetName,
        sourceName,
        sourceUrl,
        reportingPeriod,
        previewRecords
      );
      setHistory(dataAdminService.getHistory());
      toast.success(
        `Import complete: ${record.changes.added} institutions added, ${record.changes.updated} updated.`,
        'Dataset Version Published'
      );
      setPreviewRecords([]);
      setRawJson('');
      setActiveTab('history');
    } catch {
      toast.error('Import failed during verification stage.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRollback = (id: string) => {
    dataAdminService.rollbackImport(id);
    setHistory(dataAdminService.getHistory());
    toast.warning('Dataset version rolled back to previous stable release.', 'Rollback Complete');
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* Header Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 p-6 sm:p-8 text-white border border-slate-800 shadow-xl space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-300 text-xs font-semibold">
          <Database className="w-3.5 h-3.5 text-teal-400" />
          <span>LankaCare Administrative Data Management Pipeline</span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
          Authoritative Data Ingestion & Version Control
        </h1>

        <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
          Official Data Pipeline: <em>Source → Fetch/Import → Parser → Validation → Normalization → Duplicate Detection → Approval → Versioned Store</em>.
          Historical versions are preserved to ensure auditing integrity without destructive overwrites.
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <Link href="/admin/data-quality">
            <Button variant="outline" size="sm" className="border-teal-500/40 text-teal-200">
              <Eye className="w-3.5 h-3.5 mr-1" /> View Live Data Quality Audit Score
            </Button>
          </Link>
          <a
            href="https://www.health.gov.lk"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-slate-400 hover:text-white font-medium inline-flex items-center gap-1"
          >
            Ministry of Health Source Repository <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('import')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'import'
              ? 'bg-teal-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Upload className="w-3.5 h-3.5" />
          <span>Stage & Import Dataset</span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'history'
              ? 'bg-teal-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <History className="w-3.5 h-3.5" />
          <span>Version History & Rollbacks ({history.length})</span>
        </button>
      </div>

      {/* TAB 1: IMPORT & STAGING PIPELINE */}
      {activeTab === 'import' && (
        <div className="space-y-6">
          <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2">
              1. Dataset Metadata & Provenance Attributes
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Dataset Designation *
                </label>
                <input
                  type="text"
                  value={datasetName}
                  onChange={(e) => setDatasetName(e.target.value)}
                  className="w-full h-9 px-3 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Authoritative Sourcing Agency *
                </label>
                <input
                  type="text"
                  value={sourceName}
                  onChange={(e) => setSourceName(e.target.value)}
                  className="w-full h-9 px-3 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Official Public URL *
                </label>
                <input
                  type="url"
                  value={sourceUrl}
                  onChange={(e) => setSourceUrl(e.target.value)}
                  className="w-full h-9 px-3 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Reporting Period *
                </label>
                <input
                  type="text"
                  value={reportingPeriod}
                  onChange={(e) => setReportingPeriod(e.target.value)}
                  className="w-full h-9 px-3 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100"
                />
              </div>
            </div>
          </div>

          {/* Staging JSON Editor */}
          <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  2. Staging Area (JSON / CSV Format)
                </h3>
                <p className="text-xs text-slate-500">
                  Paste official Ministry records array or load realistic sample records.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={handleSampleLoad}>
                  Load Sample Official Records
                </Button>
                <Button variant="primary" size="sm" onClick={handleParseJson}>
                  Validate Staged Records
                </Button>
              </div>
            </div>

            <textarea
              rows={8}
              value={rawJson}
              onChange={(e) => setRawJson(e.target.value)}
              placeholder='[ { "name": "Base Hospital...", "district": "Colombo", "region": "WESTERN", "totalBeds": 350 } ]'
              className="w-full p-3 font-mono text-xs rounded-xl bg-slate-950 text-emerald-400 border border-slate-800 focus:outline-none"
            />
          </div>

          {/* Records Preview & Approval Gate */}
          {previewRecords.length > 0 && (
            <div className="rounded-xl bg-white dark:bg-slate-900 border border-teal-500/30 p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-teal-600" />
                    <span>Validated Records Staged for Ingestion ({previewRecords.length})</span>
                  </h4>
                  <p className="text-xs text-slate-500">
                    Duplicate detection will preserve existing IDs and update changed attributes.
                  </p>
                </div>

                <Button
                  variant="primary"
                  size="md"
                  onClick={handleExecuteImport}
                  disabled={isProcessing}
                >
                  {isProcessing ? 'Executing Ingestion Pipeline...' : 'Approve & Publish Dataset Version'}
                </Button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="text-[11px] font-bold text-slate-400 uppercase bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                    <tr>
                      <th className="py-2 px-3">Institution Name</th>
                      <th className="py-2 px-3">Classification</th>
                      <th className="py-2 px-3">District</th>
                      <th className="py-2 px-3">Province</th>
                      <th className="py-2 px-3 text-right">Reported Beds</th>
                      <th className="py-2 px-3">Contact</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {previewRecords.map((r, i) => (
                      <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-white">
                          {r.name}
                        </td>
                        <td className="py-2.5 px-3 text-slate-600 dark:text-slate-300">
                          {r.officialCategory || r.type}
                        </td>
                        <td className="py-2.5 px-3 font-semibold text-teal-600 dark:text-teal-400">
                          {r.district}
                        </td>
                        <td className="py-2.5 px-3 text-slate-500">{r.region}</td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold">
                          {r.totalBeds || 0}
                        </td>
                        <td className="py-2.5 px-3 text-slate-500">
                          {r.phone || 'Not available in dataset'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: VERSION HISTORY & ROLLBACK */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Dataset Ingestion Audit Log & Version History
            </h3>

            <div className="space-y-3">
              {history.map((h) => (
                <div
                  key={h.id}
                  className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 space-y-2 hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          v{h.version}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            h.status === 'APPROVED'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                          }`}
                        >
                          {h.status}
                        </span>
                        <SourceBadge type="VERIFIED_OFFICIAL" size="sm" showDetails={false} />
                      </div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                        {h.datasetName}
                      </h4>
                      <p className="text-xs text-slate-500">
                        Source: <strong>{h.sourceName}</strong> ({h.reportingPeriod}) • Published: {h.publishedDate}
                      </p>
                    </div>

                    {h.status === 'APPROVED' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRollback(h.id)}
                        className="text-xs text-amber-600 hover:text-amber-700"
                      >
                        <Undo2 className="w-3.5 h-3.5 mr-1" /> Rollback Release
                      </Button>
                    )}
                  </div>

                  {/* Change Detection Details */}
                  <div className="flex items-center gap-4 text-xs pt-1 border-t border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400">
                    <span>
                      Total Records: <strong>{h.recordCount}</strong>
                    </span>
                    <span className="text-emerald-600 font-semibold">
                      +{h.changes.added} Added
                    </span>
                    <span className="text-blue-600 font-semibold">
                      ~{h.changes.updated} Updated
                    </span>
                    <span>
                      Imported at: {formatSriLankanDateTime(h.importedAt)} by {h.importedBy}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
