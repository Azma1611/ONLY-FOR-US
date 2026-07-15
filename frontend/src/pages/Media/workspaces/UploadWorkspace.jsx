import React, { useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UploadCloud, X, FileImage, CheckCircle } from 'lucide-react';
import Button from '@/components/ui/Button';
import useMediaStore from '@/store/mediaStore';
import { useNotificationStore } from '@/store/notificationStore';

export default function UploadWorkspace({ switchToGallery }) {
  const { uploadImage, isUploading, uploadProgress } = useMediaStore();
  const { addNotification } = useNotificationStore();
  
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [caption, setCaption] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragging(true);
    } else if (e.type === 'dragleave') {
      setIsDragging(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file) => {
    if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
      addNotification({ type: 'error', message: 'Only image and video files are supported.' });
      return;
    }
    if (file.size > 50 * 1024 * 1024) {
      addNotification({ type: 'error', message: 'File is too large (max 50MB).' });
      return;
    }
    
    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  const clearSelection = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setCaption('');
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    try {
      await uploadImage(selectedFile, caption);
      addNotification({ type: 'success', message: 'Media uploaded successfully!' });
      clearSelection();
      if (switchToGallery) switchToGallery();
    } catch (err) {
      addNotification({ type: 'error', message: 'Upload failed. Please try again.' });
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8">
      
      {!selectedFile ? (
        <div 
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-3xl p-12 flex flex-col items-center justify-center text-center transition-colors ${
            isDragging ? 'border-[var(--color-primary)] bg-[var(--color-primary-50)]' : 'border-[var(--border-color)] bg-[var(--bg-secondary)]'
          }`}
        >
          <UploadCloud className={`w-16 h-16 mb-4 ${isDragging ? 'text-[var(--color-primary)]' : 'text-[var(--text-tertiary)]'}`} />
          <h3 className="text-lg font-display font-bold text-[var(--text-primary)] mb-2">
            Drag & Drop Media Here
          </h3>
          <p className="text-sm text-[var(--text-tertiary)] mb-6">
            Supports JPEG, PNG, WEBP, GIF and MP4 up to 50MB.
          </p>
          
          <label className="cursor-pointer">
            <span className="px-6 py-3 rounded-xl bg-[var(--color-primary)] text-white font-medium hover:opacity-90 transition-opacity">
              Browse Files
            </span>
            <input type="file" className="hidden" accept="image/*,video/*" onChange={handleChange} />
          </label>
        </div>
      ) : (
        <AnimatePresence>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-3xl p-6 shadow-soft"
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-display font-bold text-lg flex items-center gap-2">
                <FileImage className="text-[var(--color-primary)]" />
                Upload Preview
              </h3>
              <button onClick={clearSelection} className="p-2 bg-[var(--bg-tertiary)] hover:bg-black/10 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="rounded-2xl overflow-hidden bg-black/5 aspect-video flex items-center justify-center mb-6">
              {selectedFile.type.startsWith('image/') ? (
                <img src={previewUrl} alt="Preview" className="max-h-[400px] object-contain" />
              ) : (
                <video src={previewUrl} controls className="max-h-[400px] object-contain" />
              )}
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Add a caption (optional)</label>
                <textarea 
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Where was this taken?"
                  className="w-full px-4 py-3 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl focus:ring-2 focus:ring-[var(--color-primary)] outline-none resize-none"
                  rows="3"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Button variant="secondary" onClick={clearSelection} disabled={isUploading}>
                  Cancel
                </Button>
                <Button onClick={handleUpload} disabled={isUploading} className="min-w-[120px]">
                  {isUploading ? (
                    <span className="flex items-center gap-2">
                      <motion.div 
                        className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin"
                      />
                      {uploadProgress}%
                    </span>
                  ) : (
                    'Upload'
                  )}
                </Button>
              </div>

              {isUploading && (
                <div className="w-full bg-[var(--bg-tertiary)] h-1.5 rounded-full overflow-hidden mt-2">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${uploadProgress}%` }}
                    className="h-full bg-[var(--color-primary)]"
                  />
                </div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}
