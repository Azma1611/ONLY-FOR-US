import api from './api';

const aiService = {
  getConversations: async () => {
    const response = await api.get('/ai/conversations');
    return response.data;
  },
  createConversation: async (title) => {
    const response = await api.post('/ai/conversations', { title });
    return response.data;
  },
  deleteConversation: async (id) => {
    const response = await api.delete(`/ai/conversations/${id}`);
    return response.data;
  },
  getMessages: async (conversationId) => {
    const response = await api.get(`/ai/conversations/${conversationId}/messages`);
    return response.data;
  },
  getSummary: async (type) => {
    const response = await api.post('/ai/summary', { type });
    return response.data;
  },
  // We don't use this directly for streaming, but keeping it if needed
};

export default aiService;
