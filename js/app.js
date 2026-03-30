// ── Skye Weather App — Main Script (Live API) ─────────────────────────────────

// ─── App State ────────────────────────────────────────────────────────────────
let settings       = loadSettings();
let activeScreen   = 'home';
let currentCity    = 'Reading';
let currentData    = null;   // Last successfully fetched WeatherData
let isLoading      = false;
let searchDebounceTimer = null;
let cacheAgeTimer  = null;
let recentLocations = [];    // [{city, country, flag, tempC}]

// ─── Init ─────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  updateClock();
  setInterval(updateClock, 1000);

  applySettings();
  setupNavigation();
  setupRefresh();
  setupSearch();
  setupSettings();

  // Kick off initial weather fetch
  loadWeather(currentCity);
});

// ─── Clock ────────────────────────────────────────────────────────────────────
function updateClock() {
  const now = new Date();
  const h = String(now.getHours()).padStart(2, '0');
  const m = String(now.getMinutes()).padStart(2, '0');
  document.querySelectorAll('[id^="status-time"]').forEach(el => {
    el.textContent = `${h}:${m}`;
  });
}

// ─── Settings persistence ─────────────────────────────────────────────────────
function loadSettings() {
  try {
    return JSON.parse(localStorage.getItem('skye_settings') || 'null') || { ...DEFAULT_SETTINGS };
  } catch { return { ...DEFAULT_SETTINGS }; }
}

function saveSettings() {
  localStorage.setItem('skye_settings', JSON.stringify(settings));
}

// ─── Formatters ───────────────────────────────────────────────────────────────
function formatTemp(celsius) {
  if (settings.tempUnit === 'F') return Math.round((celsius * 9) / 5 + 32);
  return Math.round(celsius);
}

function formatWind(kmh) {
  if (settings.windUnit === 'mph') return `${Math.round(kmh * 0.621)} mph`;
  if (settings.windUnit === 'ms')  return `${Math.round(kmh / 3.6)} m/s`;
  return `${Math.round(kmh)} km/h`;
}

function formatCacheAge(date) {
  if (!date) return '';
  const mins = Math.floor((Date.now() - date.getTime()) / 60000);
  if (mins < 1)  return 'Just updated';
  if (mins < 60) return `${mins}m ago`;
  return `${Math.floor(mins / 60)}h ago`;
}

// ─── Weather Loading ──────────────────────────────────────────────────────────
async function loadWeather(city, skipCacheCheck = false) {
  if (isLoading) return;
  isLoading = true;

  showHomeLoading();

  try {
    // If skipCacheCheck, bust the in-memory cache
    if (skipCacheCheck) {
      delete apiCache[city.toLowerCase()];
    }

    const data = await fetchWeather(city);
    currentData = data;
    currentCity = city;
    renderHome(data);
    renderForecast(data);
    startCacheAgeTimer(data.cachedAt);

    // Update the location header with canonical name from API
    document.querySelector('.city-name').textContent = data.city;
    document.querySelector('.country-name').textContent = data.country;
    document.querySelector('#screen-forecast .screen-title').textContent = data.city;

    if (!data.fromCache) {
      showToast('✓ Live data loaded');
    }
  } catch (err) {
    showHomeError(err.message, city);
  } finally {
    isLoading = false;
  }
}

// ─── Home Screen ──────────────────────────────────────────────────────────────
function showHomeLoading() {
  const heroBlock = document.getElementById('hero-block');
  heroBlock.innerHTML = `
    <div class="skeleton" style="width:80px;height:80px;border-radius:50%;margin-bottom:16px;"></div>
    <div style="display:flex;align-items:flex-start;gap:4px;margin-bottom:8px;">
      <div class="skeleton" style="width:140px;height:80px;border-radius:12px;"></div>
    </div>
    <div class="skeleton" style="width:120px;height:18px;border-radius:8px;margin-bottom:6px;"></div>
    <div class="skeleton" style="width:90px;height:14px;border-radius:8px;"></div>
  `;

  // Cache pill
  const pill = document.getElementById('cache-pill');
  pill.className = 'pill pill-warning';
  document.getElementById('cache-label').textContent = 'Fetching fresh data…';

  // Stats
  ['stat-humidity', 'stat-wind', 'stat-uv'].forEach(id => {
    document.getElementById(id).textContent = '—';
  });

  // Hourly skeleton
  const hourlyEl = document.getElementById('hourly-scroll');
  hourlyEl.innerHTML = Array.from({ length: 7 }, () =>
    `<div class="skeleton" style="width:56px;height:96px;border-radius:12px;flex-shrink:0;"></div>`
  ).join('');
}

