import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { MapPin, Search, CheckCircle2 } from 'lucide-react';
import { searchFormSchema, SearchFormValues } from '../schemas';
import { useParcelLookup } from '../hooks/useParcelLookup';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { cn } from '@/lib/utils';

const RADIUS_OPTIONS = [1, 3, 5, 10];

interface SearchFormProps {
  onSubmit: (values: SearchFormValues) => void;
  isLoading: boolean;
  onCoordinatesFromParcel?: (lat: number, lng: number) => void;
  mapLat?: number;
  mapLng?: number;
}

export function SearchForm({ onSubmit, isLoading, onCoordinatesFromParcel, mapLat, mapLng }: SearchFormProps) {
  const { isAuthenticated } = useAuth();
  const [parcelInput, setParcelInput] = useState('');
  const [selectedRadius, setSelectedRadius] = useState(3);
  const [autoFilled, setAutoFilled] = useState(false);

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<SearchFormValues>({
    resolver: zodResolver(searchFormSchema),
    defaultValues: { radiusKm: 3, lat: 0, lng: 0 },
  });

  const { data: parcelData, isSuccess: parcelFound } = useParcelLookup(parcelInput);

  useEffect(() => {
    if (parcelData && parcelFound) {
      setValue('areaHa', parcelData.areaHa);
      setValue('lat', parcelData.lat);
      setValue('lng', parcelData.lng);
      onCoordinatesFromParcel?.(parcelData.lat, parcelData.lng);
      setAutoFilled(true);
    }
  }, [parcelData, parcelFound, setValue, onCoordinatesFromParcel]);

  useEffect(() => {
    if (mapLat !== undefined && mapLng !== undefined) {
      setValue('lat', mapLat);
      setValue('lng', mapLng);
    }
  }, [mapLat, mapLng, setValue]);

  const lat = watch('lat');
  const lng = watch('lng');
  const hasCoords = lat !== 0 && lng !== 0;

  const handleRadiusSelect = (km: number) => {
    setSelectedRadius(km);
    setValue('radiusKm', km);
  };

  const handleParcelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setValue('parcelNumber', val);
    setParcelInput(val);
    if (!val) setAutoFilled(false);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div>
        <p className="text-xs font-semibold tracking-widest text-gray-400 uppercase mb-3">Subject Property</p>

        <div className="space-y-3">
          {/* Parcel Number */}
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">Parcel Number</label>
            <Input
              {...register('parcelNumber')}
              className="font-mono"
              placeholder="e.g. Chania/Mataara/26"
              onChange={handleParcelChange}
            />
          </div>

          {/* Area ha */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-medium text-gray-600">Area (ha)</label>
              {autoFilled && (
                <span className="flex items-center gap-1 text-[10px] text-green-600 font-medium">
                  <CheckCircle2 className="h-3 w-3" />
                  Auto-filled
                </span>
              )}
            </div>
            <Input
              {...register('areaHa', { valueAsNumber: true })}
              type="number"
              step="0.01"
              placeholder="e.g. 0.76"
              className={cn('font-mono', autoFilled && 'border-green-200 bg-green-50/50')}
            />
            {errors.areaHa && <p className="text-xs text-red-500 mt-1">{errors.areaHa.message}</p>}
          </div>

          {/* Radius Pills */}
          <div>
            <label className="text-xs font-medium text-gray-600 mb-2 block">Search Radius</label>
            <div className="flex gap-2">
              {RADIUS_OPTIONS.map((km) => (
                <button
                  key={km}
                  type="button"
                  onClick={() => handleRadiusSelect(km)}
                  className={cn(
                    'flex-1 py-1.5 rounded-lg text-sm font-medium border transition-colors',
                    selectedRadius === km
                      ? 'bg-[#1A3C5E] text-white border-[#1A3C5E]'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300',
                  )}
                >
                  {km}km
                </button>
              ))}
            </div>
          </div>

          {/* Coordinates */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-medium text-gray-600">Coordinates</label>
              {!hasCoords && (
                <span className="flex items-center gap-1 text-[10px] text-gray-400">
                  <MapPin className="h-3 w-3" />
                  Drop pin on map →
                </span>
              )}
            </div>
            <div className="flex gap-2">
              <Input
                {...register('lat', { valueAsNumber: true })}
                className="font-mono bg-gray-50 text-xs"
                placeholder="Latitude"
                disabled
                value={hasCoords ? lat.toFixed(6) : ''}
                readOnly
              />
              <Input
                {...register('lng', { valueAsNumber: true })}
                className="font-mono bg-gray-50 text-xs"
                placeholder="Longitude"
                disabled
                value={hasCoords ? lng.toFixed(6) : ''}
                readOnly
              />
            </div>
            {(errors.lat || errors.lng) && (
              <p className="text-xs text-red-500 mt-1">Please drop a pin on the map</p>
            )}
          </div>
        </div>
      </div>

      <Button
        type="submit"
        className="w-full"
        size="lg"
        disabled={isLoading || !hasCoords}
      >
        {isLoading ? (
          <span className="flex items-center gap-2">
            <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Searching...
          </span>
        ) : (
          <span className="flex items-center gap-2">
            <Search className="h-4 w-4" />
            Search Comparables
          </span>
        )}
      </Button>

      {!isAuthenticated && (
        <p className="text-xs text-gray-400 text-center">
          Sign in with Google for full results · Free · 3 searches/day
        </p>
      )}
    </form>
  );
}
