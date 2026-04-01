import { fetchWeather } from './weatherApi';
import type { Location } from './types';

export async function searchLocation(query: string, cacheDurationMinutes: number): Promise<Location & { tempC: number }> {
  const data = await fetchWeather(query, cacheDurationMinutes);
  return {
    city: data.city,
    country: data.country,
    flag: '📍',
    tempC: data.temperatureC,
  };
}
