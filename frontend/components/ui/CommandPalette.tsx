'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search, Building2, UserCheck, Users, Pill, Megaphone,
  Flag, AlertCircle, ArrowRight, X, Command, Compass, Bug, Database, Sparkles
} from 'lucide-react';
import {
  getHospitals, getDoctors, getPatients, getMedicines,
  getAnnouncements, getCampaigns
} from '@/services/apiClient';
import { SRI_LANKA_DISTRICTS } from '@/lib/sriLankaGeo';

export interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose }) => {
  const router = useRouter();
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else setQuery('');
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const results = useMemo(() => {
    if (!query.trim()) return null;
    const q = query.toLowerCase();

    // Matching Districts
    const districts = Object.values(SRI_LANKA_DISTRICTS)
      .filter((d) => d.name.toLowerCase().includes(q) || d.provinceName.toLowerCase().includes(q))
      .slice(0, 3)
      .map((d) => ({
        id: `district-${d.name}`,
        title: `${d.name} District`,
        subtitle: `${d.provinceName} • Est. Pop: ${d.populationEstimate.toLocaleString()}`,
        category: 'Districts',
        url: `/hospitals?district=${encodeURIComponent(d.name)}`,
        icon: Compass,
      }));

    const hospitals = getHospitals()
      .filter((h) => h.name.toLowerCase().includes(q) || (h.district && h.district.toLowerCase().includes(q)) || h.region.toLowerCase().includes(q))
      .slice(0, 4)
      .map((h) => ({ id: h.id, title: h.name, subtitle: `${h.categoryLabel || h.officialCategory || h.type} • ${h.district || h.region}`, category: 'Hospitals', url: `/hospitals/${h.id}`, icon: Building2 }));

    const doctors = getDoctors()
      .filter((d) => d.name.toLowerCase().includes(q) || d.specialty.toLowerCase().includes(q))
      .slice(0, 3)
      .map((d) => ({ id: d.id, title: d.name, subtitle: `${d.specialty} • ${d.hospitalName}`, category: 'Doctors', url: `/staff`, icon: UserCheck }));

    const patients = getPatients()
      .filter((p) => p.name.toLowerCase().includes(q) || p.nic.includes(q) || p.phn.toLowerCase().includes(q))
      .slice(0, 2)
      .map((p) => ({ id: p.id, title: p.name, subtitle: `PHN: ${p.phn} • NIC: ${p.nic}`, category: 'Patients', url: `/patients/${p.id}`, icon: Users }));

    const medicines = getMedicines()
      .filter((m) => m.name.toLowerCase().includes(q) || m.genericName.toLowerCase().includes(q))
      .slice(0, 3)
      .map((m) => ({ id: m.id, title: m.name, subtitle: `${m.category} • Essential Catalog`, category: 'Medicines', url: `/medicines`, icon: Pill }));

    const announcements = getAnnouncements()
      .filter((a) => a.title.toLowerCase().includes(q))
      .slice(0, 2)
      .map((a) => ({ id: a.id, title: a.title, subtitle: a.department, category: 'Announcements', url: `/announcements`, icon: Megaphone }));

    const campaigns = getCampaigns()
      .filter((c) => c.title.toLowerCase().includes(q))
      .slice(0, 2)
      .map((c) => ({ id: c.id, title: c.title, subtitle: `${c.progressPercentage}% completed`, category: 'Campaigns', url: `/campaigns`, icon: Flag }));

    return [...districts, ...hospitals, ...doctors, ...patients, ...medicines, ...announcements, ...campaigns];
  }, [query]);

  const handleSelect = (url: string) => {
    router.push(url);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4">
      <div
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="relative w-full max-w-2xl rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden z-10 flex flex-col animate-in zoom-in-95 duration-150">
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-100 dark:border-slate-800">
          <Search className="w-5 h-5 text-slate-400 shrink-0 mr-3" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search hospitals, 25 districts, doctors, medicines, dengue reports..."
            className="w-full bg-transparent text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none"
            autoFocus
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-flex items-center gap-1 rounded bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[11px] font-medium text-slate-500 ml-2">
            ESC
          </kbd>
        </div>

        {/* Results / Navigation Suggestions */}
        <div className="max-h-96 overflow-y-auto p-2">
          {!query.trim() ? (
            <div className="p-4">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Quick Healthcare Services
              </p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {[
                  { label: 'National Health Map (GIS)', url: '/map', icon: Compass, color: 'text-teal-500' },
                  { label: 'Base Hospital Kinniya', url: '/hospitals/kinniya', icon: Building2, color: 'text-blue-500' },
                  { label: 'Compare Hospitals', url: '/compare-hospitals', icon: Sparkles, color: 'text-purple-500' },
                  { label: 'Hospital Directory (25 Districts)', url: '/hospitals', icon: Building2, color: 'text-emerald-500' },
                  { label: 'Emergency Center (1990)', url: '/emergency', icon: AlertCircle, color: 'text-amber-500' },
                  { label: 'Dengue Surveillance', url: '/dengue', icon: Bug, color: 'text-rose-500' },
                  { label: 'Essential Medicines (NMRA)', url: '/medicines', icon: Pill, color: 'text-sky-500' },
                  { label: 'Staff Roster & Scheduling', url: '/staff/schedule', icon: UserCheck, color: 'text-indigo-500' },
                ].map((item) => (
                  <button
                    key={item.url}
                    onClick={() => handleSelect(item.url)}
                    className="flex items-center gap-2.5 p-2.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/70 text-slate-700 dark:text-slate-300 text-left transition-colors cursor-pointer"
                  >
                    <item.icon className={`w-4 h-4 ${item.color}`} />
                    <span className="font-medium">{item.label}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : results && results.length > 0 ? (
            <div className="space-y-1">
              {results.map((item) => (
                <button
                  key={`${item.category}-${item.id}`}
                  onClick={() => handleSelect(item.url)}
                  className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors text-left group cursor-pointer"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 group-hover:bg-teal-50 dark:group-hover:bg-teal-950/60 group-hover:text-teal-600 dark:group-hover:text-teal-400 shrink-0">
                      <item.icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">
                        {item.title}
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                        {item.subtitle}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 ml-3">
                    <span className="text-[10px] font-semibold uppercase text-slate-400 px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800">
                      {item.category}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-transform group-hover:translate-x-0.5" />
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-xs text-slate-500 dark:text-slate-400">
              No results found matching &quot;{query}&quot;. Try searching for &quot;Colombo&quot;, &quot;NHSL&quot;, &quot;Kandy&quot;, or &quot;Paracetamol&quot;.
            </div>
          )}
        </div>

        {/* Palette Footer */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500">
          <span className="flex items-center gap-1.5">
            <Command className="w-3.5 h-3.5" /> LankaCare Global Search (25 Districts)
          </span>
          <span className="hidden sm:inline">Use arrows to navigate, Enter to select</span>
        </div>
      </div>
    </div>
  );
};

