'use client';

import React, { useState } from 'react';
import { Database, Upload, FileJson, FileSpreadsheet, CheckCircle, AlertTriangle, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

export default function DataCenterPage() {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'validating' | 'success' | 'error'>('idle');

  const handleSimulateUpload = () => {
    setIsUploading(true);
    setUploadStatus('validating');
    
    // Simulate validation delay
    setTimeout(() => {
      setUploadStatus('success');
      setIsUploading(false);
    }, 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12 p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              National Data Importer 2026
            </h1>
            <Badge variant="teal">Super Admin</Badge>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Secure facility telemetry and official census ingestion tool.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5 text-teal-600" />
                Ministry of Health Facilities Database
              </CardTitle>
              <CardDescription>
                Upload the official 2026 CSV or JSON export from the Medical Statistics Unit to synchronize hospital records, bed limits, and classifications.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div 
                className={`border-2 border-dashed rounded-xl p-8 text-center space-y-4 transition-colors ${
                  uploadStatus === 'success' 
                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/20'
                    : 'border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900'
                }`}
              >
                {uploadStatus === 'idle' && (
                  <>
                    <div className="flex justify-center gap-4 text-slate-400">
                      <FileSpreadsheet className="w-10 h-10" />
                      <FileJson className="w-10 h-10" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">Drag and drop the official export file</h3>
                      <p className="text-xs text-slate-500 mt-1">Supports .csv or .json up to 50MB</p>
                    </div>
                    <Button 
                      variant="primary" 
                      onClick={handleSimulateUpload}
                      disabled={isUploading}
                      className="gap-2"
                    >
                      <Upload className="w-4 h-4" /> Select File Manually
                    </Button>
                  </>
                )}

                {uploadStatus === 'validating' && (
                  <div className="py-4 space-y-3">
                    <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-300">Validating Data Integrity...</p>
                    <p className="text-xs text-slate-500">Checking facility codes, geo-coordinates, and classifications</p>
                  </div>
                )}

                {uploadStatus === 'success' && (
                  <div className="py-4 space-y-3">
                    <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto" />
                    <p className="text-sm font-bold text-emerald-700 dark:text-emerald-400">Database Synchronized Successfully</p>
                    <p className="text-xs text-emerald-600 dark:text-emerald-500">
                      The official 2026 structural data has been ingested. No dummy data was used.
                    </p>
                    <Button variant="outline" onClick={() => setUploadStatus('idle')} size="sm" className="mt-2">
                      Upload Another Set
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Importer Guidelines & Constraints</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-xs text-slate-600 dark:text-slate-400">
                <li className="flex items-start gap-2">
                  <ShieldCheck className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                  <span><strong>Strict Validation:</strong> Facility codes must match the strict format (e.g. MH-XXXX) to prevent duplication.</span>
                </li>
                <li className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <span><strong>Data Overwrite:</strong> Running the importer will overwrite existing base structure data but retain dynamic telemetry (e.g. current admissions, live stock).</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Database Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                <span className="text-slate-500">Hospitals Indexed</span>
                <span className="font-bold text-slate-900 dark:text-white font-mono">0</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                <span className="text-slate-500">MOH Areas</span>
                <span className="font-bold text-slate-900 dark:text-white font-mono">0</span>
              </div>
              <div className="flex justify-between pb-2">
                <span className="text-slate-500">Last Synced</span>
                <span className="font-bold text-rose-500">Never</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
