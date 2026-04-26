import { useState } from 'react';

interface Coordinates {
  lat: number;
  lng: number;
}

export function useMapCoordinates() {
  const [coordinates, setCoordinates] = useState<Coordinates | null>(null);

  const handleMapClick = (lat: number, lng: number) => {
    setCoordinates({ lat, lng });
  };

  const clearCoordinates = () => setCoordinates(null);

  return { coordinates, handleMapClick, clearCoordinates };
}
