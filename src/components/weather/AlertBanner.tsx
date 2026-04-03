import { useState } from 'react';
import styles from './AlertBanner.module.css';

interface AlertBannerProps {
  severeRisk: number;
  description: string;
  enabled: boolean;
}

export function AlertBanner({ severeRisk, description, enabled }: AlertBannerProps) {
  const [dismissed, setDismissed] = useState(false);

  if (!enabled || dismissed || severeRisk < 20) return null;

  const isDanger = severeRisk >= 50;
  const icon = isDanger ? '🔴' : '🟡';

  return (
    <div className={`${styles.banner} ${isDanger ? styles.danger : styles.warning}`}>
      <span className={styles.icon}>{icon}</span>
      <span className={styles.text}>{description || 'Severe weather possible'}</span>
      <button className={styles.close} onClick={() => setDismissed(true)} aria-label="Dismiss">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </div>
  );
}
