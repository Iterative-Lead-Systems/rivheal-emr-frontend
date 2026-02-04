import React from 'react';
import { Outlet } from 'react-router-dom';
import { cn } from '@/utils';
import { useUIStore } from '@/stores/ui.store';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

export const MainLayout: React.FC = () => {
  const sidebarCollapsed = useUIStore((state) => state.sidebarCollapsed);
  const isOnline = useUIStore((state) => state.isOnline);
  const pendingSyncCount = useUIStore((state) => state.pendingSyncCount);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div
        className={cn(
          'min-h-screen transition-all duration-300',
          sidebarCollapsed ? 'ml-16' : 'ml-64'
        )}
      >
        {/* Header */}
        <Header />

        {/* Offline Banner */}
        {!isOnline && (
          <div className="bg-orange-500 text-white px-4 py-2 text-sm text-center flex items-center justify-center gap-2">
            <span className="animate-pulse">⚠️</span>
            <span>
              You're working offline. 
              {pendingSyncCount > 0 && (
                <span className="font-medium"> {pendingSyncCount} changes pending sync.</span>
              )}
            </span>
          </div>
        )}

        {/* Page Content */}
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
