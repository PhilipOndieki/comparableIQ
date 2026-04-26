import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X } from 'lucide-react';
import { Comparable } from '@/types';
import { KENYA_COUNTIES } from '@/lib/constants';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MapPicker } from '@/features/map/components/MapPicker';

const schema = z.object({
  parcelNumber: z.string().min(1, 'Required'),
  county: z.string().min(1, 'Required'),
  locality: z.string().min(1, 'Required'),
  areaHa: z.coerce.number().positive('Must be positive'),
  salePrice: z.coerce.number().positive().optional(),
  saleDate: z.string().min(1, 'Required'),
  notes: z.string().optional(),
  lat: z.coerce.number().min(-90).max(90),
  lng: z.coerce.number().min(-180).max(180),
});

type FormValues = z.infer<typeof schema>;

interface ComparableFormProps {
  comparable?: Comparable | null;
  onSave: (values: FormValues) => Promise<void>;
  onClose: () => void;
  isSaving: boolean;
}

export function ComparableForm({ comparable, onSave, onClose, isSaving }: ComparableFormProps) {
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: comparable
      ? {
          parcelNumber: comparable.parcelNumber,
          county: comparable.county,
          locality: comparable.locality,
          areaHa: comparable.areaHa,
          salePrice: comparable.salePrice ?? undefined,
          saleDate: new Date(comparable.saleDate).toISOString().split('T')[0],
          notes: comparable.notes ?? '',
          lat: comparable.coordinates[1],
          lng: comparable.coordinates[0],
        }
      : { lat: -1.2921, lng: 36.8219 },
  });

  const lat = watch('lat');
  const lng = watch('lng');
  const areaHa = watch('areaHa');
  const salePrice = watch('salePrice');
  const pricePerHa = areaHa && salePrice ? Math.round(salePrice / areaHa) : null;

  const handleMapClick = (clickLat: number, clickLng: number) => {
    setValue('lat', clickLat);
    setValue('lng', clickLng);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-2xl bg-white h-full overflow-y-auto shadow-xl animate-slide-in">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between z-10">
          <h2 className="font-serif font-semibold text-lg">
            {comparable ? 'Edit Comparable' : 'Add Comparable'}
          </h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100 transition-colors">
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSave)} className="p-6 space-y-6">
          {/* Property Details */}
          <div>
            <p className="text-xs font-semibold tracking-widest text-gray-400 uppercase mb-4">Property Details</p>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Parcel Number</label>
                <Input {...register('parcelNumber')} className="font-mono" placeholder="e.g. Kiambu/Ruiru/1001" />
                {errors.parcelNumber && <p className="text-xs text-red-500 mt-1">{errors.parcelNumber.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">County</label>
                  <Select onValueChange={(v) => setValue('county', v)} defaultValue={comparable?.county}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select county" />
                    </SelectTrigger>
                    <SelectContent>
                      {KENYA_COUNTIES.map((c) => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.county && <p className="text-xs text-red-500 mt-1">{errors.county.message}</p>}
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Locality</label>
                  <Input {...register('locality')} placeholder="e.g. Ruiru" />
                  {errors.locality && <p className="text-xs text-red-500 mt-1">{errors.locality.message}</p>}
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Area (ha)</label>
                <Input {...register('areaHa', { valueAsNumber: true })} type="number" step="0.0001" className="font-mono" placeholder="0.0000" />
                {errors.areaHa && <p className="text-xs text-red-500 mt-1">{errors.areaHa.message}</p>}
              </div>
            </div>
          </div>

          {/* Transaction */}
          <div>
            <p className="text-xs font-semibold tracking-widest text-gray-400 uppercase mb-4">Transaction</p>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Sale Price (KES)</label>
                  <Input {...register('salePrice', { valueAsNumber: true })} type="number" className="font-mono" placeholder="0" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Price per Ha (auto)</label>
                  <Input
                    value={pricePerHa ? pricePerHa.toLocaleString() : ''}
                    disabled
                    className="font-mono bg-gray-50 text-gray-500"
                    placeholder="Auto-calculated"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Sale Date</label>
                <Input {...register('saleDate')} type="date" />
                {errors.saleDate && <p className="text-xs text-red-500 mt-1">{errors.saleDate.message}</p>}
              </div>

              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Notes (optional)</label>
                <textarea
                  {...register('notes')}
                  rows={2}
                  placeholder="Any additional notes..."
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A3C5E] resize-none"
                />
              </div>
            </div>
          </div>

          {/* Location */}
          <div>
            <p className="text-xs font-semibold tracking-widest text-gray-400 uppercase mb-2">Location</p>
            <p className="text-xs text-gray-500 mb-3">Click the map to pin the exact property location</p>
            <div className="h-64 rounded-xl overflow-hidden mb-3">
              <MapPicker lat={lat} lng={lng} onMapClick={handleMapClick} height="100%" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Latitude</label>
                <Input value={lat?.toFixed(6) ?? ''} disabled className="font-mono text-xs bg-gray-50" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Longitude</label>
                <Input value={lng?.toFixed(6) ?? ''} disabled className="font-mono text-xs bg-gray-50" />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" className="flex-1" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={isSaving}>
              {isSaving ? 'Saving...' : comparable ? 'Save Changes' : 'Add Comparable'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
