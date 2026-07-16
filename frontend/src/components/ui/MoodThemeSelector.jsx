import { motion, AnimatePresence } from 'framer-motion';
import { Check, Sparkles } from 'lucide-react';
import useMoodThemeStore, { MOOD_THEMES } from '@/store/moodThemeStore';
import useUIStore from '@/store/uiStore';
import { cn } from '@/lib/utils';

/**
 * Individual mood theme preview card.
 * Shows gradient, emoji, label, feeling, and selection state.
 * @param {{ themeKey: string, config: object, isActive: boolean, onSelect: Function, index: number }} props
 */
function MoodCard({ themeKey, config, isActive, onSelect, index }) {
  return (
    <motion.button
      onClick={() => onSelect(themeKey)}
      className={cn(
        'relative group flex flex-col items-center justify-center p-5 rounded-2xl border-2 transition-colors duration-300 overflow-hidden cursor-pointer',
        'min-h-[160px] sm:min-h-[180px]',
        isActive
          ? 'border-white/40 shadow-lg'
          : 'border-slate-700/50 hover:border-slate-600/70'
      )}
      style={{
        background: isActive
          ? `linear-gradient(135deg, ${config.gradientStart}, ${config.gradientEnd})`
          : undefined,
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      whileHover={{ scale: 1.03, y: -4 }}
      whileTap={{ scale: 0.97 }}
    >
      {/* Background gradient preview (when not active) */}
      {!isActive && (
        <div
          className="absolute inset-0 opacity-20 group-hover:opacity-35 transition-opacity duration-500 rounded-2xl"
          style={{
            background: `linear-gradient(135deg, ${config.gradientStart}, ${config.gradientEnd})`,
          }}
        />
      )}

      {/* Shimmer overlay on active card */}
      {isActive && (
        <motion.div
          className="absolute inset-0 opacity-30"
          style={{
            background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.15) 50%, transparent 100%)',
            backgroundSize: '200% 100%',
          }}
          animate={{ backgroundPosition: ['200% 0', '-200% 0'] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
        />
      )}

      {/* Selection checkmark */}
      <AnimatePresence>
        {isActive && (
          <motion.div
            className="absolute top-3 right-3 w-6 h-6 bg-white/25 backdrop-blur-sm rounded-full flex items-center justify-center"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 180 }}
            transition={{ type: 'spring', damping: 15, stiffness: 300 }}
          >
            <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center gap-2">
        <motion.span
          className="text-3xl sm:text-4xl"
          animate={isActive ? { scale: [1, 1.2, 1] } : {}}
          transition={{ duration: 0.6, ease: 'easeInOut' }}
        >
          {config.emoji}
        </motion.span>

        <span className={cn(
          'text-base font-bold tracking-tight',
          isActive ? 'text-white' : 'text-slate-200'
        )}>
          {config.label}
        </span>

        <span className={cn(
          'text-xs text-center leading-tight max-w-[120px]',
          isActive ? 'text-white/80' : 'text-slate-400'
        )}>
          {config.feeling}
        </span>
      </div>

      {/* Glow ring on active */}
      {isActive && (
        <motion.div
          className="absolute inset-0 rounded-2xl"
          style={{
            boxShadow: `0 0 30px ${config.glow}, 0 0 60px ${config.glow}`,
          }}
          animate={{
            boxShadow: [
              `0 0 20px ${config.glow}, 0 0 40px ${config.glow}`,
              `0 0 35px ${config.glowStrong}, 0 0 70px ${config.glow}`,
              `0 0 20px ${config.glow}, 0 0 40px ${config.glow}`,
            ],
          }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}
    </motion.button>
  );
}

/**
 * MoodThemeSelector — renders a 2×2 grid of mood theme cards.
 * Shows the current shared mood badge and handles theme switching
 * with animated transitions and partner sync toast.
 */
export default function MoodThemeSelector() {
  const { mood, setMoodTheme, isTransitioning } = useMoodThemeStore();
  const addToast = useUIStore((s) => s.addToast);

  const themes = Object.entries(MOOD_THEMES);
  const currentConfig = MOOD_THEMES[mood];

  /** @param {string} themeKey */
  const handleSelect = async (themeKey) => {
    if (themeKey === mood || isTransitioning) return;

    const success = await setMoodTheme(themeKey);
    if (success) {
      addToast({
        type: 'success',
        title: 'Mood Synced',
        message: 'Theme synced with your partner ❤️',
        duration: 3000,
      });
    } else {
      addToast({
        type: 'error',
        title: 'Sync Failed',
        message: 'Could not update the mood theme. Please try again.',
        duration: 4000,
      });
    }
  };

  return (
    <div className="space-y-5">
      {/* Current Shared Mood badge */}
      <motion.div
        className="flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-800/60 border border-slate-700/40"
        layout
      >
        <motion.span
          key={mood}
          className="text-2xl"
          initial={{ scale: 0, rotate: -90 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', damping: 12 }}
        >
          {currentConfig?.emoji}
        </motion.span>
        <div className="flex-1">
          <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">
            Current Shared Mood
          </p>
          <motion.p
            key={mood}
            className="text-sm font-bold"
            style={{ color: currentConfig?.accent }}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            {currentConfig?.label}
          </motion.p>
        </div>
        <Sparkles className="w-4 h-4 text-slate-500" />
      </motion.div>

      {/* Theme card grid */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        {themes.map(([key, config], index) => (
          <MoodCard
            key={key}
            themeKey={key}
            config={config}
            isActive={mood === key}
            onSelect={handleSelect}
            index={index}
          />
        ))}
      </div>

      {/* Transitioning indicator */}
      <AnimatePresence>
        {isTransitioning && (
          <motion.div
            className="flex items-center justify-center gap-2 py-2"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <motion.div
              className="w-2 h-2 rounded-full bg-[var(--mood-accent)]"
              animate={{ scale: [1, 1.5, 1] }}
              transition={{ duration: 0.6, repeat: Infinity }}
            />
            <span className="text-xs text-slate-400">Syncing mood...</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
