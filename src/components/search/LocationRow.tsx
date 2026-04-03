import styles from './LocationRow.module.css';
import type { Location } from '../../api/types';
import { useSettings } from '../../hooks/useSettings';
import { formatTemp } from '../../utils/formatters';

interface LocationRowProps {
  location: Location;
  query?: string;
  onClick: (loc: Location) => void;
}

function HighlightedCity({ city, query }: { city: string; query: string }) {
  if (!query) return <>{city}</>;
  const idx = city.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return <>{city}</>;
  return (
    <>
      {city.slice(0, idx)}
      <mark className="highlight">{city.slice(idx, idx + query.length)}</mark>
      {city.slice(idx + query.length)}
    </>
  );
}

export function LocationRow({ location, query = '', onClick }: LocationRowProps) {
  const { settings } = useSettings();

  const tempDisplay = location.tempC != null
    ? `${formatTemp(location.tempC, settings)}°${settings.tempUnit}`
    : '…';

  return (
    <div className={styles.row} onClick={() => onClick(location)}>
      <div className={styles.icon}>{location.flag || '📍'}</div>
      <div className={styles.text}>
        <div className={styles.city}>
          <HighlightedCity city={location.city} query={query} />
        </div>
        <div className={styles.country}>{location.country}</div>
      </div>
      <div className={styles.temp}>{tempDisplay}</div>
    </div>
  );
}
