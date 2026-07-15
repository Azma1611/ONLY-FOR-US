import { useEffect, useState } from 'react';
import { Target, Plus } from 'lucide-react';
import useGoalStore from '@/store/goalStore';
import { motion } from 'framer-motion';

export default function GoalsWorkspace() {
  const { goals, fetchGoals, isLoading } = useGoalStore();
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchGoals();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-[var(--text-primary)]">Goals</h2>
        <button 
          onClick={() => setShowModal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors font-semibold shadow-sm"
        >
          <Plus className="w-5 h-5" />
          <span>New Goal</span>
        </button>
      </div>

      {isLoading ? (
        <div className="text-[var(--text-secondary)]">Loading goals...</div>
      ) : goals.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl">
          <Target className="w-12 h-12 text-blue-500 mb-4" />
          <h3 className="text-lg font-bold text-[var(--text-primary)]">No goals yet</h3>
          <p className="text-[var(--text-secondary)] mt-2">Set your first goal to start tracking progress.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {goals.map(goal => (
            <motion.div 
              key={goal._id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="font-bold text-lg text-[var(--text-primary)]">{goal.title}</h3>
                <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 rounded-full font-semibold uppercase tracking-wider">
                  {goal.category}
                </span>
              </div>
              <p className="text-[var(--text-secondary)] text-sm mb-6 line-clamp-2">
                {goal.description || 'No description provided.'}
              </p>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm font-semibold">
                  <span className="text-[var(--text-primary)]">Progress</span>
                  <span className="text-blue-500">{goal.progress}%</span>
                </div>
                <div className="w-full h-2 bg-[var(--border-color)] rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-500 rounded-full transition-all duration-500" 
                    style={{ width: `${goal.progress}%` }}
                  />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
