import styles from './SearchResults.module.css';
import type { Location } from '../../api/types';
import { LocationRow } from './LocationRow';
import { Skeleton } from '../ui/Skeleton';

interface SearchResultsProps {
  query: string;
  results: Location[];
  isSearching: boolean;
  noResults: boolean;
  recentLocations: Location[];
  popularLocations: Location[];
  onSelect: (loc: Location) => void;
}

export function SearchResults({
  query,
  results,
  isSearching,
  noResults,
  recentLocations,
  popularLocations,
  onSelect,
}: SearchResultsProps) {
  const isTyping = query.trim().length > 0;

  if (isTyping) {
    return (
      <div>
        <div className="section-label">Results</div>
        {isSearching ? (
          <div className={styles.list}>
            {[0, 1, 2].map((i) => (
              <div key={i} className={styles.skeletonRow}>
                <Skeleton width={36} height={36} borderRadius="12px" />
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <Skeleton width="60%" height={14} borderRadius="6px" />
                  <Skeleton width="35%" height={12} borderRadius="6px" />
                </div>
                <Skeleton width={32} height={16} borderRadius="6px" />
              </div>
            ))}
          </div>
        ) : noResults ? (
          <div className={styles.noResults}>
            <div className={styles.noResultsIcon}>🔍</div>
            <p className={styles.noResultsText}>No results for '{query}'</p>
            <p className={styles.noResultsSub}>Check your spelling and try again</p>
          </div>
        ) : (
          <div className={styles.list}>
            {results.map((loc) => (
              <LocationRow key={loc.city} location={loc} query={query} onClick={onSelect} />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <>
      <div>
        <div className="section-label">Recent</div>
        <div className={styles.list}>
          {recentLocations.length === 0 ? (
            <div className={styles.empty}>No recent locations</div>
          ) : (
            recentLocations.map((loc) => (
              <LocationRow key={loc.city} location={loc} onClick={onSelect} />
            ))
          )}
        </div>
      </div>

      <div>
        <div className="section-label">Popular</div>
        <div className={styles.list}>
          {popularLocations.map((loc) => (
            <LocationRow key={loc.city} location={loc} onClick={onSelect} />
          ))}
        </div>
      </div>
    </>
  );
}
