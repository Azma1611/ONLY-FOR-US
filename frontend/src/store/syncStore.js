import { create } from 'zustand';
import axios from 'axios';
import useAuthStore from './authStore';

export const useSyncStore = create((set, get) => ({
  isOnline: navigator.onLine,
  pendingSyncs: 0,
  failedSyncs: 0,
  syncQueue: [],

  setOnlineStatus: (status) => set({ isOnline: status }),

  fetchSyncStatus: async () => {
    if (!get().isOnline) return;
    try {
      const { data } = await axios.get('/api/sync/status', {
        headers: { Authorization: `Bearer ${useAuthStore.getState().token}` }
      });
      set({ pendingSyncs: data.data.pendingCount, failedSyncs: data.data.failedCount });
    } catch (error) {
      console.error(error);
    }
  },

  queueAction: async (action, payload) => {
    const { isOnline, syncQueue } = get();
    
    if (!isOnline) {
      set({ syncQueue: [...syncQueue, { action, payload }] });
      return;
    }

    try {
      await axios.post('/api/sync/push', { queue: [{ action, payload }] }, {
        headers: { Authorization: `Bearer ${useAuthStore.getState().token}` }
      });
    } catch (error) {
      set({ syncQueue: [...syncQueue, { action, payload }] });
    }
  },

  processQueue: async () => {
    const { syncQueue, isOnline } = get();
    if (!isOnline || syncQueue.length === 0) return;

    try {
      await axios.post('/api/sync/push', { queue: syncQueue }, {
        headers: { Authorization: `Bearer ${useAuthStore.getState().token}` }
      });
      set({ syncQueue: [] });
    } catch (error) {
      console.error('Failed to process sync queue', error);
    }
  }
}));

// Listeners
window.addEventListener('online', () => {
  useSyncStore.getState().setOnlineStatus(true);
  useSyncStore.getState().processQueue();
});
window.addEventListener('offline', () => {
  useSyncStore.getState().setOnlineStatus(false);
});
