'use client';

import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Hospital } from '@/types';
import { MapPin, Phone, BedDouble, ExternalLink, ChevronRight } from 'lucide-react';
import Link from 'next/link';

// Fix for default Leaflet icon paths in Next.js
const defaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});
L.Marker.prototype.options.icon = defaultIcon;

interface MapControllerProps {
  center: [number, number];
  zoom: number;
}

// Component to programmatically change map center and zoom
const MapController: React.FC<MapControllerProps> = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom, { animate: true });
  }, [center, zoom, map]);
  return null;
};

export interface LeafletMapProps {
  hospitals: Hospital[];
  selectedProvince?: string;
  selectedDistrict?: string;
  onSelectHospital?: (hospital: Hospital) => void;
  className?: string;
}

const SRI_LANKA_CENTER: [number, number] = [7.8731, 80.7718];

export default function LeafletMap({ hospitals, selectedProvince, selectedDistrict, onSelectHospital, className }: LeafletMapProps) {
  
  // Filter hospitals that have verified coordinates
  const displayHospitals = hospitals.filter((h) => h.coordinates && h.coordinates.latitude && h.coordinates.longitude);

  // If a district/province is selected and there's a matching hospital, maybe pan to it
  const center = displayHospitals.length > 0 
    ? [displayHospitals[0].coordinates!.latitude, displayHospitals[0].coordinates!.longitude] as [number, number]
    : SRI_LANKA_CENTER;

  const zoom = selectedDistrict !== 'ALL' && selectedDistrict ? 10 : (selectedProvince !== 'ALL' && selectedProvince ? 8 : 7);

  return (
    <div className={`rounded-xl overflow-hidden border border-slate-700 w-full h-[600px] ${className || ''}`}>
      <MapContainer 
        center={SRI_LANKA_CENTER} 
        zoom={7} 
        scrollWheelZoom={true} 
        style={{ height: '100%', width: '100%', zIndex: 10 }}
      >
        <MapController center={center} zoom={zoom} />
        
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          className="map-tiles"
        />

        {displayHospitals.map((hosp) => (
          <Marker 
            key={hosp.id} 
            position={[hosp.coordinates!.latitude, hosp.coordinates!.longitude]}
            eventHandlers={{
              click: () => onSelectHospital && onSelectHospital(hosp)
            }}
          >
            <Popup className="hospital-popup">
              <div className="text-slate-900 w-64">
                <div className="font-bold text-sm mb-1">{hosp.name}</div>
                {hosp.nameSi && <div className="text-[11px] text-slate-600 mb-2">{hosp.nameSi}</div>}
                
                <div className="flex items-center gap-2 text-xs mb-1">
                  <MapPin className="w-3 h-3 text-teal-600" />
                  <span>{hosp.district}, {hosp.region}</span>
                </div>
                
                {hosp.phone && (
                  <div className="flex items-center gap-2 text-xs mb-1">
                    <Phone className="w-3 h-3 text-teal-600" />
                    <span>{hosp.phone}</span>
                  </div>
                )}

                <div className="mt-3 flex justify-between items-center border-t pt-2">
                  <span className="text-[10px] font-semibold bg-teal-100 text-teal-800 px-2 py-0.5 rounded">
                    {hosp.officialCategory || hosp.type}
                  </span>
                  
                  <Link href={`/hospitals/${hosp.id}`} className="text-xs text-blue-600 font-semibold hover:underline flex items-center">
                    Details <ChevronRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
