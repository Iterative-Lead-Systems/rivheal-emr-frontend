import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthStore } from '@/stores/auth.store';
import { useUIStore } from '@/stores/ui.store';
import { Eye, EyeOff, Loader2, Wifi, WifiOff } from 'lucide-react';
import { cn } from '@/utils';
import type { LoginResponse, Staff, Hospital, Branch, Role, Permission } from '@/types';

// Validation schema
const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  rememberMe: z.boolean().optional(),
});

type LoginFormData = z.infer<typeof loginSchema>;

// Mock login response for development
const mockLoginResponse: LoginResponse = {
  user: {
    id: '1',
    email: 'dr.adaeze@lagosgeneral.com',
    firstName: 'Adaeze',
    lastName: 'Obi',
    phone: '+234 801 234 5678',
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    hospitalId: '1',
    staffId: 'STF-001',
    designation: 'General Physician',
    department: 'General Medicine',
    licenseNumber: 'MDCN/12345',
    branches: [
      {
        branchId: '1',
        branch: {
          id: '1',
          hospitalId: '1',
          name: 'Lekki Branch',
          code: 'LK',
          address: '123 Healthcare Avenue',
          city: 'Lekki',
          state: 'Lagos',
          isHeadquarters: true,
          isActive: true,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
        },
        isPrimary: true,
        assignedAt: '2024-01-01T00:00:00Z',
      },
      {
        branchId: '2',
        branch: {
          id: '2',
          hospitalId: '1',
          name: 'Victoria Island',
          code: 'VI',
          address: '456 Medical Plaza',
          city: 'Victoria Island',
          state: 'Lagos',
          isHeadquarters: false,
          isActive: true,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
        },
        isPrimary: false,
        assignedAt: '2024-01-01T00:00:00Z',
      },
    ],
    roles: [
      {
        id: '1',
        hospitalId: '1',
        name: 'Doctor',
        description: 'Medical practitioner',
        isSystem: true,
        permissions: [
          { module: 'dashboard', action: 'view' },
          { module: 'patients', action: 'view' },
          { module: 'patients', action: 'create' },
          { module: 'patients', action: 'edit' },
          { module: 'appointments', action: 'view' },
          { module: 'appointments', action: 'create' },
          { module: 'opd', action: 'view' },
          { module: 'opd', action: 'create' },
          { module: 'opd', action: 'edit' },
          { module: 'laboratory', action: 'view' },
          { module: 'laboratory', action: 'create' },
          { module: 'pharmacy', action: 'view' },
          { module: 'billing', action: 'view' },
          { module: 'reports', action: 'view' },
          { module: 'settings', action: 'view' },
        ] as Permission[],
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      },
    ],
  } as Staff,
  hospital: {
    id: '1',
    name: 'Lagos General Hospital',
    slug: 'lagos-general',
    email: 'info@lagosgeneral.com',
    phone: '+234 1 234 5678',
    address: '123 Healthcare Avenue, Lekki Phase 1',
    city: 'Lagos',
    state: 'Lagos',
    country: 'Nigeria',
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    localization: {
      country: 'Nigeria',
      currency: 'NGN',
      currencySymbol: '₦',
      dateFormat: 'DD/MM/YYYY',
      timeFormat: '12h',
      timezone: 'Africa/Lagos',
      language: 'en',
    },
    settings: {
      shareStaffAcrossBranches: true,
      shareInventoryAcrossBranches: false,
      centralizedBilling: true,
      requireAppointmentForVisit: false,
      allowWalkIns: true,
      defaultConsultationDuration: 30,
      workingHours: {
        monday: { isOpen: true, openTime: '08:00', closeTime: '18:00' },
        tuesday: { isOpen: true, openTime: '08:00', closeTime: '18:00' },
        wednesday: { isOpen: true, openTime: '08:00', closeTime: '18:00' },
        thursday: { isOpen: true, openTime: '08:00', closeTime: '18:00' },
        friday: { isOpen: true, openTime: '08:00', closeTime: '18:00' },
        saturday: { isOpen: true, openTime: '09:00', closeTime: '14:00' },
        sunday: { isOpen: false },
      },
    },
  } as Hospital,
  branches: [
    {
      id: '1',
      hospitalId: '1',
      name: 'Lekki Branch',
      code: 'LK',
      address: '123 Healthcare Avenue',
      city: 'Lekki',
      state: 'Lagos',
      isHeadquarters: true,
      isActive: true,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    },
    {
      id: '2',
      hospitalId: '1',
      name: 'Victoria Island',
      code: 'VI',
      address: '456 Medical Plaza',
      city: 'Victoria Island',
      state: 'Lagos',
      isHeadquarters: false,
      isActive: true,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    },
  ] as Branch[],
  token: 'mock-jwt-token',
  refreshToken: 'mock-refresh-token',
  requiresBranchSelection: true,
};

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const setAuth = useAuthStore((state) => state.setAuth);
  const isOnline = useUIStore((state) => state.isOnline);
  const addToast = useUIStore((state) => state.addToast);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: 'dr.adaeze@lagosgeneral.com',
      password: 'password123',
      rememberMe: false,
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // In production, this would be an actual API call:
      // const response = await api.post<LoginResponse>('/auth/login', data);
      
      // For now, use mock data
      const response = mockLoginResponse;

      // Set auth state
      setAuth(response);

      // Show success toast
      addToast('success', 'Welcome back!', `Logged in as ${response.user.firstName}`);

      // Navigate to dashboard (or branch selection if needed)
      navigate('/dashboard');
    } catch (error) {
      addToast('error', 'Login Failed', 'Invalid email or password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-600 via-teal-700 to-teal-800 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-600 to-teal-700 p-6 text-center">
          <div className="w-16 h-16 bg-white rounded-full mx-auto mb-4 flex items-center justify-center shadow-lg">
            <span className="text-3xl">💚</span>
          </div>
          <h1 className="text-2xl font-bold text-white">RivHeal EMR</h1>
          <p className="text-teal-100 text-sm mt-1">Hospital Management System</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              {...register('email')}
              className={cn(
                'w-full px-4 py-3 border rounded-lg transition',
                'focus:ring-2 focus:ring-teal-500 focus:border-transparent',
                errors.email ? 'border-red-500' : 'border-gray-300'
              )}
              placeholder="you@hospital.com"
              disabled={isLoading}
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                {...register('password')}
                className={cn(
                  'w-full px-4 py-3 border rounded-lg transition pr-12',
                  'focus:ring-2 focus:ring-teal-500 focus:border-transparent',
                  errors.password ? 'border-red-500' : 'border-gray-300'
                )}
                placeholder="••••••••"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {errors.password && (
              <p className="mt-1 text-sm text-red-500">{errors.password.message}</p>
            )}
          </div>

          {/* Remember Me & Forgot Password */}
          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                {...register('rememberMe')}
                className="w-4 h-4 text-teal-600 rounded focus:ring-teal-500"
                disabled={isLoading}
              />
              <span className="ml-2 text-gray-600">Remember me</span>
            </label>
            <a href="#" className="text-teal-600 hover:text-teal-700">
              Forgot password?
            </a>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            disabled={isLoading}
            className={cn(
              'w-full py-3 rounded-lg font-medium transition shadow-lg',
              'bg-gradient-to-r from-teal-600 to-teal-700 text-white',
              'hover:from-teal-700 hover:to-teal-800',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              'flex items-center justify-center gap-2'
            )}
          >
            {isLoading ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                Signing in...
              </>
            ) : (
              'Sign In'
            )}
          </button>

          {/* Online Status */}
          <div
            className={cn(
              'flex items-center justify-center gap-2 text-sm p-3 rounded-lg',
              isOnline
                ? 'bg-green-50 text-green-700 border border-green-200'
                : 'bg-orange-50 text-orange-700 border border-orange-200'
            )}
          >
            {isOnline ? (
              <>
                <Wifi size={16} />
                <span>Online • Data syncs automatically</span>
              </>
            ) : (
              <>
                <WifiOff size={16} />
                <span>Offline • Login requires internet</span>
              </>
            )}
          </div>
        </form>

        {/* Footer */}
        <div className="px-6 pb-6 text-center">
          <p className="text-xs text-gray-500">
            By signing in, you agree to our{' '}
            <a href="#" className="text-teal-600 hover:underline">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="#" className="text-teal-600 hover:underline">
              Privacy Policy
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
