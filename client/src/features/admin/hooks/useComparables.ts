import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { ApiResponse, Comparable } from '@/types';

interface ComparablesResponse {
  comparables: Comparable[];
  total: number;
  page: number;
  limit: number;
}

interface ComparableInput {
  parcelNumber: string;
  lat: number;
  lng: number;
  areaHa: number;
  salePrice?: number;
  saleDate: Date;
  locality: string;
  county: string;
  notes?: string;
}

export function useComparables(page = 1, limit = 20, county?: string, search?: string) {
  return useQuery({
    queryKey: ['admin', 'comparables', page, limit, county, search],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<ComparablesResponse>>('/admin/comparables', {
        params: { page, limit, county, search },
      });
      return data.data!;
    },
  });
}

export function useCreateComparable() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: ComparableInput) => {
      const { data } = await api.post<ApiResponse<Comparable>>('/admin/comparables', input);
      return data.data!;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'comparables'] }),
  });
}

export function useUpdateComparable() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...input }: ComparableInput & { id: string }) => {
      const { data } = await api.put<ApiResponse<Comparable>>(`/admin/comparables/${id}`, input);
      return data.data!;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'comparables'] }),
  });
}

export function useDeleteComparable() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/admin/comparables/${id}`);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'comparables'] }),
  });
}
