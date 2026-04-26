import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { ApiResponse, ParcelLookupResult } from '@/types';

export function useParcelLookup(parcelNumber: string | undefined) {
  return useQuery({
    queryKey: ['parcel', parcelNumber],
    queryFn: async () => {
      if (!parcelNumber?.trim()) return null;
      const { data } = await api.get<ApiResponse<ParcelLookupResult>>(
        `/search/parcel/${encodeURIComponent(parcelNumber.trim())}`,
      );
      return data.data;
    },
    enabled: !!parcelNumber?.trim() && parcelNumber.trim().length > 3,
    staleTime: 1000 * 60 * 60,
    retry: false,
  });
}
