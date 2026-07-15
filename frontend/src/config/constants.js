// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_URL;

// Route paths — Phase 1 only
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  PROFILE: '/profile',
  CHAT: '/chat',
  CALENDAR: '/calendar',
  PLANNER: '/planner',
  FINANCE: '/finance',
  MEMORIES: '/memories',
  ECOSYSTEM: '/ecosystem',
  AI_ASSISTANT: '/ai',
  NOTIFICATIONS: '/notifications',
  SETTINGS: '/settings',
  MEDIA: '/media',
};

// App metadata
export const APP_NAME = 'Only For Us';
export const APP_DESCRIPTION = 'The most beautiful relationship management platform';
export const APP_VERSION = '1.0.0';

// Theme
export const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
  AUTO: 'auto',
};

// Navigation items for sidebar — Phase 1
export const NAV_ITEMS = [
  { path: ROUTES.DASHBOARD, label: 'Dashboard', icon: 'LayoutDashboard' },
  { path: ROUTES.CHAT, label: 'Chat', icon: 'MessageCircle' },
  { path: ROUTES.CALENDAR, label: 'Calendar', icon: 'Calendar' },
  { path: ROUTES.PLANNER, label: 'Planner', icon: 'ClipboardList' },
  { path: ROUTES.FINANCE, label: 'Finance', icon: 'Wallet' },
  { path: ROUTES.MEMORIES, label: 'Memories', icon: 'BookOpen' },
  { path: ROUTES.MEDIA, label: 'Shared Media', icon: 'ImageIcon' },
  { path: ROUTES.ECOSYSTEM, label: 'Life & Ecosystem', icon: 'Target' },
  { path: ROUTES.AI_ASSISTANT, label: 'AI Assistant', icon: 'Sparkles' },
  { path: ROUTES.NOTIFICATIONS, label: 'Notifications', icon: 'Bell' },
  { path: ROUTES.SETTINGS, label: 'Settings', icon: 'Settings' },
  { path: ROUTES.PROFILE, label: 'Profile', icon: 'User' },
];
