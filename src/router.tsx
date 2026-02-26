import React from 'react';
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
  Outlet,
} from 'react-router-dom';
import { useAuthStore } from '@/stores/auth.store';
import { MainLayout, BranchSelectionModal } from '@/components/layout';
import { LoginPage } from '@/features/auth';
import { DashboardPage } from '@/features/dashboard';
import { PatientListPage, PatientRegistrationPage, PatientDetailPage } from '@/features/patients';
import { RolesPermissionsPage, HospitalSettingsPage } from '@/features/settings';
import { AppointmentsPage, NewAppointmentPage } from '@/features/appointments';
import { ConsultationPage, OPDQueuePage } from '@/features/opd';
import { LaboratoryPage } from '@/features/laboratory';
import { PharmacyPage } from '@/features/pharmacy';
import { BillingPage, NewInvoicePage } from '@/features/billing';
import { StaffManagementPage } from '@/features/staff';
import { InventoryPage } from '@/features/inventory';
import { WardManagementPage } from '@/features/ward';
import { EmergencyPage } from '@/features/emergency';
import { RadiologyPage } from '@/features/radiology';
import { ReportsPage } from '@/features/reports';
import { HomecarePage } from '@/features/homecare';
import { DepartmentsPage } from '@/features/departments';
import { BranchesPage } from '@/features/branches';
import { NotificationsPage } from '@/features/notifications';

// Protected Route wrapper
const ProtectedRoute: React.FC = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const requiresBranchSelection = useAuthStore((state) => state.requiresBranchSelection);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Show branch selection modal if needed
  if (requiresBranchSelection) {
    return (
      <>
        <MainLayout />
        <BranchSelectionModal />
      </>
    );
  }

  return <MainLayout />;
};

// Public Route wrapper (redirects to dashboard if already logged in)
const PublicRoute: React.FC = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};

// Placeholder page for modules not yet implemented
const PlaceholderPage: React.FC<{ title: string }> = ({ title }) => (
  <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-12 text-center">
    <div className="w-20 h-20 bg-teal-100 rounded-2xl flex items-center justify-center mx-auto mb-6 text-4xl">
      📋
    </div>
    <h2 className="text-2xl font-bold text-gray-900 mb-2">{title}</h2>
    <p className="text-gray-500 max-w-md mx-auto">
      This module is part of the RivHeal EMR system. Full implementation coming soon.
    </p>
    <div className="mt-6 flex items-center justify-center gap-2 text-sm text-teal-600">
      <span className="animate-pulse">●</span>
      <span>In Development</span>
    </div>
  </div>
);

// Create router
const router = createBrowserRouter([
  // Public routes
  {
    element: <PublicRoute />,
    children: [
      {
        path: '/login',
        element: <LoginPage />,
      },
    ],
  },

  // Protected routes
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: '/',
        element: <Navigate to="/dashboard" replace />,
      },
      {
        path: '/dashboard',
        element: <DashboardPage />,
      },
      {
        path: '/patients',
        element: <PatientListPage />,
      },
      {
        path: '/patients/new',
        element: <PatientRegistrationPage />,
      },
      {
        path: '/patients/:id',
        element: <PatientDetailPage />,
      },
      {
        path: '/patients/:id/edit',
        element: <PatientRegistrationPage />,
      },
      {
        path: '/appointments',
        element: <AppointmentsPage />,
      },
      {
        path: '/appointments/new',
        element: <NewAppointmentPage />,
      },
      {
        path: '/opd',
        element: <OPDQueuePage />,
      },
      {
        path: '/opd/new',
        element: <ConsultationPage />,
      },
      {
        path: '/opd/:visitId',
        element: <ConsultationPage />,
      },
      {
        path: '/laboratory',
        element: <LaboratoryPage />,
      },
      {
        path: '/radiology',
        element: <RadiologyPage />,
      },
      {
        path: '/pharmacy',
        element: <PharmacyPage />,
      },
      {
        path: '/billing',
        element: <BillingPage />,
      },
      {
        path: '/billing/new',
        element: <NewInvoicePage />,
      },
      {
        path: '/inventory',
        element: <InventoryPage />,
      },
      {
        path: '/ward',
        element: <WardManagementPage />,
      },
      {
        path: '/emergency',
        element: <EmergencyPage />,
      },
      {
        path: '/reports',
        element: <ReportsPage />,
      },
      {
        path: '/staff',
        element: <StaffManagementPage />,
      },
      {
        path: '/roles',
        element: <RolesPermissionsPage />,
      },
      {
        path: '/settings',
        element: <HospitalSettingsPage />,
      },
      {
        path: '/homecare',
        element: <HomecarePage />,
      },
      {
        path: '/departments',
        element: <DepartmentsPage />,
      },
      {
        path: '/branches',
        element: <BranchesPage />,
      },
      {
        path: '/notifications',
        element: <NotificationsPage />,
      },
    ],
  },

  // Catch-all redirect
  {
    path: '*',
    element: <Navigate to="/dashboard" replace />,
  },
]);

export const AppRouter: React.FC = () => {
  return <RouterProvider router={router} />;
};

export default AppRouter;
