import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { getTheme } from './themes.js';

const ThemeContext = createContext(null);

const STORAGE_KEY = 'occasio:theme';

// Holds the active visual theme. Setting it:
//   - writes document.documentElement.dataset.theme so the CSS tokens in index.css swap
//   - exposes the matching theme object (shader colors, 3D accent) for the WebGL layers
// During the preview phase this is driven by the ThemeSwitcher; once a direction is
// locked in we can default it here (or remove the provider entirely).
export function ThemeProvider({ children, initial = 'default' }) {
  const [themeId, setThemeId] = useState(() => {
    if (typeof window === 'undefined') return initial;
    return window.localStorage?.getItem(STORAGE_KEY) || initial;
  });

  useEffect(() => {
    const root = document.documentElement;
    if (themeId === 'default') {
      delete root.dataset.theme;
    } else {
      root.dataset.theme = themeId;
    }
    try {
      window.localStorage?.setItem(STORAGE_KEY, themeId);
    } catch {
      /* ignore storage failures (private mode, etc.) */
    }
  }, [themeId]);

  const setTheme = useCallback((id) => setThemeId(id), []);

  const value = {
    themeId,
    theme: getTheme(themeId),
    setTheme,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    // Safe fallback so visual components can render outside the provider.
    return { themeId: 'default', theme: getTheme('default'), setTheme: () => {} };
  }
  return ctx;
}
