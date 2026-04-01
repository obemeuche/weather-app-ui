import type React from 'react';
import { createContext, useState, useCallback, useEffect } from 'react';
import type { Settings } from '../api/types';
import { DEFAULT_SETTINGS } from '../utils/constants';

interface SettingsContextValue {
  settings: Settings;
  updateSettings: (patch: Partial<Settings>) => void;
}

export const SettingsContext = createContext<SettingsContextValue | null>(null);

function loadSettings(): Settings {
  try {
    const stored = localStorage.getItem('skye_settings');
    return stored ? (JSON.parse(stored) as Settings) : { ...DEFAULT_SETTINGS };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

function saveSettings(s: Settings): void {
  localStorage.setItem('skye_settings', JSON.stringify(s));
}

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<Settings>(loadSettings);

  useEffect(() => {
    document.body.classList.toggle('light-theme', settings.theme === 'light');
  }, [settings.theme]);

  const updateSettings = useCallback((patch: Partial<Settings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...patch };
      saveSettings(next);
      return next;
    });
  }, []);

  return (
    <SettingsContext.Provider value={{ settings, updateSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}
