import React, { useState } from 'react';
import {
  Building2, Users, Plus, Search, Edit2, 
  MoreVertical, XCircle, Stethoscope, TestTube,
  Heart, Brain, Baby, Bone, Microscope, Pill, 
  Ambulance, Settings, 
} from 'lucide-react';

// Types
interface Department {
  id: string;
  code: string;
  name: string;
  type: 'clinical' | 'diagnostic' | 'support' | 'administrative';
  status: 'active' | 'inactive' | 'suspended';
  headOfDepartment?: string;
  consultationFee: number;
  followUpFee: number;
  slotDuration: number;
  maxDailyAppointments: number;
  services: string[];
  staffCount: number;
  todayAppointments: number;
  color: string;
  icon: string;
  operatingHours: Record<string, { open: string; close: string }>;
  displayOrder: number;
}

// Department icons mapping
const departmentIcons: Record<string, React.ReactNode> = {
  general: <Stethoscope className="h-5 w-5" />,
  cardiology: <Heart className="h-5 w-5" />,
  neurology: <Brain className="h-5 w-5" />,
  pediatrics: <Baby className="h-5 w-5" />,
  orthopedics: <Bone className="h-5 w-5" />,
  laboratory: <TestTube className="h-5 w-5" />,
  radiology: <Microscope className="h-5 w-5" />,
  pharmacy: <Pill className="h-5 w-5" />,
  emergency: <Ambulance className="h-5 w-5" />,
  default: <Building2 className="h-5 w-5" />,
};

// Mock data
const mockDepartments: Department[] = [
  {
    id: '1',
    code: 'GEN-MED',
    name: 'General Medicine',
    type: 'clinical',
    status: 'active',
    headOfDepartment: 'Dr. Adebayo Ogundimu',
    consultationFee: 5000,
    followUpFee: 3000,
    slotDuration: 15,
    maxDailyAppointments: 50,
    services: ['General Consultation', 'Health Checkup', 'Chronic Disease Management'],
    staffCount: 12,
    todayAppointments: 34,
    color: '#0d9488',
    icon: 'general',
    operatingHours: {
      monday: { open: '08:00', close: '18:00' },
      tuesday: { open: '08:00', close: '18:00' },
      wednesday: { open: '08:00', close: '18:00' },
      thursday: { open: '08:00', close: '18:00' },
      friday: { open: '08:00', close: '18:00' },
      saturday: { open: '09:00', close: '14:00' },
    },
    displayOrder: 1,
  },
  {
    id: '2',
    code: 'CARD',
    name: 'Cardiology',
    type: 'clinical',
    status: 'active',
    headOfDepartment: 'Dr. Chioma Nwosu',
    consultationFee: 15000,
    followUpFee: 8000,
    slotDuration: 30,
    maxDailyAppointments: 20,
    services: ['ECG', 'Echocardiogram', 'Cardiac Consultation', 'Stress Test'],
    staffCount: 8,
    todayAppointments: 12,
    color: '#dc2626',
    icon: 'cardiology',
    operatingHours: {
      monday: { open: '09:00', close: '17:00' },
      tuesday: { open: '09:00', close: '17:00' },
      wednesday: { open: '09:00', close: '17:00' },
      thursday: { open: '09:00', close: '17:00' },
      friday: { open: '09:00', close: '17:00' },
    },
    displayOrder: 2,
  },
  {
    id: '3',
    code: 'PED',
    name: 'Pediatrics',
    type: 'clinical',
    status: 'active',
    headOfDepartment: 'Dr. Fatima Bello',
    consultationFee: 7000,
    followUpFee: 4000,
    slotDuration: 20,
    maxDailyAppointments: 40,
    services: ['Child Wellness', 'Immunization', 'Growth Monitoring', 'Pediatric Emergency'],
    staffCount: 10,
    todayAppointments: 28,
    color: '#f59e0b',
    icon: 'pediatrics',
    operatingHours: {
      monday: { open: '08:00', close: '18:00' },
      tuesday: { open: '08:00', close: '18:00' },
      wednesday: { open: '08:00', close: '18:00' },
      thursday: { open: '08:00', close: '18:00' },
      friday: { open: '08:00', close: '18:00' },
      saturday: { open: '09:00', close: '14:00' },
    },
    displayOrder: 3,
  },
  {
    id: '4',
    code: 'LAB',
    name: 'Laboratory',
    type: 'diagnostic',
    status: 'active',
    headOfDepartment: 'Dr. Emmanuel Okoro',
    consultationFee: 0,
    followUpFee: 0,
    slotDuration: 10,
    maxDailyAppointments: 100,
    services: ['Blood Tests', 'Urinalysis', 'Microbiology', 'Histopathology'],
    staffCount: 15,
    todayAppointments: 67,
    color: '#8b5cf6',
    icon: 'laboratory',
    operatingHours: {
      monday: { open: '07:00', close: '20:00' },
      tuesday: { open: '07:00', close: '20:00' },
      wednesday: { open: '07:00', close: '20:00' },
      thursday: { open: '07:00', close: '20:00' },
      friday: { open: '07:00', close: '20:00' },
      saturday: { open: '08:00', close: '16:00' },
      sunday: { open: '09:00', close: '14:00' },
    },
    displayOrder: 4,
  },
  {
    id: '5',
    code: 'RAD',
    name: 'Radiology',
    type: 'diagnostic',
    status: 'active',
    headOfDepartment: 'Dr. Ngozi Ike',
    consultationFee: 0,
    followUpFee: 0,
    slotDuration: 20,
    maxDailyAppointments: 30,
    services: ['X-Ray', 'CT Scan', 'MRI', 'Ultrasound', 'Mammography'],
    staffCount: 8,
    todayAppointments: 18,
    color: '#06b6d4',
    icon: 'radiology',
    operatingHours: {
      monday: { open: '08:00', close: '18:00' },
      tuesday: { open: '08:00', close: '18:00' },
      wednesday: { open: '08:00', close: '18:00' },
      thursday: { open: '08:00', close: '18:00' },
      friday: { open: '08:00', close: '18:00' },
    },
    displayOrder: 5,
  },
  {
    id: '6',
    code: 'ER',
    name: 'Emergency',
    type: 'clinical',
    status: 'active',
    headOfDepartment: 'Dr. Ahmed Yusuf',
    consultationFee: 10000,
    followUpFee: 5000,
    slotDuration: 0,
    maxDailyAppointments: 0,
    services: ['Trauma Care', 'Critical Care', 'Emergency Surgery', 'Resuscitation'],
    staffCount: 20,
    todayAppointments: 15,
    color: '#ef4444',
    icon: 'emergency',
    operatingHours: {
      monday: { open: '00:00', close: '23:59' },
      tuesday: { open: '00:00', close: '23:59' },
      wednesday: { open: '00:00', close: '23:59' },
      thursday: { open: '00:00', close: '23:59' },
      friday: { open: '00:00', close: '23:59' },
      saturday: { open: '00:00', close: '23:59' },
      sunday: { open: '00:00', close: '23:59' },
    },
    displayOrder: 6,
  },
];

