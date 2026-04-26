import { useState } from 'react';
import { Plus, Search, Pencil, Trash2, Upload } from 'lucide-react';
import { useComparables, useCreateComparable, useUpdateComparable, useDeleteComparable } from '@/features/admin/hooks/useComparables';
import { ComparableForm } from '@/features/admin/components/ComparableForm';
import { AdminLayout } from '@/components/AdminLayout';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Comparable } from '@/types';
import { KENYA_COUNTIES } from '@/lib/constants';
import { formatCurrency, formatDate } from '@/lib/utils';
import { api } from '@/lib/axios';

type FormInput = {
  parcelNumber: string;
  county: string;
  locality: string;
  areaHa: number;
  salePrice?: number;
  saleDate: string;
  notes?: string;
  lat: number;
  lng: number;
};

export function ComparablesPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [county, setCounty] = useState<string | undefined>();
  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Comparable | null>(null);

  const { data, isLoading } = useComparables(page, 20, county, search);
  const create = useCreateComparable();
  const update = useUpdateComparable();
  const del = useDeleteComparable();

  const handleSave = async (values: FormInput) => {
    const payload = {
      ...values,
      saleDate: new Date(values.saleDate),
    };
    if (editTarget) {
      await update.mutateAsync({ id: editTarget.id, ...payload });
    } else {
      await create.mutateAsync(payload);
    }
    setFormOpen(false);
    setEditTarget(null);
  };

  const handleEdit = (comp: Comparable) => {
    setEditTarget(comp);
    setFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Soft delete this comparable? It will not appear in searches.')) return;
    await del.mutateAsync(id);
  };

  const handleBulkUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    try {
      const { data } = await api.post('/admin/comparables/bulk', formData);
      alert(`Imported ${data.data.created} comparables`);
    } catch {
      alert('Import failed');
    }
    e.target.value = '';
  };

  return (
    <AdminLayout>
      <PageHeader title="Comparables" subtitle="Manage transaction records" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Actions row */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search parcel number..."
              className="pl-9 font-mono"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
          <Select onValueChange={(v) => { setCounty(v === 'all' ? undefined : v); setPage(1); }}>
            <SelectTrigger className="w-full sm:w-44">
              <SelectValue placeholder="All Counties" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Counties</SelectItem>
              {KENYA_COUNTIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
          <label className="inline-flex items-center gap-2 cursor-pointer btn-secondary px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium hover:bg-gray-50 transition-colors">
            <Upload className="h-4 w-4" />
            <span>Bulk CSV</span>
            <input type="file" accept=".csv" className="sr-only" onChange={handleBulkUpload} />
          </label>
          <Button onClick={() => { setEditTarget(null); setFormOpen(true); }} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Comparable
          </Button>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-50 bg-gray-50/50">
                  {['Parcel', 'County', 'Locality', 'Area (ha)', 'Price/ha', 'Date', 'Actions'].map((h) => (
                    <th key={h} className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-4 py-3">
                      {h}
                    </th>
                  ))}
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
                  : data?.comparables.map((comp) => (
                      <tr key={comp.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-4 py-3 font-mono text-xs font-medium text-[#0A0A0A]">{comp.parcelNumber}</td>
                        <td className="px-4 py-3">
                          <Badge variant="default" className="text-[10px]">{comp.county}</Badge>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">{comp.locality}</td>
                        <td className="px-4 py-3 font-mono text-sm">{comp.areaHa.toFixed(2)}</td>
                        <td className="px-4 py-3 font-mono text-sm text-[#1A3C5E] font-medium">
                          {comp.pricePerHa ? formatCurrency(comp.pricePerHa) : '—'}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">{formatDate(comp.saleDate)}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleEdit(comp)}
                              className="p-1.5 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition-colors"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => handleDelete(comp.id)}
                              className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
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

      {formOpen && (
        <ComparableForm
          comparable={editTarget}
          onSave={handleSave}
          onClose={() => { setFormOpen(false); setEditTarget(null); }}
          isSaving={create.isPending || update.isPending}
        />
      )}
    </AdminLayout>
  );
}
