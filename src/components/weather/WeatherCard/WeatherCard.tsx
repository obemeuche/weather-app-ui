import styles from './WeatherCard.module.css';
import type { WeatherData } from '../../../api/types';
import { useSettings } from '../../../hooks/useSettings';
import { formatTemp } from '../../../utils/formatters';
import { Skeleton } from '../../ui/Skeleton';

const WEATHER_ICONS: Record<string, string> = {
  sunny: `<svg width="80" height="80" viewBox="0 0 80 80" fill="none"><circle cx="40" cy="40" r="18" fill="#FCD34D" opacity="0.95"/><g stroke="#FCD34D" stroke-width="3" stroke-linecap="round"><line x1="40" y1="8" x2="40" y2="16"/><line x1="40" y1="64" x2="40" y2="72"/><line x1="8" y1="40" x2="16" y2="40"/><line x1="64" y1="40" x2="72" y2="40"/><line x1="17.4" y1="17.4" x2="23.1" y2="23.1"/><line x1="56.9" y1="56.9" x2="62.6" y2="62.6"/><line x1="62.6" y1="17.4" x2="56.9" y2="23.1"/><line x1="23.1" y1="56.9" x2="17.4" y2="62.6"/></g></svg>`,
  'partly-cloudy': `<svg width="80" height="80" viewBox="0 0 80 80" fill="none"><circle cx="32" cy="36" r="13" fill="#FCD34D" opacity="0.9"/><g stroke="#FCD34D" stroke-width="2.5" stroke-linecap="round" opacity="0.7"><line x1="32" y1="14" x2="32" y2="20"/><line x1="10" y1="36" x2="16" y2="36"/><line x1="16.4" y1="20.4" x2="20.6" y2="24.6"/><line x1="47.6" y1="20.4" x2="43.4" y2="24.6"/></g><path d="M28 42C28 36.5 32.5 32 38 32C42.5 32 46.3 34.7 47.7 38.5C49 38.2 50.4 38 51.8 38C58 38 63 43 63 49C63 55 58 60 51.8 60H28C23.6 60 20 56.4 20 52C20 47.6 23.6 44 28 44V42Z" fill="rgba(255,255,255,0.85)"/></svg>`,
  cloudy: `<svg width="80" height="80" viewBox="0 0 80 80" fill="none"><path d="M25 55C19.5 55 15 50.5 15 45C15 39.5 19.5 35 25 35C25.7 35 26.4 35.1 27 35.2C28.8 30.4 33.5 27 39 27C46.2 27 52 32.8 52 40C52 40.3 52 40.6 52 40.9C54.3 41.9 56 44.3 56 47C56 50.9 52.9 54 49 54H25V55Z" fill="rgba(255,255,255,0.7)"/><path d="M33 62C28.6 62 25 58.4 25 54C25 49.6 28.6 46 33 46C33.5 46 34 46.1 34.5 46.2C36 42.5 39.6 40 43.8 40C49.4 40 54 44.6 54 50.2C54 50.5 54 50.7 53.9 51C55.7 51.8 57 53.8 57 56C57 59.3 54.3 62 51 62H33Z" fill="rgba(255,255,255,0.95)"/></svg>`,
  rainy: `<svg width="80" height="80" viewBox="0 0 80 80" fill="none"><path d="M25 45C19.5 45 15 40.5 15 35C15 29.5 19.5 25 25 25C25.7 25 26.4 25.1 27 25.2C28.8 20.4 33.5 17 39 17C46.2 17 52 22.8 52 30C52 30.3 52 30.6 52 30.9C54.3 31.9 56 34.3 56 37C56 40.9 52.9 44 49 44H25V45Z" fill="rgba(255,255,255,0.75)"/><g stroke="#7EC8E3" stroke-width="2.5" stroke-linecap="round"><line x1="28" y1="52" x2="24" y2="62"/><line x1="38" y1="52" x2="34" y2="62"/><line x1="48" y1="52" x2="44" y2="62"/><line x1="33" y1="58" x2="29" y2="68"/><line x1="43" y1="58" x2="39" y2="68"/></g></svg>`,
  stormy: `<svg width="80" height="80" viewBox="0 0 80 80" fill="none"><path d="M22 44C16.5 44 12 39.5 12 34C12 28.5 16.5 24 22 24C22.7 24 23.4 24.1 24 24.2C25.8 19.4 30.5 16 36 16C43.2 16 49 21.8 49 29C49 29.3 49 29.6 49 29.9C51.3 30.9 53 33.3 53 36C53 39.9 49.9 43 46 43H22V44Z" fill="rgba(180,180,200,0.7)"/><polygon points="42,44 36,56 42,56 36,70 50,52 44,52 50,44" fill="#FCD34D"/></svg>`,
  snowy: `<svg width="80" height="80" viewBox="0 0 80 80" fill="none"><path d="M24 44C18.5 44 14 39.5 14 34C14 28.5 18.5 24 24 24C24.7 24 25.4 24.1 26 24.2C27.8 19.4 32.5 16 38 16C45.2 16 51 21.8 51 29C51 29.3 51 29.6 51 29.9C53.3 30.9 55 33.3 55 36C55 39.9 51.9 43 48 43H24V44Z" fill="rgba(255,255,255,0.8)"/><g fill="#7EC8E3" opacity="0.9"><circle cx="28" cy="54" r="3"/><circle cx="40" cy="54" r="3"/><circle cx="52" cy="54" r="3"/><circle cx="34" cy="63" r="3"/><circle cx="46" cy="63" r="3"/></g></svg>`,
};

export function getWeatherIcon(name: string): string {
  return WEATHER_ICONS[name] || WEATHER_ICONS['cloudy'];
}

interface WeatherCardProps {
  data: WeatherData;
}

export function WeatherCard({ data }: WeatherCardProps) {
  const { settings } = useSettings();
  const iconHtml = getWeatherIcon(data.conditionIcon);

  return (
    <div className={`hero-block ${styles.heroBlock}`}>
      <div className={styles.weatherIconWrap}>
        <div
          className={`weather-icon animated ${styles.weatherIcon}`}
          dangerouslySetInnerHTML={{ __html: iconHtml }}
        />
      </div>
      <div className={styles.tempBlock}>
        <span className={`temperature ${styles.temperature}`}>
          {formatTemp(data.temperatureC, settings)}
        </span>
        <span className={styles.unit}>°{settings.tempUnit}</span>
      </div>
      <p className={styles.condition}>{data.condition}</p>
      <p className={styles.feelsLike}>
        Feels like {formatTemp(data.feelsLikeC, settings)}°{settings.tempUnit}
      </p>
    </div>
  );
}

export function WeatherCardSkeleton() {
  return (
    <div className={`hero-block ${styles.heroBlock}`}>
      <Skeleton width={80} height={80} borderRadius="50%" style={{ marginBottom: 16 }} />
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 4, marginBottom: 8 }}>
        <Skeleton width={140} height={80} borderRadius="12px" />
      </div>
      <Skeleton width={120} height={18} borderRadius="8px" style={{ marginBottom: 6 }} />
      <Skeleton width={90} height={14} borderRadius="8px" />
    </div>
  );
}
