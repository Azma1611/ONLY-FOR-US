import api from './api';

const healthService = {
  getLogs: async () => {
    const response = await api.get('/health/logs');
    return response.data;
  },
  createLog: async (data) => {
    const response = await api.post('/health/logs', data);
    return response.data;
  },
  deleteLog: async (id) => {
    const response = await api.delete(`/health/logs/${id}`);
    return response.data;
  },
  getMedicines: async () => {
    const response = await api.get('/health/medicine');
    return response.data;
  },
  createMedicine: async (data) => {
    const response = await api.post('/health/medicine', data);
    return response.data;
  },
  updateMedicine: async (id, data) => {
    const response = await api.put(`/health/medicine/${id}`, data);
    return response.data;
  },
  deleteMedicine: async (id) => {
    const response = await api.delete(`/health/medicine/${id}`);
    return response.data;
  }
};

export default healthService;
