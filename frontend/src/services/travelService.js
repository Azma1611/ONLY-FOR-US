import api from './api';

const travelService = {
  getPlans: async () => {
    const response = await api.get('/travel');
    return response.data;
  },

  createPlan: async (planData) => {
    const response = await api.post('/travel', planData);
    return response.data;
  },

  updatePlan: async (id, updates) => {
    const response = await api.patch(`/travel/${id}`, updates);
    return response.data;
  },

  deletePlan: async (id) => {
    const response = await api.delete(`/travel/${id}`);
    return response.data;
  },
};

export default travelService;
