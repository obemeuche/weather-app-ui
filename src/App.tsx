import { useState, useEffect, useRef } from 'react';
import { SettingsProvider } from './context/SettingsContext';
import { WeatherProvider } from './context/WeatherContext';
import { BottomNav } from './components/layout/BottomNav';
import type { Screen } from './components/layout/BottomNav';
import { HomeScreen } from './screens/HomeScreen';
import { ForecastScreen } from './screens/ForecastScreen';
import { SearchScreen } from './screens/SearchScreen';
import { SettingsScreen } from './screens/SettingsScreen';

function Clock() {
  const [time, setTime] = useState('');
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const h = String(now.getHours()).padStart(2, '0');
      const m = String(now.getMinutes()).padStart(2, '0');
      setTime(`${h}:${m}`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    document.querySelectorAll('[id^="status-time"]').forEach((el) => {
      el.textContent = time;
    });
  }, [time]);

  return null;
}

function AppShell() {
  const [activeScreen, setActiveScreen] = useState<Screen>('home');
  const prevScreen = useRef<Screen>('home');

  const navigateTo = (screen: Screen) => {
    prevScreen.current = activeScreen;
    setActiveScreen(screen);
  };

  const screens: Screen[] = ['home', 'search', 'forecast', 'settings'];

  return (
    <div id="app">
      <Clock />
      {screens.map((screen) => (
        <div
          key={screen}
          id={`screen-${screen}`}
          className={`screen${activeScreen === screen ? ' active' : ''}`}
        >
          {screen === 'home'     && <HomeScreen />}
          {screen === 'forecast' && <ForecastScreen />}
          {screen === 'search'   && <SearchScreen onNavigateHome={() => navigateTo('home')} />}
          {screen === 'settings' && <SettingsScreen />}
        </div>
      ))}
      <BottomNav active={activeScreen} onNavigate={navigateTo} />
    </div>
  );
}

export default function App() {
  return (
    <SettingsProvider>
      <WeatherProvider>
        <AppShell />
      </WeatherProvider>
    </SettingsProvider>
  );
}
