import { create } from 'zustand';

// Plays a gentle, sweet synthetic chime using Web Audio API (no dependencies, ultra-reliable)
const playChime = () => {
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const now = audioCtx.currentTime;
    
    // Note 1: E5
    const osc1 = audioCtx.createOscillator();
    const gain1 = audioCtx.createGain();
    osc1.connect(gain1);
    gain1.connect(audioCtx.destination);
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(659.25, now);
    gain1.gain.setValueAtTime(0.001, now);
    gain1.gain.exponentialRampToValueAtTime(0.12, now + 0.05);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
    osc1.start(now);
    osc1.stop(now + 0.3);
    
    // Note 2: A5
    const osc2 = audioCtx.createOscillator();
    const gain2 = audioCtx.createGain();
    osc2.connect(gain2);
    gain2.connect(audioCtx.destination);
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(880.00, now + 0.08);
    gain2.gain.setValueAtTime(0.001, now + 0.08);
    gain2.gain.exponentialRampToValueAtTime(0.15, now + 0.12);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
    osc2.start(now + 0.08);
    osc2.stop(now + 0.45);
  } catch (error) {
    console.warn('Synthetic notification chime play failed:', error.message);
  }
};

/**
 * Notification store to manage unread counts, sounds, and browser notifications
 */
const useNotificationStore = create((set, get) => ({
  unreadCount: 0,
  muted: false,
  unreadMessages: [],

  incrementUnread: (message) => {
    const { muted } = get();
    
    set((state) => ({
      unreadCount: state.unreadCount + 1,
      unreadMessages: [...state.unreadMessages, message],
    }));

    // Play sound if not muted
    if (!muted) {
      playChime();
    }

    // Trigger Browser notification if permission granted
    if (Notification.permission === 'granted') {
      const bodyText = message.type === 'text' 
        ? message.text 
        : `Sent a ${message.type}`;
      
      new Notification(`New message from ${message.sender?.name || 'Partner'}`, {
        body: bodyText,
        icon: message.sender?.avatar || '/favicon.ico',
      });
    }
  },

  clearUnread: () => {
    set({
      unreadCount: 0,
      unreadMessages: [],
    });
  },

  toggleMute: () => set((state) => ({ muted: !state.muted })),
  setMuted: (muted) => set({ muted }),

  requestPermission: async () => {
    if (Notification.permission === 'default') {
      await Notification.requestPermission();
    }
  },
}));

export default useNotificationStore;
