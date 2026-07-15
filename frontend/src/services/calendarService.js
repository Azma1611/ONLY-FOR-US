import axios from 'axios';
import useAuthStore from '../store/authStore';

export const calendarService = {
  getAuthUrl: async () => {
    const { data } = await axios.get('/api/integrations/google/auth', {
      headers: { Authorization: `Bearer ${useAuthStore.getState().token}` }
    });
    return data.data.url;
  },
  
  // This is typically handled via redirect, but provided for completeness
  linkAccount: async (code) => {
    const { data } = await axios.get(`/api/integrations/google/callback?code=${code}`, {
      headers: { Authorization: `Bearer ${useAuthStore.getState().token}` }
    });
    return data.success;
  }
};