export const DepartmentsPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
      suspended: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      clinical: 'bg-teal-100 text-teal-800',
      diagnostic: 'bg-purple-100 text-purple-800',
      support: 'bg-blue-100 text-blue-800',
      administrative: 'bg-orange-100 text-orange-800',
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(amount);
  };

  const filteredDepartments = mockDepartments.filter(dept => {
    const matchesSearch = dept.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         dept.code.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'all' || dept.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const stats = {
    total: mockDepartments.length,
    clinical: mockDepartments.filter(d => d.type === 'clinical').length,
    diagnostic: mockDepartments.filter(d => d.type === 'diagnostic').length,
    totalStaff: mockDepartments.reduce((sum, d) => sum + d.staffCount, 0),
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Departments</h1>
          <p className="text-gray-600 mt-1">Manage hospital departments and their settings</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Department
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-teal-100 rounded-xl">
              <Building2 className="h-6 w-6 text-teal-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              <p className="text-sm text-gray-500">Total Departments</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-xl">
              <Stethoscope className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.clinical}</p>
              <p className="text-sm text-gray-500">Clinical Departments</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-100 rounded-xl">
              <TestTube className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.diagnostic}</p>
              <p className="text-sm text-gray-500">Diagnostic Departments</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 rounded-xl">
              <Users className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.totalStaff}</p>
              <p className="text-sm text-gray-500">Total Staff</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-xl border border-gray-100">
        {/* Search & Filter */}
        <div className="p-4 border-b border-gray-100">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search departments..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500"
            >
              <option value="all">All Types</option>
              <option value="clinical">Clinical</option>
              <option value="diagnostic">Diagnostic</option>
              <option value="support">Support</option>
              <option value="administrative">Administrative</option>
            </select>
          </div>
        </div>

        {/* Departments Grid */}
        <div className="p-4">
          <div className="grid grid-cols-2 gap-4">
            {filteredDepartments.map(dept => (
              <div
                key={dept.id}
                className="p-4 border border-gray-100 rounded-xl hover:shadow-md transition-shadow cursor-pointer group"
                onClick={() => setSelectedDepartment(dept)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="p-3 rounded-xl"
                      style={{ backgroundColor: `${dept.color}20`, color: dept.color }}
                    >
                      {departmentIcons[dept.icon] || departmentIcons.default}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-900">{dept.name}</h3>
                        <span className="text-xs text-gray-500 font-mono">{dept.code}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`px-2 py-0.5 rounded-full text-xs ${getTypeColor(dept.type)}`}>
                          {dept.type}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-xs ${getStatusColor(dept.status)}`}>
                          {dept.status}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button className="p-2 hover:bg-gray-100 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                    <MoreVertical className="h-4 w-4 text-gray-400" />
                  </button>
                </div>

                {dept.headOfDepartment && (
                  <p className="text-sm text-gray-600 mt-3">
                    <span className="text-gray-400">Head:</span> {dept.headOfDepartment}
                  </p>
                )}

                <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-gray-100">
                  <div className="text-center">
                    <p className="text-lg font-semibold text-gray-900">{dept.staffCount}</p>
                    <p className="text-xs text-gray-500">Staff</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-semibold text-teal-600">{dept.todayAppointments}</p>
                    <p className="text-xs text-gray-500">Today</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-semibold text-gray-900">
                      {dept.consultationFee > 0 ? formatCurrency(dept.consultationFee) : 'N/A'}
                    </p>
                    <p className="text-xs text-gray-500">Fee</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1 mt-3">
                  {dept.services.slice(0, 3).map((service, i) => (
                    <span key={i} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                      {service}
                    </span>
                  ))}
                  {dept.services.length > 3 && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                      +{dept.services.length - 3} more
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Department Detail Modal */}
      {selectedDepartment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setSelectedDepartment(null)}>
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div
                    className="p-4 rounded-xl"
                    style={{ backgroundColor: `${selectedDepartment.color}20`, color: selectedDepartment.color }}
                  >
                    {departmentIcons[selectedDepartment.icon] || departmentIcons.default}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">{selectedDepartment.name}</h2>
                    <p className="text-gray-500">{selectedDepartment.code}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedDepartment(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <XCircle className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Type</p>
                  <span className={`px-2 py-1 rounded-full text-sm ${getTypeColor(selectedDepartment.type)}`}>
                    {selectedDepartment.type}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <span className={`px-2 py-1 rounded-full text-sm ${getStatusColor(selectedDepartment.status)}`}>
                    {selectedDepartment.status}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Head of Department</p>
                  <p className="font-medium">{selectedDepartment.headOfDepartment || 'Not assigned'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Staff Count</p>
                  <p className="font-medium">{selectedDepartment.staffCount} members</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-500 mb-2">Consultation Fees</p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500">New Consultation</p>
                    <p className="text-lg font-semibold text-teal-600">
                      {selectedDepartment.consultationFee > 0 ? formatCurrency(selectedDepartment.consultationFee) : 'N/A'}
                    </p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500">Follow-up</p>
                    <p className="text-lg font-semibold text-teal-600">
                      {selectedDepartment.followUpFee > 0 ? formatCurrency(selectedDepartment.followUpFee) : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-500 mb-2">Appointment Settings</p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500">Slot Duration</p>
                    <p className="font-medium">{selectedDepartment.slotDuration || 'Walk-in'} min</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500">Max Daily Appointments</p>
                    <p className="font-medium">{selectedDepartment.maxDailyAppointments || 'Unlimited'}</p>
                  </div>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-500 mb-2">Services Offered</p>
                <div className="flex flex-wrap gap-2">
                  {selectedDepartment.services.map((service, i) => (
                    <span key={i} className="px-3 py-1.5 bg-teal-50 text-teal-700 rounded-lg text-sm">
                      {service}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-100">
                <button className="flex-1 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 flex items-center justify-center gap-2">
                  <Edit2 className="h-4 w-4" />
                  Edit Department
                </button>
                <button className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  View Staff
                </button>
                <button className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Settings
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DepartmentsPage;
