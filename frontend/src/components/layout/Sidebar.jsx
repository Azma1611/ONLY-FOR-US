import { NavLink, useLocation, useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, ChevronLeft, LogOut, User, MessageCircle, Calendar, ClipboardList, Wallet, BookOpen, Target, Sparkles, Bell, Settings, Image as ImageIcon } from 'lucide-react';
import useUIStore from '@/store/uiStore';
import useAuthStore from '@/store/authStore';
import authService from '@/services/authService';
import { cn } from '@/lib/utils';
import { NAV_ITEMS } from '@/config/constants';
import Avatar from '@/components/ui/Avatar';
import Badge from '@/components/ui/Badge';

const iconMap = {
  LayoutDashboard,
  User,
  MessageCircle,
  Calendar,
  ClipboardList,
  Wallet,
  BookOpen,
  ImageIcon,
  Target,
  Sparkles,
  Bell,
  Settings,
};

export default function Sidebar() {
  const { sidebarOpen, toggleSidebar, addToast } = useUIStore();
  const { user, refreshToken, logout: storeLogout } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      if (refreshToken) {
        await authService.logout(refreshToken);
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      storeLogout();
      addToast({
        type: 'info',
        title: 'Signed out',
        message: 'Logged out successfully. See you soon! 💕',
      });
      navigate('/login');
    }
  };

  const isPaired = !!user?.relationship || !!user?.isConnected;

  return (
    <>
      {/* Sidebar */}
      <motion.aside
        className={cn(
          'fixed left-0 top-0 bottom-0 z-40 flex flex-col',
          'bg-[var(--sidebar-bg)] backdrop-blur-xl border-r border-[var(--border-color)]',
          'transition-all duration-300 ease-[var(--ease-smooth)]',
          'hidden lg:flex'
        )}
        animate={{ width: sidebarOpen ? 260 : 72 }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 h-20 lg:h-22 border-b border-[var(--border-color)]">
          <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center flex-shrink-0">
            <span className="text-white text-lg">💕</span>
          </div>
          <AnimatePresence>
            {sidebarOpen && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                className="font-display font-bold text-lg gradient-text whitespace-nowrap overflow-hidden"
              >
                Only For Us
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {/* User info */}
        <div className="px-3 py-4 border-b border-[var(--border-color)]">
          <div className={cn(
            'flex items-center gap-3 p-2 rounded-xl',
            sidebarOpen ? '' : 'justify-center'
          )}>
            <Avatar name={user?.name || 'User'} src={user?.avatar} size="sm" />
            <AnimatePresence>
              {sidebarOpen && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="overflow-hidden"
                >
                  <p className="text-sm font-semibold text-[var(--text-primary)] truncate">
                    {user?.name || 'User'}
                  </p>
                  <div className="mt-0.5">
                    {isPaired ? (
                      <Badge variant="primary" size="sm">Paired 💕</Badge>
                    ) : (
                      <Badge variant="secondary" size="sm">Single Onboarding</Badge>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto no-scrollbar px-3 py-3">
          <div className="space-y-1">
            {NAV_ITEMS.map((item) => {
              const Icon = iconMap[item.icon] || LayoutDashboard;
              const isActive = location.pathname === item.path;

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all relative',
                    sidebarOpen ? '' : 'justify-center',
                    isActive
                      ? 'text-[var(--color-primary)] bg-[var(--color-primary-50)]'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]'
                  )}
                >
                  {isActive && (
                    <motion.div
                      layoutId="sidebar-active"
                      className="absolute inset-0 rounded-xl bg-[var(--color-primary)] opacity-[0.08]"
                      transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                    />
                  )}
                  <Icon className={cn('w-5 h-5 flex-shrink-0 relative z-10', isActive && 'text-[var(--color-primary)]')} />
                  <AnimatePresence>
                    {sidebarOpen && (
                      <motion.span
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: 'auto' }}
                        exit={{ opacity: 0, width: 0 }}
                        className="relative z-10 whitespace-nowrap overflow-hidden"
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </NavLink>
              );
            })}
          </div>
        </nav>

        {/* Bottom actions */}
        <div className="px-3 py-3 border-t border-[var(--border-color)] space-y-1">
          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all w-full',
              'text-[var(--color-error)] hover:bg-red-50 dark:hover:bg-red-950/15',
              sidebarOpen ? '' : 'justify-center'
            )}
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {sidebarOpen && <span>Sign Out</span>}
          </button>

          {/* Collapse toggle */}
          <button
            onClick={toggleSidebar}
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all w-full',
              'text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]',
              sidebarOpen ? '' : 'justify-center'
            )}
          >
            <motion.div animate={{ rotate: sidebarOpen ? 0 : 180 }}>
              <ChevronLeft className="w-5 h-5" />
            </motion.div>
            {sidebarOpen && <span>Collapse</span>}
          </button>
        </div>
      </motion.aside>
    </>
  );
}
