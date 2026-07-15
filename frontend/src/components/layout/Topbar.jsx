import { Bell, Search, Menu } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router';
import { useEffect } from 'react';
import ThemeToggle from '@/components/ui/ThemeToggle';
import Avatar from '@/components/ui/Avatar';
import useAuthStore from '@/store/authStore';
import useUIStore from '@/store/uiStore';
import { useNotificationStore } from '@/store/notificationStore';

export default function Topbar() {
  const { user } = useAuthStore();
  const { toggleSearch, setMobileNavOpen } = useUIStore();
  const { unreadCount, fetchNotifications } = useNotificationStore();
  const navigate = useNavigate();

  // Fetch initial notifications for count
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  return (
    <header className="sticky top-0 z-30 h-20 lg:h-22 flex items-center justify-between px-6 lg:px-12 bg-[var(--bg-primary)]/80 backdrop-blur-lg border-b border-[var(--border-color)]">
      {/* Left */}
      <div className="flex items-center gap-3">
        {/* Mobile menu toggle */}
        <button
          className="lg:hidden p-2 rounded-xl text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] transition-colors"
          onClick={() => setMobileNavOpen(true)}
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Search */}
        <motion.button
          className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[var(--bg-tertiary)] text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] text-sm transition-colors"
          onClick={toggleSearch}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Search className="w-4 h-4" />
          <span className="hidden sm:inline">Search...</span>
          <kbd className="hidden md:inline-flex items-center gap-0.5 px-1.5 py-0.5 ml-2 text-xs font-medium bg-[var(--bg-elevated)] border border-[var(--border-color)] rounded">
            ⌘K
          </kbd>
        </motion.button>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2">
        {/* Theme toggle */}
        <ThemeToggle compact />

        {/* Notifications */}
        <motion.button
          onClick={() => navigate('/notifications')}
          className="relative p-2 rounded-xl text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Bell className="w-5 h-5" />
          {/* Notification badge */}
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 text-[10px] font-bold text-white rounded-full bg-[var(--color-primary)] ring-2 ring-[var(--bg-primary)] flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </motion.button>

        {/* User avatar */}
        <motion.button
          onClick={() => navigate('/profile')}
          className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl hover:bg-[var(--bg-tertiary)] transition-colors"
          whileHover={{ scale: 1.02 }}
        >
          <Avatar name={user?.name || 'User'} src={user?.avatar} size="sm" />
          <span className="hidden sm:block text-sm font-medium text-[var(--text-primary)]">
            {user?.name || 'User'}
          </span>
        </motion.button>
      </div>
    </header>
  );
}
