'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { Hospital } from '@/types';
import { Loader2 } from 'lucide-react';

const LeafletMap = dynamic(() => import('./LeafletMap'), { 
  ssr: false,
  loading: () => (
    <div className="w-full h-[600px] bg-slate-900 rounded-xl border border-slate-800 flex flex-col items-center justify-center text-slate-400">
      <Loader2 className="w-8 h-8 animate-spin text-teal-500 mb-4" />
      <p className="text-sm font-medium">Loading Interactive Map...</p>
      <p className="text-xs mt-2 text-slate-500">Initializing mapping engine</p>
    </div>
  )
});

export interface SriLankaHealthMapProps {
  hospitals: Hospital[];
  selectedProvince?: string;
  selectedDistrict?: string;
  onSelectHospital?: (hospital: Hospital) => void;
  className?: string;
}

export const SriLankaHealthMap: React.FC<SriLankaHealthMapProps> = (props) => {
  return (
    <div className="relative">
      <div className="absolute top-4 left-4 z-20 bg-slate-900/90 backdrop-blur-sm border border-slate-700 rounded-lg p-3 shadow-lg pointer-events-none">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          Sri Lanka National Health Map
        </h3>
        <p className="text-[11px] text-slate-400 mt-1">
          Showing verified healthcare facilities
        </p>
      </div>
      <LeafletMap {...props} />
    </div>
  );
};
