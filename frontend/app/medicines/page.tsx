'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Pill, Search, Filter, AlertTriangle, AlertCircle, CheckCircle2,
  Building2, RefreshCw, Plus, PackageCheck, AlertOctagon, ExternalLink,
  BookOpen, ShieldCheck, Info, FileText, Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card, CardContent } from '@/components/ui/Card';
import { SourceBadge } from '@/components/ui/SourceBadge';
import { getMedicineCatalog, MedicineCatalogItem, publicMedicineService } from '@/services/apiClient';
import { useLanguage } from '@/context/LanguageContext';

export default function MedicinesPage() {
  const { t } = useLanguage();
  const catalog = useMemo(() => getMedicineCatalog(), []);

  const [activeTab, setActiveTab] = useState<'catalog' | 'inventory'>('catalog');
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  const categories = useMemo(() => {
    const set = new Set(catalog.map((m) => m.category));
    return ['ALL', ...Array.from(set)];
  }, [catalog]);

  const filteredCatalog = useMemo(() => {
    return catalog.filter((m) => {
      const matchSearch =
        m.genericName.toLowerCase().includes(search.toLowerCase()) ||
        m.brandExamples.toLowerCase().includes(search.toLowerCase()) ||
        m.code.toLowerCase().includes(search.toLowerCase()) ||
        m.indications.toLowerCase().includes(search.toLowerCase());
      const matchCat = selectedCategory === 'ALL' || m.category === selectedCategory;
      return matchSearch && matchCat;
    });
  }, [catalog, search, selectedCategory]);

  const [inventorySearch, setInventorySearch] = useState('');
  const [inventoryDistrict, setInventoryDistrict] = useState('');
  const [inventoryResults, setInventoryResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleInventorySearch = async () => {
    if (!inventorySearch.trim()) return;
    setIsSearching(true);
    try {
      const res = await publicMedicineService.searchAvailability(inventorySearch, inventoryDistrict || undefined);
      setInventoryResults(res.data);
    } catch (err) {
      console.error('Failed to search inventory:', err);
    } finally {
      setIsSearching(false);
    }
  };


  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* Header Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-purple-950 via-slate-900 to-slate-950 p-6 sm:p-8 text-white border border-purple-900/40 shadow-xl space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-semibold">
          <Pill className="w-3.5 h-3.5 text-purple-400" />
          <span>National Essential Medicines Architecture</span>
        </div>

        <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
          Sri Lanka Medicines Registry
        </h1>

        <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
          National Essential Medicines List (NEML) published by the National Medicines Regulatory Authority (NMRA)
          and Medical Supplies Division (MSD). Verified clinical information is kept strictly separate from hospital inventory telemetry.
        </p>

        <div className="flex flex-wrap items-center gap-2 pt-1">
          <SourceBadge
            type="VERIFIED_OFFICIAL"
            sourceName="NMRA Sri Lanka (nmra.gov.lk) & MSD"
            sourceUrl="https://nmra.gov.lk"
            publishedDate="2025-2026"
            size="sm"
          />
          <a
            href="https://nmra.gov.lk"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-purple-300 hover:text-white font-semibold inline-flex items-center gap-1 ml-auto"
          >
            Official NMRA Portal <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Tab Switcher: Medicine Information vs Medicine Inventory (Requirement 14) */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('catalog')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'catalog'
              ? 'bg-teal-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>1. Official Medicine Information (Essential List)</span>
        </button>

        <button
          onClick={() => setActiveTab('inventory')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'inventory'
              ? 'bg-purple-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <PackageCheck className="w-3.5 h-3.5" />
          <span>2. Hospital Inventory Status</span>
        </button>
      </div>

      {/* TAB 1: MEDICINE INFORMATION (NEML SRI LANKA) */}
      {activeTab === 'catalog' && (
        <div className="space-y-4">
          {/* Search & Category Filter */}
          <div className="rounded-xl bg-white dark:bg-slate-900 p-4 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Search by generic drug name, brand, MSD code, therapeutic indication..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-10 pl-9 pr-3 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div className="sm:w-64">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full h-10 px-3 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c === 'ALL' ? 'All Therapeutic Categories' : c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Medicine Information Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredCatalog.map((med) => (
              <div
                key={med.code}
                className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-3 hover:border-purple-500/50 transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs font-bold text-teal-600 dark:text-teal-400">
                        {med.code}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                        {med.essentialLevel}
                      </span>
                      <SourceBadge type="VERIFIED_OFFICIAL" size="sm" showDetails={false} />
                    </div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white mt-1">
                      {med.genericName}
                    </h3>
                    <p className="text-xs text-slate-500">
                      Brand Examples: <strong className="text-slate-700 dark:text-slate-300">{med.brandExamples}</strong>
                    </p>
                  </div>
                </div>

                <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                  <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
                    <span className="text-slate-500 dark:text-slate-400 block font-semibold mb-0.5">
                      Clinical Indications:
                    </span>
                    <p className="text-slate-800 dark:text-slate-200 leading-relaxed">
                      {med.indications}
                    </p>
                  </div>

                  <div>
                    <span className="text-[11px] text-slate-500">Official Dosage Forms:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {med.dosageForms.map((df, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[11px] font-medium text-slate-700 dark:text-slate-300"
                        >
                          {df}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 flex items-center justify-between">
                  <span>Category: <strong>{med.category}</strong></span>
                  <span className="text-slate-400 italic">Source: {med.source}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: MEDICINE INVENTORY */}
      {activeTab === 'inventory' && (
        <div className="space-y-4">
          <div className="p-6 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800/80 text-amber-900 dark:text-amber-200 space-y-2">
            <div className="flex items-center gap-2 font-bold text-sm">
              <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
              <span>Real-time availability search from verified institutions.</span>
            </div>
            <p className="text-xs text-amber-800/90 dark:text-amber-300/90 leading-relaxed">
              Query the availability of essential medicines across participating hospitals. Data is sourced from official institutional records.
            </p>
          </div>

          <div className="rounded-xl bg-white dark:bg-slate-900 p-4 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Search by generic drug name..."
                value={inventorySearch}
                onChange={(e) => setInventorySearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleInventorySearch()}
                className="w-full h-10 pl-9 pr-3 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div className="sm:w-48">
              <input
                type="text"
                placeholder="District (Optional)"
                value={inventoryDistrict}
                onChange={(e) => setInventoryDistrict(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleInventorySearch()}
                className="w-full h-10 px-3 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <Button onClick={handleInventorySearch} disabled={isSearching || !inventorySearch.trim()}>
              {isSearching ? 'Searching...' : 'Search Availability'}
            </Button>
          </div>

          {/* Hospital-specific inventory tracking */}
          <div className="rounded-xl bg-white dark:bg-slate-900 p-5 border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-teal-600" />
                  Verified Hospital Medicine Inventories
                </h3>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400">
                    <th className="py-2.5 px-3">Medicine</th>
                    <th className="py-2.5 px-3">Hospital Facility</th>
                    <th className="py-2.5 px-3">District</th>
                    <th className="py-2.5 px-3">Available Quantity</th>
                    <th className="py-2.5 px-3">Alert Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {inventoryResults.map((inv, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-slate-100">{inv.medicineName}</td>
                      <td className="py-2.5 px-3 text-teal-600 font-semibold">{inv.hospitalName}</td>
                      <td className="py-2.5 px-3">{inv.district}</td>
                      <td className="py-2.5 px-3 font-semibold">{inv.availableQuantity}</td>
                      <td className="py-2.5 px-3">
                        <Badge variant={inv.status === 'CRITICAL' ? 'rose' : inv.status === 'LOW_STOCK' ? 'amber' : 'emerald'} size="sm">
                          {inv.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                  {inventoryResults.length === 0 && !isSearching && (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-500">
                        {inventorySearch ? 'No availability found.' : 'Enter a medicine name to check availability.'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
