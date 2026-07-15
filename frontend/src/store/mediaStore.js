import { create } from 'zustand';
import mediaService from '../services/mediaService';
import useSocketStore from './socketStore';

const useMediaStore = create((set, get) => ({
  media: [],
  isLoading: false,
  isUploading: false,
  uploadProgress: 0,
  error: null,
  pagination: null,

  fetchMedia: async (page = 1, limit = 50, favorite = false) => {
    if (page === 1) set({ isLoading: true, error: null });
    try {
      const response = await mediaService.getMedia({ page, limit, favorite });
      set((state) => ({
        media: page === 1 ? response.data.data : [...state.media, ...response.data.data],
        pagination: response.data.pagination,
        isLoading: false
      }));
    } catch (error) {
      set({ error: error.response?.data?.message || 'Failed to fetch media', isLoading: false });
    }
  },

  uploadImage: async (file, caption = '') => {
    set({ isUploading: true, uploadProgress: 0, error: null });
    try {
      const formData = new FormData();
      formData.append('file', file);
      if (caption) formData.append('caption', caption);

      const response = await mediaService.uploadMedia(formData, (progressEvent) => {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        set({ uploadProgress: percentCompleted });
      });

      const newMedia = response.data.data;
      
      // Update local state
      set((state) => ({
        media: [newMedia, ...state.media],
        isUploading: false,
        uploadProgress: 0
      }));

      // Emit to partner
      const socketStore = useSocketStore.getState();
      if (socketStore.socket) {
        socketStore.socket.emit('media_upload', newMedia);
      }

      return newMedia;
    } catch (error) {
      set({ error: error.response?.data?.message || 'Failed to upload image', isUploading: false, uploadProgress: 0 });
      throw error;
    }
  },

  deleteImage: async (id, type) => {
    try {
      await mediaService.deleteMedia(id, type);
      
      set((state) => ({
        media: state.media.filter(m => m._id !== id)
      }));

      const socketStore = useSocketStore.getState();
      if (socketStore.socket) {
        socketStore.socket.emit('media_delete', { mediaId: id, type });
      }
    } catch (error) {
      set({ error: error.response?.data?.message || 'Failed to delete media' });
    }
  },

  toggleFavorite: async (id) => {
    try {
      const response = await mediaService.toggleFavoriteMedia(id);
      const { isFavorited } = response.data;
      
      set((state) => ({
        media: state.media.map(m => 
          m._id === id 
            ? { 
                ...m, 
                favoritedBy: isFavorited 
                  ? [...m.favoritedBy, 'me'] 
                  : m.favoritedBy.filter(uid => uid !== 'me') 
              } 
            : m
        )
      }));

      const socketStore = useSocketStore.getState();
      if (socketStore.socket) {
        socketStore.socket.emit('media_favorite', { mediaId: id, isFavorited, userId: 'me' });
      }
    } catch (error) {
      set({ error: error.response?.data?.message || 'Failed to favorite media' });
    }
  },

  downloadImage: async (id, originalFileName, imageUrl) => {
    try {
      // Trigger API to update download counts
      await mediaService.downloadMedia(id);
      
      // Update local count
      set((state) => ({
        media: state.media.map(m => m._id === id ? { ...m, downloadedCount: m.downloadedCount + 1 } : m)
      }));

      // Perform actual file download via blob
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = originalFileName || `media-${id}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      const socketStore = useSocketStore.getState();
      if (socketStore.socket) {
        socketStore.socket.emit('media_download', { mediaId: id, userId: 'me' });
      }
    } catch (error) {
      console.error('Download failed', error);
    }
  },

  markViewed: async (id) => {
    try {
      await mediaService.markMediaViewed(id);
      set((state) => ({
        media: state.media.map(m => m._id === id ? { ...m, viewed: true } : m)
      }));

      const socketStore = useSocketStore.getState();
      if (socketStore.socket) {
        socketStore.socket.emit('media_seen', { mediaId: id, userId: 'me' });
      }
    } catch (error) {
      console.error('Failed to mark viewed', error);
    }
  },

  // Socket listener handlers (called from AppLayout or MediaPage)
  receiveMediaUpload: (media) => {
    set((state) => ({
      media: [media, ...state.media]
    }));
  },

  receiveMediaDelete: (mediaId) => {
    set((state) => ({
      media: state.media.filter(m => m._id !== mediaId)
    }));
  },
  
  receiveMediaFavorite: (mediaId, isFavorited, partnerId) => {
    set((state) => ({
      media: state.media.map(m => {
        if (m._id === mediaId) {
          const favoritedBy = isFavorited 
            ? [...m.favoritedBy, partnerId]
            : m.favoritedBy.filter(uid => uid !== partnerId);
          return { ...m, favoritedBy };
        }
        return m;
      })
    }));
  },
  
  receiveMediaDownload: (mediaId) => {
    set((state) => ({
      media: state.media.map(m => m._id === mediaId ? { ...m, downloadedCount: m.downloadedCount + 1 } : m)
    }));
  }
}));

export default useMediaStore;
