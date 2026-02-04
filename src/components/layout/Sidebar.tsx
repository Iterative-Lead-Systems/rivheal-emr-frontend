import React from 'react';
import { NavLink } from 'react-router-dom';
import { cn } from '@/utils';
import { useAuthStore } from '@/stores/auth.store';
import { useUIStore } from '@/stores/ui.store';
import {
  LayoutDashboard,
  Users,
  Calendar,
  Stethoscope,
  FlaskConical,
  ImageIcon,
  Pill,
  Receipt,
  Package,
  BedDouble,
  AlertTriangle,
  BarChart3,
  UserCog,
  Settings,
  ChevronLeft,
  ChevronRight,
  Wifi,
  WifiOff,
  RefreshCw,
  Shield,
} from 'lucide-react';

interface NavItem {
  key: string;
  label: string;
  icon: React.ElementType;
  path: string;
}

const navItems: NavItem[] = [
  { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
  { key: 'patients', label: 'Patients', icon: Users, path: '/patients' },
  { key: 'appointments', label: 'Appointments', icon: Calendar, path: '/appointments' },
  { key: 'opd', label: 'OPD / Consultation', icon: Stethoscope, path: '/opd' },
  { key: 'laboratory', label: 'Laboratory', icon: FlaskConical, path: '/laboratory' },
  { key: 'radiology', label: 'Radiology', icon: ImageIcon, path: '/radiology' },
  { key: 'pharmacy', label: 'Pharmacy', icon: Pill, path: '/pharmacy' },
  { key: 'billing', label: 'Billing', icon: Receipt, path: '/billing' },
  { key: 'inventory', label: 'Inventory', icon: Package, path: '/inventory' },
  { key: 'ward', label: 'Ward Management', icon: BedDouble, path: '/ward' },
  { key: 'emergency', label: 'Emergency', icon: AlertTriangle, path: '/emergency' },
  { key: 'reports', label: 'Reports', icon: BarChart3, path: '/reports' },
  { key: 'staff', label: 'Staff Management', icon: UserCog, path: '/staff' },
  { key: 'roles', label: 'Roles & Permissions', icon: Shield, path: '/roles' },
  { key: 'settings', label: 'Settings', icon: Settings, path: '/settings' },
];

export const Sidebar: React.FC = () => {
  const sidebarCollapsed = useUIStore((state) => state.sidebarCollapsed);
  const toggleSidebar = useUIStore((state) => state.toggleSidebar);
  const isOnline = useUIStore((state) => state.isOnline);
  const pendingSyncCount = useUIStore((state) => state.pendingSyncCount);
  const isSyncing = useUIStore((state) => state.isSyncing);
  const lastSyncAt = useUIStore((state) => state.lastSyncAt);
  
  const hospital = useAuthStore((state) => state.hospital);
  const currentBranch = useAuthStore((state) => state.currentBranch);
  const hasModuleAccess = useAuthStore((state) => state.hasModuleAccess);

  // Filter nav items based on permissions
  const visibleNavItems = navItems.filter((item) => hasModuleAccess(item.key));

  const formatLastSync = (dateStr: string | null) => {
    if (!dateStr) return 'Never';
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <aside
      className={cn(
        'bg-gray-900 text-white fixed left-0 top-0 z-40 h-screen flex flex-col transition-all duration-300',
        sidebarCollapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Logo Section */}
      <div className="flex items-center justify-between p-4 border-b border-gray-800">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-teal-600 rounded-lg flex items-center justify-center flex-shrink-0 shadow-lg">
            <span className="text-white text-lg font-bold">R</span>
          </div>
          {!sidebarCollapsed && (
            <div className="min-w-0">
              <h1 className="font-bold text-lg truncate">RivHeal</h1>
              <p className="text-xs text-gray-400 truncate">EMR System</p>
            </div>
          )}
        </div>
        <button
          onClick={toggleSidebar}
          className="p-1.5 rounded-lg hover:bg-gray-800 transition-colors text-gray-400 hover:text-white"
        >
          {sidebarCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {/* Hospital Info */}
      {!sidebarCollapsed && hospital && (
        <div className="p-4 border-b border-gray-800 bg-gray-800/50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-sm flex-shrink-0">
              {hospital.logoUrl ? (
                <img src={hospital.logoUrl} alt={hospital.name} className="w-full h-full object-cover rounded-lg" />
              ) : (
                '🏥'
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium truncate">{hospital.name}</p>
              <p className="text-xs text-gray-400 truncate">{currentBranch?.name || 'Select Branch'}</p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 p-2 overflow-y-auto scrollbar-hide">
        {visibleNavItems.map((item) => (
          <NavLink
            key={item.key}
            to={item.path}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 transition-all',
                isActive
                  ? 'bg-teal-600 text-white shadow-lg'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              )
            }
          >
            <item.icon size={20} className="flex-shrink-0" />
            {!sidebarCollapsed && <span className="text-sm truncate">{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Sync Status */}
      <div className="p-4 border-t border-gray-800">
        <div className={cn('flex items-center gap-2', sidebarCollapsed && 'justify-center')}>
          {/* Online/Offline indicator */}
          {isOnline ? (
            <Wifi size={16} className="text-green-500 flex-shrink-0" />
          ) : (
            <WifiOff size={16} className="text-orange-500 flex-shrink-0" />
          )}
          
          {!sidebarCollapsed && (
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400">
                  {isOnline ? 'Online' : 'Offline'}
                </span>
                {pendingSyncCount > 0 && (
                  <span className="px-1.5 py-0.5 bg-orange-500/20 text-orange-400 text-xs rounded-full">
                    {pendingSyncCount} pending
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500 truncate">
                {isSyncing ? (
                  <span className="flex items-center gap-1">
                    <RefreshCw size={10} className="animate-spin" />
                    Syncing...
                  </span>
                ) : (
                  `Synced ${formatLastSync(lastSyncAt)}`
                )}
              </p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
