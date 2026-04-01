import type React from 'react';
import { createContext, useState, useCallback, useEffect, useRef } from 'react';
import type { WeatherData } from '../api/types';
import { fetchWeather } from '../api/weatherApi';
import { deleteCache } from '../utils/cache';
import { useSettings } from '../hooks/useSettings';

interface WeatherContextValue {
  currentData: WeatherData | null;
  currentCity: string;
  isLoading: boolean;
  error: string | null;
  loadWeather: (city: string, force?: boolean) => Promise<void>;
}

export const WeatherContext = createContext<WeatherContextValue | null>(null);

export function WeatherProvider({ children }: { children: React.ReactNode }) {
  const { settings } = useSettings();
  const [currentData, setCurrentData] = useState<WeatherData | null>(null);
  const [currentCity, setCurrentCity] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const autoRefreshTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const loadWeather = useCallback(
    async (city: string, force = false) => {
      if (isLoading) return;
      setIsLoading(true);
      setError(null);
      try {
        if (force) deleteCache(city);
        const data = await fetchWeather(city, settings.cacheDurationMinutes);
        setCurrentData(data);
        setCurrentCity(city);
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Unknown error';
        setError(msg);
      } finally {
        setIsLoading(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [settings.cacheDurationMinutes]
  );

  // Auto-refresh
  useEffect(() => {
    if (autoRefreshTimerRef.current) clearInterval(autoRefreshTimerRef.current);
    if (!settings.autoRefresh) return;
    autoRefreshTimerRef.current = setInterval(() => {
      if (!document.hidden && currentCity) {
        loadWeather(currentCity);
      }
    }, settings.cacheDurationMinutes * 60 * 1000);
    return () => {
      if (autoRefreshTimerRef.current) clearInterval(autoRefreshTimerRef.current);
    };
  }, [settings.autoRefresh, settings.cacheDurationMinutes, currentCity, loadWeather]);

  return (
    <WeatherContext.Provider value={{ currentData, currentCity, isLoading, error, loadWeather }}>
      {children}
    </WeatherContext.Provider>
  );
}
