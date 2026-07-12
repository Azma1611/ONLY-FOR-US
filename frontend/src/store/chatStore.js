import { create } from 'zustand';
import chatService from '@/services/chatService';

/**
 * Chat store — manages active messages, editing, replying, and scrolling flags
 */
const useChatStore = create((set, get) => ({
  messages: [],
  pagination: null,
  isLoading: false,
  isLoadingMore: false,
  isChatPageActive: false,
  replyTo: null,
  editingMessage: null,
  searchQuery: '',

  setChatPageActive: (active) => set({ isChatPageActive: active }),
  setReplyTo: (message) => set({ replyTo: message }),
  setEditingMessage: (message) => set({ editingMessage: message }),
  setSearchQuery: (query) => set({ searchQuery: query }),

  fetchMessages: async (page = 1, limit = 30, append = false) => {
    const { searchQuery } = get();
    if (page === 1) {
      set({ isLoading: true });
    } else {
      set({ isLoadingMore: true });
    }

    try {
      const data = await chatService.getMessages({
        page,
        limit,
        search: searchQuery || undefined,
      });

      const newMessages = data.data.messages;
      const pagination = data.data.pagination;

      set((state) => ({
        messages: append ? [...newMessages, ...state.messages] : newMessages,
        pagination,
        isLoading: false,
        isLoadingMore: false,
      }));

      return newMessages;
    } catch (error) {
      console.error('Failed to fetch messages in store:', error);
      set({ isLoading: false, isLoadingMore: false });
      throw error;
    }
  },

  addMessage: (message) => {
    set((state) => ({
      messages: [...state.messages, message],
    }));
  },

  updateMessage: (id, updatedMessage) => {
    set((state) => ({
      messages: state.messages.map((m) => (m._id === id ? { ...m, ...updatedMessage } : m)),
    }));
  },

  removeMessage: (id) => {
    set((state) => ({
      messages: state.messages.filter((m) => m._id !== id),
    }));
  },

  updateMessageStatus: (messageId, statusUpdate) => {
    set((state) => ({
      messages: state.messages.map((m) => {
        if (m._id !== messageId) return m;
        
        const updated = { ...m };
        if (statusUpdate.deliveredTo) {
          if (!updated.deliveredTo) updated.deliveredTo = [];
          if (!updated.deliveredTo.includes(statusUpdate.deliveredTo)) {
            updated.deliveredTo = [...updated.deliveredTo, statusUpdate.deliveredTo];
          }
        }
        if (statusUpdate.readBy) {
          if (!updated.readBy) updated.readBy = [];
          if (!updated.readBy.includes(statusUpdate.readBy)) {
            updated.readBy = [...updated.readBy, statusUpdate.readBy];
            if (!updated.deliveredTo) updated.deliveredTo = [];
            if (!updated.deliveredTo.includes(statusUpdate.readBy)) {
              updated.deliveredTo = [...updated.deliveredTo, statusUpdate.readBy];
            }
          }
        }
        return updated;
      }),
    }));
  },

  updateMessageReactions: (messageId, reactions) => {
    set((state) => ({
      messages: state.messages.map((m) => (m._id === messageId ? { ...m, reactions } : m)),
    }));
  },

  clearChat: () => {
    set({
      messages: [],
      pagination: null,
      replyTo: null,
      editingMessage: null,
    });
  },
}));

export default useChatStore;
