import { useState } from 'react';
import { Search, MoreVertical, UserCheck, MapPin, UserX, User } from 'lucide-react';
import { useUsers, useUpgradeUser, useDeactivateUser, useToggleMapAccess } from '@/features/admin/hooks/useUsers';
import { AdminLayout } from '@/components/AdminLayout';
import { PageHeader } from '@/components/PageHeader';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { UserRole } from '@/types';
import { formatDate, cn } from '@/lib/utils';

const ROLE_BADGE: Record<UserRole, { label: string; variant: 'secondary' | 'accent' | 'default' }> = {
  [UserRole.ADMIN]: { label: 'Admin', variant: 'secondary' },
  [UserRole.VERIFIED_VALUER]: { label: 'Verified', variant: 'accent' },
  [UserRole.GOOGLE_USER]: { label: 'Google', variant: 'default' },
};

export function UsersPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<UserRole | undefined>();

  const { data, isLoading } = useUsers(page, 20, roleFilter, search);
  const upgrade = useUpgradeUser();
  const deactivate = useDeactivateUser();
  const toggleMap = useToggleMapAccess();

  return (
    <AdminLayout>
      <PageHeader title="Users" subtitle="Manage valuer access" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search name or email..."
              className="pl-9"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
          <Select onValueChange={(v) => { setRoleFilter(v === 'all' ? undefined : v as UserRole); setPage(1); }}>
            <SelectTrigger className="w-full sm:w-44">
              <SelectValue placeholder="All Roles" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value={UserRole.ADMIN}>Admin</SelectItem>
              <SelectItem value={UserRole.VERIFIED_VALUER}>Verified Valuer</SelectItem>
              <SelectItem value={UserRole.GOOGLE_USER}>Google User</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-50 bg-gray-50/50">
                  <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-4 py-3">User</th>
                  <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-4 py-3">Role</th>
                  <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-4 py-3">Searches Today</th>
                  <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-4 py-3">Map Access</th>
                  <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-4 py-3">Status</th>
                  <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-4 py-3">Joined</th>
                  <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {isLoading
                  ? Array.from({ length: 8 }).map((_, i) => (
                      <tr key={i}>
                        {Array.from({ length: 7 }).map((_, j) => (
                          <td key={j} className="px-4 py-3">
                            <Skeleton className="h-4 w-full" />
                          </td>
                        ))}
                      </tr>
                    ))
                  : data?.users.map((user) => {
                      const { label, variant } = ROLE_BADGE[user.role];
                      const isAtLimit = user.searchCountToday >= 3 && user.role === UserRole.GOOGLE_USER;

                      return (
                        <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              {user.avatarUrl ? (
                                <img src={user.avatarUrl} alt={user.displayName} className="h-8 w-8 rounded-full object-cover" />
                              ) : (
                                <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
                                  <User className="h-4 w-4 text-gray-400" />
                                </div>
                              )}
                              <div className="min-w-0">
                                <p className="text-sm font-medium text-gray-800 truncate max-w-[140px]">{user.displayName}</p>
                                <p className="text-xs text-gray-400 truncate max-w-[140px]">{user.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <Badge variant={variant} className="text-[10px]">{label}</Badge>
                          </td>
                          <td className="px-4 py-3">
                            <span className={cn(
                              'font-mono text-sm font-medium',
                              isAtLimit ? 'text-amber-600' : 'text-gray-700',
                            )}>
                              {user.searchCountToday}
                              {isAtLimit && <span className="ml-1 text-amber-400">⚠</span>}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <Switch
                              checked={user.hasMapAccess}
                              onCheckedChange={() => toggleMap.mutate(user.id)}
                              disabled={user.role === UserRole.GOOGLE_USER}
                            />
                          </td>
                          <td className="px-4 py-3">
                            <span className={cn(
                              'inline-flex items-center gap-1.5 text-xs font-medium',
                              user.isActive ? 'text-green-600' : 'text-gray-400',
                            )}>
                              <span className={cn('h-1.5 w-1.5 rounded-full', user.isActive ? 'bg-green-500' : 'bg-gray-300')} />
                              {user.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-xs text-gray-500">{formatDate(user.createdAt)}</td>
                          <td className="px-4 py-3">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors">
                                  <MoreVertical className="h-3.5 w-3.5" />
                                </button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-48">
                                {user.role === UserRole.GOOGLE_USER && (
                                  <DropdownMenuItem
                                    onClick={() => upgrade.mutate(user.id)}
                                    className="gap-2 cursor-pointer"
                                  >
                                    <UserCheck className="h-4 w-4 text-[#C8A96E]" />
                                    Upgrade to Verified
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuItem
                                  onClick={() => toggleMap.mutate(user.id)}
                                  className="gap-2 cursor-pointer"
                                  disabled={user.role === UserRole.GOOGLE_USER}
                                >
                                  <MapPin className="h-4 w-4 text-[#1A3C5E]" />
                                  Toggle Map Access
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                {user.isActive && (
                                  <DropdownMenuItem
                                    onClick={() => {
                                      if (confirm(`Deactivate ${user.displayName}?`)) deactivate.mutate(user.id);
                                    }}
                                    className="gap-2 cursor-pointer text-red-600 focus:text-red-600"
                                  >
                                    <UserX className="h-4 w-4" />
                                    Deactivate Account
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </td>
                        </tr>
                      );
                    })}
              </tbody>
            </table>
          </div>

          {data && data.total > 20 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-50">
              <p className="text-xs text-gray-500">
                Showing {((page - 1) * 20) + 1}–{Math.min(page * 20, data.total)} of {data.total.toLocaleString()}
              </p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
                  Previous
                </Button>
                <Button variant="outline" size="sm" onClick={() => setPage(p => p + 1)} disabled={page * 20 >= data.total}>
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
