import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { MapPicker } from '@/features/map/components/MapPicker';
import { AdminLayout } from '@/components/AdminLayout';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { KENYA_COUNTIES } from '@/lib/constants';
import { useCreateComparable } from '@/features/admin/hooks/useComparables';

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

export function AddComparablePage() {
  const navigate = useNavigate();
  const create = useCreateComparable();
  const [saveAndAdd, setSaveAndAdd] = useState(false);

  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { lat: -1.2921, lng: 36.8219 },
  });

  const lat = watch('lat');
  const lng = watch('lng');
  const areaHa = watch('areaHa');
  const salePrice = watch('salePrice');
  const pricePerHa = areaHa && salePrice ? Math.round(salePrice / areaHa) : null;

  const onSubmit = async (values: FormValues) => {
    await create.mutateAsync({
      ...values,
      saleDate: new Date(values.saleDate),
    });
    if (saveAndAdd) {
      reset({ lat: -1.2921, lng: 36.8219 });
    } else {
      navigate('/admin/comparables');
    }
  };

  return (
    <AdminLayout>
      <PageHeader title="Add Comparable" subtitle="Add a verified transaction record" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left — Form */}
            <div className="space-y-6">
              {/* Property Details */}
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
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
                      <Select onValueChange={(v) => setValue('county', v)}>
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
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
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
                        value={pricePerHa ? `KES ${pricePerHa.toLocaleString()}` : ''}
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
                      rows={3}
                      placeholder="Any additional notes..."
                      className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A3C5E] resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Save buttons */}
              <div className="flex gap-3">
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={create.isPending}
                  onClick={() => setSaveAndAdd(false)}
                >
                  {create.isPending && !saveAndAdd ? 'Saving...' : 'Save Comparable'}
                </Button>
                <Button
                  type="submit"
                  variant="secondary"
                  className="flex-1"
                  disabled={create.isPending}
                  onClick={() => setSaveAndAdd(true)}
                >
                  Save & Add Another
                </Button>
              </div>
            </div>

            {/* Right — Map */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
              <p className="text-xs font-semibold tracking-widest text-gray-400 uppercase mb-2">Property Location</p>
              <p className="text-xs text-gray-500 mb-3">Click the map to pin the exact property location</p>
              <div className="h-80 rounded-xl overflow-hidden mb-4">
                <MapPicker
                  lat={lat}
                  lng={lng}
                  onMapClick={(clickLat, clickLng) => {
                    setValue('lat', clickLat);
                    setValue('lng', clickLng);
                  }}
                  height="100%"
                />
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
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
