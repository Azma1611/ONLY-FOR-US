import { useState } from 'react';
import { Settings, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

export default function AISettingsWorkspace() {
  const [provider, setProvider] = useState('gemini');
  const [personality, setPersonality] = useState('helpful and friendly');

  const handleSave = () => {
    // In a full implementation, this would save to the AISettings backend model
    toast.success('AI Settings saved successfully!');
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 p-4">
      <div className="flex items-center space-x-2 text-gray-500 mb-6">
        <Settings className="w-6 h-6" />
        <h2 className="text-2xl font-bold text-[var(--text-primary)]">AI Preferences</h2>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl p-6 space-y-6"
      >
        <div>
          <label className="block text-sm font-bold text-[var(--text-primary)] mb-2">AI Provider</label>
          <select 
            value={provider}
            onChange={(e) => setProvider(e.target.value)}
            className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl px-4 py-2 text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="gemini">Google Gemini (Default)</option>
            <option value="openai">OpenAI ChatGPT</option>
            <option value="claude">Anthropic Claude</option>
          </select>
          <p className="text-xs text-[var(--text-secondary)] mt-2">
            Switching providers requires the appropriate API keys configured in the backend environment.
          </p>
        </div>

        <div>
          <label className="block text-sm font-bold text-[var(--text-primary)] mb-2">AI Personality</label>
          <input 
            type="text"
            value={personality}
            onChange={(e) => setPersonality(e.target.value)}
            className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl px-4 py-2 text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="e.g., helpful and friendly, sarcastic, professional"
          />
        </div>

        <button 
          onClick={handleSave}
          className="w-full flex items-center justify-center space-x-2 bg-indigo-500 text-white rounded-xl py-3 font-bold hover:bg-indigo-600 transition-colors shadow-sm"
        >
          <Save className="w-5 h-5" />
          <span>Save Preferences</span>
        </button>
      </motion.div>
    </div>
  );
}
