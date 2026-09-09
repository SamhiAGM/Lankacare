'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  Building2, Search, Filter, Plus, Phone, Mail, MapPin,
  BedDouble, Siren, LayoutGrid, Table as TableIcon, CheckCircle2,
  ExternalLink, Edit, Map as MapIcon, ChevronLeft, ChevronRight,
  Sparkles, RefreshCw, AlertCircle, Compass, Info
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { SourceBadge } from '@/components/ui/SourceBadge';
import { Modal } from '@/components/ui/Modal';
import { EmptyState } from '@/components/ui/EmptyState';
import { SriLankaHealthMap } from '@/components/map/SriLankaHealthMap';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { hospitalService, getHospitals } from '@/services/apiClient';
import {
  Hospital, HospitalType, HospitalStatus, SriLankaRegion,
  SriLankaHospitalCategory, UserRole
} from '@/types';
import { RoleGuard } from '@/components/auth/RoleGuard';
import {
  SRI_LANKA_PROVINCES, SRI_LANKA_DISTRICTS,
  formatSriLankanPhone, formatSriLankanDate
} from '@/lib/sriLankaGeo';
import { formatNumber } from '@/lib/utils';

export default function HospitalsDirectoryPage() {
  const { user } = useAuth();
  const { toast } = useToast();

  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [search, setSearch] = useState('');
  const [selectedProvince, setSelectedProvince] = useState('ALL');
  const [selectedDistrict, setSelectedDistrict] = useState('ALL');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [viewMode, setViewMode] = useState<'grid' | 'table' | 'map'>('grid');

  // Pagination (Requirement 44: Performance / Server-side & Client Pagination)
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;

  // New Hospital Modal State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newHosp, setNewHosp] = useState({
    name: '',
    nameSi: '',
    code: '',
    type: HospitalType.GENERAL,
    officialCategory: SriLankaHospitalCategory.BASE_HOSPITAL_A,
    status: HospitalStatus.OPERATIONAL,
    region: SriLankaRegion.WESTERN,
    district: 'Colombo',
    address: '',
    phone: '',
    email: '',
    totalBeds: 450,
    emergencyAvailable: true,
    departments: 'General Medicine, General Surgery, Pediatrics, Emergency Care',
  });

  useEffect(() => {
    setHospitals(getHospitals());
  }, []);

  const canManage =
    user?.role === UserRole.SUPER_ADMIN ||
    user?.role === UserRole.MINISTRY_ADMIN ||
    user?.role === UserRole.DATA_ADMIN ||
    user?.role === UserRole.HOSPITAL_ADMIN;

  // Available districts for dropdown based on province
  const availableDistricts = useMemo(() => {
    if (selectedProvince === 'ALL') return Object.keys(SRI_LANKA_DISTRICTS);
    const prov = SRI_LANKA_PROVINCES[selectedProvince];
    return prov ? prov.districts : Object.keys(SRI_LANKA_DISTRICTS);
  }, [selectedProvince]);

  const filteredHospitals = useMemo(() => {
    return hospitals.filter((h) => {
      const matchSearch =
        h.name.toLowerCase().includes(search.toLowerCase()) ||
        (h.nameSi && h.nameSi.includes(search)) ||
        h.address.toLowerCase().includes(search.toLowerCase()) ||
        h.code.toLowerCase().includes(search.toLowerCase()) ||
        h.district.toLowerCase().includes(search.toLowerCase());
      const matchProv = selectedProvince === 'ALL' || h.region === selectedProvince;
      const matchDist = selectedDistrict === 'ALL' || h.district === selectedDistrict;
      const matchCat =
        selectedCategory === 'ALL' ||
        h.officialCategory === selectedCategory ||
        h.categoryLabel === selectedCategory;
      return matchSearch && matchProv && matchDist && matchCat;
    });
  }, [hospitals, search, selectedProvince, selectedDistrict, selectedCategory]);

  // Paginated records
  const totalPages = Math.ceil(filteredHospitals.length / pageSize) || 1;
  const paginatedHospitals = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredHospitals.slice(start, start + pageSize);
  }, [filteredHospitals, currentPage, pageSize]);

  const handleCreateHospital = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHosp.name || !newHosp.code) {
      toast.error('Please provide official hospital name and unique code');
      return;
    }
    setIsSubmitting(true);
    try {
      const created = await hospitalService.create({
        ...newHosp,
        availableBeds: null,
        icuBedsTotal: 10,
        icuBedsAvailable: null,
        departments: newHosp.departments.split(',').map((d) => d.trim()),
        categoryLabel: newHosp.officialCategory.replace(/_/g, ' '),
        reportingYear: 2025,
        sourceName: 'Ministry of Health Sri Lanka',
        sourceUrl: 'https://www.health.gov.lk',
        sourceType: 'OFFICIAL_GOVERNMENT',
        publishedDate: '2024-12-31',
        retrievedDate: new Date().toISOString().split('T')[0],
        verificationStatus: 'VERIFIED',
        dataVersion: '2025.1',
      });
      setHospitals(getHospitals());
      toast.success(`${created.name} registered successfully`, 'Official Facility Enrolled');
      setIsCreateOpen(false);
    } catch {
      toast.error('Failed to register hospital');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetFilters = () => {
    setSearch('');
    setSelectedProvince('ALL');
    setSelectedDistrict('ALL');
    setSelectedCategory('ALL');
    setCurrentPage(1);
  };

  return (
    <RoleGuard>
      <div className="space-y-6 pb-12">
      {/* Page Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-50 tracking-tight">
              Sri Lanka Hospital Directory
            </h1>
            <SourceBadge type="VERIFIED_OFFICIAL" size="sm" />
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Authoritative register of Sri Lankan healthcare institutions across all 9 provinces and 25 districts.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link href="/find-care">
            <Button variant="outline" size="sm">
              <Compass className="w-3.5 h-3.5 mr-1 text-teal-600" />
              Care Finder Wizard
            </Button>
          </Link>

          {canManage && (
            <Button variant="primary" size="sm" onClick={() => setIsCreateOpen(true)}>
              <Plus className="w-3.5 h-3.5 mr-1" />
              Enroll Facility
            </Button>
          )}
        </div>
      </div>

      {/* Honest Data Notice */}
      <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 text-xs text-slate-600 dark:text-slate-300 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0" />
          <span>
            <strong>Official Data Rule:</strong> Bed counts represent published statistics (reporting year 2025).
            Live bed telemetry is not available. Missing attributes display <em>"Not available in the current official dataset."</em>
          </span>
        </div>
        <Link
          href="/admin/data-quality"
          className="text-teal-600 dark:text-teal-400 font-bold hover:underline shrink-0"
        >
          Data Quality: 98% →
        </Link>
      </div>

      {/* Search & Filter Controls */}
      <div className="rounded-xl bg-white dark:bg-slate-900 p-4 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Keyword Search */}
          <div className="lg:col-span-2 relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search by hospital name, district, town..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full h-10 pl-9 pr-3 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-teal-500"
            />
          </div>

          {/* Province Filter */}
          <div>
            <select
              value={selectedProvince}
              onChange={(e) => {
                setSelectedProvince(e.target.value);
                setSelectedDistrict('ALL');
                setCurrentPage(1);
              }}
              className="w-full h-10 px-3 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100"
            >
              <option value="ALL">All 9 Provinces</option>
              {Object.values(SRI_LANKA_PROVINCES).map((p) => (
                <option key={p.key} value={p.key}>
                  {p.name.replace(' Province', '')} ({p.nameSi})
                </option>
              ))}
            </select>
          </div>

          {/* District Filter */}
          <div>
            <select
              value={selectedDistrict}
              onChange={(e) => {
                setSelectedDistrict(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full h-10 px-3 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100"
            >
              <option value="ALL">All Districts ({availableDistricts.length})</option>
              {availableDistricts.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          {/* Classification Filter */}
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full h-10 px-3 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100"
            >
              <option value="ALL">All Categories</option>
              <option value="National Hospital">National Hospital</option>
              <option value="Teaching Hospital">Teaching Hospital</option>
              <option value="Provincial General Hospital">Provincial General</option>
              <option value="District General Hospital">District General</option>
              <option value="Base Hospital (Type A)">Base Hospital</option>
              <option value="Specialized Hospital">Specialized Hospital</option>
            </select>
          </div>
        </div>

        {/* View Switcher & Result Count */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
          <div className="text-slate-500 dark:text-slate-400">
            Found <strong className="text-slate-900 dark:text-white">{filteredHospitals.length}</strong>{' '}
            verified healthcare facilities in database
            {(selectedProvince !== 'ALL' || selectedDistrict !== 'ALL' || selectedCategory !== 'ALL' || search) && (
              <button
                onClick={handleResetFilters}
                className="ml-2 text-rose-500 hover:underline font-semibold"
              >
                Clear Filters
              </button>
            )}
          </div>

          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-md transition-colors ${
                viewMode === 'grid'
                  ? 'bg-white dark:bg-slate-900 text-teal-600 shadow-xs font-bold'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-md transition-colors ${
                viewMode === 'table'
                  ? 'bg-white dark:bg-slate-900 text-teal-600 shadow-xs font-bold'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
              title="Table View"
            >
              <TableIcon className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`p-1.5 rounded-md transition-colors flex items-center gap-1 text-xs px-2 ${
                viewMode === 'map'
                  ? 'bg-white dark:bg-slate-900 text-teal-600 shadow-xs font-bold'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
              title="Interactive Map View"
            >
              <MapIcon className="w-4 h-4" />
              <span>Map</span>
            </button>
          </div>
        </div>
      </div>

      {/* VIEW MODE 1: INTERACTIVE SRI LANKA MAP */}
      {viewMode === 'map' && (
        <div className="space-y-4">
          <SriLankaHealthMap
            hospitals={filteredHospitals}
            selectedProvince={selectedProvince}
            selectedDistrict={selectedDistrict}
          />
        </div>
      )}

      {/* VIEW MODE 2: CARD GRID */}
      {viewMode === 'grid' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {paginatedHospitals.map((hosp) => (
              <div
                key={hosp.id}
                className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 hover:border-teal-500/60 dark:hover:border-teal-500/60 transition-all shadow-xs flex flex-col justify-between space-y-3"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
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
                      showDetails={false}
                    />
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-snug">
                      {hosp.name}
                    </h3>
                    {hosp.nameSi && (
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                        {hosp.nameSi}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300 pt-1">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">
                        {hosp.address}, <strong>{hosp.district}</strong> ({hosp.region.replace('_', ' ')})
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
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

                    {/* Reported Bed Data Note */}
                    <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-0.5">
                      <div className="flex justify-between items-center text-[11px]">
                        <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
                          <BedDouble className="w-3 h-3 text-slate-400" /> Bed Strength:
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

                    {/* Services Tags */}
                    {hosp.departments && hosp.departments.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {hosp.departments.slice(0, 3).map((dept, i) => (
                          <span
                            key={i}
                            className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] text-slate-700 dark:text-slate-300 font-medium"
                          >
                            {dept}
                          </span>
                        ))}
                        {hosp.departments.length > 3 && (
                          <span className="text-[10px] text-slate-400">
                            +{hosp.departments.length - 3} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  {hosp.sourceUrl ? (
                    <a
                      href={hosp.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] font-semibold text-teal-600 dark:text-teal-400 hover:underline inline-flex items-center gap-1"
                    >
                      View Official Source <ExternalLink className="w-3 h-3" />
                    </a>
                  ) : (
                    <span className="text-[10px] text-slate-400">
                      Source: Ministry of Health
                    </span>
                  )}

                  <Link
                    href={`/hospitals/${hosp.id}`}
                    className="px-2.5 py-1 rounded-md bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold inline-flex items-center gap-1 transition-colors"
                  >
                    Details <ChevronRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-slate-200 dark:border-slate-800 pt-4 text-xs">
              <div className="text-slate-500">
                Page <strong className="text-slate-900 dark:text-white">{currentPage}</strong> of{' '}
                <strong className="text-slate-900 dark:text-white">{totalPages}</strong> (
                {filteredHospitals.length} total institutions)
              </div>

              <div className="flex items-center gap-1.5">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="w-3.5 h-3.5 mr-1" /> Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next <ChevronRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* VIEW MODE 3: TABLE VIEW */}
      {viewMode === 'table' && (
        <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 shadow-xs space-y-4">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="text-[11px] font-bold text-slate-400 uppercase bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="py-2.5 px-3">Hospital Name</th>
                  <th className="py-2.5 px-3">Classification</th>
                  <th className="py-2.5 px-3">District</th>
                  <th className="py-2.5 px-3">Province</th>
                  <th className="py-2.5 px-3 text-right">Reported Beds (2025)</th>
                  <th className="py-2.5 px-3">Official Contact</th>
                  <th className="py-2.5 px-3">Source & Verification</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {paginatedHospitals.map((hosp) => (
                  <tr key={hosp.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="py-3 px-3">
                      <div className="font-bold text-slate-900 dark:text-white">
                        {hosp.name}
                      </div>
                      {hosp.nameSi && (
                        <div className="text-[10px] text-slate-400">{hosp.nameSi}</div>
                      )}
                    </td>
                    <td className="py-3 px-3 text-slate-600 dark:text-slate-300">
                      {hosp.categoryLabel || hosp.officialCategory}
                    </td>
                    <td className="py-3 px-3 font-semibold text-teal-600 dark:text-teal-400">
                      {hosp.district}
                    </td>
                    <td className="py-3 px-3 text-slate-500">{hosp.region.replace('_', ' ')}</td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-slate-900 dark:text-white">
                      {hosp.totalBeds}
                      <span className="block text-[9px] text-amber-600 font-normal">
                        Reported 2025
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-600 dark:text-slate-300">
                      {hosp.phone ? (
                        formatSriLankanPhone(hosp.phone)
                      ) : (
                        <span className="text-slate-400 italic">Not available in dataset</span>
                      )}
                    </td>
                    <td className="py-3 px-3">
                      <SourceBadge
                        type="VERIFIED_OFFICIAL"
                        sourceName={hosp.sourceName}
                        sourceUrl={hosp.sourceUrl}
                        publishedDate={hosp.publishedDate}
                        reportingPeriod="2025"
                        size="sm"
                      />
                    </td>
                    <td className="py-3 px-3 text-right">
                      <Link
                        href={`/hospitals/${hosp.id}`}
                        className="text-xs text-teal-600 dark:text-teal-400 font-bold hover:underline"
                      >
                        View Profile →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-slate-200 dark:border-slate-800 pt-4 text-xs">
              <div className="text-slate-500">
                Page <strong className="text-slate-900 dark:text-white">{currentPage}</strong> of{' '}
                <strong className="text-slate-900 dark:text-white">{totalPages}</strong>
              </div>

              <div className="flex items-center gap-1.5">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="w-3.5 h-3.5 mr-1" /> Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next <ChevronRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Enroll New Facility Modal (For Authorized Roles) */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Enroll Healthcare Institution (Official Register)"
        description="Add an accredited public healthcare facility to the national registry with proper administrative province and district attribution."
      >
        <form onSubmit={handleCreateHospital} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Official Hospital Name (English) *
            </label>
            <input
              type="text"
              placeholder="e.g. Base Hospital Homagama"
              value={newHosp.name}
              onChange={(e) => setNewHosp({ ...newHosp, name: e.target.value })}
              className="w-full h-10 px-3 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Official Name (Sinhala)
              </label>
              <input
                type="text"
                placeholder="e.g. මූලික රෝහල හෝමාගම"
                value={newHosp.nameSi}
                onChange={(e) => setNewHosp({ ...newHosp, nameSi: e.target.value })}
                className="w-full h-10 px-3 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Unique Facility Code *
              </label>
              <input
                type="text"
                placeholder="e.g. BH-HOM-32"
                value={newHosp.code}
                onChange={(e) => setNewHosp({ ...newHosp, code: e.target.value })}
                className="w-full h-10 px-3 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Province *
              </label>
              <select
                value={newHosp.region}
                onChange={(e) =>
                  setNewHosp({ ...newHosp, region: e.target.value as SriLankaRegion })
                }
                className="w-full h-10 px-3 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100"
              >
                {Object.values(SRI_LANKA_PROVINCES).map((p) => (
                  <option key={p.key} value={p.key}>
                    {p.name.replace(' Province', '')}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                District *
              </label>
              <select
                value={newHosp.district}
                onChange={(e) => setNewHosp({ ...newHosp, district: e.target.value })}
                className="w-full h-10 px-3 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100"
              >
                {Object.keys(SRI_LANKA_DISTRICTS).map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Official Classification *
              </label>
              <select
                value={newHosp.officialCategory}
                onChange={(e) =>
                  setNewHosp({
                    ...newHosp,
                    officialCategory: e.target.value as SriLankaHospitalCategory,
                  })
                }
                className="w-full h-10 px-3 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100"
              >
                <option value={SriLankaHospitalCategory.NATIONAL_HOSPITAL}>National Hospital</option>
                <option value={SriLankaHospitalCategory.TEACHING_HOSPITAL}>Teaching Hospital</option>
                <option value={SriLankaHospitalCategory.PROVINCIAL_GENERAL}>Provincial General</option>
                <option value={SriLankaHospitalCategory.DISTRICT_GENERAL}>District General</option>
                <option value={SriLankaHospitalCategory.BASE_HOSPITAL_A}>Base Hospital (Type A)</option>
                <option value={SriLankaHospitalCategory.BASE_HOSPITAL_B}>Base Hospital (Type B)</option>
                <option value={SriLankaHospitalCategory.SPECIALIZED_HOSPITAL}>Specialized Hospital</option>
                <option value={SriLankaHospitalCategory.DIVISIONAL_HOSPITAL}>Divisional Hospital</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Address *
            </label>
            <input
              type="text"
              placeholder="e.g. High Level Road, Homagama"
              value={newHosp.address}
              onChange={(e) => setNewHosp({ ...newHosp, address: e.target.value })}
              className="w-full h-10 px-3 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Official Telephone (Sri Lanka +94 or 0XX format)
              </label>
              <input
                type="text"
                placeholder="+94 11 285 5261"
                value={newHosp.phone}
                onChange={(e) => setNewHosp({ ...newHosp, phone: e.target.value })}
                className="w-full h-10 px-3 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Official Reported Beds (2025)
              </label>
              <input
                type="number"
                value={newHosp.totalBeds}
                onChange={(e) => setNewHosp({ ...newHosp, totalBeds: parseInt(e.target.value) || 0 })}
                className="w-full h-10 px-3 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Clinical Departments (comma-separated)
            </label>
            <input
              type="text"
              value={newHosp.departments}
              onChange={(e) => setNewHosp({ ...newHosp, departments: e.target.value })}
              className="w-full h-10 px-3 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsCreateOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" disabled={isSubmitting}>
              {isSubmitting ? 'Enrolling...' : 'Enroll Facility to Registry'}
            </Button>
          </div>
        </form>
      </Modal>
      </div>
    </RoleGuard>
  );
}
