import styles from './DetailCards.module.css';
import type { WeatherData } from '../../api/types';
import { useSettings } from '../../hooks/useSettings';
import { uvLabel, pressureLabel, visibilityLabel } from '../../utils/formatters';

interface DetailCardsProps {
  data: WeatherData;
}

export function DetailCards({ data }: DetailCardsProps) {
  const { settings } = useSettings();
  const uvPct = Math.min(100, (data.uvIndex / 11) * 100);

  const pressureDisplay = settings.pressureUnit === 'inhg'
    ? `${(data.pressure * 0.02953).toFixed(2)} inHg`
    : `${data.pressure} hPa`;

  const cloudLabel =
    data.cloudCover < 20 ? 'Clear'
    : data.cloudCover < 50 ? 'Partly cloudy'
    : data.cloudCover < 85 ? 'Mostly cloudy'
    : 'Overcast';

  return (
    <div className={styles.grid}>

      {/* UV Index */}
      <div className={styles.card}>
        <div className={styles.header}>
          <span className={styles.cardIcon} style={{ background: 'rgba(126,200,227,0.12)', color: '#7EC8E3' }}>☀️</span>
          <span className={styles.label}>UV Index</span>
        </div>
        <span className={styles.value}>{data.uvIndex}</span>
        <div className={styles.uvTrack}>
          <div className={styles.uvFill} style={{ width: `${uvPct}%` }} />
          <div className={styles.uvDot} style={{ left: `${uvPct}%` }} />
        </div>
        <span className={styles.sub}>{uvLabel(data.uvIndex)}</span>
      </div>

      {/* Sunrise / Sunset */}
      <div className={styles.card}>
        <div className={styles.header}>
          <span className={styles.cardIcon} style={{ background: 'rgba(252,211,77,0.12)', color: '#FCD34D' }}>🌅</span>
          <span className={styles.label}>Sunrise</span>
        </div>
        <span className={styles.value}>{data.sunrise || '—'}</span>
        <span className={styles.sub}>{data.sunset ? `Sunset ${data.sunset}` : '—'}</span>
      </div>

      {/* Visibility */}
      <div className={styles.card}>
        <div className={styles.header}>
          <span className={styles.cardIcon} style={{ background: 'rgba(167,139,250,0.12)', color: '#A78BFA' }}>👁</span>
          <span className={styles.label}>Visibility</span>
        </div>
        <span className={styles.value}>{data.visibility != null ? `${data.visibility} km` : '—'}</span>
        <span className={styles.sub}>{visibilityLabel(data.visibility)}</span>
      </div>

      {/* Pressure */}
      <div className={styles.card}>
        <div className={styles.header}>
          <span className={styles.cardIcon} style={{ background: 'rgba(34,197,94,0.12)', color: '#22C55E' }}>🌡</span>
          <span className={styles.label}>Pressure</span>
        </div>
        <span className={styles.value}>{pressureDisplay}</span>
        <span className={styles.sub}>{pressureLabel(data.pressure)}</span>
      </div>

      {/* Cloud Cover */}
      <div className={styles.card}>
        <div className={styles.header}>
          <span className={styles.cardIcon} style={{ background: 'rgba(148,163,184,0.12)', color: '#94A3B8' }}>☁️</span>
          <span className={styles.label}>Cloud Cover</span>
        </div>
        <span className={styles.value}>{data.cloudCover}%</span>
        <span className={styles.sub}>{cloudLabel}</span>
      </div>

      {/* Moon Phase */}
      <div className={styles.card}>
        <div className={styles.header}>
          <span className={styles.cardIcon} style={{ background: 'rgba(167,139,250,0.12)', color: '#A78BFA' }}>🌙</span>
          <span className={styles.label}>Moon Phase</span>
        </div>
        <span className={`${styles.value} ${styles.moonEmoji}`}>{data.moonEmoji}</span>
        <span className={styles.sub}>{data.moonLabel}</span>
      </div>

    </div>
  );
}
