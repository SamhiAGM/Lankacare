'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  MapPin, Building2, Search, Filter, Compass, Phone, Mail,
  BedDouble, ShieldCheck, Siren, ArrowRight, ExternalLink,
  Layers, CheckCircle2, Navigation, Star, HeartPulse, Info, X
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { getHospitals } from '@/services/apiClient';
import { Hospital, SriLankaRegion } from '@/types';

// Sri Lanka bounds for SVG coordinate projection
// Lat: 5.9°N to 9.85°N (~3.95 deg)
// Lng: 79.6°E to 81.95°E (~2.35 deg)
const MIN_LAT = 5.85;
const MAX_LAT = 9.9;
const MIN_LNG = 79.6;
const MAX_LNG = 82.0;

function projectCoords(lat: number, lng: number, width: number = 600, height: number = 840) {
  const x = ((lng - MIN_LNG) / (MAX_LNG - MIN_LNG)) * width;
  // Invert Y because SVG coordinates increase downwards
  const y = ((MAX_LAT - lat) / (MAX_LAT - MIN_LAT)) * height;
  return { x: Math.max(30, Math.min(width - 30, x)), y: Math.max(30, Math.min(height - 30, y)) };
}

// 25 Districts of Sri Lanka organized by Province
const PROVINCES_DATA = [
  { id: 'WESTERN', name: 'Western Province', districts: ['Colombo', 'Gampaha', 'Kalutara'], center: { lat: 6.9, lng: 80.0 } },
  { id: 'CENTRAL', name: 'Central Province', districts: ['Kandy', 'Matale', 'Nuwara Eliya'], center: { lat: 7.3, lng: 80.7 } },
  { id: 'SOUTHERN', name: 'Southern Province', districts: ['Galle', 'Matara', 'Hambantota'], center: { lat: 6.1, lng: 80.5 } },
  { id: 'NORTHERN', name: 'Northern Province', districts: ['Jaffna', 'Kilinochchi', 'Mannar', 'Mullaitivu', 'Vavuniya'], center: { lat: 9.3, lng: 80.3 } },
  { id: 'EASTERN', name: 'Eastern Province', districts: ['Trincomalee', 'Batticaloa', 'Ampara'], center: { lat: 7.9, lng: 81.5 } },
  { id: 'NORTH_WESTERN', name: 'North Western Province', districts: ['Kurunegala', 'Puttalam'], center: { lat: 7.6, lng: 80.1 } },
  { id: 'NORTH_CENTRAL', name: 'North Central Province', districts: ['Anuradhapura', 'Polonnaruwa'], center: { lat: 8.2, lng: 80.7 } },
  { id: 'UVA', name: 'Uva Province', districts: ['Badulla', 'Monaragala'], center: { lat: 6.9, lng: 81.2 } },
  { id: 'SABARAGAMUWA', name: 'Sabaragamuwa Province', districts: ['Ratnapura', 'Kegalle'], center: { lat: 6.7, lng: 80.4 } },
];

