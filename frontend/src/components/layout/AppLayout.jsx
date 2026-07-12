import { Outlet } from 'react-router';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import Modal from '@/components/ui/Modal';
import useUIStore from '@/store/uiStore';
import useMediaQuery from '@/hooks/useMediaQuery';
import useSocketStore from '@/store/socketStore';
import { useEffect } from 'react';

/**
 * Main app layout with sidebar + topbar for authenticated pages
 */
export default function AppLayout() {
  const { sidebarOpen, searchOpen, toggleSearch } = useUIStore();
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  
  const connectSocket = useSocketStore((state) => state.connectSocket);
  const disconnectSocket = useSocketStore((state) => state.disconnectSocket);

  useEffect(() => {
    connectSocket();
    return () => {
      disconnectSocket();
    };
  }, [connectSocket, disconnectSocket]);

  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      {/* Sidebar */}
      <Sidebar />

      {/* Main content area */}
      <div
        className="transition-all duration-300 ease-[var(--ease-smooth)]"
        style={{
          marginLeft: isDesktop ? (sidebarOpen ? 260 : 72) : 0,
        }}
      >
        {/* Topbar */}
        <Topbar />

        {/* Page content */}
        <div className="page-container">
          <Outlet />
        </div>
      </div>

      {/* Global Search Modal */}
      <Modal isOpen={searchOpen} onClose={toggleSearch} title="Search">
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Type to search..."
            className="w-full px-4 py-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-tertiary)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
            autoFocus
          />
          <p className="text-sm text-[var(--text-secondary)] text-center">
            No results found. Try searching for "Dashboard".
          </p>
        </div>
      </Modal>
    </div>
  );
}
