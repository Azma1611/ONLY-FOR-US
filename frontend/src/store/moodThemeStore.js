import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import themeService from '@/services/themeService';

/**
 * @typedef {'love' | 'normal' | 'sad' | 'angry'} MoodTheme
 */

/**
 * Mood theme definitions — gradients, accents, glows, and labels for each emotional theme.
 * These drive CSS custom properties that cascade through the entire design system.
 */
export const MOOD_THEMES = {
  love: {
    key: 'love',
    emoji: '❤️',
    label: 'Love',
    feeling: 'Warm, romantic, soft glow',
    gradientStart: '#FF5F8F',
    gradientEnd: '#FF8FB1',
    accent: '#FF5F8F',
    accentLight: '#FF8FB1',
    glow: 'rgba(255, 95, 143, 0.3)',
    glowStrong: 'rgba(255, 95, 143, 0.5)',
    particleColor: 'rgba(255, 95, 143, 0.6)',
  },
  normal: {
    key: 'normal',
    emoji: '😊',
    label: 'Normal',
    feeling: 'Calm, peaceful, clean',
    gradientStart: '#4FACFE',
    gradientEnd: '#00F2FE',
    accent: '#4FACFE',
    accentLight: '#00F2FE',
    glow: 'rgba(79, 172, 254, 0.3)',
    glowStrong: 'rgba(79, 172, 254, 0.5)',
    particleColor: 'rgba(79, 172, 254, 0.6)',
  },
  sad: {
    key: 'sad',
    emoji: '😔',
    label: 'Sad',
    feeling: 'Quiet, comforting, reflective',
    gradientStart: '#5C6BC0',
    gradientEnd: '#3949AB',
    accent: '#5C6BC0',
    accentLight: '#7986CB',
    glow: 'rgba(92, 107, 192, 0.3)',
    glowStrong: 'rgba(92, 107, 192, 0.5)',
    particleColor: 'rgba(92, 107, 192, 0.6)',
  },
  angry: {
    key: 'angry',
    emoji: '😡',
    label: 'Angry',
    feeling: 'Intense but elegant',
    gradientStart: '#FF512F',
    gradientEnd: '#DD2476',
    accent: '#FF512F',
    accentLight: '#FF7858',
    glow: 'rgba(255, 81, 47, 0.3)',
    glowStrong: 'rgba(255, 81, 47, 0.5)',
    particleColor: 'rgba(255, 81, 47, 0.6)',
  },
};

/**
 * Applies mood theme CSS custom properties to the document root.
 * All themed components automatically pick up changes via var() references.
 * @param {MoodTheme} mood - The mood key to apply
 */
const applyMoodCSSVariables = (mood) => {
  const config = MOOD_THEMES[mood];
  if (!config) return;

  const root = document.documentElement;
  root.style.setProperty('--mood-gradient-start', config.gradientStart);
  root.style.setProperty('--mood-gradient-end', config.gradientEnd);
  root.style.setProperty('--mood-accent', config.accent);
  root.style.setProperty('--mood-accent-light', config.accentLight);
  root.style.setProperty('--mood-glow', config.glow);
  root.style.setProperty('--mood-glow-strong', config.glowStrong);
  root.style.setProperty('--mood-particle-color', config.particleColor);
};

/**
 * Mood theme Zustand store — manages the shared emotional theme state.
 *
 * Responsibilities:
 * - Fetches theme from API after login
 * - Applies CSS variables globally
 * - Persists to localStorage for instant load before API response
 * - Handles Socket.IO updates from partner
 */
const useMoodThemeStore = create(
  persist(
    (set, get) => ({
      /** @type {MoodTheme} Current active mood theme */
      mood: 'normal',

      /** @type {boolean} Whether we're loading the theme from API */
      isLoading: false,

      /** @type {boolean} Whether a theme transition animation is active */
      isTransitioning: false,

      /** @type {object|null} User who last changed the theme */
      updatedBy: null,

      /**
       * Fetches the current mood theme from the API and applies it.
       * Called on app mount (AppLayout) after authentication.
       */
      fetchMoodTheme: async () => {
        try {
          set({ isLoading: true });
          const response = await themeService.getTheme();
          const themeDoc = response.data?.data?.theme;
          if (themeDoc) {
            const mood = themeDoc.theme || 'normal';
            applyMoodCSSVariables(mood);
            set({
              mood,
              updatedBy: themeDoc.updatedBy || null,
              isLoading: false,
            });
          } else {
            set({ isLoading: false });
          }
        } catch (error) {
          console.error('Failed to fetch mood theme:', error);
          // Fall back to persisted local value
          applyMoodCSSVariables(get().mood);
          set({ isLoading: false });
        }
      },

      /**
       * Changes the mood theme — saves to API, applies locally, triggers transition.
       * The API controller handles Socket.IO broadcast to the partner.
       * @param {MoodTheme} mood - The new mood to set
       * @returns {Promise<boolean>} Whether the update succeeded
       */
      setMoodTheme: async (mood) => {
        if (!MOOD_THEMES[mood]) return false;
        if (get().mood === mood) return true;

        // Start transition animation
        set({ isTransitioning: true });

        // Apply immediately for responsive feel
        applyMoodCSSVariables(mood);
        set({ mood });

        try {
          await themeService.updateTheme(mood);

          // End transition after animation duration (600ms)
          setTimeout(() => {
            set({ isTransitioning: false });
          }, 600);

          return true;
        } catch (error) {
          console.error('Failed to update mood theme:', error);
          // Revert on failure
          const previousMood = get().mood;
          applyMoodCSSVariables(previousMood);
          set({ isTransitioning: false });
          return false;
        }
      },

      /**
       * Handles a theme_changed Socket.IO event from the partner.
       * Applies the new theme with transition animation.
       * @param {{ theme: MoodTheme, updatedBy: object, updatedAt: string }} data
       */
      handleSocketThemeChange: (data) => {
        const { theme, updatedBy } = data;
        if (!MOOD_THEMES[theme] || get().mood === theme) return;

        set({ isTransitioning: true });
        applyMoodCSSVariables(theme);
        set({
          mood: theme,
          updatedBy: updatedBy || null,
        });

        // End transition after animation duration
        setTimeout(() => {
          set({ isTransitioning: false });
        }, 600);

        return updatedBy; // Caller can use this for toast
      },

      /**
       * Initializes mood CSS variables from the persisted local state.
       * Called synchronously before API response for instant theme application.
       */
      initMoodTheme: () => {
        const { mood } = get();
        applyMoodCSSVariables(mood);
      },
    }),
    {
      name: 'ofu-mood-theme',
      partialize: (state) => ({ mood: state.mood }),
    }
  )
);

export default useMoodThemeStore;
