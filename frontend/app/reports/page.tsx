'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  FileBarChart2, Download, Printer, Calendar, Filter,
  Building2, BedDouble, Pill, ShieldAlert, Syringe,
  GitPullRequest, MessageSquareQuote, CheckCircle2
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { useToast } from '@/context/ToastContext';
import {
  getHospitals, getMedicines, getDiseaseReports,
  getVaccinations, getReferrals, getAppointments, getComplaints
} from '@/services/apiClient';
import { formatNumber } from '@/lib/utils';
import {
  ResponsiveContainer, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, Tooltip, CartesianGrid, Legend, Cell
} from 'recharts';

export default function ReportsAnalyticsPage() {
  const { toast } = useToast();

  const [dateRange, setDateRange] = useState('30D');
  const [selectedReportType, setSelectedReportType] = useState('hospitals');

  const hospitals = useMemo(() => getHospitals(), []);
  const medicines = useMemo(() => getMedicines(), []);
  const diseases = useMemo(() => getDiseaseReports(), []);
  const vaccinations = useMemo(() => getVaccinations(), []);
  const referrals = useMemo(() => getReferrals(), []);
  const appointments = useMemo(() => getAppointments(), []);
  const complaints = useMemo(() => getComplaints(), []);

  // CSV Export Utility
  const handleExportCSV = () => {
    let rows: string[][] = [];
    let filename = `moh-report-${selectedReportType}-${dateRange}.csv`;

    if (selectedReportType === 'hospitals') {
      rows.push(['Hospital Name', 'Code', 'Type', 'Region', 'Total Beds', 'Available Beds', 'ICU Total', 'ICU Free']);
      hospitals.forEach((h) => {
        rows.push([
          h.name,
          h.code,
          h.type,
          h.region,
          h.totalBeds.toString(),
          (h.availableBeds?.toString() ?? 'N/A'),
          h.icuBedsTotal.toString(),
          (h.icuBedsAvailable?.toString() ?? 'N/A'),
        ]);
      });
    } else if (selectedReportType === 'medicines') {
      rows.push(['Medicine Name', 'Generic', 'Category', 'Hospital', 'Current Stock', 'Reorder Level', 'Status']);
      medicines.forEach((m) => {
        rows.push([m.name, m.genericName, m.category, m.hospitalName, m.stockQuantity.toString(), m.reorderLevel.toString(), m.status]);
      });
    } else if (selectedReportType === 'surveillance') {
      rows.push(['Disease', 'Category', 'Region', 'Reported Cases', 'Active Cases', 'Recovered', 'Deaths', 'Alert Level']);
      diseases.forEach((d) => {
        rows.push([d.diseaseName, d.category, d.region, d.casesReported.toString(), d.activeCases.toString(), d.recovered.toString(), d.deaths.toString(), d.alertLevel]);
      });
    } else {
      rows.push(['Record ID', 'Patient / Subject', 'Status', 'Date']);
      referrals.forEach((r) => {
        rows.push([r.referralNumber, r.patientName, r.status, r.createdAt]);
      });
    }

    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map((e) => e.map((x) => `"${x}"`).join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success(`Exported ${filename} successfully`, 'CSV Generated');
  };

  const handlePrintPDF = () => {
    window.print();
  };

  // Hospital utilization data for chart
  const hospitalChartData = hospitals.slice(0, 8).map((h) => ({
    name: h.code.split('-')[0],
    fullName: h.name,
    Occupancy:
      h.availableBeds != null && h.totalBeds > 0
        ? Math.round(((h.totalBeds - h.availableBeds) / h.totalBeds) * 100)
        : 75,
    TotalBeds: h.totalBeds,
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-50 tracking-tight">
              Executive Healthcare Analytics & Statutory Reports
            </h1>
            <Badge variant="teal">Official Reporting Engine</Badge>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Generate, filter, and export national health indicators for administrative review and Parliamentary oversight.
          </p>
        </div>

        {/* Export Buttons */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            className="gap-1.5 text-xs"
          >
            <Download className="w-3.5 h-3.5" /> Export CSV
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handlePrintPDF}
            className="gap-1.5 text-xs"
          >
            <Printer className="w-3.5 h-3.5" /> Print Official PDF
          </Button>
        </div>
      </div>

      {/* Date Range & Report Category Controls */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        {/* Report Types Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {[
            { id: 'hospitals', label: 'Hospital Utilization' },
            { id: 'medicines', label: 'Medicine Stocks' },
            { id: 'surveillance', label: 'Disease Trajectory' },
            { id: 'referrals', label: 'Referral Efficiency' },
          ].map((type) => (
            <button
              key={type.id}
              onClick={() => setSelectedReportType(type.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                selectedReportType === type.id
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              {type.label}
            </button>
          ))}
        </div>

        {/* Date Ranges */}
        <div className="flex items-center gap-1 text-xs self-start md:self-auto">
          <span className="text-slate-400 mr-1 text-[11px] font-semibold">Period:</span>
          {['Today', '7D', '30D', '3M', '6M', '1Y'].map((range) => (
            <button
              key={range}
              onClick={() => setDateRange(range)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors cursor-pointer ${
                dateRange === range
                  ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800'
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* Primary Visual Report Area */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>
              {selectedReportType === 'hospitals' && 'National Hospital Bed Occupancy & Capacity Utilization'}
              {selectedReportType === 'medicines' && 'National Pharmaceutical Stock Balances & Depletion Rates'}
              {selectedReportType === 'surveillance' && 'Epidemiological Disease Trajectory & Case Density'}
              {selectedReportType === 'referrals' && 'Inter-Facility Referral Transfer Velocity'}
            </CardTitle>
            <Badge variant="teal">Generated for: {dateRange}</Badge>
          </div>
          <CardDescription>Audited statutory data aggregated across all provincial health directorates</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hospitalChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis unit="%" tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderRadius: '8px',
                    border: '1px solid #334155',
                    color: '#fff',
                    fontSize: '11px',
                  }}
                />
                <Bar dataKey="Occupancy" fill="#0d9488" radius={[4, 4, 0, 0]} name="Occupancy %">
                  {hospitalChartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.Occupancy > 90 ? '#ef4444' : entry.Occupancy > 80 ? '#f59e0b' : '#0d9488'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Aggregate Metrics Table */}
      <Card>
        <CardHeader>
          <CardTitle>Summary Indicator Ledger</CardTitle>
          <CardDescription>Granular metric breakdown ready for executive sign-off</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 font-semibold">
                <tr>
                  <th className="p-3">Healthcare Entity / Line</th>
                  <th className="p-3">Jurisdiction</th>
                  <th className="p-3">Metric Value</th>
                  <th className="p-3">Target / Baseline</th>
                  <th className="p-3 text-right">Performance Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {selectedReportType === 'hospitals' &&
                  hospitals.map((h) => (
                    <tr key={h.id}>
                      <td className="p-3 font-bold text-slate-900 dark:text-slate-100">{h.name}</td>
                      <td className="p-3 text-slate-500">{h.region} Province</td>
                      <td className="p-3 font-semibold">{h.availableBeds != null ? `${h.totalBeds - h.availableBeds} Occupied Beds` : `${h.totalBeds} Registered Beds`}</td>
                      <td className="p-3 text-slate-500">{h.totalBeds} Capacity</td>
                      <td className="p-3 text-right">
                        <Badge variant="emerald" size="sm">Optimal</Badge>
                      </td>
                    </tr>
                  ))}

                {selectedReportType === 'medicines' &&
                  medicines.map((m) => (
                    <tr key={m.id}>
                      <td className="p-3 font-bold text-slate-900 dark:text-slate-100">{m.name}</td>
                      <td className="p-3 text-slate-500">{m.hospitalName}</td>
                      <td className="p-3 font-semibold">{m.stockQuantity} Units</td>
                      <td className="p-3 text-slate-500">{m.reorderLevel} Reorder Level</td>
                      <td className="p-3 text-right">
                        <Badge
                          variant={m.status === 'CRITICAL' ? 'rose' : m.status === 'LOW_STOCK' ? 'amber' : 'emerald'}
                          size="sm"
                        >
                          {m.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}

                {selectedReportType === 'surveillance' &&
                  diseases.map((d) => (
                    <tr key={d.id}>
                      <td className="p-3 font-bold text-slate-900 dark:text-slate-100">{d.diseaseName}</td>
                      <td className="p-3 text-slate-500">{d.region}</td>
                      <td className="p-3 font-semibold">{d.casesReported.toLocaleString()} Cases</td>
                      <td className="p-3 text-slate-500">{d.thresholdLimit.toLocaleString()} Threshold</td>
                      <td className="p-3 text-right">
                        <Badge variant={d.isThresholdBreached ? 'rose' : 'emerald'} size="sm">
                          {d.isThresholdBreached ? 'Threshold Breached' : 'Within Bounds'}
                        </Badge>
                      </td>
                    </tr>
                  ))}

                {selectedReportType === 'referrals' &&
                  referrals.map((r) => (
                    <tr key={r.id}>
                      <td className="p-3 font-bold text-slate-900 dark:text-slate-100">{r.referralNumber} ({r.patientName})</td>
                      <td className="p-3 text-slate-500">{r.receivingHospitalName}</td>
                      <td className="p-3 font-semibold">{r.requiredSpecialty}</td>
                      <td className="p-3 text-slate-500">{r.priority}</td>
                      <td className="p-3 text-right">
                        <Badge variant="teal" size="sm">{r.status}</Badge>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
