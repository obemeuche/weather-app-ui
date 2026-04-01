import type { WeatherData } from '../api/types';

interface CacheEntry {
  data: Omit<WeatherData, 'fromCache' | 'cachedAt'>;
  fetchedAt: number;
}

const apiCache: Record<string, CacheEntry> = {};

export function getCached(
  city: string,
  ttlMinutes: number
): (WeatherData & { fromCache: true; cachedAt: Date }) | null {
  const key = city.toLowerCase();
  const entry = apiCache[key];
  if (!entry) return null;
  const ttlMs = ttlMinutes * 60 * 1000;
  if (Date.now() - entry.fetchedAt >= ttlMs) return null;
  return { ...entry.data, fromCache: true, cachedAt: new Date(entry.fetchedAt) };
}

export function setCache(
  city: string,
  data: Omit<WeatherData, 'fromCache' | 'cachedAt'>
): void {
  apiCache[city.toLowerCase()] = { data, fetchedAt: Date.now() };
}

export function deleteCache(city: string): void {
  delete apiCache[city.toLowerCase()];
}

export function clearAllCache(): void {
  Object.keys(apiCache).forEach((k) => delete apiCache[k]);
}
