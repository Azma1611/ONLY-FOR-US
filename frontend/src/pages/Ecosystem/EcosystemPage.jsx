import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, Activity, Heart, BookOpen, Briefcase, Trophy } from 'lucide-react';
import useAuthStore from '@/store/authStore';
import GoalsWorkspace from './workspaces/GoalsWorkspace';
import HabitsWorkspace from './workspaces/HabitsWorkspace';
import HealthWorkspace from './workspaces/HealthWorkspace';
import StudyWorkspace from './workspaces/StudyWorkspace';
import WorkWorkspace from './workspaces/WorkWorkspace';
import AchievementsWorkspace from './workspaces/AchievementsWorkspace';

export default function EcosystemPage() {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState('goals');

  const tabs = [
    { id: 'goals', label: 'Goals', icon: <Target className="w-5 h-5" /> },
    { id: 'habits', label: 'Habits', icon: <Activity className="w-5 h-5" /> },
    { id: 'health', label: 'Health', icon: <Heart className="w-5 h-5" /> },
    { id: 'study', label: 'Study', icon: <BookOpen className="w-5 h-5" /> },
    { id: 'work', label: 'Work', icon: <Briefcase className="w-5 h-5" /> },
    { id: 'achievements', label: 'Awards', icon: <Trophy className="w-5 h-5" /> },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'goals': return <GoalsWorkspace />;
      case 'habits': return <HabitsWorkspace />;
      case 'health': return <HealthWorkspace />;
      case 'study': return <StudyWorkspace />;
      case 'work': return <WorkWorkspace />;
      case 'achievements': return <AchievementsWorkspace />;
      default: return <GoalsWorkspace />;
    }
  };

  return (
    <div className="flex flex-col h-full bg-[var(--bg-primary)]">
      {/* Header */}
      <div className="p-6 border-b border-[var(--border-color)]">
        <h1 className="text-3xl font-black text-[var(--text-primary)]">Ecosystem</h1>
        <p className="text-[var(--text-secondary)] mt-1">
          Your complete productivity and wellness hub.
        </p>

        {/* Custom Tabs */}
        <div className="flex items-center space-x-2 mt-6 overflow-x-auto scrollbar-hide pb-2">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-semibold transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'text-white'
                  : 'text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)]'
              }`}
            >
              {activeTab === tab.id && (
                <motion.div
                  layoutId="ecosystem-tab"
                  className="absolute inset-0 bg-blue-500 rounded-xl"
                  initial={false}
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                />
              )}
              <span className="relative z-10 flex items-center space-x-2">
                {tab.icon}
                <span>{tab.label}</span>
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-hidden relative bg-[var(--bg-primary)]">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 overflow-y-auto p-6"
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
