import type { Settings, Location } from '../api/types';

export const API_BASE_URL = '/api/v1';

export const DEFAULT_SETTINGS: Settings = {
  tempUnit: 'C',
  windUnit: 'kmh',
  pressureUnit: 'hpa',
  cacheDurationMinutes: 5,
  autoRefresh: true,
  notifyDailySummary: true,
  notifySevereAlerts: true,
  theme: 'dark',
};

export const POPULAR_LOCATIONS_STATIC: Location[] = [
  { city: 'New York', country: 'US', flag: '🇺🇸' },
  { city: 'Tokyo', country: 'Japan', flag: '🇯🇵' },
  { city: 'Paris', country: 'France', flag: '🇫🇷' },
  { city: 'Dubai', country: 'UAE', flag: '🇦🇪' },
  { city: 'Sydney', country: 'Australia', flag: '🇦🇺' },
  { city: 'Lagos', country: 'Nigeria', flag: '🇳🇬' },
];

export const DEFAULT_CITY = 'Reading';
