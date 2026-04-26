import { Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Comparable } from '@/types';

interface BlurredResultsProps {
  comparables: Comparable[];
  total: number;
  subjectParcel?: string;
  radiusKm: number;
}

export function BlurredResults({ comparables, total, subjectParcel, radiusKm }: BlurredResultsProps) {
  const handleSignIn = () => {
    window.location.href = `${import.meta.env['VITE_API_URL'] ?? '/api/v1'}/auth/google`;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          <span className="font-semibold text-[#0A0A0A]">{total} comparables</span> found
          {subjectParcel && <span className="text-gray-400"> · Near {subjectParcel}</span>}
          <span className="text-gray-400"> · {radiusKm}km radius</span>
        </p>
      </div>

      {/* Blurred cards */}
      <div className="relative space-y-3">
        {comparables.slice(0, 3).map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-xl border border-gray-100 p-4 select-none"
            style={{ filter: 'blur(4px)', opacity: 0.5, userSelect: 'none', pointerEvents: 'none' }}
          >
            <div className="h-4 bg-gray-200 rounded w-2/3 mb-2" />
            <div className="h-3 bg-gray-100 rounded w-1/2 mb-3" />
            <div className="flex gap-2">
              <div className="h-6 bg-gray-100 rounded-md w-16" />
              <div className="h-6 bg-gray-100 rounded-md w-20" />
              <div className="h-6 bg-gray-100 rounded-md w-16" />
            </div>
          </div>
        ))}

        {/* Frosted overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center rounded-xl bg-white/60 backdrop-blur-sm border border-gray-100">
          <div className="text-center px-6 py-8">
            <div className="w-12 h-12 rounded-full bg-[#1A3C5E]/10 flex items-center justify-center mx-auto mb-4">
              <Lock className="h-5 w-5 text-[#1A3C5E]" />
            </div>
            <h3 className="font-serif font-semibold text-[#0A0A0A] text-base mb-1">Sign in to view full results</h3>
            <p className="text-gray-500 text-xs mb-5">Free account · 3 searches per day</p>
            <Button onClick={handleSignIn} className="w-full gap-2">
              <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden>
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#C8A96E" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#C8A96E" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#C8A96E" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Sign in with Google
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
