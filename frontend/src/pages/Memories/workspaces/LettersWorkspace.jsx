import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Edit3, Send, Trash2, Heart } from 'lucide-react';
import useMemoriesStore from '@/store/memoriesStore';
import useAuthStore from '@/store/authStore';
import Button from '@/components/ui/Button';
import memoriesService from '@/services/memoriesService';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

export default function LettersWorkspace() {
  const { loveLetters } = useMemoriesStore();
  const { user } = useAuthStore();
  const [isComposing, setIsComposing] = useState(false);
  const [activeLetter, setActiveLetter] = useState(null); // The letter currently being viewed/edited

  return (
    <div className="flex flex-col h-full max-w-5xl mx-auto space-y-6 pt-4">
      
      {/* Header Controls */}
      {!isComposing && !activeLetter && (
        <div className="flex justify-between items-center bg-white/5 p-4 rounded-2xl border border-white/10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-pink-500/20 rounded-xl text-pink-400">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Love Letters</h2>
              <p className="text-sm text-gray-400">Write something special for your partner.</p>
            </div>
          </div>
          <Button onClick={() => setIsComposing(true)} className="gap-2 bg-pink-600 hover:bg-pink-700">
            <Edit3 className="w-4 h-4" /> Compose
          </Button>
        </div>
      )}

      {/* Main Content Area */}
      <AnimatePresence mode="wait">
        
        {/* COMPOSER / EDITOR */}
        {isComposing && (
          <motion.div
            key="composer"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex-1 bg-white/5 backdrop-blur-md rounded-2xl border border-pink-500/20 overflow-hidden flex flex-col"
          >
            <Composer 
              onClose={() => setIsComposing(false)} 
              initialLetter={activeLetter} // Can pass if editing a draft
            />
          </motion.div>
        )}

        {/* LETTER VIEWER */}
        {!isComposing && activeLetter && (
          <motion.div
            key="viewer"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex-1 max-w-3xl mx-auto w-full"
          >
            <LetterViewer letter={activeLetter} onClose={() => setActiveLetter(null)} currentUserId={user?._id} />
          </motion.div>
        )}

        {/* LIST VIEW */}
        {!isComposing && !activeLetter && (
          <motion.div
            key="list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-8"
          >
            {loveLetters.length === 0 ? (
              <div className="col-span-full py-16 flex flex-col items-center justify-center text-center">
                <Heart className="w-12 h-12 text-pink-500/50 mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">Your mailbox is empty</h3>
                <p className="text-gray-400">Be the first to write a love letter to your partner.</p>
              </div>
            ) : (
              loveLetters.map(letter => (
                <div 
                  key={letter._id} 
                  onClick={() => setActiveLetter(letter)}
                  className="bg-gradient-to-br from-[#2a1a25] to-[#1a1c23] border border-pink-500/10 hover:border-pink-500/30 rounded-2xl p-6 cursor-pointer transition-all hover:scale-[1.02] shadow-lg flex flex-col h-64"
                >
                  <div className="flex justify-between items-start mb-4">
                    <Heart className="w-5 h-5 text-pink-500/50" />
                    <span className="text-xs text-gray-400 font-medium tracking-wider uppercase">
                      {format(new Date(letter.createdAt), 'MMM d, yyyy')}
                    </span>
                  </div>
                  <h3 className="text-xl font-serif text-white mb-2 line-clamp-2">{letter.title}</h3>
                  <p className="text-gray-400 text-sm line-clamp-3 mb-auto font-serif">
                    {letter.content}
                  </p>
                  <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between text-xs text-gray-500">
                    <span>{letter.authorId?._id === user?._id ? 'Sent by you' : `From ${letter.authorId?.name}`}</span>
                    {letter.isDraft && <span className="bg-yellow-500/20 text-yellow-500 px-2 py-0.5 rounded-full">Draft</span>}
                  </div>
                </div>
              ))
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}


function Composer({ onClose, initialLetter }) {
  const [title, setTitle] = useState(initialLetter?.title || '');
  const [content, setContent] = useState(initialLetter?.content || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSave = async (isDraft) => {
    if (!title || !content) return toast.error('Title and content are required');
    setIsSubmitting(true);
    try {
      const data = { title, content, isDraft, visibility: isDraft ? 'private' : 'shared' };
      if (initialLetter?._id) {
        await memoriesService.updateLoveLetter(initialLetter._id, data);
      } else {
        await memoriesService.createLoveLetter(data);
      }
      toast.success(isDraft ? 'Draft saved' : 'Letter sent!');
      onClose();
    } catch (err) {
      toast.error('Failed to save letter');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#faf7f2] dark:bg-[#1f1a1d] transition-colors relative">
      <div className="flex items-center justify-between p-4 border-b border-black/5 dark:border-white/5">
        <button onClick={onClose} className="text-gray-500 hover:text-gray-800 dark:hover:text-white px-3 py-1 rounded-md text-sm font-medium">Cancel</button>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => handleSave(true)} disabled={isSubmitting} className="text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 dark:bg-dark dark:border-white/10 dark:text-gray-300">Save Draft</Button>
          <Button onClick={() => handleSave(false)} disabled={isSubmitting} className="bg-pink-600 hover:bg-pink-700 text-white border-none gap-2">
            <Send className="w-4 h-4" /> Send Letter
          </Button>
        </div>
      </div>
      <div className="flex-1 p-8 md:p-12 overflow-y-auto font-serif">
        <input 
          type="text" 
          placeholder="A letter to my love..." 
          value={title}
          onChange={e => setTitle(e.target.value)}
          className="w-full text-3xl md:text-4xl bg-transparent border-none focus:outline-none focus:ring-0 text-gray-900 dark:text-white font-medium mb-6 placeholder:text-gray-400 dark:placeholder:text-gray-600"
        />
        <textarea 
          placeholder="Write your heart out here..." 
          value={content}
          onChange={e => setContent(e.target.value)}
          className="w-full h-full min-h-[400px] text-lg bg-transparent border-none focus:outline-none focus:ring-0 text-gray-800 dark:text-gray-300 resize-none leading-relaxed placeholder:text-gray-400 dark:placeholder:text-gray-600"
        />
      </div>
    </div>
  );
}

function LetterViewer({ letter, onClose, currentUserId }) {
  const isAuthor = letter.authorId?._id === currentUserId;

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this letter?')) return;
    try {
      await memoriesService.deleteLoveLetter(letter._id);
      toast.success('Letter deleted');
      onClose();
    } catch (err) {
      toast.error('Failed to delete letter');
    }
  };

  return (
    <div className="bg-[#faf7f2] dark:bg-[#1f1a1d] rounded-3xl shadow-2xl overflow-hidden min-h-[600px] flex flex-col relative">
      <div className="flex justify-between items-center p-4">
        <button onClick={onClose} className="text-gray-500 hover:text-gray-800 dark:hover:text-white font-medium px-4 py-2">
          Back
        </button>
        {isAuthor && (
          <button onClick={handleDelete} className="text-red-400 hover:text-red-600 p-2 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
            <Trash2 className="w-5 h-5" />
          </button>
        )}
      </div>

      <div className="flex-1 p-8 md:p-16 max-w-2xl mx-auto w-full">
        <div className="text-center mb-12">
          <Heart className="w-8 h-8 text-pink-500 mx-auto mb-6 opacity-80" />
          <h2 className="text-3xl md:text-5xl font-serif text-gray-900 dark:text-white mb-4 leading-tight">{letter.title}</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 font-medium tracking-widest uppercase">
            {format(new Date(letter.createdAt), 'MMMM do, yyyy')}
          </p>
        </div>
        
        <div className="prose prose-lg dark:prose-invert font-serif text-gray-800 dark:text-gray-300 leading-loose whitespace-pre-wrap">
          {letter.content}
        </div>
        
        <div className="mt-16 pt-8 border-t border-gray-200 dark:border-white/10 text-right">
          <p className="text-lg font-serif italic text-gray-600 dark:text-gray-400">
            With love,<br />
            <span className="font-semibold text-gray-900 dark:text-white">{letter.authorId?.name}</span>
          </p>
        </div>
      </div>
    </div>
  );
}
