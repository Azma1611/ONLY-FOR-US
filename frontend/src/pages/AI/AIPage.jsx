import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, MessageSquare, Lightbulb, Settings } from 'lucide-react';
import AIChatWorkspace from './workspaces/AIChatWorkspace';
import AIInsightsWorkspace from './workspaces/AIInsightsWorkspace';
import AISettingsWorkspace from './workspaces/AISettingsWorkspace';

export default function AIPage() {
  const [activeTab, setActiveTab] = useState('chat');

  const tabs = [
    { id: 'chat', label: 'AI Chat', icon: <MessageSquare className="w-5 h-5" /> },
    { id: 'insights', label: 'Smart Insights', icon: <Lightbulb className="w-5 h-5" /> },
    { id: 'settings', label: 'Settings', icon: <Settings className="w-5 h-5" /> },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'chat': return <AIChatWorkspace />;
      case 'insights': return <AIInsightsWorkspace />;
      case 'settings': return <AISettingsWorkspace />;
      default: return <AIChatWorkspace />;
    }
  };

  return (
    <div className="flex flex-col h-full bg-[var(--bg-primary)]">
      {/* Header */}
      <div className="p-6 border-b border-[var(--border-color)]">
        <div className="flex items-center space-x-3 mb-1">
          <Sparkles className="w-8 h-8 text-indigo-500" />
          <h1 className="text-3xl font-black text-[var(--text-primary)] bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-500">
            AI Assistant
          </h1>
        </div>
        <p className="text-[var(--text-secondary)] mt-1">
          Your intelligent companion for relationship, finance, and productivity insights.
        </p>

        {/* Tabs */}
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
                  layoutId="ai-tab"
                  className="absolute inset-0 bg-indigo-500 rounded-xl"
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
            className="absolute inset-0 overflow-y-auto"
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
