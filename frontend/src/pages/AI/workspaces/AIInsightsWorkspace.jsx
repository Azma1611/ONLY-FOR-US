import { useState } from 'react';
import { Sun, Moon, Sparkles, Loader2 } from 'lucide-react';
import aiService from '@/services/aiService';
import toast from 'react-hot-toast';
import ReactMarkdown from 'react-markdown';
import { motion } from 'framer-motion';

export default function AIInsightsWorkspace() {
  const [morningSummary, setMorningSummary] = useState(null);
  const [nightSummary, setNightSummary] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchSummary = async (type) => {
    try {
      setIsLoading(true);
      const { summary } = await aiService.getSummary(type);
      if (type === 'morning') setMorningSummary(summary);
      else setNightSummary(summary);
    } catch (err) {
      toast.error(`Failed to generate ${type} summary`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 p-4">
      <div className="flex items-center space-x-2 text-indigo-500 mb-6">
        <Sparkles className="w-6 h-6" />
        <h2 className="text-2xl font-bold text-[var(--text-primary)]">Daily Summaries</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Morning Summary */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl p-6 shadow-sm"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3 text-orange-500">
              <Sun className="w-6 h-6" />
              <h3 className="font-bold text-lg text-[var(--text-primary)]">Morning Brief</h3>
            </div>
            {!morningSummary && (
              <button 
                onClick={() => fetchSummary('morning')}
                disabled={isLoading}
                className="px-3 py-1 bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400 rounded-lg text-sm font-semibold hover:bg-orange-200 transition-colors"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Generate'}
              </button>
            )}
          </div>
          
          <div className="prose prose-sm dark:prose-invert text-[var(--text-secondary)]">
            {morningSummary ? (
              <ReactMarkdown>{morningSummary.content}</ReactMarkdown>
            ) : (
              <p>Start your day with an AI-generated brief of your goals, habits, and agenda.</p>
            )}
          </div>
        </motion.div>

        {/* Night Summary */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl p-6 shadow-sm"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3 text-indigo-500">
              <Moon className="w-6 h-6" />
              <h3 className="font-bold text-lg text-[var(--text-primary)]">Night Reflection</h3>
            </div>
            {!nightSummary && (
              <button 
                onClick={() => fetchSummary('night')}
                disabled={isLoading}
                className="px-3 py-1 bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400 rounded-lg text-sm font-semibold hover:bg-indigo-200 transition-colors"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Generate'}
              </button>
            )}
          </div>
          
          <div className="prose prose-sm dark:prose-invert text-[var(--text-secondary)]">
            {nightSummary ? (
              <ReactMarkdown>{nightSummary.content}</ReactMarkdown>
            ) : (
              <p>End your day with a reflection on what you accomplished and what you can improve.</p>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
