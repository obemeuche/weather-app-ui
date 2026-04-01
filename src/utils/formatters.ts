import type { Settings, HourlyItem, RawDay, RawCurrentConditions } from '../api/types';

export function mapVCIcon(vcIcon: string | undefined): string {
  if (!vcIcon) return 'cloudy';
  const i = vcIcon.toLowerCase();
  if (i.includes('clear')) return 'sunny';
  if (i.includes('partly-cloudy') || i.includes('partially')) return 'partly-cloudy';
  if (i.includes('rain') || i.includes('shower')) return 'rainy';
  if (i.includes('thunder')) return 'stormy';
  if (i.includes('snow') || i.includes('sleet')) return 'snowy';
  if (i.includes('cloudy') || i.includes('overcast') || i.includes('fog')) return 'cloudy';
  return 'partly-cloudy';
}

export function conditionEmoji(vcIcon: string | undefined): string {
  if (!vcIcon) return '🌡';
  const i = vcIcon.toLowerCase();
  if (i.includes('clear-day')) return '☀️';
  if (i.includes('clear-night')) return '🌙';
  if (i.includes('partly-cloudy-day')) return '⛅';
  if (i.includes('partly-cloudy-night')) return '🌤';
  if (i.includes('thunder')) return '⛈';
  if (i.includes('snow') || i.includes('sleet')) return '🌨';
  if (i.includes('rain') || i.includes('shower')) return '🌧';
  if (i.includes('fog')) return '🌫';
  if (i.includes('cloudy')) return '☁️';
  return '🌥';
}

export function uvLabel(uv: number): string {
  if (uv <= 2) return 'Low';
  if (uv <= 5) return 'Moderate';
  if (uv <= 7) return 'High';
  if (uv <= 10) return 'Very High';
  return 'Extreme';
}

export function windDirLabel(deg: number | null | undefined): string {
  if (deg == null) return '';
  const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  return dirs[Math.round(deg / 45) % 8];
}

export function moonPhaseInfo(phase: number | null | undefined): { label: string; emoji: string } {
  if (phase == null) return { label: 'Unknown', emoji: '🌑' };
  if (phase < 0.03 || phase > 0.97) return { label: 'New Moon', emoji: '🌑' };
  if (phase < 0.22) return { label: 'Waxing Crescent', emoji: '🌒' };
  if (phase < 0.28) return { label: 'First Quarter', emoji: '🌓' };
  if (phase < 0.47) return { label: 'Waxing Gibbous', emoji: '🌔' };
  if (phase < 0.53) return { label: 'Full Moon', emoji: '🌕' };
  if (phase < 0.72) return { label: 'Waning Gibbous', emoji: '🌖' };
  if (phase < 0.78) return { label: 'Last Quarter', emoji: '🌗' };
  return { label: 'Waning Crescent', emoji: '🌘' };
}

export function pressureLabel(hpa: number): string {
  if (hpa < 1000) return 'Low';
  if (hpa > 1020) return 'High';
  return 'Normal';
}

export function visibilityLabel(km: number): string {
  if (km >= 10) return 'Very clear';
  if (km >= 5) return 'Good';
  if (km >= 2) return 'Moderate';
  return 'Poor';
}

export function precipTypeLabel(types: string[] | null | undefined): string {
  if (!types || types.length === 0) return '';
  return types.map((t) => t.charAt(0).toUpperCase() + t.slice(1)).join(', ');
}

export function formatTime12(timeStr: string | undefined): string {
  if (!timeStr) return '';
  const [h, m] = timeStr.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 || 12;
  return `${hour}:${String(m).padStart(2, '0')} ${ampm}`;
}

export function generateHourly(
  currentConditions: RawCurrentConditions,
  days: RawDay[]
): HourlyItem[] {
  const today = days[0];
  const { tempmin, tempmax } = today;
  const range = tempmax - tempmin;
  const now = new Date();
  const currentHour = now.getHours();
  const hours: HourlyItem[] = [];
  for (let offset = 0; offset < 10; offset++) {
    const h = (currentHour + offset) % 24;
    const factor = Math.sin(((h - 6) / 18) * Math.PI);
    const tempC = tempmin + Math.max(0, factor) * range;
    const icon =
      offset === 0
        ? conditionEmoji(currentConditions.icon)
        : conditionEmoji(today.icon);
    hours.push({
      time: offset === 0 ? 'Now' : `${String(h).padStart(2, '0')}:00`,
      icon,
      tempC: Math.round(tempC * 10) / 10,
    });
  }
  return hours;
}

export function formatTemp(celsius: number, settings: Settings): number {
  if (settings.tempUnit === 'F') return Math.round((celsius * 9) / 5 + 32);
  return Math.round(celsius);
}

export function formatWind(kmh: number, settings: Settings): string {
  if (settings.windUnit === 'mph') return `${Math.round(kmh * 0.621)} mph`;
  if (settings.windUnit === 'ms') return `${Math.round(kmh / 3.6)} m/s`;
  return `${Math.round(kmh)} km/h`;
}

export function formatCacheAge(date: Date | null | undefined): string {
  if (!date) return '';
  const mins = Math.floor((Date.now() - date.getTime()) / 60000);
  if (mins < 1) return 'Just updated';
  if (mins < 60) return `${mins}m ago`;
  return `${Math.floor(mins / 60)}h ago`;
}

export function formatDewPoint(celsius: number, settings: Settings): string {
  if (settings.tempUnit === 'F') return `${Math.round((celsius * 9) / 5 + 32)}°F`;
  return `${celsius}°C`;
}

export function formatWindLabel(settings: Settings): string {
  if (settings.windUnit === 'mph') return 'mph';
  if (settings.windUnit === 'ms') return 'm/s';
  return 'km/h';
}