function showHomeError(message, city) {
  const heroBlock = document.getElementById('hero-block');
  heroBlock.innerHTML = `
    <div class="error-card">
      <div style="font-size:32px;margin-bottom:8px;">⚠️</div>
      <p class="error-text">Couldn't load weather for <strong>${city}</strong></p>
      <p class="error-sub">${message || 'Check your connection and try again.'}</p>
      <button class="btn btn-outlined" id="retry-btn" style="margin-top:16px;width:auto;padding:0 24px;">Retry</button>
    </div>
  `;
  document.getElementById('retry-btn').addEventListener('click', () => loadWeather(city, true));

  const pill = document.getElementById('cache-pill');
  pill.className = 'pill pill-danger';
  document.getElementById('cache-label').textContent = 'Data unavailable';
}

function renderHome(data) {
  const heroBlock = document.getElementById('hero-block');
  heroBlock.innerHTML = `
    <div class="weather-icon-wrap">
      <div class="weather-icon animated" id="home-icon">${getWeatherIcon(data.conditionIcon)}</div>
    </div>
    <div class="temp-block">
      <span class="temperature">${formatTemp(data.temperatureC)}</span>
      <span class="unit">°${settings.tempUnit}</span>
    </div>
    <p class="condition">${data.condition}</p>
    <p class="feels-like">Feels like ${formatTemp(data.feelsLikeC)}°${settings.tempUnit}</p>
  `;

  // Cache pill
  const pill = document.getElementById('cache-pill');
  pill.className = 'pill pill-info';
  const ageText = data.fromCache
    ? `Cached · ${formatCacheAge(data.cachedAt)}`
    : 'Just updated';
  document.getElementById('cache-label').textContent = ageText;

  // Stats
  document.getElementById('stat-humidity').textContent = `${data.humidity}%`;
  document.getElementById('stat-wind').textContent = formatWind(data.windKmh);
  document.getElementById('stat-uv').textContent = data.uvIndex;

  // Hourly
  renderHourly(data.hourly);
}

function renderHourly(hourly) {
  const container = document.getElementById('hourly-scroll');
  container.innerHTML = '';

  hourly.forEach((hour, i) => {
    const card = document.createElement('div');
    card.className = `hour-card${i === 0 ? ' active' : ''}`;
    card.innerHTML = `
      <span class="hour-time">${hour.time}</span>
      <span class="hour-icon">${hour.icon}</span>
      <span class="hour-temp">${formatTemp(hour.tempC)}°</span>
    `;
    card.addEventListener('click', () => {
      container.querySelectorAll('.hour-card').forEach(c => c.classList.remove('active'));
      card.classList.add('active');
    });
    container.appendChild(card);
  });
}

function startCacheAgeTimer(cachedAt) {
  if (cacheAgeTimer) clearInterval(cacheAgeTimer);
  cacheAgeTimer = setInterval(() => {
    const label = document.getElementById('cache-label');
    if (label && cachedAt) {
      label.textContent = `Cached · ${formatCacheAge(cachedAt)}`;
    }
  }, 30_000);
}

// ─── Refresh ──────────────────────────────────────────────────────────────────
function setupRefresh() {
  document.getElementById('btn-refresh').addEventListener('click', async () => {
    if (isLoading) return;
    const btn = document.getElementById('btn-refresh');
    btn.classList.add('spinning');
    await loadWeather(currentCity, true /* bypass cache */);
    btn.classList.remove('spinning');
  });
}

