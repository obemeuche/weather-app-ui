import { useState } from 'react';
import { PageWrapper } from '../components/layout/PageWrapper';
import { ScreenHeader } from '../components/layout/ScreenHeader';
import { Toggle } from '../components/ui/Toggle';
import { Button } from '../components/ui/Button';
import { useSettings } from '../hooks/useSettings';
import { clearAllCache } from '../utils/cache';
import { formatWindLabel } from '../utils/formatters';
import styles from './SettingsScreen.module.css';

type SheetOption<T> = { label: string; value: T };

interface Sheet {
  title: string;
  options: SheetOption<string | number>[];
  current: string | number;
  onSelect: (v: string | number) => void;
}

function ChevronIcon() {
  return (
    <svg className={styles.chevron} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <polyline points="9 18 15 12 9 6"/>
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  );
}

export function SettingsScreen() {
  const { settings, updateSettings } = useSettings();
  const [sheet, setSheet] = useState<Sheet | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [toast, setToast] = useState('');

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2500);
  };

  const openSheet = (s: Sheet) => setSheet(s);
  const closeSheet = () => { setSheet(null); setShowConfirm(false); };

  const pressureDisplay = settings.pressureUnit === 'inhg' ? 'inHg' : 'hPa';

  return (
    <PageWrapper>
      <ScreenHeader title="Settings" />

      {/* Appearance */}
      <div className="section-label">Appearance</div>
      <div className={styles.group}>
        <div className={styles.row}>
          <span className={styles.icon} style={{ background: 'rgba(252,211,77,0.12)' }}>🌓</span>
          <span className={styles.rowLabel}>Light Mode</span>
          <Toggle
            checked={settings.theme === 'light'}
            onChange={(v) => {
              updateSettings({ theme: v ? 'light' : 'dark' });
              showToast(v ? '☀️ Light mode on' : '🌙 Dark mode on');
            }}
          />
        </div>
      </div>

      {/* Units */}
      <div className="section-label">Units</div>
      <div className={styles.group}>
        <div className={styles.row} onClick={() => openSheet({
          title: 'Temperature Unit',
          options: [{ label: 'Celsius (°C)', value: 'C' }, { label: 'Fahrenheit (°F)', value: 'F' }],
          current: settings.tempUnit,
          onSelect: (v) => { updateSettings({ tempUnit: v as 'C' | 'F' }); showToast(`Temperature set to °${v}`); },
        })}>
          <span className={styles.icon} style={{ background: 'rgba(126,200,227,0.12)' }}>🌡</span>
          <span className={styles.rowLabel}>Temperature</span>
          <div className={styles.control}><span className={styles.value}>°{settings.tempUnit}</span><ChevronIcon /></div>
        </div>
        <div className={styles.divider} />
        <div className={styles.row} onClick={() => openSheet({
          title: 'Wind Speed Unit',
          options: [
            { label: 'Kilometres per hour (km/h)', value: 'kmh' },
            { label: 'Miles per hour (mph)', value: 'mph' },
            { label: 'Metres per second (m/s)', value: 'ms' },
          ],
          current: settings.windUnit,
          onSelect: (v) => { updateSettings({ windUnit: v as 'kmh' | 'mph' | 'ms' }); showToast('Wind unit updated'); },
        })}>
          <span className={styles.icon} style={{ background: 'rgba(167,139,250,0.12)' }}>💨</span>
          <span className={styles.rowLabel}>Wind Speed</span>
          <div className={styles.control}><span className={styles.value}>{formatWindLabel(settings)}</span><ChevronIcon /></div>
        </div>
        <div className={styles.divider} />
        <div className={styles.row} onClick={() => openSheet({
          title: 'Pressure Unit',
          options: [
            { label: 'Hectopascal (hPa)', value: 'hpa' },
            { label: 'Inch of mercury (inHg)', value: 'inhg' },
          ],
          current: settings.pressureUnit,
          onSelect: (v) => { updateSettings({ pressureUnit: v as 'hpa' | 'inhg' }); showToast('Pressure unit updated'); },
        })}>
          <span className={styles.icon} style={{ background: 'rgba(252,211,77,0.12)' }}>☀️</span>
          <span className={styles.rowLabel}>Pressure</span>
          <div className={styles.control}><span className={styles.value}>{pressureDisplay}</span><ChevronIcon /></div>
        </div>
      </div>

      {/* Notifications */}
      <div className="section-label">Notifications</div>
      <div className={styles.group}>
        <div className={styles.row}>
          <span className={styles.icon} style={{ background: 'rgba(34,197,94,0.12)' }}>🔔</span>
          <span className={styles.rowLabel}>Daily Summary</span>
          <Toggle
            checked={settings.notifyDailySummary}
            onChange={(v) => { updateSettings({ notifyDailySummary: v }); showToast(v ? '🔔 Daily summary on' : '🔕 Daily summary off'); }}
          />
        </div>
        <div className={styles.divider} />
        <div className={styles.row}>
          <span className={styles.icon} style={{ background: 'rgba(239,68,68,0.12)' }}>⚠️</span>
          <span className={styles.rowLabel}>Severe Alerts</span>
          <Toggle
            checked={settings.notifySevereAlerts}
            onChange={(v) => { updateSettings({ notifySevereAlerts: v }); showToast(v ? '⚠️ Severe alerts on' : '🔕 Severe alerts off'); }}
          />
        </div>
      </div>

      {/* Data & Cache */}
      <div className="section-label">Data &amp; Cache</div>
      <div className={styles.group}>
        <div className={styles.row} onClick={() => openSheet({
          title: 'Cache Duration',
          options: [
            { label: '1 minute', value: 1 },
            { label: '5 minutes', value: 5 },
            { label: '10 minutes', value: 10 },
            { label: '30 minutes', value: 30 },
          ],
          current: settings.cacheDurationMinutes,
          onSelect: (v) => { updateSettings({ cacheDurationMinutes: v as number }); showToast(`Cache duration set to ${v} min`); },
        })}>
          <span className={styles.icon} style={{ background: 'rgba(126,200,227,0.12)' }}>🗄</span>
          <span className={styles.rowLabel}>Cache Duration</span>
          <div className={styles.control}><span className={styles.value}>{settings.cacheDurationMinutes} min</span><ChevronIcon /></div>
        </div>
        <div className={styles.divider} />
        <div className={styles.row}>
          <span className={styles.icon} style={{ background: 'rgba(167,139,250,0.12)' }}>🔄</span>
          <span className={styles.rowLabel}>Auto-Refresh</span>
          <Toggle
            checked={settings.autoRefresh}
            onChange={(v) => { updateSettings({ autoRefresh: v }); showToast(v ? '🔄 Auto-refresh on' : 'Auto-refresh off'); }}
          />
        </div>
        <div className={styles.divider} />
        <div className={`${styles.row} ${styles.dangerRow}`} onClick={() => setShowConfirm(true)}>
          <span className={styles.icon} style={{ background: 'rgba(239,68,68,0.12)' }}>🗑</span>
          <span className={`${styles.rowLabel} ${styles.dangerLabel}`}>Clear Cache</span>
          <svg className={styles.chevron} style={{ color: 'var(--color-danger)' }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
        </div>
      </div>

      {/* App Info */}
      <div className={styles.appInfo}>
        <p className={styles.appVersion}>Skye Weather · v2.0.0</p>
        <p className={styles.appAttrib}>Powered by Visual Crossing Weather API</p>
      </div>

      {/* Toast */}
      {toast && <div className={`toast show`}>{toast}</div>}

      {/* Sheet Overlay */}
      {(sheet || showConfirm) && (
        <div className="sheet-overlay" onClick={closeSheet} style={{ display: 'block' }} />
      )}

      {/* Unit Picker Sheet */}
      {sheet && (
        <div className="bottom-sheet" style={{ display: 'block' }}>
          <div className="sheet-handle" />
          <h3 className="sheet-title">{sheet.title}</h3>
          <div className="sheet-options">
            {sheet.options.map((opt) => (
              <button
                key={String(opt.value)}
                className={`sheet-option${opt.value === sheet.current ? ' selected' : ''}`}
                onClick={() => { sheet.onSelect(opt.value); closeSheet(); }}
              >
                {opt.label}
                {opt.value === sheet.current && <CheckIcon />}
              </button>
            ))}
          </div>
          <button className="sheet-cancel" onClick={closeSheet}>Cancel</button>
        </div>
      )}

      {/* Clear Cache Confirm Sheet */}
      {showConfirm && (
        <div className="bottom-sheet" style={{ display: 'block' }}>
          <div className="sheet-handle" />
          <div className="confirm-icon">🗑</div>
          <h3 className="sheet-title">Clear Cache?</h3>
          <p className="sheet-desc">This will remove all locally cached weather data. Fresh data will be fetched on next load.</p>
          <Button variant="danger" onClick={() => { clearAllCache(); closeSheet(); showToast('🗑 Cache cleared'); }}>
            Clear Cache
          </Button>
          <button className="sheet-cancel" onClick={closeSheet}>Cancel</button>
        </div>
      )}
    </PageWrapper>
  );
}
