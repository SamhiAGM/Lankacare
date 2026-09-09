'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Compass, MapPin, Building2, Stethoscope, ChevronRight, Phone,
  BedDouble, ExternalLink, Filter, CheckCircle2, AlertCircle, ArrowLeft,
  Sparkles, RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { SourceBadge } from '@/components/ui/SourceBadge';
import { publicHospitalService } from '@/services/apiClient';
import { Hospital, SriLankaHospitalCategory, SriLankaRegion } from '@/types';
import {
  SRI_LANKA_PROVINCES, SRI_LANKA_DISTRICTS,
  getDistrictsByProvince, formatSriLankanPhone
} from '@/lib/sriLankaGeo';
import { useLanguage } from '@/context/LanguageContext';
import { RoleGuard } from '@/components/auth/RoleGuard';

export default function FindCarePage() {
  const { t } = useLanguage();
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  React.useEffect(() => {
    const fetchHospitals = async () => {
      try {
        setIsLoading(true);
        setLoadError('');
        const res = await publicHospitalService.search({ limit: '1000' });
        setHospitals(res.data);
      } catch (err) {
        console.error('Failed to fetch hospitals:', err);
        setLoadError('We could not connect to the hospital directory. Please ensure the API is running and try again.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchHospitals();
  }, []);

  // Wizard state
  const [selectedProvince, setSelectedProvince] = useState<string>('ALL');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedService, setSelectedService] = useState<string>('ALL');

  // Available districts based on selected province
  const availableDistricts = useMemo(() => {
    if (selectedProvince === 'ALL') {
      return Object.keys(SRI_LANKA_DISTRICTS);
    }
    const prov = SRI_LANKA_PROVINCES[selectedProvince];
    return prov ? prov.districts : Object.keys(SRI_LANKA_DISTRICTS);
  }, [selectedProvince]);

  // Available categories
  const categories = useMemo(() => {
    return [
      { key: 'ALL', label: 'All Facility Classifications' },
      { key: SriLankaHospitalCategory.NATIONAL_HOSPITAL, label: 'National Hospital' },
      { key: SriLankaHospitalCategory.TEACHING_HOSPITAL, label: 'Teaching Hospital' },
      { key: SriLankaHospitalCategory.PROVINCIAL_GENERAL, label: 'Provincial General Hospital' },
      { key: SriLankaHospitalCategory.DISTRICT_GENERAL, label: 'District General Hospital' },
      { key: SriLankaHospitalCategory.BASE_HOSPITAL_A, label: 'Base Hospital (Type A/B)' },
      { key: SriLankaHospitalCategory.SPECIALIZED_HOSPITAL, label: 'Specialized Hospital' },
    ];
  }, []);

  // Collect all unique clinical departments/services from actual database
  const availableServices = useMemo(() => {
    const set = new Set<string>();
    hospitals.forEach((h) => {
      if (h.departments) {
        h.departments.forEach((d) => set.add(d));
      }
    });
    return ['ALL', ...Array.from(set).sort()];
  }, [hospitals]);

  // Filter hospitals strictly from authentic database records
  const matchingHospitals = useMemo(() => {
    return hospitals.filter((h) => {
      const matchProv = selectedProvince === 'ALL' || h.region === selectedProvince;
      const matchDist = selectedDistrict === 'ALL' || h.district === selectedDistrict;
      const matchCat =
        selectedCategory === 'ALL' ||
        h.officialCategory === selectedCategory ||
        (selectedCategory === SriLankaHospitalCategory.BASE_HOSPITAL_A &&
          (h.officialCategory === SriLankaHospitalCategory.BASE_HOSPITAL_A ||
            h.officialCategory === SriLankaHospitalCategory.BASE_HOSPITAL_B));
      const matchServ =
        selectedService === 'ALL' ||
        (h.departments && h.departments.includes(selectedService));
      return matchProv && matchDist && matchCat && matchServ;
    });
  }, [hospitals, selectedProvince, selectedDistrict, selectedCategory, selectedService]);

  const handleReset = () => {
    setSelectedProvince('ALL');
    setSelectedDistrict('ALL');
    setSelectedCategory('ALL');
    setSelectedService('ALL');
  };

  return (
    <RoleGuard>
      <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-teal-900 via-slate-900 to-slate-950 p-6 sm:p-8 text-white border border-teal-900/40 shadow-xl">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-300 text-xs font-semibold">
            <Compass className="w-3.5 h-3.5 text-teal-400" />
            <span>Sri Lankan Healthcare Facility Finder</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            Find Care in Sri Lanka
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            Locate verified government healthcare institutions across all 9 provinces and 25 districts.
            All results query authentic Ministry of Health facility records without invented information.
          </p>

          <div className="flex items-center gap-2 pt-1">
            <SourceBadge type="VERIFIED_OFFICIAL" size="sm" />
            <SourceBadge type="HISTORICAL_DATA" customText="Reported Bed Data 2025" size="sm" />
          </div>
        </div>
      </div>

      {/* 4-Step Filter Controls */}
      <div className="rounded-xl bg-white dark:bg-slate-900 p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
            <Filter className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            <span>Filter by Administrative Hierarchy & Clinical Specialty</span>
          </div>
          {(selectedProvince !== 'ALL' ||
            selectedDistrict !== 'ALL' ||
            selectedCategory !== 'ALL' ||
            selectedService !== 'ALL') && (
            <button
              onClick={handleReset}
              className="text-xs text-rose-500 hover:text-rose-600 font-medium flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" /> Reset Filters
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Step 1: Province */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              1. Select Province
            </label>
            <select
              value={selectedProvince}
              onChange={(e) => {
                setSelectedProvince(e.target.value);
                setSelectedDistrict('ALL'); // Reset district on province change
              }}
              className="w-full h-10 px-3 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-teal-500"
            >
              <option value="ALL">All 9 Provinces</option>
              {Object.values(SRI_LANKA_PROVINCES).map((p) => (
                <option key={p.key} value={p.key}>
                  {p.name} ({p.nameSi})
                </option>
              ))}
            </select>
          </div>

          {/* Step 2: District */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              2. Select District
            </label>
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="w-full h-10 px-3 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-teal-500"
            >
              <option value="ALL">All Districts ({availableDistricts.length})</option>
              {availableDistricts.map((dName) => {
                const distInfo = SRI_LANKA_DISTRICTS[dName];
                return (
                  <option key={dName} value={dName}>
                    {dName} {distInfo ? `(${distInfo.nameSi})` : ''}
                  </option>
                );
              })}
            </select>
          </div>

          {/* Step 3: Facility Category */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              3. Facility Type
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full h-10 px-3 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-teal-500"
            >
              {categories.map((c) => (
                <option key={c.key} value={c.key}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          {/* Step 4: Clinical Specialty / Service */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              4. Clinical Service
            </label>
            <select
              value={selectedService}
              onChange={(e) => setSelectedService(e.target.value)}
              className="w-full h-10 px-3 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-teal-500"
            >
              <option value="ALL">All Clinical Services</option>
              {availableServices.filter((s) => s !== 'ALL').map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between px-1">
        <div className="text-sm text-slate-600 dark:text-slate-400">
          Showing <strong className="text-slate-900 dark:text-white">{matchingHospitals.length}</strong>{' '}
          verified Sri Lankan healthcare institutions
        </div>
        <Link
          href="/hospitals"
          className="text-xs font-bold text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1"
        >
          View Full Hospital Directory & Map <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Matching Facility Cards */}
      {loadError ? (
        <div className="p-12 text-center rounded-2xl bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-900 space-y-3">
          <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Hospital directory unavailable</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">{loadError}</p>
          <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      ) : matchingHospitals.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
          <AlertCircle className="w-10 h-10 text-amber-500 mx-auto" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            No Institutions Found Matching Selected Criteria
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
            In accordance with official health policy, we do not recommend alternative facilities using
            invented or unverified data. Please broaden your search criteria.
          </p>
          <Button variant="outline" size="sm" onClick={handleReset}>
            Clear Filters
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {matchingHospitals.map((hosp) => (
            <div
              key={hosp.id}
              className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 p-5 hover:border-teal-500/60 dark:hover:border-teal-500/60 transition-all shadow-xs space-y-3"
            >
              {/* Header with Classification & Verified Badge */}
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-teal-50 text-teal-700 dark:bg-teal-950/60 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                      {hosp.categoryLabel || hosp.officialCategory}
                    </span>
                    <SourceBadge
                      type="VERIFIED_OFFICIAL"
                      sourceName={hosp.sourceName}
                      sourceUrl={hosp.sourceUrl}
                      publishedDate={hosp.publishedDate}
                      reportingPeriod="2025"
                      size="sm"
                    />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white mt-1.5">
                    {hosp.name}
                  </h3>
                  {hosp.nameSi && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                      {hosp.nameSi}
                    </p>
                  )}
                </div>
              </div>

              {/* Geographic & Contact Details */}
              <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300 pt-1">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>
                    {hosp.address}, <strong>{hosp.district} District</strong> ({hosp.region.replace('_', ' ')})
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                  {hosp.phone ? (
                    <a
                      href={`tel:${hosp.phone.replace(/\s+/g, '')}`}
                      className="text-teal-600 dark:text-teal-400 font-semibold hover:underline"
                    >
                      {formatSriLankanPhone(hosp.phone)}
                    </a>
                  ) : (
                    <span className="text-slate-400 italic">
                      Not available in the current official dataset.
                    </span>
                  )}
                </div>

                {/* Bed Information Strictly Labeled with Reporting Year */}
                <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                      <BedDouble className="w-3.5 h-3.5 text-slate-400" />
                      Official Reported Bed Strength:
                    </span>
                    <strong className="text-slate-900 dark:text-white font-mono">
                      {hosp.totalBeds} beds
                    </strong>
                  </div>
                  <p className="text-[10px] text-amber-700 dark:text-amber-300">
                    Official reported bed data — reporting year {hosp.reportingYear || 2025}.
                    Live bed availability is not currently available.
                  </p>
                </div>
              </div>

              {/* Clinical Departments Available */}
              {hosp.departments && hosp.departments.length > 0 && (
                <div className="pt-1">
                  <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                    Available Clinical Specialties:
                  </span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {hosp.departments.map((dept, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[11px] text-slate-700 dark:text-slate-300 font-medium"
                      >
                        {dept}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons & Source Link */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                {hosp.sourceUrl ? (
                  <a
                    href={hosp.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-semibold text-teal-600 dark:text-teal-400 hover:underline inline-flex items-center gap-1"
                  >
                    View Official Source <ExternalLink className="w-3 h-3" />
                  </a>
                ) : (
                  <span className="text-[10px] text-slate-400 italic">
                    Source: Ministry of Health
                  </span>
                )}

                <Link
                  href={`/hospitals/${hosp.id}`}
                  className="px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold inline-flex items-center gap-1 transition-colors"
                >
                  View Facility Profile <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
      </div>
    </RoleGuard>
  );
}
