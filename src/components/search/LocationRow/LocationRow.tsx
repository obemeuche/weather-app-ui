import styles from './LocationRow.module.css';
import type { Location } from '../../../api/types';
import { useSettings } from '../../../hooks/useSettings';
import { formatTemp } from '../../../utils/formatters';

interface LocationRowProps {
  location: Location;
  query?: string;
  onClick: (loc: Location) => void;
}

export function LocationRow({ location, query = '', onClick }: LocationRowProps) {
  const { settings } = useSettings();

  let cityHtml = location.city;
  if (query) {
    const idx = location.city.toLowerCase().indexOf(query.toLowerCase());
    if (idx !== -1) {
      cityHtml =
        location.city.slice(0, idx) +
        `<mark class="highlight">${location.city.slice(idx, idx + query.length)}</mark>` +
        location.city.slice(idx + query.length);
    }
  }

  const tempDisplay = location.tempC != null
    ? `${formatTemp(location.tempC, settings)}°${settings.tempUnit}`
    : '…';

  return (
    <div className={styles.row} onClick={() => onClick(location)}>
      <div className={styles.icon}>{location.flag || '📍'}</div>
      <div className={styles.text}>
        <div
          className={styles.city}
          dangerouslySetInnerHTML={{ __html: cityHtml }}
        />
        <div className={styles.country}>{location.country}</div>
      </div>
      <div className={styles.temp}>{tempDisplay}</div>
    </div>
  );
}
