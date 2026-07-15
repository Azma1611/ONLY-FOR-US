import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import useMediaStore from '@/store/mediaStore';
import ImageCard from '../components/ImageCard';
import ImageViewer from '../components/ImageViewer';
import { Loader2, Image as ImageIcon } from 'lucide-react';

export default function GalleryWorkspace() {
  const { 
    media, 
    isLoading, 
    fetchMedia, 
    toggleFavorite, 
    downloadImage, 
    deleteImage, 
    markViewed 
  } = useMediaStore();
  
  const [selectedMedia, setSelectedMedia] = useState(null);

  useEffect(() => {
    fetchMedia(1, 50, false);
  }, []);

  const handleImageClick = (item) => {
    if (!item.viewed) {
      markViewed(item._id);
    }
    setSelectedMedia(item);
  };

  if (isLoading && media.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-[var(--text-tertiary)]">
        <Loader2 className="w-8 h-8 animate-spin mb-4 text-[var(--color-primary)]" />
        <p>Loading your shared gallery...</p>
      </div>
    );
  }

  if (media.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-[var(--text-tertiary)] opacity-60">
        <ImageIcon className="w-16 h-16 mb-4 opacity-50" />
        <p className="text-lg font-display font-medium">No media shared yet</p>
        <p className="text-sm">Upload some photos to start your shared gallery.</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* CSS columns for masonry layout (Pinterest style) */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4"
      >
        {media.map((item) => (
          <ImageCard 
            key={item._id}
            media={item}
            onFavorite={toggleFavorite}
            onDownload={downloadImage}
            onDelete={deleteImage}
            onClick={handleImageClick}
          />
        ))}
      </motion.div>

      <ImageViewer 
        isOpen={!!selectedMedia}
        media={selectedMedia}
        onClose={() => setSelectedMedia(null)}
        onFavorite={toggleFavorite}
        onDownload={downloadImage}
        onDelete={deleteImage}
      />
    </div>
  );
}
