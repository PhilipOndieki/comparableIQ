import { useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { useAuthStore } from '@/store/auth.store';
import { User, ApiResponse } from '@/types';

export function useAuth() {
  const { user, accessToken, isLoading, setUser, setAccessToken, setLoading, logout: storeLogout } = useAuthStore();
  const qc = useQueryClient();

  const { isLoading: meLoading } = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<User>>('/auth/me');
      if (data.data) {
        setUser(data.data);
        setLoading(false);
      }
      return data.data;
    },
    enabled: !!accessToken,
    retry: false,
    staleTime: 1000 * 60 * 5,
  });

  const logoutMutation = useMutation({
    mutationFn: () => api.post('/auth/logout'),
    onSettled: () => {
      storeLogout();
      qc.clear();
    },
  });

  const handleAuthCallback = useCallback(
    (token: string) => {
      setAccessToken(token);
    },
    [setAccessToken],
  );

  return {
    user,
    accessToken,
    isLoading: isLoading || meLoading,
    isAuthenticated: !!user && !!accessToken,
    logout: logoutMutation.mutate,
    handleAuthCallback,
  };
}
