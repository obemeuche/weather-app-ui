export interface Settings {
  tempUnit: 'C' | 'F';
  windUnit: 'kmh' | 'mph' | 'ms';
  pressureUnit: 'hpa' | 'inhg';
  cacheDurationMinutes: number;
  autoRefresh: boolean;
  notifyDailySummary: boolean;
  notifySevereAlerts: boolean;
  theme: 'dark' | 'light';
}

export interface ForecastDay {
  day: string;
  icon: string;
  lo: number;
  hi: number;
  precipProb: number;
  precipType: string;
  conditions: string;
}

export interface HourlyItem {
  time: string;
  icon: string;
  tempC: number;
}

export interface WeatherData {
  city: string;
  country: string;
  temperatureC: number;
  feelsLikeC: number;
  condition: string;
  conditionIcon: string;
  humidity: number;
  windKmh: number;
  windDir: string;
  windDirDeg: number;
  windGustKmh: number;
  uvIndex: number;
  pressure: number;
  visibility: number;
  dewPointC: number;
  cloudCover: number;
  sunrise: string;
  sunset: string;
  precipProb: number;
  precipType: string;
  severeRisk: number;
  moonPhaseVal: number;
  moonEmoji: string;
  moonLabel: string;
  description: string;
  forecast: ForecastDay[];
  hourly: HourlyItem[];
  fromCache: boolean;
  cachedAt: Date;
}

export interface Location {
  city: string;
  country: string;
  flag: string;
  tempC?: number;
}

export interface RawCurrentConditions {
  temp: number;
  feelslike: number;
  conditions: string;
  icon: string;
  humidity: number;
  windspeed: number;
  winddir: number;
  windgust?: number;
  uvindex: number;
  pressure: number;
  visibility: number;
  dew?: number;
  cloudcover?: number;
  sunrise?: string;
  sunset?: string;
}

export interface RawDay {
  datetime: string;
  tempmin: number;
  tempmax: number;
  conditions?: string;
  description?: string;
  icon: string;
  precipprob?: number;
  preciptype?: string[];
  severerisk?: number;
  moonphase?: number;
}

export interface RawWeatherResponse {
  resolvedAddress?: string;
  address?: string;
  description?: string;
  currentConditions: RawCurrentConditions;
  days: RawDay[];
}
