import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Toast, ToastType } from '@/types';
import { generateUUID } from '@/utils';

interface UIState {
  // Sidebar
  sidebarCollapsed: boolean;
  sidebarMobileOpen: boolean;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleMobileSidebar: () => void;
  closeMobileSidebar: () => void;

  // Theme
  theme: 'light' | 'dark' | 'system';
  setTheme: (theme: 'light' | 'dark' | 'system') => void;

  // Connection status
  isOnline: boolean;
  setOnline: (online: boolean) => void;

  // Sync status
  pendingSyncCount: number;
  lastSyncAt: string | null;
  isSyncing: boolean;
  setPendingSyncCount: (count: number) => void;
  setLastSyncAt: (date: string) => void;
  setSyncing: (syncing: boolean) => void;

  // Toasts
  toasts: Toast[];
  addToast: (type: ToastType, title: string, message?: string, duration?: number) => void;
  removeToast: (id: string) => void;
  clearToasts: () => void;

  // Modals
  activeModal: string | null;
  modalData: Record<string, unknown> | null;
  openModal: (modalId: string, data?: Record<string, unknown>) => void;
  closeModal: () => void;

  // Global loading
  globalLoading: boolean;
  globalLoadingMessage: string | null;
  setGlobalLoading: (loading: boolean, message?: string) => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set, get) => ({
      // Sidebar
      sidebarCollapsed: false,
      sidebarMobileOpen: false,
      
      toggleSidebar: () => {
        set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed }));
      },
      
      setSidebarCollapsed: (collapsed: boolean) => {
        set({ sidebarCollapsed: collapsed });
      },
      
      toggleMobileSidebar: () => {
        set((state) => ({ sidebarMobileOpen: !state.sidebarMobileOpen }));
      },
      
      closeMobileSidebar: () => {
        set({ sidebarMobileOpen: false });
      },

      // Theme
      theme: 'light',
      
      setTheme: (theme) => {
        set({ theme });
        
        // Apply theme to document
        if (theme === 'system') {
          const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
          document.documentElement.classList.toggle('dark', isDark);
        } else {
          document.documentElement.classList.toggle('dark', theme === 'dark');
        }
      },

      // Connection status
      isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
      
      setOnline: (online: boolean) => {
        set({ isOnline: online });
      },

      // Sync status
      pendingSyncCount: 0,
      lastSyncAt: null,
      isSyncing: false,
      
      setPendingSyncCount: (count: number) => {
        set({ pendingSyncCount: count });
      },
      
      setLastSyncAt: (date: string) => {
        set({ lastSyncAt: date });
      },
      
      setSyncing: (syncing: boolean) => {
        set({ isSyncing: syncing });
      },

      // Toasts
      toasts: [],
      
      addToast: (type, title, message, duration = 5000) => {
        const id = generateUUID();
        const toast: Toast = { id, type, title, message, duration };
        
        set((state) => ({ toasts: [...state.toasts, toast] }));
        
        // Auto remove after duration
        if (duration > 0) {
          setTimeout(() => {
            get().removeToast(id);
          }, duration);
        }
      },
      
      removeToast: (id: string) => {
        set((state) => ({
          toasts: state.toasts.filter((t) => t.id !== id),
        }));
      },
      
      clearToasts: () => {
        set({ toasts: [] });
      },

      // Modals
      activeModal: null,
      modalData: null,
      
      openModal: (modalId: string, data?: Record<string, unknown>) => {
        set({ activeModal: modalId, modalData: data || null });
      },
      
      closeModal: () => {
        set({ activeModal: null, modalData: null });
      },

      // Global loading
      globalLoading: false,
      globalLoadingMessage: null,
      
      setGlobalLoading: (loading: boolean, message?: string) => {
        set({ globalLoading: loading, globalLoadingMessage: message || null });
      },
    }),
    {
      name: 'rivheal-ui',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        sidebarCollapsed: state.sidebarCollapsed,
        theme: state.theme,
      }),
    }
  )
);

// Convenience hooks
export const useSidebar = () => useUIStore((state) => ({
  collapsed: state.sidebarCollapsed,
  mobileOpen: state.sidebarMobileOpen,
  toggle: state.toggleSidebar,
  toggleMobile: state.toggleMobileSidebar,
  closeMobile: state.closeMobileSidebar,
}));

export const useTheme = () => useUIStore((state) => ({
  theme: state.theme,
  setTheme: state.setTheme,
}));

export const useOnlineStatus = () => useUIStore((state) => ({
  isOnline: state.isOnline,
  setOnline: state.setOnline,
}));

export const useSyncStatus = () => useUIStore((state) => ({
  pendingCount: state.pendingSyncCount,
  lastSyncAt: state.lastSyncAt,
  isSyncing: state.isSyncing,
}));

export const useToasts = () => useUIStore((state) => ({
  toasts: state.toasts,
  addToast: state.addToast,
  removeToast: state.removeToast,
  clearToasts: state.clearToasts,
}));

export const useModal = () => useUIStore((state) => ({
  activeModal: state.activeModal,
  modalData: state.modalData,
  openModal: state.openModal,
  closeModal: state.closeModal,
}));
