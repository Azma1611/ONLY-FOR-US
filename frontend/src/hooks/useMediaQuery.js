import { useState, useEffect } from 'react';

/**
 * Custom hook for responsive breakpoint detection
 * @param {string} query - CSS media query string (e.g. '(min-width: 1024px)')
 * @returns {boolean} Whether the media query matches
 */
export default function useMediaQuery(query) {
  const [matches, setMatches] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia(query).matches;
    }
    return false;
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia(query);
    const handler = (event) => setMatches(event.matches);

    mediaQuery.addEventListener('change', handler);
    // Sync initial value
    setMatches(mediaQuery.matches);

    return () => mediaQuery.removeEventListener('change', handler);
  }, [query]);

  return matches;
}
