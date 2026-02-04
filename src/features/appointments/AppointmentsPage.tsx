import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '@/stores/auth.store';
import { formatDate, formatCurrency, cn } from '@/utils';
import {
  Plus,
  Calendar,
  List,
  Clock,
  User,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Check,
  X,
  Phone,
  MapPin,
  AlertCircle,
  Play,
  Pause,
  SkipForward,
} from 'lucide-react';
import type { Appointment, AppointmentStatus, AppointmentType } from '@/types';

// Mock appointments data
const mockAppointments: (Appointment & { patientName: string; patientPhone: string; doctorName: string; department: string })[] = [
  {
    id: '1',
    patientId: '1',
    patientName: 'Chioma Okonkwo',
    patientPhone: '+234 801 234 5678',
    doctorId: 'd1',
    doctorName: 'Dr. Adaeze Obi',
    department: 'General Medicine',
    branchId: '1',
    appointmentDate: '2024-01-25',
    appointmentTime: '09:00',
    endTime: '09:30',
    type: 'consultation',
    status: 'checked_in',
    queueNumber: 1,
    chiefComplaint: 'Routine checkup and asthma follow-up',
    createdAt: '2024-01-20T10:00:00Z',
    updatedAt: '2024-01-25T08:45:00Z',
  },
  {
    id: '2',
    patientId: '2',
    patientName: 'Emeka Nnamdi',
    patientPhone: '+234 803 456 7890',
    doctorId: 'd1',
    doctorName: 'Dr. Adaeze Obi',
    department: 'General Medicine',
    branchId: '1',
    appointmentDate: '2024-01-25',
    appointmentTime: '09:30',
    endTime: '10:00',
    type: 'follow_up',
    status: 'in_progress',
    queueNumber: 2,
    chiefComplaint: 'Hypertension medication review',
    createdAt: '2024-01-18T10:00:00Z',
    updatedAt: '2024-01-25T09:35:00Z',
  },
  {
    id: '3',
    patientId: '3',
    patientName: 'Fatima Ibrahim',
    patientPhone: '+234 805 678 9012',
    doctorId: 'd1',
    doctorName: 'Dr. Adaeze Obi',
    department: 'General Medicine',
    branchId: '1',
    appointmentDate: '2024-01-25',
    appointmentTime: '10:00',
    endTime: '10:30',
    type: 'consultation',
    status: 'scheduled',
    queueNumber: 3,
    chiefComplaint: 'Diabetes management consultation',
    createdAt: '2024-01-22T10:00:00Z',
    updatedAt: '2024-01-22T10:00:00Z',
  },
  {
    id: '4',
    patientId: '4',
    patientName: 'Oluwaseun Adeleke',
    patientPhone: '+234 807 890 1234',
    doctorId: 'd2',
    doctorName: 'Dr. Emeka Nnamdi',
    department: 'Cardiology',
    branchId: '1',
    appointmentDate: '2024-01-25',
    appointmentTime: '10:30',
    endTime: '11:00',
    type: 'new_patient',
    status: 'scheduled',
    queueNumber: 4,
    chiefComplaint: 'Chest pain evaluation',
    createdAt: '2024-01-23T10:00:00Z',
    updatedAt: '2024-01-23T10:00:00Z',
  },
  {
    id: '5',
    patientId: '5',
    patientName: 'Ngozi Eze',
    patientPhone: '+234 809 012 3456',
    doctorId: 'd1',
    doctorName: 'Dr. Adaeze Obi',
    department: 'General Medicine',
    branchId: '1',
    appointmentDate: '2024-01-25',
    appointmentTime: '11:00',
    endTime: '11:30',
    type: 'follow_up',
    status: 'scheduled',
    chiefComplaint: 'Migraine follow-up',
    createdAt: '2024-01-24T10:00:00Z',
    updatedAt: '2024-01-24T10:00:00Z',
  },
  {
    id: '6',
    patientId: '6',
    patientName: 'Ahmed Bello',
    patientPhone: '+234 811 234 5678',
    doctorId: 'd1',
    doctorName: 'Dr. Adaeze Obi',
    department: 'General Medicine',
    branchId: '1',
    appointmentDate: '2024-01-25',
    appointmentTime: '08:30',
    endTime: '09:00',
    type: 'consultation',
    status: 'completed',
    queueNumber: 0,
    chiefComplaint: 'Annual physical examination',
    createdAt: '2024-01-19T10:00:00Z',
    updatedAt: '2024-01-25T09:00:00Z',
  },
  {
    id: '7',
    patientId: '7',
    patientName: 'Grace Okafor',
    patientPhone: '+234 812 345 6789',
    doctorId: 'd1',
    doctorName: 'Dr. Adaeze Obi',
    department: 'General Medicine',
    branchId: '1',
    appointmentDate: '2024-01-25',
    appointmentTime: '14:00',
    endTime: '14:30',
    type: 'consultation',
    status: 'cancelled',
    chiefComplaint: 'Skin rash consultation',
    notes: 'Patient called to cancel - will reschedule',
    createdAt: '2024-01-21T10:00:00Z',
    updatedAt: '2024-01-24T16:00:00Z',
  },
];