// ─── Forecast Screen ──────────────────────────────────────────────────────────
function renderForecast(data) {
  const list = document.getElementById('forecast-list');
  list.innerHTML = '';

  const allLo  = data.forecast.map(d => d.lo);
  const allHi  = data.forecast.map(d => d.hi);
  const absMin = Math.min(...allLo.map(v => formatTemp(v)));
  const absMax = Math.max(...allHi.map(v => formatTemp(v)));
  const range  = absMax - absMin || 1;

  data.forecast.forEach(day => {
    const lo = formatTemp(day.lo);
    const hi = formatTemp(day.hi);
    const leftPct  = ((lo - absMin) / range) * 100;
    const widthPct = ((hi - lo)   / range) * 100;

    const row = document.createElement('div');
    row.className = 'forecast-row';
    row.innerHTML = `
      <span class="forecast-day">${day.day}</span>
      <span class="forecast-icon">${day.icon}</span>
      <div class="bar-wrapper">
        <div class="bar-track">
          <div class="bar-fill" style="left:${Math.max(0, leftPct)}%;width:${Math.max(8, widthPct)}%"></div>
        </div>
      </div>
      <div class="forecast-temps">
        <span class="temp-lo">${lo}°</span>
        <span class="temp-hi">${hi}°</span>
      </div>
    `;
    list.appendChild(row);
  });

  // ── Detail cards — update by stable IDs ──
  const uvEl    = document.getElementById('detail-uv');
  const uvBar   = document.getElementById('uv-bar');
  const uvDot   = document.getElementById('uv-dot');

  if (uvEl)  uvEl.textContent = data.uvIndex;

  const uvPct = Math.min(100, (data.uvIndex / 11) * 100);
  if (uvBar) uvBar.style.width = `${uvPct}%`;
  if (uvDot) uvDot.style.left  = `${uvPct}%`;

  // Sub-labels for the 4 detail cards — index-based, guarded
  const detailCards = document.querySelectorAll('.detail-card');

  // Card 0 — UV Index sub
  const uvSub = detailCards[0]?.querySelector('.detail-sub');
  if (uvSub) uvSub.textContent = uvLabel(data.uvIndex);

  // Card 1 — Sunrise / Sunset
  const sunriseVal = detailCards[1]?.querySelector('.detail-value');
  const sunriseSub = detailCards[1]?.querySelector('.detail-sub');
  if (sunriseVal) sunriseVal.textContent = data.sunrise || '—';
  if (sunriseSub) sunriseSub.textContent = data.sunset ? `Sunset ${data.sunset}` : '—';

  // Card 2 — Visibility
  const visVal = detailCards[2]?.querySelector('.detail-value');
  if (visVal) visVal.textContent = data.visibility != null ? `${data.visibility} km` : '—';

  // Card 3 — Pressure
  const pressVal = detailCards[3]?.querySelector('.detail-value');
  if (pressVal) {
    pressVal.textContent = settings.pressureUnit === 'inhg'
      ? `${(data.pressure * 0.02953).toFixed(2)} inHg`
      : `${data.pressure} hPa`;
  }
}

// ─── Search Screen ────────────────────────────────────────────────────────────
function setupSearch() {
  const input       = document.getElementById('search-input');
  const rightIcon   = document.getElementById('search-right-icon');
  const clearBtn    = document.getElementById('clear-search-btn');

  const secRecent   = document.getElementById('section-recent');
  const secPopular  = document.getElementById('section-popular');
  const secResults  = document.getElementById('section-results');
  const resultsList = document.getElementById('results-list');
  const noResults   = document.getElementById('no-results');

  // Populate recent & popular with static data (no temp yet)
  renderStaticLocationList(document.getElementById('recent-list'), recentLocations);
  renderStaticLocationList(document.getElementById('popular-list'), POPULAR_LOCATIONS_STATIC);

  input.addEventListener('input', () => {
    const q = input.value.trim();

    if (q.length === 0) {
      rightIcon.style.display = 'none';
      secRecent.style.display  = 'block';
      secPopular.style.display = 'block';
      secResults.style.display = 'none';
      return;
    }

    rightIcon.style.display  = 'flex';
    secRecent.style.display  = 'none';
    secPopular.style.display = 'none';
    secResults.style.display = 'block';
    noResults.style.display  = 'none';

    // Show spinner immediately
    showSearchSpinner(resultsList);

    clearTimeout(searchDebounceTimer);
    searchDebounceTimer = setTimeout(() => performSearch(q, resultsList, noResults), 300);
  });

  clearBtn.addEventListener('click', () => {
    input.value = '';
    rightIcon.style.display  = 'none';
    secRecent.style.display  = 'block';
    secPopular.style.display = 'block';
    secResults.style.display = 'none';
    input.focus();
  });
}

function showSearchSpinner(container) {
  container.innerHTML = Array.from({ length: 3 }, () => `
    <div style="display:flex;align-items:center;gap:12px;padding:16px;border-bottom:0.5px solid var(--color-border-subtle);">
      <div class="skeleton" style="width:36px;height:36px;border-radius:12px;flex-shrink:0;"></div>
      <div style="flex:1;display:flex;flex-direction:column;gap:6px;">
        <div class="skeleton" style="width:60%;height:14px;border-radius:6px;"></div>
        <div class="skeleton" style="width:35%;height:12px;border-radius:6px;"></div>
      </div>
      <div class="skeleton" style="width:32px;height:16px;border-radius:6px;"></div>
    </div>
  `).join('');
}

