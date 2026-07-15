import { create } from 'zustand';
import aiService from '../services/aiService';
import toast from 'react-hot-toast';

const useAIStore = create((set, get) => ({
  conversations: [],
  activeConversation: null,
  messages: [],
  isStreaming: false,
  streamedText: '',

  fetchConversations: async () => {
    try {
      const { conversations } = await aiService.getConversations();
      set({ conversations });
      if (conversations.length > 0 && !get().activeConversation) {
        set({ activeConversation: conversations[0]._id });
        get().fetchMessages(conversations[0]._id);
      }
    } catch (err) {
      toast.error('Failed to load chats');
    }
  },

  createConversation: async (title = 'New Chat') => {
    try {
      const { conversation } = await aiService.createConversation(title);
      set(state => ({
        conversations: [conversation, ...state.conversations],
        activeConversation: conversation._id,
        messages: [],
      }));
    } catch (err) {
      toast.error('Failed to create chat');
    }
  },

  setActiveConversation: (id) => {
    set({ activeConversation: id });
    get().fetchMessages(id);
  },

  fetchMessages: async (id) => {
    try {
      const { messages } = await aiService.getMessages(id);
      set({ messages });
    } catch (err) {
      toast.error('Failed to load messages');
    }
  },

  sendMessage: async (content) => {
    const { activeConversation, messages } = get();
    if (!activeConversation) return;

    // Optimistically add user message
    const userMsg = { _id: Date.now().toString(), role: 'user', content };
    set({ 
      messages: [...messages, userMsg],
      isStreaming: true,
      streamedText: '',
    });

    try {
      // Use raw fetch for SSE
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/ai/chat/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ conversationId: activeConversation, content }),
      });

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantContent = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const dataStr = line.substring(6);
            if (dataStr === '[DONE]') {
              set({ isStreaming: false });
              // Finalize message
              set(state => ({
                messages: [...state.messages, { _id: Date.now().toString(), role: 'assistant', content: assistantContent }],
                streamedText: ''
              }));
              return;
            } else if (dataStr === '[ERROR]') {
               throw new Error('Stream Error');
            } else {
              try {
                const data = JSON.parse(dataStr);
                assistantContent += data.text;
                set({ streamedText: assistantContent });
              } catch (e) {
                // Ignore parse errors on partial chunks
              }
            }
          }
        }
      }
    } catch (err) {
      toast.error('Connection interrupted');
      set({ isStreaming: false });
    }
  }
}));

export default useAIStore;
