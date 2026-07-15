import { create } from 'zustand';
import goalService from '../services/goalService';
import toast from 'react-hot-toast';

const useGoalStore = create((set, get) => ({
  goals: [],
  isLoading: false,

  fetchGoals: async () => {
    set({ isLoading: true });
    try {
      const { goals } = await goalService.getGoals();
      set({ goals, isLoading: false });
    } catch (err) {
      toast.error('Failed to fetch goals');
      set({ isLoading: false });
    }
  },

  handleSocketUpdate: (update) => {
    const { action, data } = update;
    if (action === 'created') {
      set(state => ({ goals: [data, ...state.goals] }));
    } else if (action === 'updated') {
      set(state => ({ goals: state.goals.map(g => g._id === data._id ? data : g) }));
    } else if (action === 'deleted') {
      set(state => ({ goals: state.goals.filter(g => g._id !== data._id) }));
    }
  }
}));

export default useGoalStore;
