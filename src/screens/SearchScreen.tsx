import { useCallback } from 'react';
import { PageWrapper } from '../components/layout/PageWrapper';
import { SearchBar } from '../components/search/SearchBar';
import { SearchResults } from '../components/search/SearchResults';
import { useSearch } from '../hooks/useSearch';
import { useWeather } from '../hooks/useWeather';
import type { Location } from '../api/types';
import { POPULAR_LOCATIONS_STATIC } from '../utils/constants';

interface SearchScreenProps {
  onNavigateHome: () => void;
}

export function SearchScreen({ onNavigateHome }: SearchScreenProps) {
  const { query, setQuery, results, isSearching, noResults, recentLocations, addRecentLocation, clearQuery } = useSearch();
  const { loadWeather, currentData } = useWeather();

  const handleSelect = useCallback(
    async (loc: Location) => {
      onNavigateHome();
      await loadWeather(loc.city);
      addRecentLocation({
        city: loc.city,
        country: loc.country,
        flag: loc.flag,
        tempC: currentData?.temperatureC,
      });
      clearQuery();
    },
    [loadWeather, addRecentLocation, currentData, onNavigateHome, clearQuery],
  );

  return (
    <PageWrapper>
      <div className="status-bar">
        <span className="status-time" id="status-time-search">—</span>
        <div className="status-icons">
          <div className="battery-icon"><div className="battery-fill" style={{ width: '78%' }} /></div>
        </div>
      </div>

      <div style={{ padding: 'var(--space-2) 0 var(--space-4)' }}>
        <h1 style={{ fontSize: 'var(--text-heading-1)', fontWeight: 'var(--weight-medium)', color: 'var(--color-text-primary)', marginBottom: 4 }}>
          Search
        </h1>
      </div>

      <SearchBar value={query} onChange={setQuery} onClear={clearQuery} />

      <SearchResults
        query={query}
        results={results}
        isSearching={isSearching}
        noResults={noResults}
        recentLocations={recentLocations}
        popularLocations={POPULAR_LOCATIONS_STATIC}
        onSelect={handleSelect}
      />
    </PageWrapper>
  );
}
