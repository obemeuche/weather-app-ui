import { useState } from 'react';
import styles from './HourlyStrip.module.css';
import type { HourlyItem } from '../../api/types';
import { useSettings } from '../../hooks/useSettings';
import { formatTemp } from '../../utils/formatters';
import { Skeleton } from '../ui/Skeleton';

interface HourlyStripProps {
  hourly: HourlyItem[];
}

export function HourlyStrip({ hourly }: HourlyStripProps) {
  const { settings } = useSettings();
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <div className={styles.scroll}>
      {hourly.map((hour, i) => (
        <div
          key={i}
          className={`${styles.card} ${i === activeIndex ? styles.active : ''}`}
          onClick={() => setActiveIndex(i)}
        >
          <span className={styles.time}>{hour.time}</span>
          <span className={styles.icon}>{hour.icon}</span>
          <span className={styles.temp}>{formatTemp(hour.tempC, settings)}°</span>
        </div>
      ))}
    </div>
  );
}

export function HourlyStripSkeleton() {
  return (
    <div className={styles.scroll}>
      {Array.from({ length: 7 }).map((_, i) => (
        <Skeleton key={i} width={56} height={96} borderRadius="12px" style={{ flexShrink: 0 }} />
      ))}
    </div>
  );
}
