import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { ApiResponse, AuditLog, AuditAction } from '@/types';

interface AuditLogsResponse {
  logs: AuditLog[];
  total: number;
  page: number;
  limit: number;
}

export function useAuditLogs(
  page = 1,
  limit = 50,
  action?: AuditAction,
  userId?: string,
  dateFrom?: string,
  dateTo?: string,
) {
  return useQuery({
    queryKey: ['admin', 'audit-logs', page, limit, action, userId, dateFrom, dateTo],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<AuditLogsResponse>>('/admin/audit-logs', {
        params: { page, limit, action, user_id: userId, date_from: dateFrom, date_to: dateTo },
      });
      return data.data!;
    },
  });
}
