import { create } from 'zustand';
import axios from 'axios';
import useAuthStore from './authStore';

export const useNotificationStore = create((set, get) => ({
  notifications: [],
  unreadCount: 0,
  loading: false,
  
  fetchNotifications: async () => {
    try {
      set({ loading: true });
      const { data } = await axios.get('/api/notifications', {
        headers: { Authorization: `Bearer ${useAuthStore.getState().token}` }
      });
      
      const unreadCount = data.data.filter(n => !n.read).length;
      set({ notifications: data.data, unreadCount, loading: false });
    } catch (error) {
      console.error(error);
      set({ loading: false });
    }
  },

  addNotification: (notification) => {
    set((state) => ({
      notifications: [notification, ...state.notifications],
      unreadCount: state.unreadCount + (notification.read ? 0 : 1)
    }));
  },

  markAsRead: async (id) => {
    try {
      await axios.patch(`/api/notifications/${id}/read`, {}, {
        headers: { Authorization: `Bearer ${useAuthStore.getState().token}` }
      });
      set((state) => ({
        notifications: state.notifications.map(n => n._id === id ? { ...n, read: true } : n),
        unreadCount: Math.max(0, state.unreadCount - 1)
      }));
    } catch (error) {
      console.error(error);
    }
  },

  markAllAsRead: async () => {
    try {
      await axios.patch('/api/notifications/read-all', {}, {
        headers: { Authorization: `Bearer ${useAuthStore.getState().token}` }
      });
      set((state) => ({
        notifications: state.notifications.map(n => ({ ...n, read: true })),
        unreadCount: 0
      }));
    } catch (error) {
      console.error(error);
    }
  },

  deleteNotification: async (id) => {
    try {
      await axios.delete(`/api/notifications/${id}`, {
        headers: { Authorization: `Bearer ${useAuthStore.getState().token}` }
      });
      set((state) => {
        const target = state.notifications.find(n => n._id === id);
        return {
          notifications: state.notifications.filter(n => n._id !== id),
          unreadCount: target && !target.read ? Math.max(0, state.unreadCount - 1) : state.unreadCount
        };
      });
    } catch (error) {
      console.error(error);
    }
  }
}));
