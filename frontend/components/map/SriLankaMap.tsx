'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  MapPin, Building2, Phone, BedDouble, ExternalLink,
  ShieldCheck, AlertTriangle, Layers, Eye, X, ChevronRight, Info
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Hospital, SriLankaRegion } from '@/types';
import {
  SRI_LANKA_PROVINCES, SRI_LANKA_DISTRICTS,
  DistrictInfo, ProvinceInfo
} from '@/lib/sriLankaGeo';
import { SourceBadge } from '@/components/ui/SourceBadge';

export interface SriLankaMapProps {
  hospitals?: Hospital[];
  selectedProvince?: string;
  onSelectProvince?: (provinceKey: string) => void;
  selectedDistrict?: string;
  onSelectDistrict?: (districtName: string) => void;
  mode?: 'facilities' | 'dengue' | 'both';
  dengueData?: Record<string, { cases: number; risk: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL' }>;
  className?: string;
  height?: number;
}

/**
 * Geographical coordinate projection for Sri Lanka SVG:
 * Sri Lanka bounds:
 * Latitude: 5.9°N (Dondra Head) to 9.85°N (Point Pedro) -> Height delta ~3.95°
 * Longitude: 79.65°E (Colombo/Kalpitiya) to 81.88°E (Sangamankanda) -> Width delta ~2.23°
 */
const SVG_WIDTH = 540;
const SVG_HEIGHT = 700;
const MIN_LNG = 79.5;
const MAX_LNG = 82.1;
const MIN_LAT = 5.8;
const MAX_LAT = 9.9;

function projectCoords(lat: number, lng: number): { x: number; y: number } {
  // Longitude maps to X (left to right)
  const x = ((lng - MIN_LNG) / (MAX_LNG - MIN_LNG)) * (SVG_WIDTH - 60) + 30;
  // Latitude maps to Y (top to bottom inverted: higher latitude is at the top)
  const y = SVG_HEIGHT - 40 - ((lat - MIN_LAT) / (MAX_LAT - MIN_LAT)) * (SVG_HEIGHT - 80);
  return { x, y };
}

// Approximate SVG Path Polygons for the 9 Sri Lankan Provinces
const PROVINCE_PATHS: Record<string, { path: string; center: { x: number; y: number } }> = {
  NORTHERN: {
    path: 'M 140,40 L 190,45 L 230,85 L 260,140 L 230,170 L 170,175 L 125,145 L 110,95 Z',
    center: { x: 175, y: 110 },
  },
  NORTH_CENTRAL: {
    path: 'M 170,175 L 230,170 L 290,195 L 340,245 L 320,310 L 240,310 L 205,270 L 175,220 Z',
    center: { x: 250, y: 245 },
  },
  NORTH_WESTERN: {
    path: 'M 115,185 L 170,185 L 205,270 L 230,340 L 175,370 L 135,330 L 110,240 Z',
    center: { x: 160, y: 280 },
  },
  CENTRAL: {
    path: 'M 205,270 L 240,310 L 305,330 L 320,405 L 250,440 L 220,380 L 210,320 Z',
    center: { x: 255, y: 365 },
  },
  EASTERN: {
    path: 'M 260,140 L 290,195 L 340,245 L 385,340 L 440,410 L 415,480 L 375,445 L 330,385 L 305,330 L 290,240 Z',
    center: { x: 350, y: 320 },
  },
  WESTERN: {
    path: 'M 140,375 L 175,370 L 210,430 L 200,510 L 155,515 L 135,440 Z',
    center: { x: 165, y: 445 },
  },
  SABARAGAMUWA: {
    path: 'M 200,430 L 250,440 L 275,510 L 225,540 L 195,505 Z',
    center: { x: 230, y: 480 },
  },
  UVA: {
    path: 'M 250,440 L 320,405 L 375,445 L 380,530 L 305,550 L 275,510 Z',
    center: { x: 315, y: 480 },
  },
  SOUTHERN: {
    path: 'M 155,515 L 200,510 L 225,540 L 305,550 L 380,530 L 360,595 L 285,615 L 190,600 Z',
    center: { x: 260, y: 565 },
  },
};

export const SriLankaMap: React.FC<SriLankaMapProps> = ({
  hospitals = [],
  selectedProvince = 'ALL',
  onSelectProvince,
  selectedDistrict = 'ALL',
  onSelectDistrict,
  mode = 'facilities',
  dengueData = {},
  className,
  height = 560,
}) => {
  const [activeHospital, setActiveHospital] = useState<Hospital | null>(null);
  const [hoveredProvince, setHoveredProvince] = useState<string | null>(null);
  const [hoveredDistrict, setHoveredDistrict] = useState<string | null>(null);

  // Filtered hospitals to plot
  const displayHospitals = useMemo(() => {
    return hospitals.filter((h) => {
      if (!h.coordinates) return false;
      const matchProv = selectedProvince === 'ALL' || h.region === selectedProvince;
      const matchDist = selectedDistrict === 'ALL' || h.district === selectedDistrict;
      return matchProv && matchDist;
    });
  }, [hospitals, selectedProvince, selectedDistrict]);

  const handleProvinceClick = (pKey: string) => {
    if (onSelectProvince) {
      onSelectProvince(selectedProvince === pKey ? 'ALL' : pKey);
    }
  };

  return (
    <div className={cn('relative rounded-2xl bg-slate-900 border border-slate-800 p-4 select-none overflow-hidden', className)}>
      {/* Map Header Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3 border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
              <span>Sri Lanka National Health Map</span>
              <SourceBadge type="VERIFIED_OFFICIAL" size="sm" showDetails={false} />
            </h3>
            <p className="text-[11px] text-slate-400">
              Interactive 9 Provinces & 25 Districts • Georeferenced Healthcare Facilities
            </p>
          </div>
        </div>

        {/* Province Quick Filter Tags */}
        <div className="flex items-center gap-1.5 overflow-x-auto text-[11px] py-1 max-w-md scrollbar-none">
          <button
            onClick={() => onSelectProvince && onSelectProvince('ALL')}
            className={cn(
              'px-2.5 py-1 rounded-md font-semibold transition-colors shrink-0',
              selectedProvince === 'ALL'
                ? 'bg-teal-500 text-white'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            )}
          >
            All Sri Lanka
          </button>
          {Object.values(SRI_LANKA_PROVINCES).map((p) => (
            <button
              key={p.key}
              onClick={() => handleProvinceClick(p.key)}
              className={cn(
                'px-2 py-1 rounded-md transition-colors shrink-0',
                selectedProvince === p.key
                  ? 'bg-teal-600 text-white font-semibold'
                  : 'bg-slate-800/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              )}
              title={`${p.name} (${p.nameSi})`}
            >
              {p.name.replace(' Province', '')}
            </button>
          ))}
        </div>
      </div>

      {/* Main Map Viewport */}
      <div className="relative flex justify-center items-center overflow-hidden" style={{ minHeight: `${height}px` }}>
        <svg
          viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
          className="w-full max-w-[480px] h-auto drop-shadow-2xl"
          style={{ maxHeight: `${height}px` }}
        >
          <defs>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            <linearGradient id="oceanGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#091321" />
              <stop offset="100%" stopColor="#0b172a" />
            </linearGradient>
          </defs>

          {/* Sri Lanka Outer Territorial Bounds Canvas Background */}
          <rect width={SVG_WIDTH} height={SVG_HEIGHT} fill="url(#oceanGrad)" rx="16" />

          {/* Indian Ocean Context Labels */}
          <text x="50" y="650" fill="#334155" fontSize="11" fontWeight="600" letterSpacing="2">
            INDIAN OCEAN
          </text>
          <text x="350" y="100" fill="#334155" fontSize="10" fontWeight="600" letterSpacing="1">
            BAY OF BENGAL
          </text>
          <text x="45" y="80" fill="#334155" fontSize="10" fontWeight="600" letterSpacing="1">
            PALK STRAIT
          </text>

          {/* Render 9 Provinces as Interactive Vector Paths */}
          {Object.entries(PROVINCE_PATHS).map(([provKey, provGeom]) => {
            const isSelected = selectedProvince === provKey;
            const isHovered = hoveredProvince === provKey;
            const provinceData = SRI_LANKA_PROVINCES[provKey];

            // Color scheme depending on Dengue mode or Facilities mode
            let fillColor = '#1e293b'; // slate-800 default
            if (isSelected) {
              fillColor = '#0f766e'; // teal-700
            } else if (isHovered) {
              fillColor = '#14b8a6'; // teal-500
            } else {
              // Subtle province styling
              const colors: Record<string, string> = {
                WESTERN: '#1e3a5f',
                CENTRAL: '#1c3d3d',
                SOUTHERN: '#1f384a',
                NORTHERN: '#223247',
                EASTERN: '#1e3838',
                NORTH_WESTERN: '#1c3349',
                NORTH_CENTRAL: '#203c43',
                UVA: '#243b35',
                SABARAGAMUWA: '#233742',
              };
              fillColor = colors[provKey] || '#1e293b';
            }

            return (
              <g
                key={provKey}
                className="cursor-pointer transition-all duration-200"
                onClick={() => handleProvinceClick(provKey)}
                onMouseEnter={() => setHoveredProvince(provKey)}
                onMouseLeave={() => setHoveredProvince(null)}
              >
                <path
                  d={provGeom.path}
                  fill={fillColor}
                  stroke={isSelected ? '#2dd4bf' : '#334155'}
                  strokeWidth={isSelected ? '2.5' : '1.2'}
                  strokeLinejoin="round"
                  className="transition-colors duration-200 hover:brightness-125"
                />
                {/* Province Name Label */}
                <text
                  x={provGeom.center.x}
                  y={provGeom.center.y}
                  textAnchor="middle"
                  fill={isSelected ? '#ffffff' : '#94a3b8'}
                  fontSize="10"
                  fontWeight="bold"
                  pointerEvents="none"
                  className="select-none tracking-wide"
                >
                  {provinceData ? provinceData.name.replace(' Province', '') : provKey}
                </text>
              </g>
            );
          })}

          {/* Plot District Center Indicators */}
          {Object.values(SRI_LANKA_DISTRICTS).map((dist) => {
            const pt = projectCoords(dist.coordinates.lat, dist.coordinates.lng);
            const isDistSelected = selectedDistrict === dist.name;
            const dengueStat = dengueData[dist.name];

            return (
              <g
                key={dist.name}
                className="cursor-pointer group"
                onClick={() => onSelectDistrict && onSelectDistrict(isDistSelected ? 'ALL' : dist.name)}
                onMouseEnter={() => setHoveredDistrict(dist.name)}
                onMouseLeave={() => setHoveredDistrict(null)}
              >
                {/* Dengue heat circle if dengueData is available */}
                {dengueStat && mode !== 'facilities' && (
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r={dengueStat.risk === 'CRITICAL' ? 14 : dengueStat.risk === 'HIGH' ? 10 : 7}
                    fill={
                      dengueStat.risk === 'CRITICAL'
                        ? '#f43f5e'
                        : dengueStat.risk === 'HIGH'
                        ? '#fb923c'
                        : dengueStat.risk === 'MODERATE'
                        ? '#eab308'
                        : '#10b981'
                    }
                    opacity="0.35"
                    className="animate-pulse"
                  />
                )}

                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={isDistSelected ? 4 : 2}
                  fill={isDistSelected ? '#38bdf8' : '#64748b'}
                />
              </g>
            );
          })}

          {/* Georeferenced Healthcare Facility Markers */}
          {mode !== 'dengue' &&
            displayHospitals.map((hosp) => {
              if (!hosp.coordinates) return null;
              const pt = projectCoords(hosp.coordinates.latitude, hosp.coordinates.longitude);
              const isActive = activeHospital?.id === hosp.id;

              // Color-code marker according to category
              let markerColor = '#14b8a6'; // teal
              if (hosp.officialCategory?.includes('NATIONAL')) markerColor = '#ec4899'; // pink
              else if (hosp.officialCategory?.includes('TEACHING')) markerColor = '#06b6d4'; // cyan
              else if (hosp.officialCategory?.includes('PROVINCIAL')) markerColor = '#8b5cf6'; // purple
              else if (hosp.officialCategory?.includes('SPECIALIZED')) markerColor = '#f59e0b'; // amber

              return (
                <g
                  key={hosp.id}
                  className="cursor-pointer transition-transform duration-150 hover:scale-125"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveHospital(hosp);
                  }}
                >
                  {isActive && (
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r="12"
                      fill={markerColor}
                      opacity="0.4"
                      className="animate-ping"
                    />
                  )}
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r={isActive ? 6 : 4}
                    fill={markerColor}
                    stroke="#ffffff"
                    strokeWidth="1.5"
                    filter="url(#glow)"
                  />
                </g>
              );
            })}
        </svg>

        {/* Hovered District Tooltip */}
        {hoveredDistrict && (
          <div className="absolute top-2 left-2 px-2.5 py-1 rounded-md bg-slate-950/90 border border-slate-700 text-xs text-slate-200 pointer-events-none shadow-md backdrop-blur-xs">
            District: <strong className="text-white">{hoveredDistrict}</strong>
            {dengueData[hoveredDistrict] && (
              <span className="ml-2 text-rose-400 font-semibold">
                Cases: {dengueData[hoveredDistrict].cases}
              </span>
            )}
          </div>
        )}

        {/* Selected Hospital Info Floating Modal / Drawer */}
        {activeHospital && (
          <div className="absolute bottom-3 left-3 right-3 sm:left-auto sm:right-3 sm:w-96 p-4 rounded-xl bg-slate-950/95 border border-slate-700 shadow-2xl backdrop-blur-md z-30 text-white animate-in slide-in-from-bottom-3">
            <div className="flex items-start justify-between gap-2 border-b border-slate-800 pb-2.5">
              <div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-teal-500/20 text-teal-300 border border-teal-500/30">
                    {activeHospital.categoryLabel || activeHospital.type}
                  </span>
                  <SourceBadge type="VERIFIED_OFFICIAL" size="sm" showDetails={false} />
                </div>
                <h4 className="text-sm font-bold text-white mt-1 leading-snug">
                  {activeHospital.name}
                </h4>
                {activeHospital.nameSi && (
                  <p className="text-[11px] text-slate-400 font-medium">
                    {activeHospital.nameSi}
                  </p>
                )}
              </div>
              <button
                onClick={() => setActiveHospital(null)}
                className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 py-2.5 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                <span className="truncate">
                  {activeHospital.address}, {activeHospital.district} ({activeHospital.region.replace('_', ' ')})
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                <span>{activeHospital.phone || 'Not available in the current official dataset.'}</span>
              </div>

              {/* Bed Information Strictly Labeled with Reporting Year */}
              <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-400 flex items-center gap-1">
                    <BedDouble className="w-3 h-3 text-slate-400" /> Official Reported Bed Capacity:
                  </span>
                  <strong className="text-white font-mono">{activeHospital.totalBeds} beds</strong>
                </div>
                <div className="text-[10px] text-amber-300/90 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3 text-amber-400 shrink-0" />
                  <span>
                    Official reported bed data — reporting year {activeHospital.reportingYear || 2025}.
                    Live bed availability is not currently available.
                  </span>
                </div>
              </div>

              {activeHospital.departments && activeHospital.departments.length > 0 && (
                <div>
                  <span className="text-slate-400 text-[11px]">Key Services:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {activeHospital.departments.slice(0, 4).map((dept, i) => (
                      <span key={i} className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] text-slate-300">
                        {dept}
                      </span>
                    ))}
                    {activeHospital.departments.length > 4 && (
                      <span className="text-[10px] text-slate-400">
                        +{activeHospital.departments.length - 4} more
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
              {activeHospital.sourceUrl && (
                <a
                  href={activeHospital.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] text-teal-400 hover:text-teal-300 font-semibold inline-flex items-center gap-1"
                >
                  View Official Source <ExternalLink className="w-3 h-3" />
                </a>
              )}
              <Link
                href={`/hospitals/${activeHospital.id}`}
                className="text-[11px] text-white font-bold bg-teal-600 hover:bg-teal-500 px-2.5 py-1 rounded-md inline-flex items-center gap-1 transition-colors ml-auto"
              >
                Full Details <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Map Legend */}
      <div className="mt-3 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-[11px] text-slate-400">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="font-semibold text-slate-300">Legend:</span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-pink-500" /> National Hospital
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" /> Teaching Hospital
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-500" /> Provincial General
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Specialized Hospital
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-teal-400" /> Base / District Hospital
          </span>
        </div>

        <div className="text-slate-500 text-[10px]">
          Source: Ministry of Health Sri Lanka • Projection: SLD99 / WGS84
        </div>
      </div>
    </div>
  );
};
