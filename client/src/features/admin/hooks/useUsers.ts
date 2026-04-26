import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { ApiResponse, User, UserRole } from '@/types';

interface UsersResponse {
  users: User[];
  total: number;
  page: number;
  limit: number;
}

export function useUsers(page = 1, limit = 20, role?: UserRole, search?: string, isActive?: boolean) {
  return useQuery({
    queryKey: ['admin', 'users', page, limit, role, search, isActive],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<UsersResponse>>('/admin/users', {
        params: { page, limit, role, search, is_active: isActive },
      });
      return data.data!;
    },
  });
}

export function useUpgradeUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.put<ApiResponse<User>>(`/admin/users/${id}/upgrade`);
      return data.data!;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'users'] }),
  });
}

export function useDeactivateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.put<ApiResponse<User>>(`/admin/users/${id}/deactivate`);
      return data.data!;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'users'] }),
  });
}

export function useToggleMapAccess() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.put<ApiResponse<User>>(`/admin/users/${id}/map-access`);
      return data.data!;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'users'] }),
  });
}
