import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { ApiResponse, SearchResult } from '@/types';
import { SearchFormValues } from '../schemas';

export function useSearch() {
  return useMutation({
    mutationFn: async (params: SearchFormValues) => {
      const { data } = await api.get<ApiResponse<SearchResult>>('/search', {
        params: {
          lat: params.lat,
          lng: params.lng,
          area_ha: params.areaHa,
          radius_km: params.radiusKm,
          parcel_number: params.parcelNumber,
        },
      });
      if (!data.success || !data.data) {
        throw new Error(data.error?.message ?? 'Search failed');
      }
      return data.data;
    },
  });
}
