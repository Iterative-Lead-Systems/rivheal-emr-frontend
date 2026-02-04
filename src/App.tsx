import React, { useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppRouter } from './router';
import { useUIStore } from '@/stores/ui.store';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Online/Offline status listener
const OnlineStatusListener: React.FC = () => {
  const setOnline = useUIStore((state) => state.setOnline);
  const addToast = useUIStore((state) => state.addToast);

  useEffect(() => {
    const handleOnline = () => {
      setOnline(true);
      addToast('success', 'Back Online', 'Your connection has been restored. Syncing data...');
    };

    const handleOffline = () => {
      setOnline(false);
      addToast('warning', 'You\'re Offline', 'Changes will be saved locally and synced when you\'re back online.');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Set initial status
    setOnline(navigator.onLine);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [setOnline, addToast]);

  return null;
};

// Toast container component
const ToastContainer: React.FC = () => {
  const toasts = useUIStore((state) => state.toasts);
  const removeToast = useUIStore((state) => state.removeToast);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`
            max-w-sm p-4 rounded-lg shadow-lg border animate-slide-in
            ${toast.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' : ''}
            ${toast.type === 'error' ? 'bg-red-50 border-red-200 text-red-800' : ''}
            ${toast.type === 'warning' ? 'bg-orange-50 border-orange-200 text-orange-800' : ''}
            ${toast.type === 'info' ? 'bg-blue-50 border-blue-200 text-blue-800' : ''}
          `}
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-medium">{toast.title}</p>
              {toast.message && (
                <p className="text-sm mt-1 opacity-80">{toast.message}</p>
              )}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-current opacity-50 hover:opacity-100"
            >
              ×
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

// Global loading overlay
const GlobalLoadingOverlay: React.FC = () => {
  const globalLoading = useUIStore((state) => state.globalLoading);
  const globalLoadingMessage = useUIStore((state) => state.globalLoadingMessage);

  if (!globalLoading) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl p-6 shadow-xl text-center">
        <div className="w-12 h-12 border-4 border-gray-200 border-t-teal-600 rounded-full animate-spin mx-auto" />
        {globalLoadingMessage && (
          <p className="mt-4 text-gray-600">{globalLoadingMessage}</p>
        )}
      </div>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <OnlineStatusListener />
      <AppRouter />
      <ToastContainer />
      <GlobalLoadingOverlay />
    </QueryClientProvider>
  );
};

export default App;
