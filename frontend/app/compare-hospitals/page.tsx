'use client';

import React, { useState, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  Layers, Building2, MapPin, Phone, Mail, BedDouble, HeartPulse,
  Stethoscope, ShieldCheck, ArrowRight, CheckCircle2, XCircle, Star
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { getHospitals } from '@/services/apiClient';
import { Hospital } from '@/types';

function CompareHospitalsContent() {
  const searchParams = useSearchParams();
  const allHospitals = useMemo(() => getHospitals(), []);

  const initialH1 = searchParams.get('h1') || 'hosp-001';
  const initialH2 = searchParams.get('h2') || 'hosp-kinniya';
  const initialH3 = searchParams.get('h3') || 'hosp-008';

  const [hosp1Id, setHosp1Id] = useState(initialH1);
  const [hosp2Id, setHosp2Id] = useState(initialH2);
  const [hosp3Id, setHosp3Id] = useState(initialH3);

  const h1 = allHospitals.find(h => h.id === hosp1Id) || allHospitals[0];
  const h2 = allHospitals.find(h => h.id === hosp2Id) || allHospitals[1];
  const h3 = allHospitals.find(h => h.id === hosp3Id) || null;

  const compareCols = [h1, h2, h3].filter(Boolean) as Hospital[];

  const selectOptions = allHospitals.map(h => ({
    value: h.id,
    label: `${h.name} (${h.district})`
  }));

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-teal-600 dark:text-teal-400 uppercase tracking-wider mb-1">
            <Layers className="w-4 h-4" /> Healthcare Institution Benchmarking
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-50 tracking-tight">
            Compare Sri Lanka Hospitals
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Side-by-side clinical capacity, certified ward beds, ICU units, and specialized department comparison.
          </p>
        </div>

        <Link href="/map">
          <Button variant="outline" size="sm" className="gap-1.5 text-xs">
            <MapPin className="w-3.5 h-3.5 text-teal-600" /> View on Map
          </Button>
        </Link>
      </div>

      {/* Selectors Bar */}
      <Card className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Select
            label="Hospital 1"
            value={hosp1Id}
            onChange={(e) => setHosp1Id(e.target.value)}
            options={selectOptions}
          />
          <Select
            label="Hospital 2"
            value={hosp2Id}
            onChange={(e) => setHosp2Id(e.target.value)}
            options={selectOptions}
          />
          <Select
            label="Hospital 3 (Optional)"
            value={hosp3Id}
            onChange={(e) => setHosp3Id(e.target.value)}
            options={[{ value: '', label: '-- None (2 Hospitals) --' }, ...selectOptions]}
          />
        </div>
      </Card>

      {/* Side-by-Side Comparison Table */}
      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60">
                <th className="py-4 px-4 w-1/4 text-slate-500 uppercase tracking-wider text-[11px]">
                  Metric / Feature
                </th>
                {compareCols.map(h => (
                  <th key={h.id} className="py-4 px-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5">
                        <Badge variant="teal" size="sm">{h.type}</Badge>
                        {h.id === 'hosp-kinniya' && (
                          <Badge variant="blue" size="sm">Trincomalee RDHS</Badge>
                        )}
                      </div>
                      <p className="text-sm font-black text-slate-900 dark:text-slate-100">{h.name}</p>
                      <p className="text-[11px] text-slate-400 font-mono">{h.code}</p>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {/* Category */}
              <tr>
                <td className="py-3 px-4 font-bold text-slate-700 dark:text-slate-300">Official Category</td>
                {compareCols.map(h => (
                  <td key={h.id} className="py-3 px-4 font-semibold text-slate-800 dark:text-slate-200">
                    {h.officialCategory?.replace(/_/g, ' ') || h.type}
                  </td>
                ))}
              </tr>

              {/* District & Province */}
              <tr>
                <td className="py-3 px-4 font-bold text-slate-700 dark:text-slate-300">District & Province</td>
                {compareCols.map(h => (
                  <td key={h.id} className="py-3 px-4 text-slate-600 dark:text-slate-300">
                    {h.district} District ({h.region} Province)
                  </td>
                ))}
              </tr>

              {/* Certified Ward Beds */}
              <tr className="bg-slate-50/50 dark:bg-slate-800/30">
                <td className="py-3 px-4 font-bold text-slate-700 dark:text-slate-300">Certified Ward Beds</td>
                {compareCols.map(h => (
                  <td key={h.id} className="py-3 px-4 font-bold text-base text-slate-900 dark:text-slate-100">
                    {h.totalBeds} <span className="text-xs font-normal text-slate-400">beds</span>
                  </td>
                ))}
              </tr>

              {/* ICU Capacity */}
              <tr>
                <td className="py-3 px-4 font-bold text-slate-700 dark:text-slate-300">ICU Bed Capacity</td>
                {compareCols.map(h => (
                  <td key={h.id} className="py-3 px-4 font-bold text-teal-600 dark:text-teal-400">
                    {h.icuBedsTotal > 0 ? `${h.icuBedsTotal} Ventilated Units` : 'Referred to Provincial General'}
                  </td>
                ))}
              </tr>

              {/* Emergency Unit */}
              <tr className="bg-slate-50/50 dark:bg-slate-800/30">
                <td className="py-3 px-4 font-bold text-slate-700 dark:text-slate-300">24/7 Emergency & ETU</td>
                {compareCols.map(h => (
                  <td key={h.id} className="py-3 px-4">
                    {h.emergencyAvailable ? (
                      <span className="flex items-center gap-1.5 text-emerald-600 font-bold">
                        <CheckCircle2 className="w-4 h-4" /> Active (1990 Synced)
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 text-rose-500 font-bold">
                        <XCircle className="w-4 h-4" /> Diverted
                      </span>
                    )}
                  </td>
                ))}
              </tr>

              {/* Specialists / Doctors */}
              <tr>
                <td className="py-3 px-4 font-bold text-slate-700 dark:text-slate-300">Practitioners / Doctors</td>
                {compareCols.map(h => (
                  <td key={h.id} className="py-3 px-4 font-semibold text-slate-800 dark:text-slate-200">
                    {h.doctorsCount || 28} Medical Officers & Consultants
                  </td>
                ))}
              </tr>

              {/* Quality Score */}
              <tr className="bg-slate-50/50 dark:bg-slate-800/30">
                <td className="py-3 px-4 font-bold text-slate-700 dark:text-slate-300">Ministry Quality Rating</td>
                {compareCols.map(h => (
                  <td key={h.id} className="py-3 px-4">
                    <div className="flex items-center gap-1 text-amber-500 font-bold">
                      <Star className="w-3.5 h-3.5 fill-amber-400" />
                      <span>{h.rating || 4.5} / 5.0</span>
                    </div>
                  </td>
                ))}
              </tr>

              {/* Clinical Departments */}
              <tr>
                <td className="py-3 px-4 font-bold text-slate-700 dark:text-slate-300 align-top">Clinical Departments</td>
                {compareCols.map(h => (
                  <td key={h.id} className="py-3 px-4 align-top">
                    <div className="flex flex-wrap gap-1.5">
                      {h.departments.map(d => (
                        <span key={d} className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-[11px] text-slate-700 dark:text-slate-300">
                          {d}
                        </span>
                      ))}
                    </div>
                  </td>
                ))}
              </tr>

              {/* Data Verification Source */}
              <tr className="bg-slate-50/50 dark:bg-slate-800/30">
                <td className="py-3 px-4 font-bold text-slate-700 dark:text-slate-300">Authoritative Baseline</td>
                {compareCols.map(h => (
                  <td key={h.id} className="py-3 px-4 text-[11px] text-teal-600 dark:text-teal-400">
                    <ShieldCheck className="w-3.5 h-3.5 inline mr-1" />
                    {h.sourceName || 'Ministry of Health Sri Lanka'}
                  </td>
                ))}
              </tr>

              {/* Actions */}
              <tr>
                <td className="py-4 px-4 font-bold text-slate-700 dark:text-slate-300">Navigation</td>
                {compareCols.map(h => (
                  <td key={h.id} className="py-4 px-4">
                    <Link href={h.id === 'hosp-kinniya' ? '/hospitals/kinniya' : `/hospitals/${h.id}`}>
                      <Button variant="primary" size="sm" className="w-full text-xs gap-1">
                        Open Hospital <ArrowRight className="w-3 h-3" />
                      </Button>
                    </Link>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

export default function CompareHospitalsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-slate-400">Loading Hospital Benchmark...</div>}>
      <CompareHospitalsContent />
    </Suspense>
  );
}
