# Skye Weather

A modern, mobile-first weather application built with React 18, TypeScript, and Vite. Skye fetches real-time weather data from a Spring Boot backend (which proxies the Visual Crossing Weather API) and presents it in a clean, dark-by-default UI with light/dark theme support.

---

## Features

- **Current conditions** — temperature, feels-like, humidity, wind speed/direction/gusts, UV index, pressure, visibility, dew point, cloud cover, sunrise/sunset
- **15-day forecast** — daily high/low, precipitation probability, condition icons
- **Hourly strip** — scrollable hourly temperature and condition preview
- **Severe weather alerts** — banner shown when severe risk exceeds threshold
- **Moon phase indicator** — emoji + label based on current moon phase value
- **City search** — live search with highlighted match, recent locations, and popular city shortcuts
- **Geolocation** — auto-detects the user's location on launch; falls back to Reading, UK
- **In-memory cache** — configurable TTL (1–30 min) with a cache-pill indicator showing data age
- **Auto-refresh** — polls for fresh data at the configured cache interval (pauses when tab is hidden)
- **Unit settings** — temperature (°C/°F), wind (km/h, mph, m/s), pressure (hPa, inHg)
- **Light/dark theme** — persisted to localStorage
- **Recent locations** — last searched cities saved to localStorage

---

## Tech Stack

| Layer | Technology |
|---|---|
| UI | React 18, TypeScript |
| Build | Vite 5, `@vitejs/plugin-react` |
| Styling | CSS Modules + global design tokens |
| HTTP | Axios |
| Backend | Spring Boot (runs separately on port 8080) |
| Weather data | Visual Crossing Weather API (via backend) |

---

## Project Structure

```
src/
├── api/
│   ├── types.ts          # Shared TypeScript interfaces
│   ├── weatherApi.ts     # Fetch + parse weather response
│   └── searchApi.ts      # Location search endpoint
├── components/
│   ├── layout/
│   │   ├── BottomNav/    # Tab bar (Home, Forecast, Search, Settings)
│   │   ├── PageWrapper/  # Scroll container with safe-area padding
│   │   └── ScreenHeader/ # Reusable titled header
│   ├── search/
│   │   ├── SearchBar/    # Controlled input with clear button
│   │   ├── LocationRow/  # Single result row with safe highlight rendering
│   │   └── SearchResults/# Sections: results / recents / popular
│   ├── ui/
│   │   ├── Badge/        # Pill label
│   │   ├── Button/       # Variant-aware button
│   │   ├── Card/         # Surface container
│   │   ├── Input/        # Text input
│   │   ├── Skeleton/     # Loading placeholder
│   │   └── Toggle/       # On/off switch
│   └── weather/
│       ├── AlertBanner/  # Severe weather warning strip
│       ├── CachePill/    # "From cache · X min ago" indicator
│       ├── DetailCards/  # Grid of stat cards (wind, humidity, UV, etc.)
│       ├── ForecastList/ # 15-day forecast rows
│       ├── HourlyStrip/  # Horizontal scrolling hourly view
│       ├── StatGrid/     # Key stats summary grid on Home
│       └── WeatherCard/  # Hero block: icon, city, temperature, condition
├── context/
│   ├── SettingsContext.tsx
│   └── WeatherContext.tsx
├── hooks/
│   ├── useLocation.ts    # Browser Geolocation API wrapper
│   ├── useSearch.ts      # Search state + recent locations
│   ├── useSettings.ts    # Settings context consumer
│   └── useWeather.ts     # Weather context consumer
├── screens/
│   ├── HomeScreen.tsx
│   ├── ForecastScreen.tsx
│   ├── SearchScreen.tsx
│   └── SettingsScreen.tsx
├── styles/
│   ├── tokens.css        # Design tokens (colours, spacing, typography)
│   ├── globals.css       # Shared utility classes
│   └── animations.css    # Keyframe animations
├── utils/
│   ├── cache.ts          # In-memory weather cache
│   ├── constants.ts      # API base URL, default settings, popular cities
│   └── formatters.ts     # Temperature, wind, pressure formatting
├── App.tsx               # Screen router (state-based, no React Router)
└── main.tsx              # Entry point
```

---

## Prerequisites

- Node.js 18+
- The Skye backend (Spring Boot) running on `http://localhost:8080`

The backend is responsible for holding the Visual Crossing API key and exposing:

```
GET /api/v1/weather?city={city}
GET /api/v1/search?q={query}
```

---

## Getting Started

```bash
# Install dependencies
npm install

# Start the dev server (proxies /api → localhost:8080)
npm run dev
```

The app will be available at `http://localhost:5173`.

### Build for production

```bash
npm run build
```

Output goes to `dist/`. In production, ensure the backend is available at the same origin or configure a reverse proxy for `/api` routes.

### Preview production build

```bash
npm run preview
```

---

## Configuration

All user preferences are persisted to `localStorage` under the key `skye_settings`.

| Setting | Default | Options |
|---|---|---|
| Temperature unit | °C | °C, °F |
| Wind unit | km/h | km/h, mph, m/s |
| Pressure unit | hPa | hPa, inHg |
| Cache duration | 5 min | 1, 5, 10, 30 min |
| Auto-refresh | On | On / Off |
| Daily summary alerts | On | On / Off |
| Severe weather alerts | On | On / Off |
| Theme | Dark | Dark / Light |

Recent searched locations are stored under `skye_recent` (last 5 entries).

---

## Screens

### Home
Displays the current weather hero (icon, city, temperature, condition, feels-like), a stats grid, cache freshness pill, severe weather alert banner, and a scrollable hourly forecast strip.

### Forecast
Shows the full 15-day daily forecast and a detailed card grid of today's extended stats (wind direction compass, moon phase, dew point, cloud cover, etc.).

### Search
Live city search with query-match highlighting, recent locations, and popular city shortcuts.

### Settings
Controls for theme, units, cache duration, auto-refresh, notification preferences, and a cache clear action.

---

## Caching

Weather responses are held in an in-memory cache keyed by city name (case-insensitive). Cache entries expire after the configured TTL. A `CachePill` on the Home screen shows whether the current data is live or cached and how old it is. The cache can be cleared manually from Settings.

Auto-refresh runs on a timer matching the cache TTL and is paused automatically when the browser tab is not visible.

---

## Geolocation

On first load, the app requests the browser's Geolocation API. If granted, coordinates are passed to the backend as `latitude,longitude`. If denied or unavailable, the app falls back to Reading, UK. The Home screen displays "My Location" when coordinates are in use.
