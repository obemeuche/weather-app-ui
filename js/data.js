// ── API Configuration ──────────────────────────────────────────────────────────
// Use relative path — requests are proxied by proxy.py running on the same origin (localhost:3000)
const API_BASE_URL = '/api/v1';

// ── Icon mapping: Visual Crossing → our SVG keys ──────────────────────────────
function mapVCIcon(vcIcon) {
  if (!vcIcon) return 'cloudy';
  const i = vcIcon.toLowerCase();
  if (i.includes('clear'))                         return 'sunny';
  if (i.includes('partly-cloudy') || i.includes('partially')) return 'partly-cloudy';
  if (i.includes('rain') || i.includes('shower'))  return 'rainy';
  if (i.includes('thunder'))                        return 'stormy';
  if (i.includes('snow') || i.includes('sleet'))   return 'snowy';
  if (i.includes('cloudy') || i.includes('overcast') || i.includes('fog')) return 'cloudy';
  return 'partly-cloudy';
}

// ── VC condition → emoji ───────────────────────────────────────────────────────
function conditionEmoji(vcIcon) {
  if (!vcIcon) return '🌡';
  const i = vcIcon.toLowerCase();
  if (i.includes('clear-day'))           return '☀️';
  if (i.includes('clear-night'))         return '🌙';
  if (i.includes('partly-cloudy-day'))   return '⛅';
  if (i.includes('partly-cloudy-night')) return '🌤';
  if (i.includes('thunder'))             return '⛈';
  if (i.includes('snow') || i.includes('sleet')) return '🌨';
  if (i.includes('rain') || i.includes('shower')) return '🌧';
  if (i.includes('fog'))                 return '🌫';
  if (i.includes('cloudy'))              return '☁️';
  return '🌥';
}

// ── UV Index label ─────────────────────────────────────────────────────────────
function uvLabel(uv) {
  if (uv <= 2) return 'Low';
  if (uv <= 5) return 'Moderate';
  if (uv <= 7) return 'High';
  if (uv <= 10) return 'Very High';
  return 'Extreme';
}

// ── Wind direction degrees → compass label ─────────────────────────────────────
function windDirLabel(deg) {
  if (deg == null) return '';
  const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  return dirs[Math.round(deg / 45) % 8];
}

// ── Moon phase (0–1) → label + emoji ──────────────────────────────────────────
function moonPhaseInfo(phase) {
  if (phase == null) return { label: 'Unknown', emoji: '🌑' };
  if (phase < 0.03 || phase > 0.97) return { label: 'New Moon',        emoji: '🌑' };
  if (phase < 0.22)                  return { label: 'Waxing Crescent', emoji: '🌒' };
  if (phase < 0.28)                  return { label: 'First Quarter',   emoji: '🌓' };
  if (phase < 0.47)                  return { label: 'Waxing Gibbous',  emoji: '🌔' };
  if (phase < 0.53)                  return { label: 'Full Moon',       emoji: '🌕' };
  if (phase < 0.72)                  return { label: 'Waning Gibbous',  emoji: '🌖' };
  if (phase < 0.78)                  return { label: 'Last Quarter',    emoji: '🌗' };
  return                                    { label: 'Waning Crescent', emoji: '🌘' };
}

// ── Pressure label ─────────────────────────────────────────────────────────────
function pressureLabel(hpa) {
  if (hpa < 1000) return 'Low';
  if (hpa > 1020) return 'High';
  return 'Normal';
}

// ── Visibility label ───────────────────────────────────────────────────────────
function visibilityLabel(km) {
  if (km >= 10) return 'Very clear';
  if (km >= 5)  return 'Good';
  if (km >= 2)  return 'Moderate';
  return 'Poor';
}

// ── Precip type → display string ──────────────────────────────────────────────
function precipTypeLabel(types) {
  if (!types || types.length === 0) return '';
  return types.map(t => t.charAt(0).toUpperCase() + t.slice(1)).join(', ');
}

// ── Format "06:43:58" → "6:43 AM" ─────────────────────────────────────────────
function formatTime12(timeStr) {
  if (!timeStr) return '';
  const [h, m] = timeStr.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 || 12;
  return `${hour}:${String(m).padStart(2, '0')} ${ampm}`;
}

