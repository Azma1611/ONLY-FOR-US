import { create } from 'zustand';

/**
 * UI store — manages global UI state
 */
const useUIStore = create((set) => ({
  // Sidebar
  sidebarOpen: true,
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),

  // Mobile nav
  mobileNavOpen: false,
  toggleMobileNav: () => set((s) => ({ mobileNavOpen: !s.mobileNavOpen })),
  setMobileNavOpen: (open) => set({ mobileNavOpen: open }),

  // Modals
  activeModal: null,
  modalData: null,
  openModal: (modal, data = null) => set({ activeModal: modal, modalData: data }),
  closeModal: () => set({ activeModal: null, modalData: null }),

  // Toasts
  toasts: [],
  addToast: (toast) => {
    const id = Date.now() + Math.random();
    const newToast = { id, duration: 4000, ...toast };
    set((s) => ({ toasts: [...s.toasts, newToast] }));
    
    // Auto-remove
    setTimeout(() => {
      set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
    }, newToast.duration);

    return id;
  },
  removeToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),

  // Search
  searchOpen: false,
  toggleSearch: () => set((s) => ({ searchOpen: !s.searchOpen })),

  // Page loading
  pageLoading: false,
  setPageLoading: (loading) => set({ pageLoading: loading }),
}));

export default useUIStore;
