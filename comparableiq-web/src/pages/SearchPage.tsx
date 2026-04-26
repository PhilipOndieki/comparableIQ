import { useState, useCallback } from 'react';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useSearch } from '@/features/search/hooks/useSearch';
import { useMapCoordinates } from '@/features/map/hooks/useMapCoordinates';
import { SearchForm } from '@/features/search/components/SearchForm';
import { ResultsList } from '@/features/search/components/ResultsList';
import { BlurredResults } from '@/features/search/components/BlurredCard';
import { SearchCounter } from '@/features/search/components/SearchCounter';
import { MapPicker } from '@/features/map/components/MapPicker';
import { ResultsMap } from '@/features/map/components/ResultsMap';
import { Layout } from '@/components/Layout';
import { PageHeader } from '@/components/PageHeader';
import { UserRole, SearchResult } from '@/types';
import { SearchFormValues } from '@/features/search/schemas';

export function SearchPage() {
  const { user, isAuthenticated } = useAuth();
  const { mutate: search, isPending: isSearching } = useSearch();
  const { coordinates, handleMapClick } = useMapCoordinates();

  const [searchResult, setSearchResult] = useState<SearchResult | null>(null);
  const [lastSearchParams, setLastSearchParams] = useState<SearchFormValues | null>(null);
  const [activeComparableId, setActiveComparableId] = useState<string | undefined>();
  const [parcelFromSearch, setParcelFromSearch] = useState<string | undefined>();

  const canSeeResults = isAuthenticated && user?.role !== UserRole.GOOGLE_USER;
  const isGoogleUser = isAuthenticated && user?.role === UserRole.GOOGLE_USER;
  const hasResults = searchResult !== null;

  const handleSearch = useCallback((values: SearchFormValues) => {
    setLastSearchParams(values);
    setParcelFromSearch(values.parcelNumber);
    search(values, {
      onSuccess: (data) => setSearchResult(data),
    });
  }, [search]);

  const handleParcelCoords = useCallback((lat: number, lng: number) => {
    handleMapClick(lat, lng);
  }, [handleMapClick]);

  // STATE A — No results
  if (!hasResults) {
    return (
      <Layout>
        <PageHeader
          title="Property Comparables"
          subtitle="Search verified transaction data across Kenya"
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Search Form */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                <SearchForm
                  onSubmit={handleSearch}
                  isLoading={isSearching}
                  onCoordinatesFromParcel={handleParcelCoords}
                  mapLat={coordinates?.lat}
                  mapLng={coordinates?.lng}
                />
              </div>
            </div>

            {/* Map */}
            <div className="lg:col-span-3 h-[500px] lg:h-auto min-h-[400px]">
              <MapPicker
                lat={coordinates?.lat}
                lng={coordinates?.lng}
                onMapClick={handleMapClick}
                height="100%"
              />
            </div>
          </div>

          {/* How it works */}
          <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { step: '01', title: 'Drop a Pin', desc: 'Click the map to set the subject property location in Kenya' },
              { step: '02', title: 'Set Parameters', desc: 'Enter area in hectares and choose your search radius' },
              { step: '03', title: 'Get Comparables', desc: 'Instantly see verified land transactions sorted by proximity' },
            ].map(({ step, title, desc }) => (
              <div key={step} className="text-center">
                <div className="font-mono text-xs font-bold text-[#C8A96E] tracking-widest mb-2">{step}</div>
                <h3 className="font-serif font-semibold text-[#0A0A0A] text-base mb-1">{title}</h3>
                <p className="text-sm text-gray-500">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </Layout>
    );
  }

  // STATE B & C — Has results
  const comparables = searchResult.comparables;
  const subjectLat = coordinates?.lat ?? lastSearchParams?.lat ?? -1.2921;
  const subjectLng = coordinates?.lng ?? lastSearchParams?.lng ?? 36.8219;
  const isHidden = searchResult.hidden;
  const showBlurred = isHidden && !canSeeResults && !isGoogleUser;

  return (
    <Layout>
      {/* Compact search bar */}
      <div className="bg-[#0A0A0A] py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1">
              <p className="text-white/60 text-xs font-mono">
                {parcelFromSearch ?? `${subjectLat.toFixed(4)}, ${subjectLng.toFixed(4)}`}
                {lastSearchParams && <span className="text-white/40"> · {lastSearchParams.radiusKm}km radius</span>}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <SearchCounter />
              <button
                onClick={() => setSearchResult(null)}
                className="text-white/60 text-xs hover:text-white transition-colors border border-white/20 rounded-lg px-3 py-1.5"
              >
                New Search
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Left — Results */}
          <div className="lg:col-span-2 lg:max-h-[calc(100vh-200px)] lg:overflow-y-auto space-y-4">
            {!isAuthenticated || showBlurred ? (
              <BlurredResults
                comparables={comparables}
                total={searchResult.total}
                subjectParcel={parcelFromSearch}
                radiusKm={lastSearchParams?.radiusKm ?? 3}
              />
            ) : (
              <ResultsList
                comparables={comparables}
                total={searchResult.total}
                parcelNumber={parcelFromSearch}
                radiusKm={lastSearchParams?.radiusKm ?? 3}
                activeId={activeComparableId}
                onCardClick={setActiveComparableId}
              />
            )}
          </div>

          {/* Right — Map */}
          <div className="lg:col-span-3 h-[450px] lg:h-[calc(100vh-200px)] lg:sticky lg:top-24">
            <ResultsMap
              comparables={isHidden ? [] : comparables}
              subjectLat={subjectLat}
              subjectLng={subjectLng}
              activeId={activeComparableId}
              onPinClick={setActiveComparableId}
              blurred={!isAuthenticated}
            />
          </div>
        </div>
      </div>
    </Layout>
  );
}
