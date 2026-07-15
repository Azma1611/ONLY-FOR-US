import { create } from 'zustand';
import healthService from '../services/healthService';
import toast from 'react-hot-toast';

const useHealthStore = create((set, get) => ({
  logs: [],
  medicines: [],
  isLoading: false,

  fetchHealthData: async () => {
    set({ isLoading: true });
    try {
      const [logsRes, medRes] = await Promise.all([
        healthService.getLogs(),
        healthService.getMedicines()
      ]);
      set({ 
        logs: logsRes.logs, 
        medicines: medRes.medicines, 
        isLoading: false 
      });
    } catch (err) {
      toast.error('Failed to fetch health data');
      set({ isLoading: false });
    }
  },

  handleSocketUpdate: (update) => {
    const { action, data } = update;
    if (action === 'created') set(state => ({ logs: [data, ...state.logs] }));
    if (action === 'updated') set(state => ({ logs: state.logs.map(l => l._id === data._id ? data : l) }));
    if (action === 'deleted') set(state => ({ logs: state.logs.filter(l => l._id !== data._id) }));
  }
}));

export default useHealthStore;
