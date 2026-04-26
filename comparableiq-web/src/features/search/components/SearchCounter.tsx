import { useAuth } from '@/features/auth/hooks/useAuth';
import { UserRole } from '@/types';
import { cn } from '@/lib/utils';

const MAX_SEARCHES = 3;

export function SearchCounter() {
  const { user } = useAuth();

  if (!user || user.role !== UserRole.GOOGLE_USER) return null;

  const used = user.searchCountToday;
  const isLast = used === MAX_SEARCHES - 1;
  const isAtLimit = used >= MAX_SEARCHES;

  return (
    <div className={cn(
      'inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium border',
      isAtLimit
        ? 'bg-red-50 text-red-700 border-red-200'
        : isLast
        ? 'bg-amber-50 text-amber-700 border-amber-200'
        : 'bg-green-50 text-green-700 border-green-200',
    )}>
      <div className="flex gap-1">
        {Array.from({ length: MAX_SEARCHES }).map((_, i) => (
          <div
            key={i}
            className={cn(
              'h-1.5 w-4 rounded-full transition-colors',
              i < used
                ? isAtLimit ? 'bg-red-400' : isLast ? 'bg-amber-400' : 'bg-green-400'
                : 'bg-current opacity-20',
            )}
          />
        ))}
      </div>
      <span>
        {isAtLimit
          ? 'Daily limit reached'
          : `${used} of ${MAX_SEARCHES} searches used today`}
      </span>
    </div>
  );
}
