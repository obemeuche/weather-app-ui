import { useEffect, useState } from 'react';
import { PageWrapper } from '../components/layout/PageWrapper';
import { WeatherCard, WeatherCardSkeleton } from '../components/weather/WeatherCard';
import { CachePill } from '../components/weather/CachePill';
import { AlertBanner } from '../components/weather/AlertBanner';
import { StatGrid, StatGridSkeleton } from '../components/weather/StatGrid';
import { HourlyStrip, HourlyStripSkeleton } from '../components/weather/HourlyStrip';
import { useWeather } from '../hooks/useWeather';
import { useSettings } from '../hooks/useSettings';
import { useLocation } from '../hooks/useLocation';
import styles from './HomeScreen.module.css';

export function HomeScreen() {
  const { currentData, isLoading, error, loadWeather, currentCity } = useWeather();
  const { settings } = useSettings();
  const { requestGeolocation } = useLocation();
  const [displayCity, setDisplayCity] = useState('Reading');
  const [displayCountry, setDisplayCountry] = useState('UK');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    requestGeolocation(
      (coordCity) => {
        setDisplayCity('My Location');
        setDisplayCountry('');
        loadWeather(coordCity);
      },
      () => loadWeather('Reading'),
    );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!currentData) return;
    const isCoords = /^-?\d+\.\d+,-?\d+\.\d+$/.test(currentCity);
    setDisplayCity(isCoords ? 'My Location' : currentData.city);
    setDisplayCountry(isCoords ? '' : currentData.country);
  }, [currentData, currentCity]);

  const handleRefresh = async () => {
    if (refreshing || isLoading) return;
    setRefreshing(true);
    await loadWeather(currentCity, true);
    setRefreshing(false);
  };

  return (
    <PageWrapper>
      {/* Status Bar */}
      <div className="status-bar">
        <span className="status-time" id="status-time">—</span>
        <div className="status-icons">
          <svg width="16" height="12" viewBox="0 0 16 12" fill="currentColor">
            <rect x="0" y="4" width="3" height="8" rx="1" opacity="0.4"/>
            <rect x="4" y="2" width="3" height="10" rx="1" opacity="0.6"/>
            <rect x="8" y="0" width="3" height="12" rx="1" opacity="0.8"/>
            <rect x="12" y="0" width="3" height="12" rx="1"/>
          </svg>
          <div className="battery-icon"><div className="battery-fill" style={{ width: '78%' }} /></div>
        </div>
      </div>

      {/* Floating refresh button — top right */}
      <div className={styles.refreshRow}>
        <button
          className={`icon-btn${refreshing ? ' spinning' : ''}`}
          onClick={handleRefresh}
          title="Refresh weather"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <polyline points="23 4 23 10 17 10"/>
            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
          </svg>
        </button>
      </div>

      {/* Hero — location is now inside WeatherCard */}
      {isLoading || !currentData ? (
        error ? (
          <div className="error-card">
            <div style={{ fontSize: 32, marginBottom: 8 }}>⚠️</div>
            <p className="error-text">Couldn't load weather</p>
            <p className="error-sub">{error}</p>
            <button
              className="btn btn-outlined"
              style={{ marginTop: 16, width: 'auto', padding: '0 24px' }}
              onClick={() => loadWeather(currentCity, true)}
            >
              Retry
            </button>
          </div>
        ) : (
          <WeatherCardSkeleton />
        )
      ) : (
        <WeatherCard
          data={currentData}
          displayCity={displayCity}
          displayCountry={displayCountry}
        />
      )}

      {/* Cache Pill */}
      <CachePill
        fromCache={currentData?.fromCache ?? false}
        cachedAt={currentData?.cachedAt ?? null}
        isLoading={isLoading}
      />

      {/* Alert Banner */}
      {currentData && (
        <AlertBanner
          severeRisk={currentData.severeRisk}
          description={currentData.description}
          enabled={settings.notifySevereAlerts}
        />
      )}

      {/* Stats */}
      {isLoading || !currentData ? <StatGridSkeleton /> : <StatGrid data={currentData} />}

      {/* Hourly */}
      <div className="section-label">Hourly Forecast</div>
      {isLoading || !currentData ? <HourlyStripSkeleton /> : <HourlyStrip hourly={currentData.hourly} />}
    </PageWrapper>
  );
}