export default function SriLankaMapPage() {
  const allHospitals = useMemo(() => getHospitals(), []);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProvince, setSelectedProvince] = useState<string>('ALL');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [onlyEmergency, setOnlyEmergency] = useState(false);
  const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(null);
  const [activeViewMode, setActiveViewMode] = useState<'map' | 'list'>('map');

  // Filtered hospitals
  const filteredHospitals = useMemo(() => {
    return allHospitals.filter((h) => {
      // Query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = h.name.toLowerCase().includes(q);
        const matchDist = h.district.toLowerCase().includes(q);
        const matchCode = h.code.toLowerCase().includes(q);
        const matchAddr = h.address.toLowerCase().includes(q);
        if (!matchName && !matchDist && !matchCode && !matchAddr) return false;
      }

      // Province filter
      if (selectedProvince !== 'ALL' && h.region !== selectedProvince) {
        return false;
      }

      // District filter
      if (selectedDistrict !== 'ALL' && h.district !== selectedDistrict) {
        return false;
      }

      // Category filter
      if (selectedCategory !== 'ALL' && h.officialCategory !== selectedCategory && h.type !== selectedCategory) {
        return false;
      }

      // Emergency filter
      if (onlyEmergency && !h.emergencyAvailable) {
        return false;
      }

      return true;
    });
  }, [allHospitals, searchQuery, selectedProvince, selectedDistrict, selectedCategory, onlyEmergency]);

  // District options based on chosen province
  const availableDistricts = useMemo(() => {
    if (selectedProvince === 'ALL') {
      const set = new Set<string>();
      allHospitals.forEach((h) => { if (h.district) set.add(h.district); });
      return Array.from(set).sort();
    }
    const prov = PROVINCES_DATA.find(p => p.id === selectedProvince);
    return prov ? prov.districts : [];
  }, [selectedProvince, allHospitals]);

  // Handle province change
  const handleProvinceChange = (prov: string) => {
    setSelectedProvince(prov);
    setSelectedDistrict('ALL');
  };

  // SVG dimensions
  const svgWidth = 640;
  const svgHeight = 880;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-teal-600 dark:text-teal-400 uppercase tracking-wider mb-1">
            <Compass className="w-4 h-4" /> National Health Geographic Information System (GIS)
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-50 tracking-tight">
            Sri Lanka Healthcare Institution Map
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Official geospatial locator for all 9 Provinces, 25 Districts, and verified Ministry of Health facilities.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded-xl flex items-center gap-1 border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setActiveViewMode('map')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeViewMode === 'map'
                  ? 'bg-white dark:bg-slate-900 text-teal-600 dark:text-teal-400 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              Interactive Map
            </button>
            <button
              onClick={() => setActiveViewMode('list')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeViewMode === 'list'
                  ? 'bg-white dark:bg-slate-900 text-teal-600 dark:text-teal-400 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              Facility List ({filteredHospitals.length})
            </button>
          </div>

          <Link href="/compare-hospitals">
            <Button variant="outline" size="sm" className="gap-1.5 text-xs">
              <Layers className="w-3.5 h-3.5 text-teal-600" /> Compare
            </Button>
          </Link>
        </div>
      </div>

      {/* Filter and Search Control Bar */}
      <Card className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 items-center">
          <div className="relative lg:col-span-2">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search hospital name, city, or district..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
              >
                ✕
              </button>
            )}
          </div>

          <Select
            value={selectedProvince}
            onChange={(e) => handleProvinceChange(e.target.value)}
            options={[
              { value: 'ALL', label: 'All 9 Provinces' },
              ...PROVINCES_DATA.map(p => ({ value: p.id, label: p.name }))
            ]}
          />

          <Select
            value={selectedDistrict}
            onChange={(e) => setSelectedDistrict(e.target.value)}
            options={[
              { value: 'ALL', label: 'All Districts' },
              ...availableDistricts.map(d => ({ value: d, label: d }))
            ]}
          />

          <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
            <input
              type="checkbox"
              id="mapEmergency"
              checked={onlyEmergency}
              onChange={(e) => setOnlyEmergency(e.target.checked)}
              className="rounded border-slate-300 text-teal-600 focus:ring-teal-500"
            />
            <label htmlFor="mapEmergency" className="text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
              24/7 Emergency Only
            </label>
          </div>
        </div>

        {/* Active Quick Badges */}
        <div className="flex flex-wrap items-center gap-2 pt-3 mt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
          <span className="text-slate-400 text-[11px] font-semibold">Quick Focus:</span>
          <button
            onClick={() => {
              setSelectedProvince('EASTERN');
              setSelectedDistrict('Trincomalee');
              const kinniya = allHospitals.find(h => h.id === 'hosp-kinniya');
              if (kinniya) setSelectedHospital(kinniya);
            }}
            className="px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-[11px] font-bold hover:bg-blue-100 transition-colors flex items-center gap-1"
          >
            <MapPin className="w-3 h-3 text-blue-500" /> Base Hospital Kinniya (Trincomalee)
          </button>
          <button
            onClick={() => {
              setSelectedProvince('WESTERN');
              setSelectedDistrict('Colombo');
            }}
            className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            Colombo Metro
          </button>
          <button
            onClick={() => {
              setSelectedProvince('CENTRAL');
              setSelectedDistrict('Kandy');
            }}
            className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            Kandy Teaching Network
          </button>
          <button
            onClick={() => {
              setSelectedProvince('NORTHERN');
              setSelectedDistrict('Jaffna');
            }}
            className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            Jaffna Peninsula
          </button>
          <button
            onClick={() => {
              setSelectedProvince('SOUTHERN');
              setSelectedDistrict('Galle');
            }}
            className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            Southern Coastal (Karapitiya)
          </button>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedProvince('ALL');
              setSelectedDistrict('ALL');
              setSelectedCategory('ALL');
              setOnlyEmergency(false);
              setSelectedHospital(null);
            }}
            className="ml-auto text-[11px] text-teal-600 font-semibold hover:underline"
          >
            Reset Filters
          </button>
        </div>
      </Card>

      {/* Main Content Area */}
      {activeViewMode === 'map' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* SVG Map Canvas Container */}
          <Card className="lg:col-span-8 p-4 sm:p-6 overflow-hidden relative bg-slate-900 border-slate-800 shadow-xl">
            <div className="flex items-center justify-between mb-4 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                <span className="font-mono text-emerald-400 font-bold uppercase tracking-wider">
                  Live National GIS Coordinates
                </span>
              </div>
              <div className="text-slate-400 font-mono text-[11px]">
                Showing {filteredHospitals.length} of {allHospitals.length} institutions
              </div>
            </div>

            {/* Interactive SVG Rendering Sri Lanka Island */}
            <div className="w-full flex justify-center py-2 relative">
              <svg
                viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                className="w-full max-w-[580px] h-auto select-none"
                style={{ filter: 'drop-shadow(0 15px 30px rgba(0,0,0,0.5))' }}
              >
                {/* Background Grid & Water Ripple */}
                <defs>
                  <radialGradient id="oceanGlow" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#0f2b38" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#0b1320" stopOpacity="0" />
                  </radialGradient>
                  <linearGradient id="islandGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#1e293b" />
                    <stop offset="100%" stopColor="#0f172a" />
                  </linearGradient>
                  <linearGradient id="selectedIslandGlow" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#0d9488" stopOpacity="0.2" />
                    <stop offset="100%" stopColor="#0f766e" stopOpacity="0.05" />
                  </linearGradient>
                </defs>

                {/* Ambient Indian Ocean Glow */}
                <circle cx={svgWidth / 2} cy={svgHeight / 2} r="380" fill="url(#oceanGlow)" />

                {/* Stylized Accurate Sri Lanka Coastline Contour */}
                <path
                  d={`
                    M 250,55
                    C 280,60 300,90 320,130
                    C 345,175 365,220 380,270
                    C 410,340 435,420 445,490
                    C 455,560 450,620 420,680
                    C 390,740 350,790 300,820
                    C 250,835 220,830 190,810
                    C 150,780 135,720 130,660
                    C 125,600 120,530 135,460
                    C 150,390 170,330 185,270
                    C 200,200 215,120 230,75
                    Z
                  `}
                  fill="url(#islandGradient)"
                  stroke="#334155"
                  strokeWidth="2.5"
                  className="transition-all duration-500"
                />

                {/* Jaffna Peninsula & Northern Islands Contour */}
                <path
                  d={`
                    M 230,75
                    C 210,50 200,35 180,30
                    C 160,25 150,45 170,65
                    C 185,80 210,80 230,75
                    Z
                  `}
                  fill="#1e293b"
                  stroke="#334155"
                  strokeWidth="2"
                />

                {/* Mannar Island & Talaimannar Pier Contour */}
                <path
                  d={`
                    M 160,240
                    C 140,230 115,225 95,215
                    C 85,210 95,200 115,205
                    C 135,210 155,225 160,240
                    Z
                  `}
                  fill="#1e293b"
                  stroke="#334155"
                  strokeWidth="1.5"
                />

                {/* Internal Province Boundary Guides (Subtle) */}
                <line x1="160" y1="270" x2="380" y2="270" stroke="#1e293b" strokeDasharray="4 4" strokeWidth="1" />
                <line x1="135" y1="460" x2="435" y2="460" stroke="#1e293b" strokeDasharray="4 4" strokeWidth="1" />
                <line x1="130" y1="660" x2="420" y2="680" stroke="#1e293b" strokeDasharray="4 4" strokeWidth="1" />
                <line x1="280" y1="270" x2="280" y2="700" stroke="#1e293b" strokeDasharray="4 4" strokeWidth="1" />

                {/* Province Regional Labels */}
                {PROVINCES_DATA.map((prov) => {
                  const pt = projectCoords(prov.center.lat, prov.center.lng, svgWidth, svgHeight);
                  const isSelected = selectedProvince === prov.id;
                  return (
                    <g
                      key={prov.id}
                      className="cursor-pointer group"
                      onClick={() => handleProvinceChange(isSelected ? 'ALL' : prov.id)}
                    >
                      <text
                        x={pt.x}
                        y={pt.y}
                        textAnchor="middle"
                        fill={isSelected ? '#2dd4bf' : '#64748b'}
                        fontSize={isSelected ? '13' : '11'}
                        fontWeight={isSelected ? 'bold' : 'normal'}
                        className="transition-all duration-300 select-none group-hover:fill-teal-300"
                        letterSpacing="1"
                      >
                        {prov.name.toUpperCase()}
                      </text>
                    </g>
                  );
                })}

                {/* Hospital Markers */}
                {filteredHospitals.map((h) => {
                  const lat = h.coordinates?.latitude ?? (h.coordinates as any)?.lat ?? 6.9;
                  const lng = h.coordinates?.longitude ?? (h.coordinates as any)?.lng ?? 79.9;
                  const pt = projectCoords(lat, lng, svgWidth, svgHeight);
                  const isSelected = selectedHospital?.id === h.id;
                  const isKinniya = h.id === 'hosp-kinniya';

                  let markerColor = '#0d9488'; // Default Teal
                  if (h.type === 'TEACHING') markerColor = '#8b5cf6'; // Purple
                  if (h.type === 'DISTRICT') markerColor = '#3b82f6'; // Blue
                  if (isKinniya) markerColor = '#f59e0b'; // Amber Gold for Kinniya prominence

                  return (
                    <g
                      key={h.id}
                      className="cursor-pointer group"
                      onClick={() => setSelectedHospital(h)}
                      transform={`translate(${pt.x}, ${pt.y})`}
                    >
                      {/* Pulse circle for selected or Kinniya */}
                      {(isSelected || isKinniya) && (
                        <circle
                          r="14"
                          fill="none"
                          stroke={isKinniya ? '#f59e0b' : '#2dd4bf'}
                          strokeWidth="2"
                          className="animate-ping origin-center"
                          opacity="0.75"
                        />
                      )}

                      {/* Main Pin Base */}
                      <circle
                        r={isSelected ? '9' : isKinniya ? '8' : '6.5'}
                        fill={markerColor}
                        stroke="#ffffff"
                        strokeWidth={isSelected ? '2.5' : '1.5'}
                        className="transition-all duration-200 group-hover:scale-125"
                      />

                      {/* Inner dot */}
                      <circle
                        r={isSelected ? '3.5' : '2.5'}
                        fill="#ffffff"
                      />

                      {/* Prominent Label on Hover or if Selected / Kinniya */}
                      {(isSelected || isKinniya) && (
                        <g transform="translate(0, -18)">
                          <rect
                            x="-70"
                            y="-16"
                            width="140"
                            height="20"
                            rx="5"
                            fill="#0f172a"
                            stroke={isKinniya ? '#f59e0b' : '#2dd4bf'}
                            strokeWidth="1.5"
                          />
                          <text
                            x="0"
                            y="-3"
                            textAnchor="middle"
                            fill="#ffffff"
                            fontSize="9.5"
                            fontWeight="bold"
                          >
                            {isKinniya ? '★ Base Hospital Kinniya' : h.name.slice(0, 20)}
                          </text>
                        </g>
                      )}
                    </g>
                  );
                })}
              </svg>
            </div>

            {/* Map Legend */}
            <div className="pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-[11px] text-slate-400">
              <div className="flex flex-wrap items-center gap-4">
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-purple-500 inline-block" /> National / Teaching
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-blue-500 inline-block" /> Provincial / District General
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-amber-500 inline-block" /> Base Hospital (Kinniya)
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-teal-500 inline-block" /> Specialized & Others
                </span>
              </div>
              <div className="text-[10px] text-slate-500">
                Click any pin or province name to inspect facility details.
              </div>
            </div>
          </Card>

          {/* Side Drawer: Selected Hospital Details */}
          <div className="lg:col-span-4 space-y-4">
            {selectedHospital ? (
              <Card className="p-5 space-y-4 border-teal-200 dark:border-teal-800 shadow-lg relative">
                <button
                  onClick={() => setSelectedHospital(null)}
                  className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-4 h-4" />
                </button>

                <div className="space-y-1 pr-6">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <Badge variant="teal" size="sm">{selectedHospital.type}</Badge>
                    <Badge variant={selectedHospital.emergencyAvailable ? 'emerald' : 'rose'} size="sm">
                      {selectedHospital.emergencyAvailable ? '24/7 ETU Active' : 'No Emergency Unit'}
                    </Badge>
                  </div>
                  <h3 className="text-base font-black text-slate-900 dark:text-slate-100 pt-1">
                    {selectedHospital.name}
                  </h3>
                  {selectedHospital.id === 'hosp-kinniya' && (
                    <Badge variant="blue" className="bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border-blue-300">
                      Trincomalee RDHS Verified Institution
                    </Badge>
                  )}
                  <p className="text-xs text-slate-500 flex items-center gap-1 pt-1">
                    <MapPin className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                    {selectedHospital.address}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
                    <p className="text-[10px] text-slate-400">Total Ward Beds</p>
                    <p className="font-bold text-sm text-slate-900 dark:text-slate-100">{selectedHospital.totalBeds}</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
                    <p className="text-[10px] text-slate-400">ICU Units</p>
                    <p className="font-bold text-sm text-slate-900 dark:text-slate-100">
                      {selectedHospital.icuBedsTotal > 0 ? selectedHospital.icuBedsTotal : 'N/A'}
                    </p>
                  </div>
                </div>

                <div className="space-y-2 text-xs pt-1">
                  <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-slate-400">District / Province:</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {selectedHospital.district} ({selectedHospital.region})
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-slate-400">Direct Phone:</span>
                    <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">
                      {selectedHospital.phone || 'RDHS Exchange'}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-slate-400">GPS Coordinates:</span>
                    <span className="font-mono text-slate-600 dark:text-slate-400 text-[11px]">
                      {(selectedHospital.coordinates?.latitude ?? (selectedHospital.coordinates as any)?.lat)?.toFixed(4)}°N, {(selectedHospital.coordinates?.longitude ?? (selectedHospital.coordinates as any)?.lng)?.toFixed(4)}°E
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-slate-400">Authoritative Source:</span>
                    <span className="font-semibold text-teal-600 dark:text-teal-400 text-[11px]">
                      {selectedHospital.sourceName || 'Ministry of Health Sri Lanka'}
                    </span>
                  </div>
                </div>

                <div className="pt-2 space-y-2">
                  <Link
                    href={selectedHospital.id === 'hosp-kinniya' ? '/hospitals/kinniya' : `/hospitals/${selectedHospital.id}`}
                    className="w-full block"
                  >
                    <Button variant="primary" size="sm" className="w-full gap-1.5 text-xs">
                      Open 15-Tab Hospital Workspace <ArrowRight className="w-3.5 h-3.5" />
                    </Button>
                  </Link>
                  <Link href={`/compare-hospitals?h1=${selectedHospital.id}`} className="w-full block">
                    <Button variant="outline" size="sm" className="w-full gap-1 text-xs">
                      Compare with Other Facilities
                    </Button>
                  </Link>
                </div>
              </Card>
            ) : (
              <Card className="p-6 text-center space-y-3 border-dashed">
                <Building2 className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto" />
                <h3 className="font-bold text-sm text-slate-700 dark:text-slate-300">Select a Hospital on the Map</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Click on any facility pin to inspect certified bed capacity, emergency status, contact information, and navigate to the 15-tab hospital detail workspace.
                </p>
                <div className="pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const kinniya = allHospitals.find(h => h.id === 'hosp-kinniya');
                      if (kinniya) setSelectedHospital(kinniya);
                    }}
                    className="text-xs"
                  >
                    Inspect Base Hospital Kinniya
                  </Button>
                </div>
              </Card>
            )}

            {/* Quick Regional Summary Card */}
            <Card className="p-4 space-y-3 text-xs">
              <h4 className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-teal-600" /> National Health Network Coverage
              </h4>
              <p className="text-slate-500 leading-relaxed text-[11px]">
                The Sri Lanka public health network comprises over 600 state hospitals delivering free healthcare at the point of delivery under the Ministry of Health and Provincial Councils.
              </p>
              <div className="p-2.5 rounded-lg bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 text-teal-800 dark:text-teal-300 text-[11px]">
                <strong>Emergency Helpline:</strong> Dial <strong>1990</strong> for <em>1990 Suwa Seriya</em> Free National Ambulance Service available across all 25 districts.
              </div>
            </Card>
          </div>
        </div>
      ) : (
        /* Tabular Facility List View */
        <Card className="p-4">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700 text-slate-400">
                  <th className="py-3 px-3">Institution Name</th>
                  <th className="py-3 px-3">Category</th>
                  <th className="py-3 px-3">District & Province</th>
                  <th className="py-3 px-3">Certified Beds</th>
                  <th className="py-3 px-3">Emergency Unit</th>
                  <th className="py-3 px-3">Telephone</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredHospitals.map((h) => (
                  <tr key={h.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-3">
                      <div className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                        {h.name}
                        {h.id === 'hosp-kinniya' && (
                          <Badge variant="blue" size="sm">Trincomalee</Badge>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono">{h.code}</div>
                    </td>
                    <td className="py-3 px-3">
                      <Badge variant="teal" size="sm">{h.type}</Badge>
                    </td>
                    <td className="py-3 px-3 text-slate-600 dark:text-slate-300">
                      {h.district}, <span className="text-slate-400">{h.region}</span>
                    </td>
                    <td className="py-3 px-3 font-semibold">
                      {h.totalBeds} <span className="text-[10px] text-slate-400 font-normal">beds</span>
                    </td>
                    <td className="py-3 px-3">
                      <Badge variant={h.emergencyAvailable ? 'emerald' : 'rose'} size="sm">
                        {h.emergencyAvailable ? '24/7 Active' : 'Diverted'}
                      </Badge>
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-500">
                      {h.phone || 'N/A'}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <Link href={h.id === 'hosp-kinniya' ? '/hospitals/kinniya' : `/hospitals/${h.id}`}>
                        <Button variant="outline" size="sm" className="text-xs h-7 gap-1">
                          View Details <ArrowRight className="w-3 h-3" />
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
