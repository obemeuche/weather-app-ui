import { PageWrapper } from '../components/layout/PageWrapper';
import { ScreenHeader } from '../components/layout/ScreenHeader';
import { ForecastList } from '../components/weather/ForecastList';
import { DetailCards } from '../components/weather/DetailCards';
import { useWeather } from '../hooks/useWeather';

export function ForecastScreen() {
  const { currentData, currentCity } = useWeather();

  const isCoords = /^-?\d+\.\d+,-?\d+\.\d+$/.test(currentCity);
  const title = currentData ? (isCoords ? 'My Location' : currentData.city) : 'Forecast';
  const subtitle = currentData ? `${currentData.forecast.length}-day forecast` : '';

  return (
    <PageWrapper>
      <div className="status-bar">
        <span className="status-time" id="status-time-forecast">—</span>
        <div className="status-icons">
          <div className="battery-icon"><div className="battery-fill" style={{ width: '78%' }} /></div>
        </div>
      </div>

      <ScreenHeader title={title} subtitle={subtitle} />

      {currentData ? (
        <>
          <ForecastList forecast={currentData.forecast} />
          <div className="section-label" style={{ marginTop: 24 }}>Today's Details</div>
          <DetailCards data={currentData} />
        </>
      ) : (
        <p style={{ color: 'var(--color-text-muted)', textAlign: 'center', marginTop: 48 }}>
          No data yet — go to Home to load weather.
        </p>
      )}
    </PageWrapper>
  );
}
