import api from './api';

const productivityService = {
  getItems: async () => {
    const response = await api.get('/productivity');
    return response.data;
  },
  createItem: async (data) => {
    const response = await api.post('/productivity', data);
    return response.data;
  },
  updateItem: async (id, data) => {
    const response = await api.put(`/productivity/${id}`, data);
    return response.data;
  },
  deleteItem: async (id) => {
    const response = await api.delete(`/productivity/${id}`);
    return response.data;
  }
};

export default productivityService;
