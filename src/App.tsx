import { useState } from 'react';
import { SettingsProvider } from './context/SettingsContext';
import { WeatherProvider } from './context/WeatherContext';
import { BottomNav } from './components/layout/BottomNav';
import type { Screen } from './components/layout/BottomNav';
import { HomeScreen } from './screens/HomeScreen';
import { ForecastScreen } from './screens/ForecastScreen';
import { SearchScreen } from './screens/SearchScreen';
import { SettingsScreen } from './screens/SettingsScreen';

function AppShell() {
  const [activeScreen, setActiveScreen] = useState<Screen>('home');

  const navigateTo = (screen: Screen) => setActiveScreen(screen);

  const screens: Screen[] = ['home', 'search', 'forecast', 'settings'];

  return (
    <div id="app">
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
