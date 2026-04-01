import axios from 'axios';
import type { WeatherData, RawWeatherResponse } from './types';
import {
  mapVCIcon,
  conditionEmoji,
  precipTypeLabel,
  formatTime12,
  generateHourly,
  moonPhaseInfo,
  windDirLabel,
} from '../utils/formatters';
import { getCached, setCache } from '../utils/cache';
import { DEFAULT_SETTINGS } from '../utils/constants';

const client = axios.create({ baseURL: '/api/v1' });

export default client;

function parseWeatherResponse(raw: RawWeatherResponse): Omit<WeatherData, 'fromCache' | 'cachedAt'> {
  const cc = raw.currentConditions;
  const days = raw.days || [];
  const resolvedParts = (raw.resolvedAddress || raw.address || '').split(',').map((s) => s.trim());
  const city = resolvedParts[0] || raw.address || 'Unknown';
  const country = resolvedParts.length >= 2 ? resolvedParts[resolvedParts.length - 1] : '';
  const today = days[0] || ({} as (typeof days)[0]);
  const forecast = days.slice(0, 15).map((d, i) => {
    const date = new Date(d.datetime);
    const dayLabel =
      i === 0
        ? 'Today'
        : date.toLocaleDateString('en-GB', { weekday: 'short' });
    return {
      day: dayLabel,
      icon: conditionEmoji(d.icon),
      lo: Math.round(d.tempmin),
      hi: Math.round(d.tempmax),
      precipProb: Math.round(d.precipprob || 0),
      precipType: precipTypeLabel(d.preciptype || []),
      conditions: d.conditions || '',
    };
  });
  const hourly = generateHourly(cc, days);
  const moon = moonPhaseInfo(today.moonphase);
  return {
    city,
    country,
    temperatureC: Math.round(cc.temp),
    feelsLikeC: Math.round(cc.feelslike),
    condition: cc.conditions,
    conditionIcon: mapVCIcon(cc.icon),
    humidity: Math.round(cc.humidity),
    windKmh: Math.round(cc.windspeed),
    windDir: windDirLabel(cc.winddir),
    windDirDeg: cc.winddir,
    windGustKmh: Math.round(cc.windgust || 0),
    uvIndex: Math.round(cc.uvindex),
    pressure: Math.round(cc.pressure),
    visibility: Math.round(cc.visibility * 10) / 10,
    dewPointC: Math.round((cc.dew ?? 0) * 10) / 10,
    cloudCover: Math.round(cc.cloudcover || 0),
    sunrise: formatTime12(cc.sunrise),
    sunset: formatTime12(cc.sunset),
    precipProb: Math.round(today.precipprob || 0),
    precipType: precipTypeLabel(today.preciptype || []),
    severeRisk: Math.round(today.severerisk || 0),
    moonPhaseVal: today.moonphase ?? 0,
    moonEmoji: moon.emoji,
    moonLabel: moon.label,
    description: raw.description || today.description || '',
    forecast,
    hourly,
  };
}

export async function fetchWeather(
  city: string,
  cacheDurationMinutes: number = DEFAULT_SETTINGS.cacheDurationMinutes
): Promise<WeatherData> {
  const cached = getCached(city, cacheDurationMinutes);
  if (cached) return cached;

  const res = await client.get<RawWeatherResponse>(
    `/weather/${encodeURIComponent(city)}`
  );
  const parsed = parseWeatherResponse(res.data);
  setCache(city, parsed);
  return { ...parsed, fromCache: false, cachedAt: new Date() };
}
