import styles from './ForecastList.module.css';
import type { ForecastDay } from '../../../api/types';
import { useSettings } from '../../../hooks/useSettings';
import { formatTemp } from '../../../utils/formatters';

interface ForecastListProps {
  forecast: ForecastDay[];
}

export function ForecastList({ forecast }: ForecastListProps) {
  const { settings } = useSettings();

  const allLo  = forecast.map((d) => formatTemp(d.lo, settings));
  const allHi  = forecast.map((d) => formatTemp(d.hi, settings));
  const absMin = Math.min(...allLo);
  const absMax = Math.max(...allHi);
  const range  = absMax - absMin || 1;

  return (
    <div className={styles.list}>
      {forecast.map((day) => {
        const lo = formatTemp(day.lo, settings);
        const hi = formatTemp(day.hi, settings);
        const leftPct  = ((lo - absMin) / range) * 100;
        const widthPct = ((hi - lo) / range) * 100;

        return (
          <div key={day.day} className={styles.row}>
            <span className={styles.day}>{day.day}</span>

            <div className={styles.iconWrap}>
              <span className={styles.icon}>{day.icon}</span>
              {day.precipProb > 0 && (
                <span className={styles.precip}>🌧 {day.precipProb}%</span>
              )}
            </div>

            <div className={styles.barWrapper}>
              <div className={styles.barTrack}>
                <div
                  className={styles.barFill}
                  style={{
                    left: `${Math.max(0, leftPct)}%`,
                    width: `${Math.max(8, widthPct)}%`,
                  }}
                />
              </div>
              {day.precipProb > 0 && (
                <div className={styles.precipTrack}>
                  <div
                    className={styles.precipFill}
                    style={{ width: `${day.precipProb}%` }}
                  />
                </div>
              )}
            </div>

            <div className={styles.temps}>
              <span className={styles.lo}>{lo}°</span>
              <span className={styles.hi}>{hi}°</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
