import { create } from 'zustand';
import axios from 'axios';
import useAuthStore from './authStore';
import toast from 'react-hot-toast';

export const useReminderStore = create((set, get) => ({
  reminders: [],
  loading: false,

  fetchReminders: async () => {
    try {
      set({ loading: true });
      const { data } = await axios.get('/api/reminders', {
        headers: { Authorization: `Bearer ${useAuthStore.getState().token}` }
      });
      set({ reminders: data.data, loading: false });
    } catch (error) {
      console.error(error);
      set({ loading: false });
    }
  },

  createReminder: async (reminderData) => {
    try {
      const { data } = await axios.post('/api/reminders', reminderData, {
        headers: { Authorization: `Bearer ${useAuthStore.getState().token}` }
      });
      set((state) => ({ reminders: [...state.reminders, data.data] }));
      toast.success('Reminder created');
      return true;
    } catch (error) {
      toast.error('Failed to create reminder');
      return false;
    }
  },

  updateReminder: async (id, reminderData) => {
    try {
      const { data } = await axios.put(`/api/reminders/${id}`, reminderData, {
        headers: { Authorization: `Bearer ${useAuthStore.getState().token}` }
      });
      set((state) => ({
        reminders: state.reminders.map(r => r._id === id ? data.data : r)
      }));
      toast.success('Reminder updated');
      return true;
    } catch (error) {
      toast.error('Failed to update reminder');
      return false;
    }
  },

  deleteReminder: async (id) => {
    try {
      await axios.delete(`/api/reminders/${id}`, {
        headers: { Authorization: `Bearer ${useAuthStore.getState().token}` }
      });
      set((state) => ({
        reminders: state.reminders.filter(r => r._id !== id)
      }));
      toast.success('Reminder deleted');
    } catch (error) {
      toast.error('Failed to delete reminder');
    }
  }
}));
