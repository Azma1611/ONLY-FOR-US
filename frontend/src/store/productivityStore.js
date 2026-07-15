import { create } from 'zustand';
import productivityService from '../services/productivityService';
import toast from 'react-hot-toast';

const useProductivityStore = create((set, get) => ({
  items: [],
  isLoading: false,

  fetchItems: async () => {
    set({ isLoading: true });
    try {
      const { items } = await productivityService.getItems();
      set({ items, isLoading: false });
    } catch (err) {
      toast.error('Failed to fetch productivity items');
      set({ isLoading: false });
    }
  },

  handleSocketUpdate: (update) => {
    const { action, data } = update;
    if (action === 'created') set(state => ({ items: [data, ...state.items] }));
    if (action === 'updated') set(state => ({ items: state.items.map(i => i._id === data._id ? data : i) }));
    if (action === 'deleted') set(state => ({ items: state.items.filter(i => i._id !== data._id) }));
  }
}));

export default useProductivityStore;
