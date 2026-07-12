import api from './api';

const movieService = {
  getPlans: async () => {
    const response = await api.get('/movies');
    return response.data;
  },

  createPlan: async (planData) => {
    const response = await api.post('/movies', planData);
    return response.data;
  },

  updatePlan: async (id, updates) => {
    const response = await api.patch(`/movies/${id}`, updates);
    return response.data;
  },

  deletePlan: async (id) => {
    const response = await api.delete(`/movies/${id}`);
    return response.data;
  },
};

export default movieService;