async function performSearch(query, resultsList, noResults) {
  // Search against the backend by just trying to fetch the city
  // The backend only exposes /weather/{city} so we do a live fetch
  try {
    const data = await fetchWeather(query);
    noResults.style.display = 'none';

    // Build a location entry from the response
    const loc = { city: data.city, country: data.country, flag: '📍', tempC: data.temperatureC };
    renderLocationList(resultsList, [loc], query);
  } catch {
    // If not found, show no-results
    resultsList.innerHTML = '';
    noResults.style.display = 'flex';
    noResults.querySelector('.no-results-text').textContent = `No results for '${query}'`;
  }
}

function renderStaticLocationList(container, locations) {
  container.innerHTML = '';
  if (!locations || locations.length === 0) {
    container.innerHTML = '<div style="padding:16px;text-align:center;color:var(--color-text-muted);font-size:13px;">No recent locations</div>';
    return;
  }
  locations.forEach(loc => {
    const row = buildLocationRow(loc, '');
    container.appendChild(row);
  });
}

function renderLocationList(container, locations, query = '') {
  container.innerHTML = '';
  locations.forEach(loc => {
    const row = buildLocationRow(loc, query);
    container.appendChild(row);
  });
}

function buildLocationRow(loc, query) {
  const row = document.createElement('div');
  row.className = 'location-row';

  let cityHtml = loc.city || loc.city;
  if (query) {
    const idx = (loc.city || '').toLowerCase().indexOf(query.toLowerCase());
    if (idx !== -1) {
      cityHtml =
        loc.city.slice(0, idx) +
        `<span class="highlight">${loc.city.slice(idx, idx + query.length)}</span>` +
        loc.city.slice(idx + query.length);
    }
  }

  const tempDisplay = loc.tempC != null
    ? `${formatTemp(loc.tempC)}°${settings.tempUnit}`
    : '…';

  row.innerHTML = `
    <div class="location-icon">${loc.flag || '📍'}</div>
    <div class="location-text">
      <div class="location-city">${cityHtml}</div>
      <div class="location-country">${loc.country || ''}</div>
    </div>
    <div class="location-temp">${tempDisplay}</div>
  `;

  row.addEventListener('click', () => selectLocation(loc));
  return row;
}

async function selectLocation(loc) {
  navigateTo('home');
  currentCity = loc.city;
  // Update header immediately
  document.querySelector('.city-name').textContent = loc.city;
  document.querySelector('.country-name').textContent = loc.country || '';
  await loadWeather(loc.city);

  // Track in recent
  const existing = recentLocations.findIndex(r => r.city.toLowerCase() === loc.city.toLowerCase());
  if (existing !== -1) recentLocations.splice(existing, 1);
  recentLocations.unshift({ city: loc.city, country: loc.country, flag: loc.flag || '📍', tempC: currentData?.temperatureC });
  if (recentLocations.length > 5) recentLocations.pop();

  renderStaticLocationList(document.getElementById('recent-list'), recentLocations);
}

// ─── Settings Screen ──────────────────────────────────────────────────────────
function applySettings() {
  document.getElementById('val-temp').textContent     = `°${settings.tempUnit}`;
  document.getElementById('val-wind').textContent     = formatWindLabel();
  document.getElementById('val-pressure').textContent = settings.pressureUnit === 'inhg' ? 'inHg' : 'hPa';
  document.getElementById('val-cache').textContent    = `${settings.cacheDurationMinutes} min`;
  document.getElementById('toggle-daily-input').checked   = settings.notifyDailySummary;
  document.getElementById('toggle-alerts-input').checked  = settings.notifySevereAlerts;
  document.getElementById('toggle-refresh-input').checked = settings.autoRefresh;
}

function formatWindLabel() {
  if (settings.windUnit === 'mph') return 'mph';
  if (settings.windUnit === 'ms')  return 'm/s';
  return 'km/h';
}

