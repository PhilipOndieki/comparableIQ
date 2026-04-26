import { useQuery } from '@tanstack/react-query';
import { BarChart2, Users, Search, AlertTriangle, MapPin } from 'lucide-react';
import { api } from '@/lib/axios';
import { ApiResponse, DashboardStats, AuditLog } from '@/types';
import { AdminLayout } from '@/components/AdminLayout';
import { PageHeader } from '@/components/PageHeader';
import { StatsCard } from '@/features/admin/components/StatsCard';
import { formatDate } from '@/lib/utils';

function useDashboard() {
  return useQuery({
    queryKey: ['admin', 'dashboard'],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<DashboardStats>>('/admin/dashboard');
      return data.data!;
    },
    refetchInterval: 30000,
  });
}

function useRecentSearches() {
  return useQuery({
    queryKey: ['admin', 'recent-searches'],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<AuditLog[]>>('/admin/dashboard/recent-searches');
      return data.data ?? [];
    },
  });
}

export function DashboardPage() {
  const { data: stats, isLoading: statsLoading } = useDashboard();
  const { data: recent, isLoading: recentLoading } = useRecentSearches();

  const today = new Date().toLocaleDateString('en-KE', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <AdminLayout>
      <PageHeader title="Dashboard" subtitle={today} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Stats row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title="Total Comparables"
            value={stats?.totalComparables ?? 0}
            icon={MapPin}
            isLoading={statsLoading}
          />
          <StatsCard
            title="Searches Today"
            value={stats?.searchesToday ?? 0}
            delta={stats ? stats.searchesToday - stats.searchesYesterday : undefined}
            icon={Search}
            isLoading={statsLoading}
          />
          <StatsCard
            title="New Sign-ins Today"
            value={stats?.newSigninsToday ?? 0}
            icon={Users}
            isLoading={statsLoading}
          />
          <StatsCard
            title="Limit Hits Today"
            value={stats?.limitHitsToday ?? 0}
            icon={AlertTriangle}
            accent
            isLoading={statsLoading}
          />
        </div>

        {/* Recent Searches */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
          <div className="p-6 border-b border-gray-50">
            <h2 className="font-serif font-semibold text-lg">Recent Searches</h2>
          </div>
          <div className="overflow-x-auto">
            {recentLoading ? (
              <div className="p-6 space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex gap-4">
                    <div className="h-4 bg-gray-100 rounded flex-1 animate-pulse" />
                    <div className="h-4 bg-gray-100 rounded w-24 animate-pulse" />
                    <div className="h-4 bg-gray-100 rounded w-20 animate-pulse" />
                  </div>
                ))}
              </div>
            ) : !recent?.length ? (
              <div className="text-center py-12">
                <BarChart2 className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-400 text-sm">No searches yet today</p>
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-50">
                    <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-6 py-3">User</th>
                    <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-6 py-3">Details</th>
                    <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-6 py-3">Results</th>
                    <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-6 py-3">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {recent.map((log) => {
                    const meta = log.metadata as { parcelNumber?: string; resultCount?: number; lat?: number; lng?: number; radiusKm?: number };
                    return (
                      <tr key={log.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-3">
                          <p className="text-sm font-medium text-gray-800">{log.userDisplayName ?? 'Anonymous'}</p>
                          <p className="text-xs text-gray-400 truncate max-w-[160px]">{log.userEmail}</p>
                        </td>
                        <td className="px-6 py-3">
                          <p className="font-mono text-xs text-gray-600">
                            {meta.parcelNumber ?? `${meta.lat?.toFixed(4)}, ${meta.lng?.toFixed(4)}`}
                          </p>
                          <p className="text-xs text-gray-400">{meta.radiusKm}km radius</p>
                        </td>
                        <td className="px-6 py-3">
                          <span className="font-mono text-sm font-semibold text-[#1A3C5E]">{meta.resultCount ?? 0}</span>
                        </td>
                        <td className="px-6 py-3">
                          <p className="text-xs text-gray-500">{formatDate(log.createdAt)}</p>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
