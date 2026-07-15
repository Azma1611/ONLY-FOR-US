import React from 'react';
import { motion } from 'framer-motion';
import { Heart, Download, Trash2, Eye } from 'lucide-react';
import useAuthStore from '@/store/authStore';

const formatBytes = (bytes, decimals = 2) => {
  if (!+bytes) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
};

function ImageCard({ 
  media, 
  onFavorite, 
  onDownload, 
  onDelete, 
  onClick 
}) {
  const { user } = useAuthStore();
  
  const isFavorited = media.favoritedBy?.some(id => id === user?._id || id === 'me');
  const isOwn = media.senderId?._id === user?._id || media.senderId === user?._id;
  const uploaderName = isOwn ? 'You' : (media.senderId?.name || 'Partner');

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      layout
      className="group relative rounded-2xl overflow-hidden bg-[var(--bg-secondary)] border border-[var(--border-color)] shadow-sm hover:shadow-md transition-all cursor-pointer break-inside-avoid mb-4"
    >
      {/* Image container */}
      <div className="relative aspect-auto w-full overflow-hidden bg-slate-900/5 dark:bg-white/5 min-h-[150px]" onClick={() => onClick(media)}>
        <img 
          src={media.thumbnailUrl || media.imageUrl} 
          alt={media.caption || 'Shared media'} 
          className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        
        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-4">
          <div className="flex justify-end gap-2">
            <button 
              onClick={(e) => { e.stopPropagation(); onFavorite(media._id); }}
              className={`p-2 rounded-full backdrop-blur-md bg-white/20 hover:bg-white/40 transition-colors ${isFavorited ? 'text-pink-500' : 'text-white'}`}
            >
              <Heart className={`w-4 h-4 ${isFavorited ? 'fill-current' : ''}`} />
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); onDownload(media._id, media.originalFileName, media.imageUrl); }}
              className="p-2 rounded-full backdrop-blur-md bg-white/20 hover:bg-white/40 text-white transition-colors"
            >
              <Download className="w-4 h-4" />
            </button>
            {isOwn && (
              <button 
                onClick={(e) => { e.stopPropagation(); onDelete(media._id, 'everyone'); }}
                className="p-2 rounded-full backdrop-blur-md bg-white/20 hover:bg-red-500/80 text-white transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
          
          <div className="flex justify-center">
             <div className="p-2 rounded-full bg-white/20 backdrop-blur-md text-white transform scale-90 group-hover:scale-100 transition-transform">
               <Eye className="w-6 h-6" />
             </div>
          </div>
        </div>
      </div>

      {/* Metadata Bottom Bar */}
      <div className="p-3 bg-[var(--bg-secondary)] flex flex-col gap-1.5">
        {media.caption && (
          <p className="text-sm text-[var(--text-primary)] font-medium line-clamp-2">
            {media.caption}
          </p>
        )}
        <div className="flex items-center justify-between text-xs text-[var(--text-tertiary)]">
          <span className="font-medium">By {uploaderName}</span>
          <div className="flex gap-2">
            <span>{formatBytes(media.fileSize)}</span>
            <span>•</span>
            <span>{new Date(media.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default React.memo(ImageCard);
