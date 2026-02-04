import React, { useState } from 'react';
import { cn } from '@/utils';
import { useAuthStore } from '@/stores/auth.store';
import { useUIStore } from '@/stores/ui.store';
import {
  Menu,
  Search,
  Bell,
  ChevronDown,
  LogOut,
  User,
  Settings,
  Building2,
  Check,
  Wifi,
  WifiOff,
} from 'lucide-react';
import type { Branch } from '@/types';

export const Header: React.FC = () => {
  const [showBranchDropdown, setShowBranchDropdown] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // UI Store
  const sidebarCollapsed = useUIStore((state) => state.sidebarCollapsed);
  const toggleMobileSidebar = useUIStore((state) => state.toggleMobileSidebar);
  const isOnline = useUIStore((state) => state.isOnline);
  const pendingSyncCount = useUIStore((state) => state.pendingSyncCount);

  // Auth Store
  const user = useAuthStore((state) => state.user);
  const currentBranch = useAuthStore((state) => state.currentBranch);
  const availableBranches = useAuthStore((state) => state.availableBranches);
  const switchBranch = useAuthStore((state) => state.switchBranch);
  const logout = useAuthStore((state) => state.logout);

  const handleBranchSwitch = (branch: Branch) => {
    switchBranch(branch.id);
    setShowBranchDropdown(false);
  };

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName[0]}${lastName[0]}`.toUpperCase();
  };

  return (
    <header
      className={cn(
        'bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-30 transition-all duration-300',
        sidebarCollapsed ? 'ml-16' : 'ml-64'
      )}
    >
      {/* Left Section */}
      <div className="flex items-center gap-4">
        {/* Mobile Menu Button */}
        <button
          onClick={toggleMobileSidebar}
          className="p-2 hover:bg-gray-100 rounded-lg transition lg:hidden"
        >
          <Menu size={24} />
        </button>

        {/* Search */}
        <div className="relative hidden sm:block">
          <input
            type="text"
            placeholder="Search patients, records... (Ctrl+K)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-2 w-64 lg:w-80 bg-gray-100 rounded-lg focus:bg-white focus:ring-2 focus:ring-teal-500 border border-transparent focus:border-teal-500 transition text-sm"
          />
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-3">
        {/* Branch Switcher (if multiple branches) */}
        {availableBranches.length > 1 && (
          <div className="relative">
            <button
              onClick={() => setShowBranchDropdown(!showBranchDropdown)}
              className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition text-sm"
            >
              <Building2 size={16} className="text-gray-600" />
              <span className="hidden md:inline text-gray-700 max-w-[150px] truncate">
                {currentBranch?.name || 'Select Branch'}
              </span>
              <ChevronDown size={16} className="text-gray-400" />
            </button>

            {showBranchDropdown && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowBranchDropdown(false)}
                />
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-20">
                  <div className="px-3 py-2 border-b border-gray-100">
                    <p className="text-xs font-medium text-gray-500 uppercase">Switch Branch</p>
                  </div>
                  {availableBranches.map((branch) => (
                    <button
                      key={branch.id}
                      onClick={() => handleBranchSwitch(branch)}
                      className={cn(
                        'w-full flex items-center justify-between px-3 py-2 hover:bg-gray-50 transition text-left',
                        currentBranch?.id === branch.id && 'bg-teal-50'
                      )}
                    >
                      <div>
                        <p className="text-sm font-medium text-gray-900">{branch.name}</p>
                        <p className="text-xs text-gray-500">{branch.code}</p>
                      </div>
                      {currentBranch?.id === branch.id && (
                        <Check size={16} className="text-teal-600" />
                      )}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* Online/Offline Status */}
        <div
          className={cn(
            'flex items-center gap-2 px-3 py-1.5 rounded-full text-sm',
            isOnline
              ? 'bg-green-50 text-green-700 border border-green-200'
              : 'bg-orange-50 text-orange-700 border border-orange-200'
          )}
        >
          {isOnline ? <Wifi size={14} /> : <WifiOff size={14} />}
          <span className="hidden sm:inline">
            {isOnline ? 'Online' : 'Offline'}
          </span>
          {!isOnline && pendingSyncCount > 0 && (
            <span className="bg-orange-200 text-orange-800 px-1.5 py-0.5 rounded-full text-xs">
              {pendingSyncCount}
            </span>
          )}
        </div>

        {/* Notifications */}
        <button className="relative p-2 hover:bg-gray-100 rounded-lg transition">
          <Bell size={20} className="text-gray-600" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
        </button>

        {/* User Menu */}
        <div className="relative">
          <button
            onClick={() => setShowUserDropdown(!showUserDropdown)}
            className="flex items-center gap-3 pl-3 border-l border-gray-200 hover:bg-gray-50 rounded-lg p-2 transition"
          >
            <div className="text-right hidden md:block">
              <p className="text-sm font-medium text-gray-900">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-xs text-gray-500">{user?.designation || 'Staff'}</p>
            </div>
            <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-teal-600 rounded-full flex items-center justify-center text-white font-medium shadow">
              {user ? getInitials(user.firstName, user.lastName) : 'U'}
            </div>
          </button>

          {showUserDropdown && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowUserDropdown(false)}
              />
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-20">
                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="text-sm font-medium text-gray-900">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                </div>
                <div className="py-1">
                  <button className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition">
                    <User size={16} />
                    My Profile
                  </button>
                  <button className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition">
                    <Settings size={16} />
                    Settings
                  </button>
                </div>
                <div className="border-t border-gray-100 py-1">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition"
                  >
                    <LogOut size={16} />
                    Sign Out
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
