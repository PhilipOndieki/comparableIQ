import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

interface StatsCardProps {
  title: string;
  value: number | string;
  delta?: number;
  icon: LucideIcon;
  accent?: boolean;
  isLoading?: boolean;
}

export function StatsCard({ title, value, delta, icon: Icon, accent, isLoading }: StatsCardProps) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
        <Skeleton className="h-4 w-24 mb-3" />
        <Skeleton className="h-8 w-16 mb-2" />
        <Skeleton className="h-3 w-20" />
      </div>
    );
  }

  return (
    <div className={cn(
      'bg-white rounded-xl border shadow-sm p-6 transition-shadow hover:shadow-md',
      accent ? 'border-[#C8A96E]/30' : 'border-gray-100',
    )}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">{title}</p>
          <p className={cn(
            'font-mono text-3xl font-bold',
            accent ? 'text-[#C8A96E]' : 'text-[#0A0A0A]',
          )}>
            {typeof value === 'number' ? value.toLocaleString() : value}
          </p>
          {delta !== undefined && (
            <p className={cn('text-xs mt-1 font-medium', delta >= 0 ? 'text-green-600' : 'text-red-600')}>
              {delta >= 0 ? '+' : ''}{delta} vs yesterday
            </p>
          )}
        </div>
        <div className={cn(
          'h-10 w-10 rounded-xl flex items-center justify-center',
          accent ? 'bg-[#C8A96E]/10' : 'bg-gray-50',
        )}>
          <Icon className={cn('h-5 w-5', accent ? 'text-[#C8A96E]' : 'text-gray-400')} />
        </div>
      </div>
    </div>
  );
}
