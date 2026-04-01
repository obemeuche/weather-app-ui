import { useState, useCallback, useRef } from 'react';
import type { Location } from '../api/types';
import { searchLocation } from '../api/searchApi';
import { useSettings } from './useSettings';

function loadRecentLocations(): Location[] {
  try {
    return JSON.parse(localStorage.getItem('skye_recent') || '[]') as Location[];
  } catch {
    return [];
  }
}

function saveRecentLocations(locs: Location[]): void {
  localStorage.setItem('skye_recent', JSON.stringify(locs));
}

interface UseSearchReturn {
  query: string;
  setQuery: (q: string) => void;
  results: Location[];
  isSearching: boolean;
  noResults: boolean;
  recentLocations: Location[];
  addRecentLocation: (loc: Location) => void;
  clearQuery: () => void;
}

export function useSearch(): UseSearchReturn {
  const { settings } = useSettings();
  const [query, setQueryState] = useState('');
  const [results, setResults] = useState<Location[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [noResults, setNoResults] = useState(false);
  const [recentLocations, setRecentLocations] = useState<Location[]>(loadRecentLocations);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const performSearch = useCallback(
    async (q: string) => {
      setIsSearching(true);
      setNoResults(false);
      try {
        const loc = await searchLocation(q, settings.cacheDurationMinutes);
        setResults([loc]);
        setNoResults(false);
      } catch {
        setResults([]);
        setNoResults(true);
      } finally {
        setIsSearching(false);
      }
    },
    [settings.cacheDurationMinutes]
  );

  const setQuery = useCallback(
    (q: string) => {
      setQueryState(q);
      if (q.trim().length === 0) {
        setResults([]);
        setNoResults(false);
        return;
      }
      setIsSearching(true);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => performSearch(q.trim()), 300);
    },
    [performSearch]
  );

  const clearQuery = useCallback(() => {
    setQueryState('');
    setResults([]);
    setNoResults(false);
    if (debounceRef.current) clearTimeout(debounceRef.current);
  }, []);

  const addRecentLocation = useCallback((loc: Location) => {
    setRecentLocations((prev) => {
      const filtered = prev.filter(
        (r) => r.city.toLowerCase() !== loc.city.toLowerCase()
      );
      const next = [loc, ...filtered].slice(0, 5);
      saveRecentLocations(next);
      return next;
    });
  }, []);

  return {
    query,
    setQuery,
    results,
    isSearching,
    noResults,
    recentLocations,
    addRecentLocation,
    clearQuery,
  };
}
