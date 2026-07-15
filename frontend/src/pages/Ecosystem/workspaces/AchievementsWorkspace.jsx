import { useEffect } from 'react';
import { Star, Zap, Heart } from 'lucide-react';
import useAchievementStore from '@/store/achievementStore';
import { motion } from 'framer-motion';

const BADGES = [
  { id: '7_day_streak', title: '7 Day Streak', icon: <Zap className="w-8 h-8" />, color: 'text-yellow-500', bg: 'bg-yellow-50 dark:bg-yellow-900/20', border: 'border-yellow-200 dark:border-yellow-900' },
  { id: 'goal_master', title: 'Goal Master', icon: <Target className="w-8 h-8" />, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20', border: 'border-blue-200 dark:border-blue-900' },
  { id: 'health_hero', title: 'Health Hero', icon: <Heart className="w-8 h-8" />, color: 'text-rose-500', bg: 'bg-rose-50 dark:bg-rose-900/20', border: 'border-rose-200 dark:border-rose-900' },
  { id: 'perfect_week', title: 'Perfect Week', icon: <Star className="w-8 h-8" />, color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-900/20', border: 'border-purple-200 dark:border-purple-900' },
];

// Fallback icons if not imported above
import { Target } from 'lucide-react';

export default function AchievementsWorkspace() {
  const { achievements, fetchAchievements } = useAchievementStore();

  useEffect(() => {
    fetchAchievements();
  }, []);

  const isUnlocked = (badgeId) => achievements.some(a => a.badgeId === badgeId);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-[var(--text-primary)]">Awards & Achievements</h2>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {BADGES.map((badge, idx) => {
          const unlocked = isUnlocked(badge.id);
          
          return (
            <motion.div 
              key={badge.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.1 }}
              className={`relative flex flex-col items-center justify-center p-6 rounded-3xl border-2 transition-all duration-300 ${
                unlocked 
                  ? `${badge.bg} ${badge.border} shadow-lg shadow-${badge.color.split('-')[1]}-500/20` 
                  : 'bg-[var(--bg-secondary)] border-[var(--border-color)] opacity-50 grayscale'
              }`}
            >
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
                unlocked ? 'bg-white dark:bg-black/50 shadow-sm' : 'bg-[var(--bg-primary)]'
              }`}>
                <div className={`${unlocked ? badge.color : 'text-[var(--text-secondary)]'}`}>
                  {badge.icon}
                </div>
              </div>
              <h3 className={`font-bold text-center ${unlocked ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'}`}>
                {badge.title}
              </h3>
              
              {unlocked && (
                <div className="absolute -top-2 -right-2 bg-green-500 text-white rounded-full p-1 border-2 border-white dark:border-[var(--bg-primary)]">
                  <CheckIcon className="w-4 h-4" />
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

const CheckIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
  </svg>
);
