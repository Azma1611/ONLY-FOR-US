import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flag, Plus, Trash2, Calendar, Star } from 'lucide-react';
import useMemoriesStore from '@/store/memoriesStore';
import Button from '@/components/ui/Button';
import memoriesService from '@/services/memoriesService';
import toast from 'react-hot-toast';
import { format, formatDistanceToNow } from 'date-fns';

const MILESTONE_TYPES = [
  { id: 'first_meeting', label: 'First Meeting', icon: Star, color: 'text-yellow-400', bg: 'bg-yellow-400/20' },
  { id: 'first_date', label: 'First Date', icon: Heart, color: 'text-pink-400', bg: 'bg-pink-400/20' },
  { id: 'engagement', label: 'Engagement', icon: Star, color: 'text-purple-400', bg: 'bg-purple-400/20' },
  { id: 'wedding', label: 'Wedding', icon: Star, color: 'text-white', bg: 'bg-white/20' },
  { id: 'anniversary', label: 'Anniversary', icon: Flag, color: 'text-blue-400', bg: 'bg-blue-400/20' },
  { id: 'custom', label: 'Custom Milestone', icon: Flag, color: 'text-green-400', bg: 'bg-green-400/20' }
];

// Reusable dummy icon if not found
const Heart = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>

export default function MilestonesWorkspace() {
  const { milestones } = useMemoriesStore();
  const [isAdding, setIsAdding] = useState(false);
  
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [type, setType] = useState('custom');

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!title || !date) return toast.error('Title and date are required');
    try {
      await memoriesService.createMilestone({ title, date, type });
      toast.success('Milestone added!');
      setIsAdding(false);
      setTitle('');
      setDate('');
    } catch (err) {
      toast.error('Failed to add milestone');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this milestone?')) return;
    try {
      await memoriesService.deleteMilestone(id);
      toast.success('Deleted');
    } catch (err) {
      toast.error('Failed to delete');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center bg-gradient-to-r from-purple-500/10 to-pink-500/10 p-6 rounded-3xl border border-white/5">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">Relationship Milestones</h2>
          <p className="text-gray-400">Track the moments that changed your lives forever.</p>
        </div>
        <Button onClick={() => setIsAdding(!isAdding)} className="gap-2 rounded-full">
          {isAdding ? <Flag className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {isAdding ? 'Cancel' : 'Add Milestone'}
        </Button>
      </div>

      <AnimatePresence>
        {isAdding && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={handleAdd}
            className="bg-white/5 p-6 rounded-3xl border border-white/10 space-y-4 overflow-hidden"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Title</label>
                <input 
                  type="text" 
                  value={title} 
                  onChange={e => setTitle(e.target.value)}
                  className="w-full bg-[#1a1c23] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500"
                  placeholder="The day we met..."
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Date</label>
                <input 
                  type="date" 
                  value={date} 
                  onChange={e => setDate(e.target.value)}
                  className="w-full bg-[#1a1c23] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500"
                  required
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm text-gray-400 mb-2">Type</label>
                <div className="flex flex-wrap gap-2">
                  {MILESTONE_TYPES.map(t => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setType(t.id)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                        type === t.id 
                          ? 'bg-purple-500 text-white shadow-lg border border-purple-400/50' 
                          : 'bg-[#1a1c23] text-gray-400 border border-white/10 hover:border-white/20'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex justify-end pt-2">
              <Button type="submit">Save Milestone</Button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <AnimatePresence>
          {milestones.map((milestone, index) => {
            const config = MILESTONE_TYPES.find(t => t.id === milestone.type) || MILESTONE_TYPES[5];
            const Icon = config.icon;
            const mDate = new Date(milestone.date);
            const isFuture = mDate > new Date();

            return (
              <motion.div
                key={milestone._id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white/5 border border-white/10 rounded-3xl p-6 relative group overflow-hidden"
              >
                {/* Decorative background blur */}
                <div className={`absolute -right-10 -top-10 w-40 h-40 rounded-full blur-3xl opacity-20 ${config.bg}`}></div>
                
                <div className="flex justify-between items-start relative z-10">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${config.bg} ${config.color} shadow-lg`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  
                  <button 
                    onClick={() => handleDelete(milestone._id)}
                    className="p-2 text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity bg-white/5 hover:bg-white/10 rounded-full"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                
                <h3 className="text-xl font-bold text-white mb-1 relative z-10">{milestone.title}</h3>
                
                <div className="flex items-center gap-2 text-gray-400 text-sm mt-4 relative z-10 bg-black/20 self-start inline-flex px-3 py-1.5 rounded-lg border border-white/5">
                  <Calendar className="w-4 h-4" />
                  <span>{format(mDate, 'MMMM do, yyyy')}</span>
                </div>
                
                <p className="text-purple-400 text-sm font-medium mt-4 relative z-10">
                  {isFuture 
                    ? `Coming up in ${formatDistanceToNow(mDate)}` 
                    : `${formatDistanceToNow(mDate)} ago`
                  }
                </p>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
      
      {milestones.length === 0 && !isAdding && (
        <div className="text-center py-16">
          <Flag className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl text-gray-300 font-medium">No milestones yet</h3>
          <p className="text-gray-500 mt-2">Add the important dates to celebrate your journey together.</p>
        </div>
      )}
    </div>
  );
}