// ── Generate synthetic hourly from daily range (backend has no hourly) ─────────
function generateHourly(currentConditions, days) {
  const today = days[0];
  const { tempmin, tempmax } = today;
  const range = tempmax - tempmin;

  const now = new Date();
  const currentHour = now.getHours();

  const hours = [];
  for (let offset = 0; offset < 10; offset++) {
    const h = (currentHour + offset) % 24;
    const factor = Math.sin(((h - 6) / 18) * Math.PI);
    const tempC = tempmin + Math.max(0, factor) * range;

    const icon = offset === 0
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

// ── Settings defaults ─────────────────────────────────────────────────────────
const DEFAULT_SETTINGS = {
  tempUnit:             'C',
  windUnit:             'kmh',
  pressureUnit:         'hpa',
  cacheDurationMinutes: 5,
  autoRefresh:          true,
  notifyDailySummary:   true,
  notifySevereAlerts:   true,
  theme:                'dark',
};

// ── Static popular locations ───────────────────────────────────────────────────
const POPULAR_LOCATIONS_STATIC = [
  { city: 'New York',   country: 'US',        flag: '🇺🇸' },
  { city: 'Tokyo',      country: 'Japan',     flag: '🇯🇵' },
  { city: 'Paris',      country: 'France',    flag: '🇫🇷' },
  { city: 'Dubai',      country: 'UAE',       flag: '🇦🇪' },
  { city: 'Sydney',     country: 'Australia', flag: '🇦🇺' },
  { city: 'Lagos',      country: 'Nigeria',   flag: '🇳🇬' },
];

// ── In-memory cache: city → { data, fetchedAt } ───────────────────────────────
const apiCache = {};

async function fetchWeather(city) {
  const key = city.toLowerCase();
  // Use live settings if available, otherwise fall back to default
  const ttlMinutes = (typeof settings !== 'undefined')
    ? settings.cacheDurationMinutes
    : DEFAULT_SETTINGS.cacheDurationMinutes;
  const ttlMs = ttlMinutes * 60 * 1000;

  if (apiCache[key] && (Date.now() - apiCache[key].fetchedAt) < ttlMs) {
    return { ...apiCache[key].data, fromCache: true, cachedAt: new Date(apiCache[key].fetchedAt) };
  }

  const res = await fetch(`${API_BASE_URL}/weather/${encodeURIComponent(city)}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `HTTP ${res.status}`);
  }
  const raw = await res.json();
  const parsed = parseWeatherResponse(raw);

  apiCache[key] = { data: parsed, fetchedAt: Date.now() };
  return { ...parsed, fromCache: false, cachedAt: new Date() };
}

function parseWeatherResponse(raw) {
  const cc   = raw.currentConditions;
  const days = raw.days || [];

  // Derive city/country from resolvedAddress
  const resolvedParts = (raw.resolvedAddress || raw.address || '').split(',').map(s => s.trim());
  const city    = resolvedParts[0] || raw.address || 'Unknown';
  const country = resolvedParts.length >= 2 ? resolvedParts[resolvedParts.length - 1] : '';

  const today = days[0] || {};

  // Up to 15-day forecast with precipitation data
  const forecast = days.slice(0, 15).map((d, i) => {
    const date = new Date(d.datetime);
    const dayLabel = i === 0 ? 'Today' : date.toLocaleDateString('en-GB', { weekday: 'short' });
    const precipTypes = d.preciptype || [];
    return {
      day:        dayLabel,
      icon:       conditionEmoji(d.icon),
      lo:         Math.round(d.tempmin),
      hi:         Math.round(d.tempmax),
      precipProb: Math.round(d.precipprob || 0),
      precipType: precipTypeLabel(precipTypes),
      conditions: d.conditions || '',
    };
  });

  const hourly = generateHourly(cc, days);

  const moon = moonPhaseInfo(today.moonphase);

  return {
    city,
    country,
    temperatureC:   Math.round(cc.temp),
    feelsLikeC:     Math.round(cc.feelslike),
    condition:      cc.conditions,
    conditionIcon:  mapVCIcon(cc.icon),
    humidity:       Math.round(cc.humidity),
    windKmh:        Math.round(cc.windspeed),
    windDir:        windDirLabel(cc.winddir),
    windDirDeg:     cc.winddir,
    windGustKmh:    Math.round(cc.windgust || 0),
    uvIndex:        Math.round(cc.uvindex),
    pressure:       Math.round(cc.pressure),
    visibility:     Math.round(cc.visibility * 10) / 10,
    dewPointC:      Math.round((cc.dew ?? 0) * 10) / 10,
    cloudCover:     Math.round(cc.cloudcover || 0),
    sunrise:        formatTime12(cc.sunrise),
    sunset:         formatTime12(cc.sunset),
    // From today's day record (not in currentConditions)
    precipProb:     Math.round(today.precipprob || 0),
    precipType:     precipTypeLabel(today.preciptype || []),
    severeRisk:     Math.round(today.severerisk || 0),
    moonPhaseVal:   today.moonphase,
    moonEmoji:      moon.emoji,
    moonLabel:      moon.label,
    description:    raw.description || today.description || '',
    forecast,
    hourly,
  };
}
