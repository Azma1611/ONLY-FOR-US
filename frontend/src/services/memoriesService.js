import api from './api';

const memoriesService = {
  // Memories
  getMemories: async (params) => {
    const response = await api.get('/memories', { params });
    return response.data;
  },

  createMemory: async (data, file) => {
    // If there's a file, we must use FormData
    if (file) {
      const formData = new FormData();
      Object.keys(data).forEach(key => {
        formData.append(key, data[key]);
      });
      formData.append('mediaFile', file);
      
      const response = await api.post('/memories', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data;
    } else {
      const response = await api.post('/memories', data);
      return response.data;
    }
  },

  updateMemory: async (id, data) => {
    const response = await api.put(`/memories/${id}`, data);
    return response.data;
  },

  deleteMemory: async (id) => {
    const response = await api.delete(`/memories/${id}`);
    return response.data;
  },

  // Albums
  getAlbums: async () => {
    const response = await api.get('/memories/albums');
    return response.data;
  },

  createAlbum: async (data) => {
    const response = await api.post('/memories/albums', data);
    return response.data;
  },

  deleteAlbum: async (id) => {
    const response = await api.delete(`/memories/albums/${id}`);
    return response.data;
  },

  // Love Letters
  getLoveLetters: async () => {
    const response = await api.get('/memories/letters');
    return response.data;
  },

  createLoveLetter: async (data) => {
    const response = await api.post('/memories/letters', data);
    return response.data;
  },

  updateLoveLetter: async (id, data) => {
    const response = await api.put(`/memories/letters/${id}`, data);
    return response.data;
  },

  deleteLoveLetter: async (id) => {
    const response = await api.delete(`/memories/letters/${id}`);
    return response.data;
  },

  // Milestones
  getMilestones: async () => {
    const response = await api.get('/memories/milestones');
    return response.data;
  },

  createMilestone: async (data) => {
    const response = await api.post('/memories/milestones', data);
    return response.data;
  },

  deleteMilestone: async (id) => {
    const response = await api.delete(`/memories/milestones/${id}`);
    return response.data;
  },
};

export default memoriesService;
