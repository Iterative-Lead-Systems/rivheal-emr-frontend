import React from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '@/stores/auth.store';
import { formatCurrency } from '@/utils';
import {
  Users,
  Clock,
  Calendar,
  FlaskConical,
  BedDouble,
  TrendingUp,
  Plus,
  ArrowRight,
  UserPlus,
  Stethoscope,
  Pill,
  Receipt,
} from 'lucide-react';

// Mock data for dashboard
const mockStats = {
  todayPatients: 47,
  inQueue: 12,
  appointments: 23,
  pendingLabs: 8,
  bedOccupancy: 78,
  revenue: 2450000,
};

const mockAppointments = [
  { time: '09:00', patient: 'Chioma Okonkwo', type: 'Follow-up', status: 'Checked In' },
  { time: '09:30', patient: 'Emeka Nnamdi', type: 'New Visit', status: 'In Progress' },
  { time: '10:00', patient: 'Fatima Ibrahim', type: 'Review', status: 'Waiting' },
  { time: '10:30', patient: 'Oluwaseun Adeleke', type: 'Consultation', status: 'Scheduled' },
  { time: '11:00', patient: 'Ngozi Eze', type: 'Follow-up', status: 'Scheduled' },
];

const mockPatients = [
  { id: 'RH-001234', name: 'Chioma Okonkwo', age: 32, gender: 'F', dept: 'General Medicine', status: 'In Queue' },
  { id: 'RH-001235', name: 'Emeka Nnamdi', age: 45, gender: 'M', dept: 'Cardiology', status: 'With Doctor' },
  { id: 'RH-001236', name: 'Fatima Ibrahim', age: 58, gender: 'F', dept: 'Endocrinology', status: 'Lab Pending' },
  { id: 'RH-001237', name: 'Oluwaseun Adeleke', age: 28, gender: 'M', dept: 'Orthopedics', status: 'Billing' },
];

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  trend?: string;
  color: 'teal' | 'blue' | 'purple' | 'orange' | 'red' | 'green';
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, trend, color }) => {
  const colorClasses = {
    teal: 'bg-teal-50 text-teal-600 border-teal-100',
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    purple: 'bg-purple-50 text-purple-600 border-purple-100',
    orange: 'bg-orange-50 text-orange-600 border-orange-100',
    red: 'bg-red-50 text-red-600 border-red-100',
    green: 'bg-green-50 text-green-600 border-green-100',
  };

  return (
    <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {trend && (
            <div className="flex items-center gap-1 mt-1">
              <TrendingUp size={14} className="text-green-500" />
              <span className="text-xs text-green-600">{trend}</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-xl border ${colorClasses[color]}`}>
          <Icon size={24} />
        </div>
      </div>
    </div>
  );
};

const statusColors: Record<string, string> = {
  'Checked In': 'bg-green-100 text-green-700',
  'In Progress': 'bg-blue-100 text-blue-700',
  'Waiting': 'bg-yellow-100 text-yellow-700',
  'Scheduled': 'bg-gray-100 text-gray-700',
  'In Queue': 'bg-yellow-100 text-yellow-700',
  'With Doctor': 'bg-blue-100 text-blue-700',
  'Lab Pending': 'bg-purple-100 text-purple-700',
  'Billing': 'bg-green-100 text-green-700',
};

export const DashboardPage: React.FC = () => {
  const user = useAuthStore((state) => state.user);
  const hospital = useAuthStore((state) => state.hospital);

  const currency = hospital?.localization?.currency || 'NGN';

  // Get greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {getGreeting()}, Dr. {user?.firstName} 👋
          </h1>
          <p className="text-gray-500">
            Here's what's happening at {hospital?.name} today.
          </p>
        </div>
        <Link
          to="/patients/new"
          className="inline-flex items-center justify-center gap-2 bg-teal-600 text-white px-4 py-2.5 rounded-lg hover:bg-teal-700 transition shadow-lg"
        >
          <Plus size={20} />
          New Patient
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard
          title="Today's Patients"
          value={mockStats.todayPatients}
          icon={Users}
          trend="+12% from yesterday"
          color="teal"
        />
        <StatCard
          title="In Queue"
          value={mockStats.inQueue}
          icon={Clock}
          color="blue"
        />
        <StatCard
          title="Appointments"
          value={mockStats.appointments}
          icon={Calendar}
          color="purple"
        />
        <StatCard
          title="Pending Labs"
          value={mockStats.pendingLabs}
          icon={FlaskConical}
          color="orange"
        />
        <StatCard
          title="Bed Occupancy"
          value={`${mockStats.bedOccupancy}%`}
          icon={BedDouble}
          color="red"
        />
        <StatCard
          title="Today's Revenue"
          value={formatCurrency(mockStats.revenue, currency)}
          icon={TrendingUp}
          color="green"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Appointments */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Today's Appointments</h2>
            <Link
              to="/appointments"
              className="text-sm text-teal-600 hover:text-teal-700 font-medium flex items-center gap-1"
            >
              View All <ArrowRight size={14} />
            </Link>
          </div>
          <div className="divide-y divide-gray-100">
            {mockAppointments.map((apt, idx) => (
              <div
                key={idx}
                className="p-4 flex items-center justify-between hover:bg-gray-50 transition"
              >
                <div className="flex items-center gap-4">
                  <div className="text-center bg-gray-100 rounded-lg px-3 py-2 min-w-[60px]">
                    <p className="text-lg font-bold text-gray-900">{apt.time}</p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{apt.patient}</p>
                    <p className="text-sm text-gray-500">{apt.type}</p>
                  </div>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    statusColors[apt.status] || 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {apt.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
          <div className="p-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Quick Actions</h2>
          </div>
          <div className="p-4 space-y-3">
            {[
              { label: 'Register New Patient', icon: UserPlus, path: '/patients/new', color: 'teal' },
              { label: 'Book Appointment', icon: Calendar, path: '/appointments/new', color: 'blue' },
              { label: 'Start Consultation', icon: Stethoscope, path: '/opd', color: 'purple' },
              { label: 'Order Lab Test', icon: FlaskConical, path: '/laboratory/new', color: 'orange' },
              { label: 'Issue Prescription', icon: Pill, path: '/pharmacy', color: 'green' },
              { label: 'Generate Bill', icon: Receipt, path: '/billing/new', color: 'red' },
            ].map((action, idx) => (
              <Link
                key={idx}
                to={action.path}
                className="w-full flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-teal-300 hover:bg-teal-50 transition"
              >
                <div className="p-2 rounded-lg bg-gray-100">
                  <action.icon size={20} className="text-gray-600" />
                </div>
                <span className="font-medium text-gray-700">{action.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Patients Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">Recent Patients</h2>
          <Link
            to="/patients"
            className="text-sm text-teal-600 hover:text-teal-700 font-medium flex items-center gap-1"
          >
            View All <ArrowRight size={14} />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">
                  Patient ID
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">
                  Name
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">
                  Age/Gender
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">
                  Department
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {mockPatients.map((patient) => (
                <tr key={patient.id} className="hover:bg-gray-50 transition">
                  <td className="px-4 py-3">
                    <span className="font-mono text-sm text-teal-600 bg-teal-50 px-2 py-1 rounded">
                      {patient.id}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-teal-600 rounded-full flex items-center justify-center text-white text-xs font-medium">
                        {patient.name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')}
                      </div>
                      <span className="font-medium text-gray-900">{patient.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {patient.age}y / {patient.gender}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{patient.dept}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        statusColors[patient.status] || 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {patient.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      to={`/patients/${patient.id}`}
                      className="text-teal-600 hover:text-teal-700 text-sm font-medium"
                    >
                      View →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