const statusConfig: Record<AppointmentStatus, { label: string; color: string; bg: string }> = {
  scheduled: { label: 'Scheduled', color: 'text-blue-700', bg: 'bg-blue-100' },
  confirmed: { label: 'Confirmed', color: 'text-purple-700', bg: 'bg-purple-100' },
  checked_in: { label: 'Checked In', color: 'text-orange-700', bg: 'bg-orange-100' },
  in_progress: { label: 'In Progress', color: 'text-teal-700', bg: 'bg-teal-100' },
  completed: { label: 'Completed', color: 'text-green-700', bg: 'bg-green-100' },
  cancelled: { label: 'Cancelled', color: 'text-red-700', bg: 'bg-red-100' },
  no_show: { label: 'No Show', color: 'text-gray-700', bg: 'bg-gray-100' },
};

const typeConfig: Record<AppointmentType, { label: string; color: string }> = {
  consultation: { label: 'Consultation', color: 'text-blue-600' },
  follow_up: { label: 'Follow-up', color: 'text-green-600' },
  new_patient: { label: 'New Patient', color: 'text-purple-600' },
  emergency: { label: 'Emergency', color: 'text-red-600' },
  telemedicine: { label: 'Telemedicine', color: 'text-teal-600' },
};

type ViewMode = 'list' | 'queue';

