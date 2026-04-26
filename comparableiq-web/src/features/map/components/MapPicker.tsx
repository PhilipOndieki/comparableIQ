import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';

const subjectIcon = L.divIcon({
  className: '',
  html: `<div style="width:20px;height:20px;background:#C8A96E;border:3px solid white;border-radius:50%;box-shadow:0 2px 6px rgba(0,0,0,0.3)"></div>`,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

interface MapClickHandlerProps {
  onMapClick: (lat: number, lng: number) => void;
}

function MapClickHandler({ onMapClick }: MapClickHandlerProps) {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

interface MapPickerProps {
  lat?: number;
  lng?: number;
  onMapClick: (lat: number, lng: number) => void;
  height?: string;
}

export function MapPicker({ lat, lng, onMapClick, height = '100%' }: MapPickerProps) {
  const defaultCenter: [number, number] = [-1.2921, 36.8219]; // Nairobi

  return (
    <div className="relative w-full rounded-xl overflow-hidden" style={{ height }}>
      <MapContainer
        center={lat && lng ? [lat, lng] : defaultCenter}
        zoom={lat && lng ? 13 : 7}
        style={{ height: '100%', width: '100%' }}
        className="z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://carto.com">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />
        <MapClickHandler onMapClick={onMapClick} />
        {lat && lng && <Marker position={[lat, lng]} icon={subjectIcon} />}
      </MapContainer>

      {!lat && !lng && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
          <div className="bg-white/90 backdrop-blur-sm rounded-lg px-4 py-2 shadow-sm border border-gray-100">
            <p className="text-sm text-gray-500 font-medium">Click map to set location</p>
          </div>
        </div>
      )}
    </div>
  );
}
