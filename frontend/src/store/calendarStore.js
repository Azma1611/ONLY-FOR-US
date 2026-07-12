import { create } from 'zustand';
import api from '@/services/api';

const useCalendarStore = create((set, get) => ({
  events: [],
  isLoading: false,
  categoryFilter: 'all',

  setCategoryFilter: (filter) => set({ categoryFilter: filter }),

  fetchEvents: async () => {
    set({ isLoading: true });
    try {
      const response = await api.get('/calendar');
      set({ events: response.data.data.events, isLoading: false });
    } catch (error) {
      console.error('Failed to fetch calendar events:', error);
      set({ isLoading: false });
    }
  },

  createEvent: async (eventData) => {
    try {
      const response = await api.post('/calendar', eventData);
      const newEvent = response.data.data.event;
      set((state) => ({ events: [...state.events, newEvent] }));
      return newEvent;
    } catch (error) {
      console.error('Failed to create calendar event:', error);
      throw error;
    }
  },

  updateEvent: async (id, updates) => {
    try {
      const response = await api.patch(`/calendar/${id}`, updates);
      const updated = response.data.data.event;
      set((state) => ({
        events: state.events.map((e) => (e._id === id ? updated : e)),
      }));
      return updated;
    } catch (error) {
      console.error('Failed to update calendar event:', error);
      throw error;
    }
  },

  deleteEvent: async (id) => {
    try {
      await api.delete(`/calendar/${id}`);
      set((state) => ({
        events: state.events.filter((e) => e._id !== id),
      }));
    } catch (error) {
      console.error('Failed to delete calendar event:', error);
      throw error;
    }
  },

  // Socket triggers
  addEventLocally: (event) => {
    const { events } = get();
    if (!events.some((e) => e._id === event._id)) {
      set({ events: [...events, event] });
    }
  },

  updateEventLocally: (event) => {
    set((state) => ({
      events: state.events.map((e) => (e._id === event._id ? event : e)),
    }));
  },

  removeEventLocally: (eventId) => {
    set((state) => ({
      events: state.events.filter((e) => e._id !== eventId),
    }));
  },
}));

export default useCalendarStore;
