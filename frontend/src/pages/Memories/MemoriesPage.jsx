import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Image as ImageIcon, Heart, Flag } from 'lucide-react';
import useMemoriesStore from '@/store/memoriesStore';
import TimelineWorkspace from './workspaces/TimelineWorkspace';
import GalleryWorkspace from './workspaces/GalleryWorkspace';
import LettersWorkspace from './workspaces/LettersWorkspace';
import MilestonesWorkspace from './workspaces/MilestonesWorkspace';

const TABS = [
  { id: 'timeline', label: 'Timeline', icon: Clock },
  { id: 'gallery', label: 'Gallery', icon: ImageIcon },
  { id: 'letters', label: 'Love Letters', icon: Heart },
  { id: 'milestones', label: 'Milestones', icon: Flag },
];

export default function MemoriesPage() {
  const [activeTab, setActiveTab] = useState('timeline');
  const { fetchMemories, fetchAlbums, fetchLoveLetters, fetchMilestones } = useMemoriesStore();

  useEffect(() => {
    fetchMemories();
    fetchAlbums();
    fetchLoveLetters();
    fetchMilestones();
  }, [fetchMemories, fetchAlbums, fetchLoveLetters, fetchMilestones]);

  return (
    <div className="h-full flex flex-col pt-16 md:pt-0">
      {/* Header & Navigation */}
      <div className="px-4 md:px-8 pt-6 pb-4 shrink-0 bg-dark/50 backdrop-blur-md sticky top-0 z-20 border-b border-white/5">
        <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-4">
          Memories & Scrapbook
        </h1>
        
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none snap-x">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 whitespace-nowrap snap-start shrink-0 ${
                  isActive 
                    ? 'bg-purple-500/20 text-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.1)] border border-purple-500/20'
                    : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-gray-200 border border-transparent'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'animate-pulse' : ''}`} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6 custom-scrollbar relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10, filter: 'blur(5px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -10, filter: 'blur(5px)' }}
            transition={{ duration: 0.3 }}
            className="h-full"
          >
            {activeTab === 'timeline' && <TimelineWorkspace />}
            {activeTab === 'gallery' && <GalleryWorkspace />}
            {activeTab === 'letters' && <LettersWorkspace />}
            {activeTab === 'milestones' && <MilestonesWorkspace />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
