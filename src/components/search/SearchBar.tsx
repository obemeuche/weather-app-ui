import { useRef } from 'react';
import styles from './SearchBar.module.css';

interface SearchBarProps {
  value: string;
  onChange: (v: string) => void;
  onClear: () => void;
}

export function SearchBar({ value, onChange, onClear }: SearchBarProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className={styles.wrapper}>
      <span className={styles.iconLeft} aria-hidden="true">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <circle cx="11" cy="11" r="8" />
          <path d="M21 21l-4.35-4.35" />
        </svg>
      </span>

      <input
        ref={inputRef}
        type="search"
        className={styles.input}
        placeholder="Search city or airport…"
        autoComplete="off"
        spellCheck={false}
        aria-label="Search for a city"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />

      {value.length > 0 && (
        <span className={styles.iconRight}>
          <button
            className={styles.clearBtn}
            aria-label="Clear search"
            type="button"
            onClick={() => { onClear(); inputRef.current?.focus(); }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </span>
      )}
    </div>
  );
}
