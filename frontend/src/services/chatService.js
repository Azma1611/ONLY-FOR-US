import api from './api';

/**
 * Chat service wrapper for communication with /api/chat endpoints
 */
const chatService = {
  /**
   * Fetch paginated chat history.
   * Query params: limit, page, search
   */
  getMessages: async (params = {}) => {
    const response = await api.get('/chat/messages', { params });
    return response.data;
  },

  /**
   * Save a new message to the database
   */
  sendMessage: async (messageData) => {
    const response = await api.post('/chat/message', messageData);
    return response.data;
  },

  /**
   * Delete a message (supports type: 'me' or 'everyone')
   */
  deleteMessage: async (id, type = 'me') => {
    const response = await api.delete(`/chat/message/${id}`, { params: { type } });
    return response.data;
  },

  /**
   * Edit message text
   */
  editMessage: async (id, text) => {
    const response = await api.patch(`/chat/message/${id}`, { text });
    return response.data;
  },

  /**
   * Upload media or document to Cloudinary
   * formData must contain 'file' field
   */
  uploadFile: async (formData) => {
    const response = await api.post('/chat/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};

export default chatService;
