import { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useMoodThemeStore, { MOOD_THEMES } from '@/store/moodThemeStore';

/**
 * Generates random positions and sizes for floating particles.
 * @param {number} count - Number of particles
 * @returns {Array<{x: number, y: number, size: number, delay: number, duration: number}>}
 */
const generateParticles = (count) =>
  Array.from({ length: count }, (_, i) => ({
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: 4 + Math.random() * 12,
    delay: Math.random() * 4,
    duration: 6 + Math.random() * 8,
    id: i,
  }));

/**
 * Floating heart particles for the "Love" mood.
 * Renders heart shapes that drift upward with rotation and shimmer.
 */
function LoveParticles({ config }) {
  const particles = useMemo(() => generateParticles(12), []);

  return (
    <>
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute pointer-events-none select-none"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            fontSize: `${p.size}px`,
          }}
          animate={{
            y: [0, -60, -30, -80],
            x: [0, 15, -10, 5],
            opacity: [0, 0.7, 0.5, 0],
            rotate: [0, 10, -10, 5],
            scale: [0.5, 1, 0.9, 0.3],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          ❤️
        </motion.div>
      ))}
      {/* Subtle shimmer overlay */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse at 50% 50%, ${config.glow} 0%, transparent 70%)`,
        }}
        animate={{ opacity: [0.1, 0.25, 0.1] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      />
    </>
  );
}

/**
 * Gentle floating circles for the "Normal" mood.
 * Soft pastel circles drift slowly across the background.
 */
function NormalParticles({ config }) {
  const particles = useMemo(() => generateParticles(10), []);

  return (
    <>
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full pointer-events-none"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size * 2,
            height: p.size * 2,
            background: `radial-gradient(circle, ${config.particleColor}, transparent)`,
          }}
          animate={{
            y: [0, -30, 10, -20],
            x: [0, 20, -15, 10],
            opacity: [0.15, 0.4, 0.2, 0.15],
            scale: [1, 1.3, 0.9, 1],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
    </>
  );
}

/**
 * Slow floating particles with blur for the "Sad" mood.
 * Creates a quiet, reflective atmosphere with blurred glass-like orbs.
 */
function SadParticles({ config }) {
  const particles = useMemo(() => generateParticles(8), []);

  return (
    <>
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full pointer-events-none"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size * 3,
            height: p.size * 3,
            background: `radial-gradient(circle, ${config.particleColor}, transparent)`,
            filter: 'blur(8px)',
          }}
          animate={{
            y: [0, -15, 5, -10],
            x: [0, 8, -5, 3],
            opacity: [0.1, 0.3, 0.15, 0.1],
            scale: [1, 1.15, 0.95, 1],
          }}
          transition={{
            duration: p.duration + 4,
            delay: p.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
      {/* Blurred glass overlay */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse at 30% 70%, ${config.glow} 0%, transparent 60%)`,
          filter: 'blur(40px)',
        }}
        animate={{ opacity: [0.08, 0.18, 0.08] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      />
    </>
  );
}

/**
 * Pulsing gradient glow for the "Angry" mood.
 * Subtle moving gradient with glowing border effects (not flashy).
 */
function AngryParticles({ config }) {
  const particles = useMemo(() => generateParticles(6), []);

  return (
    <>
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full pointer-events-none"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size * 2.5,
            height: p.size * 2.5,
            background: `radial-gradient(circle, ${config.particleColor}, transparent)`,
          }}
          animate={{
            opacity: [0.1, 0.35, 0.1],
            scale: [0.8, 1.4, 0.8],
          }}
          transition={{
            duration: p.duration * 0.6,
            delay: p.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
      {/* Gradient pulse overlay */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `linear-gradient(135deg, ${config.glow} 0%, transparent 40%, ${config.glow} 100%)`,
        }}
        animate={{
          opacity: [0.05, 0.15, 0.05],
          backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'],
        }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
      />
    </>
  );
}

/** Map of mood keys to their particle components */
const PARTICLE_MAP = {
  love: LoveParticles,
  normal: NormalParticles,
  sad: SadParticles,
  angry: AngryParticles,
};

/**
 * MoodThemeBackground — renders mood-specific floating particle animations
 * behind all app content. Fixed-position with pointer-events: none.
 *
 * Transitions between moods with 600ms crossfade animation.
 */
export default function MoodThemeBackground() {
  const mood = useMoodThemeStore((s) => s.mood);
  const config = MOOD_THEMES[mood] || MOOD_THEMES.normal;
  const ParticleComponent = PARTICLE_MAP[mood] || NormalParticles;

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {/* Base gradient wash */}
      <AnimatePresence mode="wait">
        <motion.div
          key={mood}
          className="absolute inset-0"
          style={{
            background: `radial-gradient(ellipse at 20% 80%, ${config.glow} 0%, transparent 50%), radial-gradient(ellipse at 80% 20%, ${config.glow} 0%, transparent 50%)`,
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: 'easeInOut' }}
        />
      </AnimatePresence>

      {/* Mood-specific particles */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`particles-${mood}`}
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: 'easeInOut' }}
        >
          <ParticleComponent config={config} />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
