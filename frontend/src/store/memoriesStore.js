import { create } from 'zustand';
import memoriesService from '../services/memoriesService';
import toast from 'react-hot-toast';

const useMemoriesStore = create((set, get) => ({
  memories: [],
  albums: [],
  loveLetters: [],
  milestones: [],
  isLoading: false,

  fetchMemories: async (params = {}) => {
    set({ isLoading: true });
    try {
      const data = await memoriesService.getMemories(params);
      set({ memories: data.data.memories, isLoading: false });
    } catch (error) {
      toast.error('Failed to load memories');
      set({ isLoading: false });
    }
  },

  fetchAlbums: async () => {
    try {
      const data = await memoriesService.getAlbums();
      set({ albums: data.data.albums });
    } catch (error) {
      console.error(error);
    }
  },

  fetchLoveLetters: async () => {
    try {
      const data = await memoriesService.getLoveLetters();
      set({ loveLetters: data.data.letters });
    } catch (error) {
      console.error(error);
    }
  },

  fetchMilestones: async () => {
    try {
      const data = await memoriesService.getMilestones();
      set({ milestones: data.data.milestones });
    } catch (error) {
      console.error(error);
    }
  },

  handleSocketUpdate: (update) => {
    const { type, action, data } = update;
    
    if (type === 'memory') {
      if (action === 'created') set((state) => ({ memories: [data, ...state.memories] }));
      if (action === 'updated') set((state) => ({ memories: state.memories.map(m => m._id === data._id ? data : m) }));
      if (action === 'deleted') set((state) => ({ memories: state.memories.filter(m => m._id !== data._id) }));
    }
    
    if (type === 'album') {
      if (action === 'created') set((state) => ({ albums: [data, ...state.albums] }));
      if (action === 'deleted') set((state) => ({ albums: state.albums.filter(a => a._id !== data._id) }));
    }
    
    if (type === 'loveletter') {
      if (action === 'created') set((state) => ({ loveLetters: [data, ...state.loveLetters] }));
      if (action === 'updated') set((state) => ({ loveLetters: state.loveLetters.map(l => l._id === data._id ? data : l) }));
      if (action === 'deleted') set((state) => ({ loveLetters: state.loveLetters.filter(l => l._id !== data._id) }));
    }
    
    if (type === 'milestone') {
      if (action === 'created') set((state) => ({ milestones: [data, ...state.milestones] }));
      if (action === 'deleted') set((state) => ({ milestones: state.milestones.filter(m => m._id !== data._id) }));
    }
  }
}));

export default useMemoriesStore;
