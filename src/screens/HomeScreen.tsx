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

export function HomeScreen() {
  const { currentData, isLoading, error, loadWeather, currentCity } = useWeather();
  const { settings } = useSettings();
  const { requestGeolocation } = useLocation();
  const [displayCity, setDisplayCity] = useState('Reading');
  const [displayCountry, setDisplayCountry] = useState('UK');

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

  return (
    <PageWrapper>
      {/* Hero */}
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
