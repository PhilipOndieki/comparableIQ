import { MapPin, Calendar, AreaChart } from 'lucide-react';
import { Comparable } from '@/types';
import { formatCurrency, formatDate, formatDistance, cn } from '@/lib/utils';

interface ResultCardProps {
  comparable: Comparable;
  isActive?: boolean;
  onClick?: () => void;
}

export function ResultCard({ comparable, isActive, onClick }: ResultCardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'bg-white rounded-xl border border-gray-100 p-4 cursor-pointer transition-all duration-200',
        'hover:shadow-md hover:-translate-y-0.5',
        isActive
          ? 'border-l-4 border-l-[#1A3C5E] shadow-md -translate-y-0.5'
          : 'border-l-4 border-l-transparent',
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="font-mono font-semibold text-[#0A0A0A] text-sm truncate">{comparable.parcelNumber}</p>
          <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
            <MapPin className="h-3 w-3 shrink-0" />
            {comparable.locality}, {comparable.county}
            {comparable.distanceM !== undefined && (
              <span className="text-gray-400">· {formatDistance(comparable.distanceM)}</span>
            )}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mt-3">
        <div className="flex items-center gap-1 bg-gray-50 rounded-md px-2 py-1">
          <AreaChart className="h-3 w-3 text-gray-400" />
          <span className="font-mono text-xs text-gray-700">{comparable.areaHa.toFixed(2)} ha</span>
        </div>

        {comparable.pricePerHa !== null && (
          <div className="flex items-center gap-1 bg-[#1A3C5E]/5 rounded-md px-2 py-1">
            <span className="font-mono text-xs text-[#1A3C5E] font-medium">
              {formatCurrency(comparable.pricePerHa)}/ha
            </span>
          </div>
        )}

        <div className="flex items-center gap-1 bg-gray-50 rounded-md px-2 py-1">
          <Calendar className="h-3 w-3 text-gray-400" />
          <span className="font-mono text-xs text-gray-700">{formatDate(comparable.saleDate)}</span>
        </div>
      </div>

      {comparable.salePrice !== null && (
        <div className="mt-2 pt-2 border-t border-gray-50">
          <span className="text-xs text-gray-500">Sale Price: </span>
          <span className="font-mono text-xs font-semibold text-[#0A0A0A]">{formatCurrency(comparable.salePrice)}</span>
        </div>
      )}
    </div>
  );
}
