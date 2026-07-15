import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, Heart, Info, Trash2 } from 'lucide-react';
import useAuthStore from '@/store/authStore';

const formatBytes = (bytes, decimals = 2) => {
  if (!+bytes) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
};

export default function ImageViewer({ 
  media, 
  isOpen, 
  onClose, 
  onFavorite, 
  onDownload,
  onDelete 
}) {
  const { user } = useAuthStore();

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !media) return null;

  const isFavorited = media.favoritedBy?.some(id => id === user?._id || id === 'me');
  const isOwn = media.senderId?._id === user?._id || media.senderId === user?._id;
  const uploaderName = isOwn ? 'You' : (media.senderId?.name || 'Partner');

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 md:p-8"
        onClick={onClose}
      >
        {/* Top toolbar */}
        <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-start bg-gradient-to-b from-black/60 to-transparent z-10" onClick={e => e.stopPropagation()}>
          <div className="text-white text-sm">
            <p className="font-bold">{uploaderName}</p>
            <p className="opacity-70">{new Date(media.createdAt).toLocaleString()}</p>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={() => onFavorite(media._id)}
              className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
              title="Favorite"
            >
              <Heart className={`w-5 h-5 ${isFavorited ? 'fill-pink-500 text-pink-500' : ''}`} />
            </button>
            <button 
              onClick={() => onDownload(media._id, media.originalFileName, media.imageUrl)}
              className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
              title="Download"
            >
              <Download className="w-5 h-5" />
            </button>
            {isOwn && (
              <button 
                onClick={() => {
                  onDelete(media._id, 'everyone');
                  onClose();
                }}
                className="p-2.5 rounded-full bg-white/10 hover:bg-red-500/80 text-white transition-colors"
                title="Delete"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            )}
            <button 
              onClick={onClose}
              className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors ml-4"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Image container */}
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative max-w-full max-h-full flex items-center justify-center"
          onClick={e => e.stopPropagation()}
        >
          <img 
            src={media.imageUrl} 
            alt={media.caption || 'Expanded media'} 
            className="max-w-full max-h-[85vh] object-contain rounded-md shadow-2xl"
          />
        </motion.div>

        {/* Bottom Info Bar */}
        <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent flex justify-between items-end text-white z-10" onClick={e => e.stopPropagation()}>
          <div className="max-w-3xl">
            {media.caption && (
              <p className="text-lg font-medium mb-2">{media.caption}</p>
            )}
            <div className="flex items-center gap-4 text-xs opacity-60">
              <span className="flex items-center gap-1"><Info className="w-3.5 h-3.5"/> {media.width} x {media.height}</span>
              <span>{formatBytes(media.fileSize)}</span>
              <span className="uppercase">{media.mimeType.split('/')[1] || 'IMG'}</span>
              <span>Downloads: {media.downloadedCount || 0}</span>
            </div>
          </div>
        </div>

      </motion.div>
    </AnimatePresence>
  );
}
