import api from './api';

const habitService = {
  getHabits: async () => {
    const response = await api.get('/habits');
    return response.data;
  },
  createHabit: async (data) => {
    const response = await api.post('/habits', data);
    return response.data;
  },
  updateHabit: async (id, data) => {
    const response = await api.put(`/habits/${id}`, data);
    return response.data;
  },
  deleteHabit: async (id) => {
    const response = await api.delete(`/habits/${id}`);
    return response.data;
  },
  logHabit: async (id, date, completed) => {
    const response = await api.post(`/habits/${id}/log`, { date, completed });
    return response.data;
  }
};

export default habitService;
