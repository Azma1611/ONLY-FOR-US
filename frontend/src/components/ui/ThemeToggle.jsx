import { motion } from 'framer-motion';
import { Sun, Moon, Monitor } from 'lucide-react';
import useThemeStore from '@/store/themeStore';
import { cn } from '@/lib/utils';

const themes = [
  { value: 'light', icon: Sun, label: 'Light' },
  { value: 'dark', icon: Moon, label: 'Dark' },
  { value: 'auto', icon: Monitor, label: 'Auto' },
];

/**
 * Three-way theme toggle with animated indicator
 */
export default function ThemeToggle({ compact = false }) {
  const { theme, setTheme } = useThemeStore();

  if (compact) {
    // Simple icon toggle for topbar
    const currentTheme = themes.find((t) => t.value === theme);
    const nextTheme = themes[(themes.findIndex((t) => t.value === theme) + 1) % themes.length];
    const Icon = currentTheme.icon;

    return (
      <motion.button
        className="p-2 rounded-xl text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] transition-colors"
        onClick={() => setTheme(nextTheme.value)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        title={`Switch to ${nextTheme.label} mode`}
      >
        <motion.div
          key={theme}
          initial={{ rotate: -90, opacity: 0 }}
          animate={{ rotate: 0, opacity: 1 }}
          exit={{ rotate: 90, opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <Icon className="w-5 h-5" />
        </motion.div>
      </motion.button>
    );
  }

  // Full three-way toggle
  return (
    <div className="flex items-center gap-1 p-1 rounded-xl bg-[var(--bg-tertiary)]">
      {themes.map((t) => {
        const Icon = t.icon;
        const isActive = theme === t.value;

        return (
          <button
            key={t.value}
            className={cn(
              'relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
              isActive ? 'text-[var(--text-primary)]' : 'text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]'
            )}
            onClick={() => setTheme(t.value)}
          >
            {isActive && (
              <motion.div
                className="absolute inset-0 bg-[var(--bg-elevated)] rounded-lg shadow-sm"
                layoutId="theme-toggle"
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-1.5">
              <Icon className="w-3.5 h-3.5" />
              {t.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
