import api from './api';

const shoppingService = {
  getItems: async () => {
    const response = await api.get('/shopping');
    return response.data;
  },

  addItem: async (itemData) => {
    const response = await api.post('/shopping', itemData);
    return response.data;
  },

  updateItem: async (id, updates) => {
    const response = await api.patch(`/shopping/${id}`, updates);
    return response.data;
  },

  deleteItem: async (id) => {
    const response = await api.delete(`/shopping/${id}`);
    return response.data;
  },
};

export default shoppingService;
