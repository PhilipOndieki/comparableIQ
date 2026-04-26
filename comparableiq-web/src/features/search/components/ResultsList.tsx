import { Comparable } from '@/types';
import { ResultCard } from './ResultCard';
import { Skeleton } from '@/components/ui/skeleton';

interface ResultsListProps {
  comparables: Comparable[];
  total: number;
  parcelNumber?: string;
  radiusKm: number;
  activeId?: string;
  onCardClick: (id: string) => void;
  isLoading?: boolean;
}

export function ResultsList({ comparables, total, parcelNumber, radiusKm, activeId, onCardClick, isLoading }: ResultsListProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-100 p-4 space-y-3">
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-3 w-1/2" />
            <div className="flex gap-2">
              <Skeleton className="h-6 w-16 rounded-md" />
              <Skeleton className="h-6 w-20 rounded-md" />
              <Skeleton className="h-6 w-16 rounded-md" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          <span className="font-semibold text-[#0A0A0A]">{total} comparables</span> found
          {parcelNumber && <span className="text-gray-400"> · Near {parcelNumber}</span>}
          <span className="text-gray-400"> · {radiusKm}km radius</span>
        </p>
      </div>

      {comparables.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
            <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <p className="text-gray-500 text-sm">No comparables found in this area</p>
          <p className="text-gray-400 text-xs mt-1">Try increasing the search radius</p>
        </div>
      ) : (
        <div className="space-y-3">
          {comparables.map((comp) => (
            <ResultCard
              key={comp.id}
              comparable={comp}
              isActive={comp.id === activeId}
              onClick={() => onCardClick(comp.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
