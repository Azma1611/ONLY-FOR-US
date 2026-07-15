import api from './api';

const goalService = {
  getGoals: async () => {
    const response = await api.get('/goals');
    return response.data;
  },
  createGoal: async (data) => {
    const response = await api.post('/goals', data);
    return response.data;
  },
  updateGoal: async (id, data) => {
    const response = await api.put(`/goals/${id}`, data);
    return response.data;
  },
  deleteGoal: async (id) => {
    const response = await api.delete(`/goals/${id}`);
    return response.data;
  }
};

export default goalService;
