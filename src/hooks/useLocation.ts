import { useCallback } from 'react';
import { DEFAULT_CITY } from '../utils/constants';

interface UseLocationReturn {
  requestGeolocation: (
    onCoords: (coordCity: string) => void,
    onFallback: () => void
  ) => void;
}

export function useLocation(): UseLocationReturn {
  const requestGeolocation = useCallback(
    (onCoords: (coordCity: string) => void, onFallback: () => void) => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const { latitude, longitude } = pos.coords;
            const coordCity = `${latitude.toFixed(4)},${longitude.toFixed(4)}`;
            onCoords(coordCity);
          },
          () => onFallback(),
          { timeout: 5000, maximumAge: 300000 }
        );
      } else {
        onFallback();
      }
    },
    []
  );

  return { requestGeolocation };
}

export { DEFAULT_CITY };
