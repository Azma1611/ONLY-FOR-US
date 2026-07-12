import api from './api';

const restaurantService = {
  getPlans: async () => {
    const response = await api.get('/restaurants');
    return response.data;
  },

  createPlan: async (planData) => {
    const response = await api.post('/restaurants', planData);
    return response.data;
  },

  updatePlan: async (id, updates) => {
    const response = await api.patch(`/restaurants/${id}`, updates);
    return response.data;
  },

  deletePlan: async (id) => {
    const response = await api.delete(`/restaurants/${id}`);
    return response.data;
  },
};

export default restaurantService;
