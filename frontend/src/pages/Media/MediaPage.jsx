import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Image as ImageIcon, UploadCloud, Heart, Folders } from 'lucide-react';
import GalleryWorkspace from './workspaces/GalleryWorkspace';
import UploadWorkspace from './workspaces/UploadWorkspace';

export default function MediaPage() {
  const [activeTab, setActiveTab] = useState('gallery');

  const tabs = [
    { id: 'gallery', label: 'Gallery', icon: ImageIcon },
    { id: 'upload', label: 'Upload', icon: UploadCloud },
    { id: 'favorites', label: 'Favorites', icon: Heart },
    { id: 'albums', label: 'Albums', icon: Folders },
  ];

  return (
    <div className="h-full flex flex-col pt-6 pb-24 lg:pb-8 px-4 lg:px-8 max-w-7xl mx-auto w-full">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl lg:text-3xl font-display font-bold text-[var(--text-primary)]">
            Shared Media
          </h1>
          <p className="text-sm text-[var(--text-tertiary)] mt-1">
            Your private collection of photos and videos.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex bg-[var(--bg-secondary)] p-1 rounded-2xl border border-[var(--border-color)] shadow-sm self-stretch md:self-auto overflow-x-auto no-scrollbar">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 flex-1 md:flex-none whitespace-nowrap ${
                  isActive ? 'text-white shadow-md' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="mediaTabIndicator"
                    className="absolute inset-0 bg-[var(--color-primary)] rounded-xl"
                    initial={false}
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-2">
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto no-scrollbar relative">
        <AnimatePresence mode="wait">
          {activeTab === 'gallery' && (
            <motion.div 
              key="gallery"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="h-full"
            >
              <GalleryWorkspace />
            </motion.div>
          )}

          {activeTab === 'upload' && (
            <motion.div 
              key="upload"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <UploadWorkspace switchToGallery={() => setActiveTab('gallery')} />
            </motion.div>
          )}

          {activeTab === 'favorites' && (
            <motion.div 
              key="favorites"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex flex-col items-center justify-center h-64 text-[var(--text-tertiary)] opacity-60"
            >
              <Heart className="w-16 h-16 mb-4 opacity-50" />
              <p className="text-lg font-display font-medium">Coming soon</p>
              <p className="text-sm">Your favorite memories will appear here.</p>
            </motion.div>
          )}

          {activeTab === 'albums' && (
            <motion.div 
              key="albums"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex flex-col items-center justify-center h-64 text-[var(--text-tertiary)] opacity-60"
            >
              <Folders className="w-16 h-16 mb-4 opacity-50" />
              <p className="text-lg font-display font-medium">Coming soon</p>
              <p className="text-sm">Smart albums grouped by month and year.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

    </div>
  );
}
