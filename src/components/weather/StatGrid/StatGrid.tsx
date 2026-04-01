import styles from './StatGrid.module.css';
import type { WeatherData } from '../../../api/types';
import { useSettings } from '../../../hooks/useSettings';
import { formatWind } from '../../../utils/formatters';
import { Skeleton } from '../../ui/Skeleton';

interface StatGridProps {
  data: WeatherData;
}

export function StatGrid({ data }: StatGridProps) {
  const { settings } = useSettings();

  const stats = [
    { icon: '💧', value: `${data.humidity}%`, label: 'Humidity', sub: '' },
    { icon: '💨', value: formatWind(data.windKmh, settings), label: 'Wind', sub: data.windDir },
    { icon: '☀️', value: String(data.uvIndex), label: 'UV Index', sub: '' },
    { icon: '🌧', value: `${data.precipProb}%`, label: 'Rain', sub: data.precipType || 'No precip' },
    { icon: '💨', value: formatWind(data.windGustKmh, settings), label: 'Gust', sub: '' },
    { icon: '☁️', value: `${data.cloudCover}%`, label: 'Cloud', sub: '' },
  ];

  return (
    <div className={styles.grid}>
      {stats.map((s) => (
        <div key={s.label} className={styles.card}>
          <span className={styles.icon}>{s.icon}</span>
          <span className={styles.value}>{s.value}</span>
          <span className={styles.label}>{s.label}</span>
          {s.sub ? <span className={styles.sub}>{s.sub}</span> : null}
        </div>
      ))}
    </div>
  );
}

export function StatGridSkeleton() {
  return (
    <div className={styles.grid}>
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className={styles.card}>
          <Skeleton width={28} height={28} borderRadius="8px" />
          <Skeleton width={48} height={16} borderRadius="6px" style={{ marginTop: 4 }} />
          <Skeleton width={36} height={10} borderRadius="4px" style={{ marginTop: 4 }} />
        </div>
      ))}
    </div>
  );
}
