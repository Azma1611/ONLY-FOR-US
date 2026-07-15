import { create } from 'zustand';
import habitService from '../services/habitService';
import toast from 'react-hot-toast';

const useHabitStore = create((set, get) => ({
  habits: [],
  logs: [],
  isLoading: false,

  fetchHabits: async () => {
    set({ isLoading: true });
    try {
      const { habits, logs } = await habitService.getHabits();
      set({ habits, logs, isLoading: false });
    } catch (err) {
      toast.error('Failed to fetch habits');
      set({ isLoading: false });
    }
  },

  handleSocketUpdate: (update) => {
    const { type, action, data } = update;
    if (type === 'habit') {
      if (action === 'created') set(state => ({ habits: [data, ...state.habits] }));
      if (action === 'updated') set(state => ({ habits: state.habits.map(h => h._id === data._id ? data : h) }));
      if (action === 'deleted') set(state => ({ habits: state.habits.filter(h => h._id !== data._id) }));
    }
    if (type === 'habitLog') {
      if (action === 'updated') {
        set(state => {
          const existingIndex = state.logs.findIndex(l => l._id === data._id);
          if (existingIndex >= 0) {
            const newLogs = [...state.logs];
            newLogs[existingIndex] = data;
            return { logs: newLogs };
          }
          return { logs: [...state.logs, data] };
        });
      }
    }
  }
}));

export default useHabitStore;
