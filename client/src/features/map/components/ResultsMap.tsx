import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Comparable } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';

const comparableIcon = L.divIcon({
  className: '',
  html: `<div style="width:16px;height:16px;background:#1A3C5E;border:2px solid white;border-radius:50%;box-shadow:0 2px 4px rgba(0,0,0,0.3)"></div>`,
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

const subjectIcon = L.divIcon({
  className: '',
  html: `<div style="width:20px;height:20px;background:#C8A96E;border:3px solid white;border-radius:50%;box-shadow:0 2px 6px rgba(0,0,0,0.3)"></div>`,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

const activeComparableIcon = L.divIcon({
  className: '',
  html: `<div style="width:20px;height:20px;background:#C8A96E;border:3px solid white;border-radius:50%;box-shadow:0 2px 6px rgba(0,0,0,0.4)"></div>`,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

interface FitBoundsProps {
  comparables: Comparable[];
  subjectLat: number;
  subjectLng: number;
}

function FitBounds({ comparables, subjectLat, subjectLng }: FitBoundsProps) {
  const map = useMap();

  useEffect(() => {
    const points: [number, number][] = [[subjectLat, subjectLng]];
    comparables.forEach((c) => {
      const [lng, lat] = c.coordinates;
      points.push([lat, lng]);
    });

    if (points.length > 1) {
      map.fitBounds(points, { padding: [40, 40] });
    } else {
      map.setView([subjectLat, subjectLng], 13);
    }
  }, [comparables, subjectLat, subjectLng, map]);

  return null;
}

interface ResultsMapProps {
  comparables: Comparable[];
  subjectLat: number;
  subjectLng: number;
  activeId?: string;
  onPinClick?: (id: string) => void;
  blurred?: boolean;
}

export function ResultsMap({ comparables, subjectLat, subjectLng, activeId, onPinClick, blurred }: ResultsMapProps) {
  return (
    <div className="relative w-full h-full rounded-xl overflow-hidden">
      <MapContainer
        center={[subjectLat, subjectLng]}
        zoom={12}
        style={{ height: '100%', width: '100%' }}
        className="z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://carto.com">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />
        <FitBounds comparables={comparables} subjectLat={subjectLat} subjectLng={subjectLng} />

        <Marker position={[subjectLat, subjectLng]} icon={subjectIcon}>
          <Popup>
            <div className="text-xs font-semibold text-[#C8A96E]">Subject Property</div>
          </Popup>
        </Marker>

        {comparables.map((comp) => {
          const [lng, lat] = comp.coordinates;
          const isActive = comp.id === activeId;
          return (
            <Marker
              key={comp.id}
              position={[lat, lng]}
              icon={isActive ? activeComparableIcon : comparableIcon}
              eventHandlers={{ click: () => onPinClick?.(comp.id) }}
            >
              <Popup>
                <div className="space-y-1 text-xs min-w-[160px]">
                  <p className="font-mono font-semibold text-[#0A0A0A]">{comp.parcelNumber}</p>
                  <p className="text-gray-500">{comp.locality}, {comp.county}</p>
                  {comp.pricePerHa && (
                    <p className="font-mono text-[#1A3C5E] font-medium">
                      {formatCurrency(comp.pricePerHa)}/ha
                    </p>
                  )}
                  <p className="text-gray-400">{formatDate(comp.saleDate)}</p>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {blurred && (
        <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm flex flex-col items-center justify-center z-10 rounded-xl">
          <div className="text-center px-6">
            <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <p className="text-white font-semibold text-sm mb-1">Sign in to view map</p>
            <p className="text-white/70 text-xs">Get full access with Google Sign In</p>
          </div>
        </div>
      )}
    </div>
  );
}