export const AppointmentsPage: React.FC = () => {
  const canCreate = useAuthStore((state) => state.canCreate);
  const hospital = useAuthStore((state) => state.hospital);

  // State
  const [viewMode, setViewMode] = useState<ViewMode>('queue');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<AppointmentStatus | ''>('');
  const [departmentFilter, setDepartmentFilter] = useState('');

  // Get unique departments
  const departments = [...new Set(mockAppointments.map((a) => a.department))];

  // Filter appointments
  const filteredAppointments = useMemo(() => {
    return mockAppointments.filter((apt) => {
      const matchesSearch =
        !searchQuery ||
        apt.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        apt.doctorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        apt.patientPhone.includes(searchQuery);

      const matchesStatus = !statusFilter || apt.status === statusFilter;
      const matchesDepartment = !departmentFilter || apt.department === departmentFilter;
      const matchesDate = apt.appointmentDate === selectedDate;

      return matchesSearch && matchesStatus && matchesDepartment && matchesDate;
    });
  }, [searchQuery, statusFilter, departmentFilter, selectedDate]);

  // Queue: Only show active appointments sorted by queue number
  const queueAppointments = useMemo(() => {
    return filteredAppointments
      .filter((apt) => ['checked_in', 'in_progress', 'scheduled', 'confirmed'].includes(apt.status))
      .sort((a, b) => {
        // In progress first, then checked in, then by time
        if (a.status === 'in_progress') return -1;
        if (b.status === 'in_progress') return 1;
        if (a.status === 'checked_in' && b.status !== 'checked_in') return -1;
        if (b.status === 'checked_in' && a.status !== 'checked_in') return 1;
        return a.appointmentTime.localeCompare(b.appointmentTime);
      });
  }, [filteredAppointments]);

  // Stats
  const stats = useMemo(() => {
    const today = mockAppointments.filter((a) => a.appointmentDate === selectedDate);
    return {
      total: today.length,
      completed: today.filter((a) => a.status === 'completed').length,
      inQueue: today.filter((a) => ['checked_in', 'in_progress'].includes(a.status)).length,
      upcoming: today.filter((a) => ['scheduled', 'confirmed'].includes(a.status)).length,
      cancelled: today.filter((a) => a.status === 'cancelled').length,
    };
  }, [selectedDate]);

  // Date navigation
  const navigateDate = (direction: 'prev' | 'next') => {
    const date = new Date(selectedDate);
    date.setDate(date.getDate() + (direction === 'next' ? 1 : -1));
    setSelectedDate(date.toISOString().split('T')[0]);
  };

  const isToday = selectedDate === new Date().toISOString().split('T')[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Appointments</h1>
          <p className="text-gray-500">Manage patient appointments and queue</p>
        </div>
        <div className="flex items-center gap-3">
          {/* View Toggle */}
          <div className="flex items-center bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('queue')}
              className={cn(
                'flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition',
                viewMode === 'queue' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'
              )}
            >
              <Clock size={16} />
              Queue
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={cn(
                'flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition',
                viewMode === 'list' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'
              )}
            >
              <List size={16} />
              List
            </button>
          </div>

          {canCreate('appointments') && (
            <Link
              to="/appointments/new"
              className="inline-flex items-center gap-2 bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition"
            >
              <Plus size={18} />
              New Appointment
            </Link>
          )}
        </div>
      </div>

      {/* Date Selector & Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Date Picker */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <div className="flex items-center justify-between mb-3">
            <button
              onClick={() => navigateDate('prev')}
              className="p-1.5 hover:bg-gray-100 rounded-lg transition"
            >
              <ChevronLeft size={18} />
            </button>
            <div className="text-center">
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="text-lg font-semibold text-gray-900 bg-transparent border-none text-center cursor-pointer"
              />
              {isToday && (
                <span className="text-xs text-teal-600 font-medium">Today</span>
              )}
            </div>
            <button
              onClick={() => navigateDate('next')}
              className="p-1.5 hover:bg-gray-100 rounded-lg transition"
            >
              <ChevronRight size={18} />
            </button>
          </div>
          {!isToday && (
            <button
              onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}
              className="w-full text-sm text-teal-600 hover:text-teal-700"
            >
              Go to Today
            </button>
          )}
        </div>

        {/* Stats Cards */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
            <Calendar size={24} className="text-blue-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            <p className="text-sm text-gray-500">Total Appointments</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center gap-4">
          <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
            <Clock size={24} className="text-orange-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{stats.inQueue}</p>
            <p className="text-sm text-gray-500">In Queue</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center gap-4">
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
            <Check size={24} className="text-green-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{stats.completed}</p>
            <p className="text-sm text-gray-500">Completed</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search patient or doctor..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
            />
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as AppointmentStatus | '')}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
          >
            <option value="">All Statuses</option>
            {Object.entries(statusConfig).map(([key, { label }]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>

          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
          >
            <option value="">All Departments</option>
            {departments.map((dept) => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Queue View */}
      {viewMode === 'queue' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Current Patient */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-semibold text-gray-900">Now Serving</h2>
              <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
            </div>
            {queueAppointments.find((a) => a.status === 'in_progress') ? (
              <div className="p-6">
                {(() => {
                  const current = queueAppointments.find((a) => a.status === 'in_progress')!;
                  return (
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-teal-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
                            {current.patientName.split(' ').map((n) => n[0]).join('')}
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-gray-900">{current.patientName}</h3>
                            <p className="text-gray-500">{current.department}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-3xl font-bold text-teal-600">#{current.queueNumber}</p>
                          <p className="text-sm text-gray-500">{current.appointmentTime}</p>
                        </div>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-4 mb-4">
                        <p className="text-sm text-gray-500 mb-1">Chief Complaint</p>
                        <p className="text-gray-900">{current.chiefComplaint}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Link
                          to={`/opd/${current.id}`}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition"
                        >
                          <Play size={18} />
                          Continue Consultation
                        </Link>
                        <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition">
                          <SkipForward size={18} />
                        </button>
                      </div>
                    </div>
                  );
                })()}
              </div>
            ) : (
              <div className="p-12 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <User size={32} className="text-gray-400" />
                </div>
                <p className="text-gray-500">No patient currently being served</p>
                {queueAppointments.filter((a) => a.status === 'checked_in').length > 0 && (
                  <button className="mt-4 text-teal-600 font-medium hover:text-teal-700">
                    Call Next Patient
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Queue List */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900">
                Waiting Queue ({queueAppointments.filter((a) => a.status === 'checked_in').length})
              </h2>
            </div>
            <div className="divide-y divide-gray-100 max-h-[500px] overflow-y-auto">
              {queueAppointments
                .filter((a) => a.status !== 'in_progress')
                .map((apt, index) => (
                  <div
                    key={apt.id}
                    className={cn(
                      'p-4 hover:bg-gray-50 transition',
                      apt.status === 'checked_in' && 'bg-orange-50'
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          'w-10 h-10 rounded-full flex items-center justify-center font-bold',
                          apt.status === 'checked_in'
                            ? 'bg-orange-500 text-white'
                            : 'bg-gray-200 text-gray-600'
                        )}>
                          {apt.queueNumber || index + 1}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{apt.patientName}</p>
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Clock size={12} />
                            <span>{apt.appointmentTime}</span>
                            <span>•</span>
                            <span className={typeConfig[apt.type].color}>{typeConfig[apt.type].label}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={cn('px-2 py-1 rounded-full text-xs font-medium', statusConfig[apt.status].bg, statusConfig[apt.status].color)}>
                          {statusConfig[apt.status].label}
                        </span>
                        {apt.status === 'checked_in' && (
                          <Link
                            to={`/opd/${apt.id}`}
                            className="p-2 text-teal-600 hover:bg-teal-50 rounded-lg transition"
                            title="Start Consultation"
                          >
                            <Play size={16} />
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

              {queueAppointments.filter((a) => a.status !== 'in_progress').length === 0 && (
                <div className="p-8 text-center text-gray-500">
                  No patients in queue
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Time</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Patient</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Doctor</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Chief Complaint</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredAppointments
                  .sort((a, b) => a.appointmentTime.localeCompare(b.appointmentTime))
                  .map((apt) => (
                    <tr key={apt.id} className="hover:bg-gray-50 transition">
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-900">{apt.appointmentTime}</p>
                        <p className="text-xs text-gray-500">{apt.endTime}</p>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-teal-600 rounded-full flex items-center justify-center text-white text-xs font-medium">
                            {apt.patientName.split(' ').map((n) => n[0]).join('')}
                          </div>
                          <div>
                            <Link to={`/patients/${apt.patientId}`} className="font-medium text-gray-900 hover:text-teal-600">
                              {apt.patientName}
                            </Link>
                            <p className="text-xs text-gray-500">{apt.patientPhone}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-gray-900">{apt.doctorName}</p>
                        <p className="text-xs text-gray-500">{apt.department}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className={cn('text-sm font-medium', typeConfig[apt.type].color)}>
                          {typeConfig[apt.type].label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={cn('px-2 py-1 rounded-full text-xs font-medium', statusConfig[apt.status].bg, statusConfig[apt.status].color)}>
                          {statusConfig[apt.status].label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm text-gray-600 truncate max-w-[200px]" title={apt.chiefComplaint}>
                          {apt.chiefComplaint}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          {apt.status === 'scheduled' && (
                            <button className="p-1.5 text-green-600 hover:bg-green-50 rounded transition" title="Check In">
                              <Check size={16} />
                            </button>
                          )}
                          {apt.status === 'checked_in' && (
                            <Link to={`/opd/${apt.id}`} className="p-1.5 text-teal-600 hover:bg-teal-50 rounded transition" title="Start">
                              <Play size={16} />
                            </Link>
                          )}
                          {apt.status === 'in_progress' && (
                            <Link to={`/opd/${apt.id}`} className="p-1.5 text-teal-600 hover:bg-teal-50 rounded transition" title="Continue">
                              <Play size={16} />
                            </Link>
                          )}
                          {['scheduled', 'confirmed'].includes(apt.status) && (
                            <button className="p-1.5 text-red-600 hover:bg-red-50 rounded transition" title="Cancel">
                              <X size={16} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>

          {filteredAppointments.length === 0 && (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar size={32} className="text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">No appointments found</h3>
              <p className="text-gray-500">
                {searchQuery || statusFilter || departmentFilter
                  ? 'Try adjusting your filters'
                  : 'No appointments scheduled for this date'}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AppointmentsPage;
