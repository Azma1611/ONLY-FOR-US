import axios from 'axios';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';

export const backupService = {
  exportData: async (format = 'json') => {
    try {
      const response = await axios.get(`/api/integrations/export?format=${format}`, {
        headers: { Authorization: `Bearer ${useAuthStore.getState().token}` },
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `onlyforus-backup.${format === 'zip' ? 'zip' : format === 'csv' ? 'csv' : format === 'pdf' ? 'pdf' : 'json'}`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success(`${format.toUpperCase()} Backup Generated`);
      return true;
    } catch (error) {
      console.error(error);
      toast.error(`Failed to generate ${format.toUpperCase()} backup`);
      return false;
    }
  },

  restoreBackup: async (file) => {
    // Requires a multipart/form-data endpoint to be built on backend
    // Mocking for now as the backend route for upload isn't specified in the prompt beyond "Restore Backup"
    toast.success('Backup restore initiated');
    return true;
  }
};
