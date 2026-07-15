import api from './api';

export const uploadMedia = (formData, onUploadProgress) => {
  return api.post('/media/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress
  });
};

export const getMedia = (params) => {
  return api.get('/media', { params });
};

export const downloadMedia = (id) => {
  return api.get(`/media/download/${id}`);
};

export const toggleFavoriteMedia = (id) => {
  return api.patch(`/media/favorite/${id}`);
};

export const markMediaViewed = (id) => {
  return api.patch(`/media/viewed/${id}`);
};

export const deleteMedia = (id, type = 'me') => {
  return api.delete(`/media/${id}`, { params: { type } });
};

export default {
  uploadMedia,
  getMedia,
  downloadMedia,
  toggleFavoriteMedia,
  markMediaViewed,
  deleteMedia
};
