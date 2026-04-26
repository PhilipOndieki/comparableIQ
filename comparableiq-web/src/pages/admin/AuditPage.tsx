import { useState } from 'react';
import { ScrollText } from 'lucide-react';
import { useAuditLogs } from '@/features/admin/hooks/useAuditLogs';
import { AdminLayout } from '@/components/AdminLayout';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AuditAction } from '@/types';
import { formatDate, cn } from '@/lib/utils';

const ACTION_STYLES: Record<AuditAction, { label: string; className: string }> = {
  [AuditAction.SEARCH]: { label: 'Search', className: 'bg-blue-50 text-blue-700 border-blue-200' },
  [AuditAction.VIEW_RESULT]: { label: 'View', className: 'bg-blue-50 text-blue-700 border-blue-200' },
  [AuditAction.LOGIN]: { label: 'Login', className: 'bg-green-50 text-green-700 border-green-200' },
  [AuditAction.LOGOUT]: { label: 'Logout', className: 'bg-gray-50 text-gray-600 border-gray-200' },
  [AuditAction.COMPARABLE_ADDED]: { label: 'Added', className: 'bg-[#1A3C5E]/5 text-[#1A3C5E] border-[#1A3C5E]/20' },
  [AuditAction.COMPARABLE_EDITED]: { label: 'Edited', className: 'bg-[#1A3C5E]/5 text-[#1A3C5E] border-[#1A3C5E]/20' },
  [AuditAction.COMPARABLE_DELETED]: { label: 'Deleted', className: 'bg-red-50 text-red-700 border-red-200' },
  [AuditAction.USER_UPGRADED]: { label: 'Upgraded', className: 'bg-[#C8A96E]/10 text-[#8B6914] border-[#C8A96E]/30' },
  [AuditAction.USER_DEACTIVATED]: { label: 'Deactivated', className: 'bg-red-50 text-red-700 border-red-200' },
  [AuditAction.MAP_ACCESS_TOGGLED]: { label: 'Map Toggle', className: 'bg-purple-50 text-purple-700 border-purple-200' },
};

export function AuditPage() {
  const [page, setPage] = useState(1);
  const [action, setAction] = useState<AuditAction | undefined>();
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const { data, isLoading } = useAuditLogs(page, 50, action, undefined, dateFrom || undefined, dateTo || undefined);

  return (
    <AdminLayout>
      <PageHeader title="Audit Logs" subtitle="Full activity history" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <Select onValueChange={(v) => { setAction(v === 'all' ? undefined : v as AuditAction); setPage(1); }}>
            <SelectTrigger className="w-full sm:w-44">
              <SelectValue placeholder="All Actions" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Actions</SelectItem>
              {Object.values(AuditAction).map((a) => (
                <SelectItem key={a} value={a}>{ACTION_STYLES[a].label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="w-full sm:w-40" />
          <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="w-full sm:w-40" />
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-50 bg-gray-50/50">
                  <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-4 py-3">User</th>
                  <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-4 py-3">Action</th>
                  <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-4 py-3">Details</th>
                  <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-4 py-3">IP</th>
                  <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-4 py-3">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {isLoading
                  ? Array.from({ length: 10 }).map((_, i) => (
                      <tr key={i}>
                        {[1, 2, 3, 4, 5].map((j) => (
                          <td key={j} className="px-4 py-3"><Skeleton className="h-4 w-full" /></td>
                        ))}
                      </tr>
                    ))
                  : !data?.logs.length
                  ? (
                    <tr>
                      <td colSpan={5} className="text-center py-12">
                        <ScrollText className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                        <p className="text-gray-400 text-sm">No audit logs found</p>
                      </td>
                    </tr>
                  )
                  : data.logs.map((log) => {
                      const style = ACTION_STYLES[log.action];
                      const meta = log.metadata;
                      return (
                        <tr key={log.id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-4 py-3">
                            <p className="text-sm font-medium text-gray-800">{log.userDisplayName ?? 'Anonymous'}</p>
                            <p className="text-xs text-gray-400 truncate max-w-[160px]">{log.userEmail}</p>
                          </td>
                          <td className="px-4 py-3">
                            <span className={cn('inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium border', style.className)}>
                              {style.label}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <p className="font-mono text-xs text-gray-600 max-w-[200px] truncate">
                              {JSON.stringify(meta)}
                            </p>
                          </td>
                          <td className="px-4 py-3 font-mono text-xs text-gray-400">{log.ipAddress}</td>
                          <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">{formatDate(log.createdAt)}</td>
                        </tr>
                      );
                    })}
              </tbody>
            </table>
          </div>

          {data && data.total > 50 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-50">
              <p className="text-xs text-gray-500">
                Showing {((page - 1) * 50) + 1}–{Math.min(page * 50, data.total)} of {data.total.toLocaleString()}
              </p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
                  Previous
                </Button>
                <Button variant="outline" size="sm" onClick={() => setPage(p => p + 1)} disabled={page * 50 >= data.total}>
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
