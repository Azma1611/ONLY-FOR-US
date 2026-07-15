import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useMemoriesStore from '@/store/memoriesStore';
import { Upload, X, Heart, Image as ImageIcon, Video, Trash2 } from 'lucide-react';
import Button from '@/components/ui/Button';
import memoriesService from '@/services/memoriesService';
import toast from 'react-hot-toast';

export default function GalleryWorkspace() {
  const { memories, albums, fetchMemories } = useMemoriesStore();
  const [filter, setFilter] = useState('all'); // all, photos, videos, favorites
  const [isUploading, setIsUploading] = useState(false);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);

  // Filter memories
  const galleryItems = memories.filter(m => {
    if (m.mediaType === 'place' || m.mediaType === 'text') return false; // Exclude non-media
    if (filter === 'photos') return m.mediaType === 'photo';
    if (filter === 'videos') return m.mediaType === 'video';
    if (filter === 'favorites') return m.favorite === true;
    return true; // all
  });

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this memory?')) return;
    try {
      await memoriesService.deleteMemory(id);
      toast.success('Memory deleted');
    } catch (err) {
      toast.error('Failed to delete');
    }
  };

  const handleToggleFavorite = async (memory) => {
    try {
      await memoriesService.updateMemory(memory._id, { favorite: !memory.favorite });
    } catch (err) {
      toast.error('Failed to update favorite status');
    }
  };

  return (
    <div className="flex flex-col h-full space-y-6">
      
      {/* Controls */}
      <div className="flex flex-wrap gap-4 justify-between items-center bg-white/5 p-4 rounded-2xl border border-white/10">
        <div className="flex gap-2">
          {['all', 'photos', 'videos', 'favorites'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                filter === f 
                  ? 'bg-purple-500 text-white shadow-lg' 
                  : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-gray-200'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
        
        <Button onClick={() => setUploadModalOpen(true)} className="gap-2">
          <Upload className="w-4 h-4" /> Upload
        </Button>
      </div>

      {/* Masonry Gallery Grid */}
      {galleryItems.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
          <ImageIcon className="w-12 h-12 text-gray-500 mb-4" />
          <h2 className="text-xl font-medium text-white mb-2">No media found</h2>
          <p className="text-gray-400 max-w-md">Try changing your filters or upload some new photos.</p>
        </div>
      ) : (
        <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4 pb-8">
          <AnimatePresence>
            {galleryItems.map((item) => (
              <motion.div
                key={item._id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
                className="relative group rounded-2xl overflow-hidden bg-white/5 border border-white/10 break-inside-avoid"
              >
                {item.mediaType === 'video' ? (
                  <video src={item.mediaUrl} className="w-full object-cover" controls preload="metadata" />
                ) : (
                  <img src={item.mediaUrl} alt={item.title} className="w-full object-cover" loading="lazy" />
                )}
                
                {/* Overlay actions */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                  <h4 className="text-white font-medium truncate mb-2">{item.title}</h4>
                  
                  <div className="flex gap-2 justify-between">
                    <button 
                      onClick={() => handleToggleFavorite(item)}
                      className={`p-2 rounded-full backdrop-blur-md transition-colors ${item.favorite ? 'bg-pink-500/20 text-pink-400' : 'bg-white/10 text-white hover:bg-white/20'}`}
                    >
                      <Heart className="w-4 h-4" fill={item.favorite ? "currentColor" : "none"} />
                    </button>
                    <button 
                      onClick={() => handleDelete(item._id)}
                      className="p-2 rounded-full backdrop-blur-md bg-white/10 text-white hover:bg-red-500/80 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                {/* Type icon indicator */}
                <div className="absolute top-2 right-2 p-1.5 rounded-full bg-black/50 backdrop-blur-md text-white/80">
                  {item.mediaType === 'video' ? <Video className="w-3 h-3" /> : <ImageIcon className="w-3 h-3" />}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Upload Modal placeholder (can be expanded later) */}
      <AnimatePresence>
        {uploadModalOpen && (
          <UploadModal onClose={() => setUploadModalOpen(false)} isUploading={isUploading} setIsUploading={setIsUploading} albums={albums} />
        )}
      </AnimatePresence>
    </div>
  );
}

// Simple Upload Modal component
function UploadModal({ onClose, isUploading, setIsUploading, albums }) {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [albumId, setAlbumId] = useState('');
  const [mediaType, setMediaType] = useState('photo');

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file || !title) return toast.error('File and title are required');
    
    setIsUploading(true);
    try {
      const data = { title, mediaType, albumId: albumId || undefined };
      await memoriesService.createMemory(data, file);
      toast.success('Upload complete');
      onClose();
    } catch (err) {
      toast.error('Upload failed. Note: Cloudinary keys must be configured.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-dark/90 border border-white/10 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl"
      >
        <div className="flex items-center justify-between p-4 border-b border-white/5">
          <h3 className="text-lg font-medium text-white">Upload Media</h3>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full text-gray-400">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleUpload} className="p-4 space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Title</label>
            <input 
              type="text" 
              value={title} 
              onChange={e => setTitle(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
              placeholder="Summer Vacation 2026..."
              required
            />
          </div>
          
          <div>
            <label className="block text-sm text-gray-400 mb-1">Media Type</label>
            <select 
              value={mediaType} 
              onChange={e => setMediaType(e.target.value)}
              className="w-full bg-[#1a1c23] border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none"
            >
              <option value="photo">Photo</option>
              <option value="video">Video</option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Album (Optional)</label>
            <select 
              value={albumId} 
              onChange={e => setAlbumId(e.target.value)}
              className="w-full bg-[#1a1c23] border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none"
            >
              <option value="">No Album</option>
              {albums.map(a => <option key={a._id} value={a._id}>{a.title}</option>)}
            </select>
          </div>
          
          <div>
            <label className="block text-sm text-gray-400 mb-1">File</label>
            <input 
              type="file" 
              accept={mediaType === 'photo' ? "image/*" : "video/*"}
              onChange={e => setFile(e.target.files[0])}
              className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-500/20 file:text-purple-400 hover:file:bg-purple-500/30"
              required
            />
          </div>
          
          <Button type="submit" className="w-full mt-4" disabled={isUploading}>
            {isUploading ? 'Uploading...' : 'Upload'}
          </Button>
        </form>
      </motion.div>
    </div>
  );
}
