import api from './api';

const achievementService = {
  getAchievements: async () => {
    const response = await api.get('/achievements');
    return response.data;
  },
  unlockAchievement: async (badgeId) => {
    const response = await api.post('/achievements', { badgeId });
    return response.data;
  }
};

export default achievementService;
