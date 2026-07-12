import { create } from 'zustand';
import { io } from 'socket.io-client';
import { API_BASE_URL } from '@/config/constants';
import useAuthStore from './authStore';
import useChatStore from './chatStore';
import useNotificationStore from './notificationStore';
import useCalendarStore from './calendarStore';
import useTodoStore from './todoStore';
import usePlannerStore from './plannerStore';

const getSocketUrl = () => {
  return API_BASE_URL.replace('/api', '');
};

/**
 * Socket.IO store — manages connection instance, listeners, and emits
 */
const useSocketStore = create((set, get) => ({
  socket: null,
  isConnected: false,
  partnerOnline: false,
  partnerLastSeen: null,
  partnerTyping: false,

  connectSocket: () => {
    const { socket } = get();
    if (socket) return;

    const { accessToken, user } = useAuthStore.getState();
    if (!accessToken) return;

    const socketUrl = getSocketUrl();
    const newSocket = io(socketUrl, {
      auth: {
        token: accessToken,
      },
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
    });

    newSocket.on('connect', () => {
      set({ isConnected: true });
      console.log('🔌 Connected to Socket.IO server');
      
      if (user?.relationship) {
        newSocket.emit('joinRelationshipRoom', { relationshipId: user.relationship });
      }
    });

    newSocket.on('disconnect', () => {
      set({ isConnected: false });
      console.log('🔌 Disconnected from Socket.IO server');
    });

    // Presence listeners
    newSocket.on('userOnline', ({ userId }) => {
      const authUser = useAuthStore.getState().user;
      if (userId !== authUser?._id) {
        set({ partnerOnline: true });
      }
    });

    newSocket.on('userOffline', ({ userId, lastSeen }) => {
      const authUser = useAuthStore.getState().user;
      if (userId !== authUser?._id) {
        set({ partnerOnline: false, partnerLastSeen: lastSeen });
      }
    });

    // Typing state listeners
    newSocket.on('typingStart', ({ userId }) => {
      const authUser = useAuthStore.getState().user;
      if (userId !== authUser?._id) {
        set({ partnerTyping: true });
      }
    });

    newSocket.on('typingStop', ({ userId }) => {
      const authUser = useAuthStore.getState().user;
      if (userId !== authUser?._id) {
        set({ partnerTyping: false });
      }
    });

    // Chat data listeners
    newSocket.on('receiveMessage', (message) => {
      const authUser = useAuthStore.getState().user;
      const chatStore = useChatStore.getState();
      const notificationStore = useNotificationStore.getState();

      const exists = chatStore.messages.some((m) => m._id === message._id);
      if (!exists) {
        chatStore.addMessage(message);

        // If received from partner, mark read if actively in chat room, otherwise notify
        if (message.sender?._id !== authUser?._id) {
          if (chatStore.isChatPageActive) {
            newSocket.emit('messageSeen', { messageId: message._id });
          } else {
            notificationStore.incrementUnread(message);
          }
        }
      }
    });

    newSocket.on('messageDelivered', ({ messageId, userId }) => {
      useChatStore.getState().updateMessageStatus(messageId, { deliveredTo: userId });
    });

    newSocket.on('messageSeen', ({ messageId, userId }) => {
      useChatStore.getState().updateMessageStatus(messageId, { readBy: userId });
    });

    newSocket.on('messageReaction', ({ messageId, reactions }) => {
      useChatStore.getState().updateMessageReactions(messageId, reactions);
    });

    newSocket.on('deleteMessage', ({ messageId, type, message }) => {
      if (type === 'everyone') {
        useChatStore.getState().updateMessage(messageId, message);
      } else {
        useChatStore.getState().removeMessage(messageId);
      }
    });

    newSocket.on('editMessage', (message) => {
      useChatStore.getState().updateMessage(message._id, message);
    });

    // Calendar listeners
    newSocket.on('event_created', ({ event }) => {
      useCalendarStore.getState().addEventLocally(event);
    });
    newSocket.on('event_updated', ({ event }) => {
      useCalendarStore.getState().updateEventLocally(event);
    });
    newSocket.on('event_deleted', ({ eventId }) => {
      useCalendarStore.getState().removeEventLocally(eventId);
    });

    // Task listeners
    newSocket.on('task_created', ({ task }) => {
      useTodoStore.getState().addTaskLocally(task);
    });
    newSocket.on('task_updated', ({ task }) => {
      useTodoStore.getState().updateTaskLocally(task);
    });
    newSocket.on('task_deleted', ({ taskId }) => {
      useTodoStore.getState().removeTaskLocally(taskId);
    });

    // Shopping listeners
    newSocket.on('shopping_created', ({ item }) => {
      useTodoStore.getState().addShoppingLocally(item);
    });
    newSocket.on('shopping_updated', ({ item }) => {
      useTodoStore.getState().updateShoppingLocally(item);
    });
    newSocket.on('shopping_deleted', ({ itemId }) => {
      useTodoStore.getState().removeShoppingLocally(itemId);
    });

    // Travel listeners
    newSocket.on('travel_created', ({ plan }) => {
      usePlannerStore.getState().addTravelLocally(plan);
    });
    newSocket.on('travel_updated', ({ plan }) => {
      usePlannerStore.getState().updateTravelLocally(plan);
    });
    newSocket.on('travel_deleted', ({ planId }) => {
      usePlannerStore.getState().removeTravelLocally(planId);
    });

    // Movie listeners
    newSocket.on('movie_created', ({ plan }) => {
      usePlannerStore.getState().addMovieLocally(plan);
    });
    newSocket.on('movie_updated', ({ plan }) => {
      usePlannerStore.getState().updateMovieLocally(plan);
    });
    newSocket.on('movie_deleted', ({ planId }) => {
      usePlannerStore.getState().removeMovieLocally(planId);
    });

    // Restaurant listeners
    newSocket.on('restaurant_created', ({ plan }) => {
      usePlannerStore.getState().addRestaurantLocally(plan);
    });
    newSocket.on('restaurant_updated', ({ plan }) => {
      usePlannerStore.getState().updateRestaurantLocally(plan);
    });
    newSocket.on('restaurant_deleted', ({ planId }) => {
      usePlannerStore.getState().removeRestaurantLocally(planId);
    });

    newSocket.on('error', (err) => {
      console.error('Socket error event:', err);
    });

    set({ socket: newSocket });
  },

  disconnectSocket: () => {
    const { socket } = get();
    if (socket) {
      socket.disconnect();
      set({ socket: null, isConnected: false });
    }
  },

  emitSendMessage: (messageData) => {
    const { socket } = get();
    if (socket) {
      socket.emit('sendMessage', messageData);
    }
  },

  emitTypingStart: () => {
    const { socket } = get();
    if (socket) {
      socket.emit('typingStart');
    }
  },

  emitTypingStop: () => {
    const { socket } = get();
    if (socket) {
      socket.emit('typingStop');
    }
  },

  emitMessageSeen: (messageId) => {
    const { socket } = get();
    if (socket) {
      socket.emit('messageSeen', { messageId });
    }
  },

  emitMessageDelivered: (messageId) => {
    const { socket } = get();
    if (socket) {
      socket.emit('messageDelivered', { messageId });
    }
  },

  emitMessageReaction: (messageId, emoji) => {
    const { socket } = get();
    if (socket) {
      socket.emit('messageReaction', { messageId, emoji });
    }
  },

  emitDeleteMessage: (messageId, type) => {
    const { socket } = get();
    if (socket) {
      socket.emit('deleteMessage', { messageId, type });
    }
  },

  emitEditMessage: (messageId, text) => {
    const { socket } = get();
    if (socket) {
      socket.emit('editMessage', { messageId, text });
    }
  },
}));

export default useSocketStore;
