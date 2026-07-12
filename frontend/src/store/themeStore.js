import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * Theme store — manages light/dark/auto theme preference
 */
const useThemeStore = create(
  persist(
    (set, get) => ({
      theme: 'auto', // 'light' | 'dark' | 'auto'
      resolvedTheme: 'dark', // The actual applied theme

      setTheme: (theme) => {
        set({ theme });
        get().applyTheme(theme);
      },

      applyTheme: (theme) => {
        let resolved = theme;
        if (theme === 'auto') {
          resolved = window.matchMedia('(prefers-color-scheme: dark)').matches
            ? 'dark'
            : 'light';
        }
        document.documentElement.setAttribute('data-theme', resolved);
        set({ resolvedTheme: resolved });
      },

      initTheme: () => {
        const { theme, applyTheme } = get();
        applyTheme(theme);

        // Listen for system theme changes
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        mediaQuery.addEventListener('change', () => {
          if (get().theme === 'auto') {
            applyTheme('auto');
          }
        });
      },
    }),
    {
      name: 'ofu-theme',
      partialize: (state) => ({ theme: state.theme }),
    }
  )
);

export default useThemeStore;