function setupSettings() {
  document.getElementById('row-temp-unit').addEventListener('click', () => {
    openSheet('Temperature Unit', [
      { label: 'Celsius (°C)',    value: 'C' },
      { label: 'Fahrenheit (°F)', value: 'F' },
    ], settings.tempUnit, (val) => {
      settings.tempUnit = val;
      saveSettings(); applySettings();
      if (currentData) { renderHome(currentData); renderForecast(currentData); }
      showToast(`Temperature set to °${val}`);
    });
  });

  document.getElementById('row-wind-unit').addEventListener('click', () => {
    openSheet('Wind Speed Unit', [
      { label: 'Kilometres per hour (km/h)', value: 'kmh' },
      { label: 'Miles per hour (mph)',        value: 'mph' },
      { label: 'Metres per second (m/s)',     value: 'ms'  },
    ], settings.windUnit, (val) => {
      settings.windUnit = val;
      saveSettings(); applySettings();
      if (currentData) renderHome(currentData);
      showToast('Wind unit updated');
    });
  });

  document.getElementById('row-pressure-unit').addEventListener('click', () => {
    openSheet('Pressure Unit', [
      { label: 'Hectopascal (hPa)',   value: 'hpa'  },
      { label: 'Inch of mercury (inHg)', value: 'inhg' },
    ], settings.pressureUnit, (val) => {
      settings.pressureUnit = val;
      saveSettings(); applySettings();
      if (currentData) renderForecast(currentData);
      showToast('Pressure unit updated');
    });
  });

  document.getElementById('row-cache-duration').addEventListener('click', () => {
    openSheet('Cache Duration', [
      { label: '1 minute',   value: 1  },
      { label: '5 minutes',  value: 5  },
      { label: '10 minutes', value: 10 },
      { label: '30 minutes', value: 30 },
    ], settings.cacheDurationMinutes, (val) => {
      settings.cacheDurationMinutes = val;
      saveSettings(); applySettings();
      showToast(`Cache duration set to ${val} min`);
    });
  });

  document.getElementById('toggle-daily-input').addEventListener('change', (e) => {
    settings.notifyDailySummary = e.target.checked;
    saveSettings();
    showToast(e.target.checked ? '🔔 Daily summary on' : '🔕 Daily summary off');
  });

  document.getElementById('toggle-alerts-input').addEventListener('change', (e) => {
    settings.notifySevereAlerts = e.target.checked;
    saveSettings();
    showToast(e.target.checked ? '⚠️ Severe alerts on' : '🔕 Severe alerts off');
  });

  document.getElementById('toggle-refresh-input').addEventListener('change', (e) => {
    settings.autoRefresh = e.target.checked;
    saveSettings();
    showToast(e.target.checked ? '🔄 Auto-refresh on' : 'Auto-refresh off');
  });

  document.getElementById('row-clear-cache').addEventListener('click', showConfirmSheet);
}

// ─── Bottom Sheet ──────────────────────────────────────────────────────────────
function openSheet(title, options, currentValue, onSelect) {
  document.getElementById('sheet-title').textContent = title;
  const optionsEl = document.getElementById('sheet-options');
  optionsEl.innerHTML = '';

  options.forEach(opt => {
    const btn = document.createElement('button');
    btn.className = `sheet-option${opt.value === currentValue ? ' selected' : ''}`;
    btn.innerHTML = `
      ${opt.label}
      <svg class="check" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
        <polyline points="20 6 9 17 4 12"/>
      </svg>
    `;
    btn.addEventListener('click', () => { onSelect(opt.value); closeSheet(); });
    optionsEl.appendChild(btn);
  });

  document.getElementById('sheet-overlay').style.display = 'block';
  document.getElementById('unit-sheet').style.display    = 'block';
  document.getElementById('sheet-cancel').onclick = closeSheet;
  document.getElementById('sheet-overlay').onclick = closeSheet;
}

function closeSheet() {
  document.getElementById('sheet-overlay').style.display  = 'none';
  document.getElementById('unit-sheet').style.display     = 'none';
  document.getElementById('confirm-sheet').style.display  = 'none';
}

function showConfirmSheet() {
  document.getElementById('sheet-overlay').style.display  = 'block';
  document.getElementById('confirm-sheet').style.display  = 'block';
  document.getElementById('confirm-cancel').onclick = closeSheet;
  document.getElementById('sheet-overlay').onclick  = closeSheet;
  document.getElementById('confirm-clear').onclick  = () => {
    // Clear in-memory cache
    Object.keys(apiCache).forEach(k => delete apiCache[k]);
    closeSheet();
    showToast('🗑 Cache cleared');
    if (currentCity) loadWeather(currentCity, true);
  };
}

// ─── Navigation ───────────────────────────────────────────────────────────────
function setupNavigation() {
  document.querySelectorAll('.nav-item').forEach(btn => {
    btn.addEventListener('click', () => navigateTo(btn.dataset.screen));
  });
}

function navigateTo(name) {
  if (activeScreen === name) return;
  document.getElementById(`screen-${activeScreen}`).classList.remove('active');
  document.getElementById(`nav-${activeScreen}`).classList.remove('active');
  activeScreen = name;
  document.getElementById(`screen-${name}`).classList.add('active');
  document.getElementById(`nav-${name}`).classList.add('active');
  if (name === 'search') {
    setTimeout(() => document.getElementById('search-input').focus(), 300);
  }
}

// ─── Toast ─────────────────────────────────────────────────────────────────────
let toastTimer = null;

function showToast(message) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.classList.add('show');
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2500);
}
