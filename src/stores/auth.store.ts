import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Staff, Hospital, Branch, Permission, LoginResponse } from '@/types';

interface AuthState {
  // State
  user: Staff | null;
  hospital: Hospital | null;
  currentBranch: Branch | null;
  availableBranches: Branch[];
  permissions: Permission[];
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  requiresBranchSelection: boolean;

  // Actions
  setAuth: (response: LoginResponse) => void;
  selectBranch: (branch: Branch) => void;
  switchBranch: (branchId: string) => void;
  updateUser: (user: Partial<Staff>) => void;
  updateHospital: (hospital: Partial<Hospital>) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;

  // Permission helpers
  hasPermission: (module: string, action: string) => boolean;
  hasModuleAccess: (module: string) => boolean;
  canCreate: (module: string) => boolean;
  canEdit: (module: string) => boolean;
  canDelete: (module: string) => boolean;
}

const initialState = {
  user: null,
  hospital: null,
  currentBranch: null,
  availableBranches: [],
  permissions: [],
  token: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: false,
  requiresBranchSelection: false,
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      ...initialState,

      setAuth: (response: LoginResponse) => {
        const { user, hospital, branches, token, refreshToken, requiresBranchSelection } = response;
        
        // If user has only one branch, auto-select it
        const currentBranch = branches.length === 1 ? branches[0] : null;
        
        // Extract permissions from user's roles
        const permissions: Permission[] = user.roles.flatMap((role) => role.permissions);

        set({
          user,
          hospital,
          currentBranch,
          availableBranches: branches,
          permissions,
          token,
          refreshToken,
          isAuthenticated: true,
          requiresBranchSelection: requiresBranchSelection && branches.length > 1,
        });
      },

      selectBranch: (branch: Branch) => {
        set({
          currentBranch: branch,
          requiresBranchSelection: false,
        });
      },

      switchBranch: (branchId: string) => {
        const { availableBranches } = get();
        const branch = availableBranches.find((b) => b.id === branchId);
        if (branch) {
          set({ currentBranch: branch });
        }
      },

      updateUser: (userData: Partial<Staff>) => {
        const { user } = get();
        if (user) {
          set({ user: { ...user, ...userData } });
        }
      },

      updateHospital: (hospitalData: Partial<Hospital>) => {
        const { hospital } = get();
        if (hospital) {
          set({ hospital: { ...hospital, ...hospitalData } });
        }
      },

      logout: () => {
        set(initialState);
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      // Permission helpers
      hasPermission: (module: string, action: string) => {
        const { permissions, user } = get();
        
        // Super admin has all permissions
        if (user?.roles.some((role) => role.name.toLowerCase() === 'super admin')) {
          return true;
        }

        return permissions.some(
          (p) => p.module === module && p.action === action
        );
      },

      hasModuleAccess: (module: string) => {
        const { permissions, user } = get();
        
        if (user?.roles.some((role) => role.name.toLowerCase() === 'super admin')) {
          return true;
        }

        return permissions.some((p) => p.module === module);
      },

      canCreate: (module: string) => {
        return get().hasPermission(module, 'create');
      },

      canEdit: (module: string) => {
        return get().hasPermission(module, 'edit');
      },

      canDelete: (module: string) => {
        return get().hasPermission(module, 'delete');
      },
    }),
    {
      name: 'rivheal-auth',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        hospital: state.hospital,
        currentBranch: state.currentBranch,
        availableBranches: state.availableBranches,
        permissions: state.permissions,
        token: state.token,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

// Selector hooks for common use cases
export const useUser = () => useAuthStore((state) => state.user);
export const useHospital = () => useAuthStore((state) => state.hospital);
export const useCurrentBranch = () => useAuthStore((state) => state.currentBranch);
export const useAvailableBranches = () => useAuthStore((state) => state.availableBranches);
export const useIsAuthenticated = () => useAuthStore((state) => state.isAuthenticated);
export const useRequiresBranchSelection = () => useAuthStore((state) => state.requiresBranchSelection);
