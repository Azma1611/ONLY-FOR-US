import { useEffect } from 'react';
import { Activity, Plus, CheckCircle, Circle } from 'lucide-react';
import useHabitStore from '@/store/habitStore';
import { format } from 'date-fns';
import { motion } from 'framer-motion';

export default function HabitsWorkspace() {
  const { habits, logs, fetchHabits, isLoading } = useHabitStore();
  const today = format(new Date(), 'yyyy-MM-dd');

  useEffect(() => {
    fetchHabits();
  }, []);

  const isCompletedToday = (habitId) => {
    return logs.some(log => log.habit === habitId && log.date === today && log.completed);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-[var(--text-primary)]">Habit Tracker</h2>
        <button 
          className="flex items-center space-x-2 px-4 py-2 bg-indigo-500 text-white rounded-xl hover:bg-indigo-600 transition-colors font-semibold shadow-sm"
        >
          <Plus className="w-5 h-5" />
          <span>New Habit</span>
        </button>
      </div>

      {isLoading ? (
        <div className="text-[var(--text-secondary)]">Loading habits...</div>
      ) : habits.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl">
          <Activity className="w-12 h-12 text-indigo-500 mb-4" />
          <h3 className="text-lg font-bold text-[var(--text-primary)]">No habits yet</h3>
          <p className="text-[var(--text-secondary)] mt-2">Start building healthy routines.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {habits.map(habit => {
            const completed = isCompletedToday(habit._id);
            return (
              <motion.div 
                key={habit._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl p-4 shadow-sm"
              >
                <div>
                  <h3 className="font-bold text-lg text-[var(--text-primary)]">{habit.title}</h3>
                  <div className="text-sm text-[var(--text-secondary)] font-semibold flex items-center space-x-4 mt-1">
                    <span>🔥 Streak: {habit.currentStreak}</span>
                    <span>🏆 Best: {habit.longestStreak}</span>
                  </div>
                </div>
                
                <button 
                  className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${
                    completed 
                      ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-400' 
                      : 'bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-secondary)] hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:text-indigo-500'
                  }`}
                >
                  {completed ? <CheckCircle className="w-6 h-6" /> : <Circle className="w-6 h-6" />}
                </button>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
