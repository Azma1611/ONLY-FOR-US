import api from './api';

const reminderService = {
  getReminders: async () => {
    const response = await api.get('/reminders');
    return response.data;
  },

  dismissReminder: async (id) => {
    const response = await api.patch(`/reminders/${id}/dismiss`);
    return response.data;
  },

  deleteReminder: async (id) => {
    const response = await api.delete(`/reminders/${id}`);
    return response.data;
  },
};

export default reminderService;
