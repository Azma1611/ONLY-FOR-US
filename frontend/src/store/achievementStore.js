import { create } from 'zustand';
import achievementService from '../services/achievementService';

const useAchievementStore = create((set, get) => ({
  achievements: [],
  
  fetchAchievements: async () => {
    try {
      const { achievements } = await achievementService.getAchievements();
      set({ achievements });
    } catch (err) {
      console.error('Failed to fetch achievements', err);
    }
  },

  handleSocketUpdate: (update) => {
    const { action, data } = update;
    if (action === 'unlocked') {
      set(state => ({ achievements: [data, ...state.achievements] }));
      // Could also trigger a toast/confetti here
    }
  }
}));

export default useAchievementStore;
