import { useEffect, useState } from 'react';
import styles from './CachePill.module.css';
import { formatCacheAge } from '../../../utils/formatters';

interface CachePillProps {
  fromCache: boolean;
  cachedAt: Date | null;
  isLoading: boolean;
}

export function CachePill({ fromCache, cachedAt, isLoading }: CachePillProps) {
  const [label, setLabel] = useState('');

  useEffect(() => {
    if (isLoading) { setLabel('Fetching fresh data…'); return; }
    if (!cachedAt)  { setLabel(''); return; }
    setLabel(fromCache ? `Cached · ${formatCacheAge(cachedAt)}` : 'Just updated');

    const id = setInterval(() => {
      setLabel(`Cached · ${formatCacheAge(cachedAt)}`);
    }, 30_000);
    return () => clearInterval(id);
  }, [fromCache, cachedAt, isLoading]);

  const variant = isLoading ? 'warning' : 'info';

  return (
    <div className={styles.wrap}>
      <div className={`pill pill-${variant} ${styles.pill}`}>
        <span className={styles.dot} />
        <span>{label}</span>
      </div>
    </div>
  );
}
