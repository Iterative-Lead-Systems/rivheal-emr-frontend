import React, { useState, useMemo } from 'react';
import { useAuthStore } from '@/stores/auth.store';
import { useUIStore } from '@/stores/ui.store';
import { formatDate, cn } from '@/utils';
import {
  Users,
  Search,
  Plus,
  Eye,
  Edit2,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Clock,
  Award,
  Shield,
  CheckCircle,
  XCircle,
  AlertCircle,
  UserCheck,
  UserX,
  MoreVertical,
  Download,
  Building2,
  Stethoscope,
  X,
  BadgeCheck,
  FileText,
  Activity,
} from 'lucide-react';

type StaffStatus = 'active' | 'inactive' | 'on_leave' | 'suspended' | 'terminated';
type StaffCategory = 'doctor' | 'nurse' | 'pharmacist' | 'lab_tech' | 'radiologist' | 'admin' | 'receptionist' | 'cashier' | 'other';
type ShiftType = 'morning' | 'afternoon' | 'night' | 'full_day';

interface StaffMember {
  id: string;
  staffId: string; // e.g., RH-STF-001
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  gender: 'male' | 'female';
  dateOfBirth: string;
  address: string;
  avatar?: string;
  category: StaffCategory;
  designation: string;
  department: string;
  roleId: string;
  roleName: string;
  employmentType: 'full_time' | 'part_time' | 'contract' | 'locum';
  hireDate: string;
  status: StaffStatus;
  qualifications: {
    degree: string;
    institution: string;
    year: number;
  }[];
  licenses: {
    type: string; // e.g., MDCN, PCN, NMCN
    number: string;
    expiryDate: string;
    verified: boolean;
  }[];
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
  };
  bankDetails?: {
    bankName: string;
    accountNumber: string;
    accountName: string;
  };
  currentShift?: ShiftType;
  isOnDuty: boolean;
  lastCheckIn?: string;
  lastCheckOut?: string;
}

// Mock staff data
const mockStaff: StaffMember[] = [
  {
    id: '1',
    staffId: 'RH-STF-001',
    firstName: 'Adaeze',
    lastName: 'Obi',
    email: 'adaeze.obi@rivheal.com',
    phone: '+234 803 456 7890',
    gender: 'female',
    dateOfBirth: '1985-03-15',
    address: '15 Admiralty Way, Lekki, Lagos',
    category: 'doctor',
    designation: 'Consultant Physician',
    department: 'General Medicine',
    roleId: '2',
    roleName: 'Doctor',
    employmentType: 'full_time',
    hireDate: '2020-01-15',
    status: 'active',
    qualifications: [
      { degree: 'MBBS', institution: 'University of Lagos', year: 2010 },
      { degree: 'FMCP', institution: 'National Postgraduate Medical College', year: 2018 },
    ],
    licenses: [
      { type: 'MDCN', number: 'MDCN/R/12345', expiryDate: '2025-12-31', verified: true },
    ],
    emergencyContact: {
      name: 'Chukwudi Obi',
      relationship: 'Spouse',
      phone: '+234 805 123 4567',
    },
    currentShift: 'morning',
    isOnDuty: true,
    lastCheckIn: '2024-01-25T08:00:00Z',
  },
  {
    id: '2',
    staffId: 'RH-STF-002',
    firstName: 'Chukwuemeka',
    lastName: 'Okafor',
    email: 'chukwuemeka.okafor@rivheal.com',
    phone: '+234 807 890 1234',
    gender: 'male',
    dateOfBirth: '1978-07-22',
    address: '42 Victoria Island, Lagos',
    category: 'doctor',
    designation: 'Consultant Cardiologist',
    department: 'Cardiology',
    roleId: '2',
    roleName: 'Doctor',
    employmentType: 'full_time',
    hireDate: '2019-06-01',
    status: 'active',
    qualifications: [
      { degree: 'MBBS', institution: 'University of Nigeria', year: 2003 },
      { degree: 'FWACP', institution: 'West African College of Physicians', year: 2012 },
      { degree: 'Fellowship', institution: 'Royal College of Physicians, UK', year: 2015 },
    ],
    licenses: [
      { type: 'MDCN', number: 'MDCN/R/67890', expiryDate: '2025-12-31', verified: true },
    ],
    emergencyContact: {
      name: 'Ngozi Okafor',
      relationship: 'Wife',
      phone: '+234 808 765 4321',
    },
    currentShift: 'morning',
    isOnDuty: true,
    lastCheckIn: '2024-01-25T07:45:00Z',
  },
  {
    id: '3',
    staffId: 'RH-STF-003',
    firstName: 'Ngozi',
    lastName: 'Eze',
    email: 'ngozi.eze@rivheal.com',
    phone: '+234 809 012 3456',
    gender: 'female',
    dateOfBirth: '1990-11-08',
    address: '78 Ikeja GRA, Lagos',
    category: 'pharmacist',
    designation: 'Senior Pharmacist',
    department: 'Pharmacy',
    roleId: '4',
    roleName: 'Pharmacist',
    employmentType: 'full_time',
    hireDate: '2021-03-01',
    status: 'active',
    qualifications: [
      { degree: 'B.Pharm', institution: 'University of Ibadan', year: 2013 },
      { degree: 'PharmD', institution: 'University of Lagos', year: 2018 },
    ],
    licenses: [
      { type: 'PCN', number: 'PCN/2014/5678', expiryDate: '2025-06-30', verified: true },
    ],
    emergencyContact: {
      name: 'Emeka Eze',
      relationship: 'Brother',
      phone: '+234 810 987 6543',
    },
    currentShift: 'morning',
    isOnDuty: true,
    lastCheckIn: '2024-01-25T08:30:00Z',
  },
  {
    id: '4',
    staffId: 'RH-STF-004',
    firstName: 'Blessing',
    lastName: 'Okonkwo',
    email: 'blessing.okonkwo@rivheal.com',
    phone: '+234 811 234 5678',
    gender: 'female',
    dateOfBirth: '1992-05-20',
    address: '25 Surulere, Lagos',
    category: 'nurse',
    designation: 'Senior Nursing Officer',
    department: 'Nursing',
    roleId: '3',
    roleName: 'Nurse',
    employmentType: 'full_time',
    hireDate: '2020-08-15',
    status: 'active',
    qualifications: [
      { degree: 'RN', institution: 'Lagos University Teaching Hospital', year: 2014 },
      { degree: 'BNSc', institution: 'University of Lagos', year: 2018 },
    ],
    licenses: [
      { type: 'NMCN', number: 'NMCN/RN/23456', expiryDate: '2025-09-30', verified: true },
    ],
    emergencyContact: {
      name: 'Chidinma Okonkwo',
      relationship: 'Mother',
      phone: '+234 812 345 6789',
    },
    currentShift: 'afternoon',
    isOnDuty: false,
    lastCheckIn: '2024-01-24T14:00:00Z',
    lastCheckOut: '2024-01-24T22:00:00Z',
  },
  {
    id: '5',
    staffId: 'RH-STF-005',
    firstName: 'Emmanuel',
    lastName: 'Adeyemi',
    email: 'emmanuel.adeyemi@rivheal.com',
    phone: '+234 813 456 7890',
    gender: 'male',
    dateOfBirth: '1988-09-12',
    address: '10 Yaba, Lagos',
    category: 'lab_tech',
    designation: 'Chief Medical Laboratory Scientist',
    department: 'Laboratory',
    roleId: '5',
    roleName: 'Lab Technician',
    employmentType: 'full_time',
    hireDate: '2019-11-01',
    status: 'active',
    qualifications: [
      { degree: 'BMLS', institution: 'University of Benin', year: 2011 },
      { degree: 'MSc', institution: 'University of Lagos', year: 2016 },
    ],
    licenses: [
      { type: 'MLSCN', number: 'MLSCN/2012/7890', expiryDate: '2025-03-31', verified: true },
    ],
    emergencyContact: {
      name: 'Funke Adeyemi',
      relationship: 'Wife',
      phone: '+234 814 567 8901',
    },
    currentShift: 'morning',
    isOnDuty: true,
    lastCheckIn: '2024-01-25T07:30:00Z',
  },
  {
    id: '6',
    staffId: 'RH-STF-006',
    firstName: 'Fatima',
    lastName: 'Mohammed',
    email: 'fatima.mohammed@rivheal.com',
    phone: '+234 815 678 9012',
    gender: 'female',
    dateOfBirth: '1995-02-28',
    address: '5 Apapa, Lagos',
    category: 'receptionist',
    designation: 'Front Desk Officer',
    department: 'Administration',
    roleId: '6',
    roleName: 'Receptionist',
    employmentType: 'full_time',
    hireDate: '2022-05-01',
    status: 'on_leave',
    qualifications: [
      { degree: 'BSc Business Administration', institution: 'Lagos State University', year: 2017 },
    ],
    licenses: [],
    emergencyContact: {
      name: 'Abubakar Mohammed',
      relationship: 'Father',
      phone: '+234 816 789 0123',
    },
    isOnDuty: false,
  },
];

const statusConfig: Record<StaffStatus, { label: string; color: string; icon: React.ElementType }> = {
  active: { label: 'Active', color: 'bg-green-100 text-green-700', icon: CheckCircle },
  inactive: { label: 'Inactive', color: 'bg-gray-100 text-gray-700', icon: XCircle },
  on_leave: { label: 'On Leave', color: 'bg-yellow-100 text-yellow-700', icon: Calendar },
  suspended: { label: 'Suspended', color: 'bg-red-100 text-red-700', icon: AlertCircle },
  terminated: { label: 'Terminated', color: 'bg-gray-100 text-gray-500', icon: UserX },
};

const categoryConfig: Record<StaffCategory, { label: string; color: string; icon: React.ElementType }> = {
  doctor: { label: 'Doctor', color: 'bg-blue-100 text-blue-700', icon: Stethoscope },
  nurse: { label: 'Nurse', color: 'bg-pink-100 text-pink-700', icon: Activity },
  pharmacist: { label: 'Pharmacist', color: 'bg-purple-100 text-purple-700', icon: Award },
  lab_tech: { label: 'Lab Technician', color: 'bg-teal-100 text-teal-700', icon: Activity },
  radiologist: { label: 'Radiologist', color: 'bg-indigo-100 text-indigo-700', icon: Activity },
  admin: { label: 'Admin', color: 'bg-orange-100 text-orange-700', icon: Shield },
  receptionist: { label: 'Receptionist', color: 'bg-cyan-100 text-cyan-700', icon: Users },
  cashier: { label: 'Cashier', color: 'bg-emerald-100 text-emerald-700', icon: Building2 },
  other: { label: 'Other', color: 'bg-gray-100 text-gray-700', icon: Users },
};

const shiftConfig: Record<ShiftType, { label: string; time: string; color: string }> = {
  morning: { label: 'Morning', time: '8:00 AM - 2:00 PM', color: 'bg-yellow-100 text-yellow-700' },
  afternoon: { label: 'Afternoon', time: '2:00 PM - 10:00 PM', color: 'bg-orange-100 text-orange-700' },
  night: { label: 'Night', time: '10:00 PM - 8:00 AM', color: 'bg-indigo-100 text-indigo-700' },
  full_day: { label: 'Full Day', time: '8:00 AM - 6:00 PM', color: 'bg-blue-100 text-blue-700' },
};

export const StaffManagementPage: React.FC = () => {
  const addToast = useUIStore((state) => state.addToast);
  const canCreate = useAuthStore((state) => state.canCreate);
  const canEdit = useAuthStore((state) => state.canEdit);
  const canDelete = useAuthStore((state) => state.canDelete);

  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<StaffCategory | ''>('');
  const [statusFilter, setStatusFilter] = useState<StaffStatus | ''>('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  // Get unique departments
  const departments = useMemo(() => {
    const depts = new Set(mockStaff.map((s) => s.department));
    return Array.from(depts).sort();
  }, []);

  // Filter staff
  const filteredStaff = useMemo(() => {
    return mockStaff.filter((staff) => {
      const matchesSearch =
        !searchQuery ||
        `${staff.firstName} ${staff.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
        staff.staffId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        staff.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        staff.phone.includes(searchQuery);

      const matchesCategory = !categoryFilter || staff.category === categoryFilter;
      const matchesStatus = !statusFilter || staff.status === statusFilter;
      const matchesDepartment = !departmentFilter || staff.department === departmentFilter;

      return matchesSearch && matchesCategory && matchesStatus && matchesDepartment;
    });
  }, [searchQuery, categoryFilter, statusFilter, departmentFilter]);

  // Stats
  const stats = useMemo(() => ({
    total: mockStaff.length,
    active: mockStaff.filter((s) => s.status === 'active').length,
    onDuty: mockStaff.filter((s) => s.isOnDuty).length,
    onLeave: mockStaff.filter((s) => s.status === 'on_leave').length,
    doctors: mockStaff.filter((s) => s.category === 'doctor').length,
    nurses: mockStaff.filter((s) => s.category === 'nurse').length,
  }), []);

  // Calculate age
  const calculateAge = (dob: string) => {
    const today = new Date();
    const birthDate = new Date(dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Staff Management</h1>
          <p className="text-gray-500">Manage hospital staff, schedules, and credentials</p>
        </div>

        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition">
            <Download size={18} />
            Export
          </button>
          {canCreate('staff') && (
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center justify-center gap-2 bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition"
            >
              <Plus size={18} />
              Add Staff
            </button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
              <Users size={20} className="text-gray-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              <p className="text-sm text-gray-500">Total Staff</p>
            </div>
          </div>
        </div>

        <div
          onClick={() => setStatusFilter('active')}
          className={cn(
            'bg-white rounded-xl border shadow-sm p-4 cursor-pointer transition hover:shadow-md',
            statusFilter === 'active' ? 'border-green-500 ring-2 ring-green-200' : 'border-gray-100'
          )}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <UserCheck size={20} className="text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
              <p className="text-sm text-gray-500">Active</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
              <Clock size={20} className="text-teal-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.onDuty}</p>
              <p className="text-sm text-gray-500">On Duty</p>
            </div>
          </div>
        </div>

        <div
          onClick={() => setStatusFilter('on_leave')}
          className={cn(
            'bg-white rounded-xl border shadow-sm p-4 cursor-pointer transition hover:shadow-md',
            statusFilter === 'on_leave' ? 'border-yellow-500 ring-2 ring-yellow-200' : 'border-gray-100'
          )}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Calendar size={20} className="text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.onLeave}</p>
              <p className="text-sm text-gray-500">On Leave</p>
            </div>
          </div>
        </div>

        <div
          onClick={() => setCategoryFilter('doctor')}
          className={cn(
            'bg-white rounded-xl border shadow-sm p-4 cursor-pointer transition hover:shadow-md',
            categoryFilter === 'doctor' ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-100'
          )}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Stethoscope size={20} className="text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.doctors}</p>
              <p className="text-sm text-gray-500">Doctors</p>
            </div>
          </div>
        </div>

        <div
          onClick={() => setCategoryFilter('nurse')}
          className={cn(
            'bg-white rounded-xl border shadow-sm p-4 cursor-pointer transition hover:shadow-md',
            categoryFilter === 'nurse' ? 'border-pink-500 ring-2 ring-pink-200' : 'border-gray-100'
          )}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center">
              <Activity size={20} className="text-pink-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.nurses}</p>
              <p className="text-sm text-gray-500">Nurses</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search by name, staff ID, email, or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
            />
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value as StaffCategory | '')}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
          >
            <option value="">All Categories</option>
            {Object.entries(categoryConfig).map(([key, { label }]) => (
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

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as StaffStatus | '')}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
          >
            <option value="">All Statuses</option>
            {Object.entries(statusConfig).map(([key, { label }]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>

          {(categoryFilter || statusFilter || departmentFilter) && (
            <button
              onClick={() => {
                setCategoryFilter('');
                setStatusFilter('');
                setDepartmentFilter('');
              }}
              className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Staff Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Staff</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Category</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Department</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Shift</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">License</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredStaff.map((staff) => {
                const status = statusConfig[staff.status];
                const StatusIcon = status.icon;
                const category = categoryConfig[staff.category];
                const CategoryIcon = category.icon;
                const primaryLicense = staff.licenses[0];

                return (
                  <tr key={staff.id} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-teal-600 rounded-full flex items-center justify-center text-white font-medium text-sm">
                            {staff.firstName[0]}{staff.lastName[0]}
                          </div>
                          {staff.isOnDuty && (
                            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{staff.firstName} {staff.lastName}</p>
                          <p className="text-xs text-gray-500 font-mono">{staff.staffId}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn('inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium', category.color)}>
                        <CategoryIcon size={12} />
                        {category.label}
                      </span>
                      <p className="text-xs text-gray-500 mt-1">{staff.designation}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-gray-900">{staff.department}</p>
                      <p className="text-xs text-gray-500 capitalize">{staff.employmentType.replace('_', ' ')}</p>
                    </td>
                    <td className="px-4 py-3">
                      {staff.currentShift ? (
                        <span className={cn('px-2 py-1 rounded text-xs font-medium', shiftConfig[staff.currentShift].color)}>
                          {shiftConfig[staff.currentShift].label}
                        </span>
                      ) : (
                        <span className="text-gray-400 text-sm">-</span>
                      )}
                      {staff.lastCheckIn && (
                        <p className="text-xs text-gray-500 mt-1">
                          In: {new Date(staff.lastCheckIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {primaryLicense ? (
                        <div className="flex items-center gap-1">
                          {primaryLicense.verified ? (
                            <BadgeCheck size={14} className="text-green-500" />
                          ) : (
                            <AlertCircle size={14} className="text-orange-500" />
                          )}
                          <span className="text-sm text-gray-700">{primaryLicense.type}</span>
                        </div>
                      ) : (
                        <span className="text-gray-400 text-sm">N/A</span>
                      )}
                      {primaryLicense && (
                        <p className="text-xs text-gray-500">
                          Exp: {formatDate(primaryLicense.expiryDate)}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn('inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium', status.color)}>
                        <StatusIcon size={12} />
                        {status.label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => {
                            setSelectedStaff(staff);
                            setShowDetailModal(true);
                          }}
                          className="p-1.5 text-teal-600 hover:bg-teal-50 rounded transition"
                          title="View"
                        >
                          <Eye size={16} />
                        </button>
                        {canEdit('staff') && (
                          <button className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition" title="Edit">
                            <Edit2 size={16} />
                          </button>
                        )}
                        <button className="p-1.5 text-gray-600 hover:bg-gray-100 rounded transition" title="More">
                          <MoreVertical size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredStaff.length === 0 && (
          <div className="p-12 text-center">
            <Users size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">No staff found</h3>
            <p className="text-gray-500">No staff members match your search criteria</p>
          </div>
        )}
      </div>

      {/* Staff Detail Modal */}
      {showDetailModal && selectedStaff && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Staff Profile</h2>
                <p className="text-sm text-gray-500">{selectedStaff.staffId}</p>
              </div>
              <button
                onClick={() => {
                  setShowDetailModal(false);
                  setSelectedStaff(null);
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Basic Info */}
              <div className="flex items-start gap-6">
                <div className="w-24 h-24 bg-gradient-to-br from-teal-500 to-teal-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold">
                  {selectedStaff.firstName[0]}{selectedStaff.lastName[0]}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900">
                    {selectedStaff.firstName} {selectedStaff.lastName}
                  </h3>
                  <p className="text-gray-600">{selectedStaff.designation}</p>
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    <span className={cn('px-2 py-1 rounded-full text-xs font-medium', categoryConfig[selectedStaff.category].color)}>
                      {categoryConfig[selectedStaff.category].label}
                    </span>
                    <span className={cn('px-2 py-1 rounded-full text-xs font-medium', statusConfig[selectedStaff.status].color)}>
                      {statusConfig[selectedStaff.status].label}
                    </span>
                    {selectedStaff.isOnDuty && (
                      <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium flex items-center gap-1">
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        On Duty
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Contact Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Mail size={18} className="text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Email</p>
                    <p className="text-gray-900">{selectedStaff.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone size={18} className="text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Phone</p>
                    <p className="text-gray-900">{selectedStaff.phone}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin size={18} className="text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Address</p>
                    <p className="text-gray-900">{selectedStaff.address}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Building2 size={18} className="text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Department</p>
                    <p className="text-gray-900">{selectedStaff.department}</p>
                  </div>
                </div>
              </div>

              {/* Employment Info */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">Employment Details</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-3 bg-white border border-gray-200 rounded-lg">
                    <p className="text-xs text-gray-500">Role</p>
                    <p className="font-medium text-gray-900">{selectedStaff.roleName}</p>
                  </div>
                  <div className="p-3 bg-white border border-gray-200 rounded-lg">
                    <p className="text-xs text-gray-500">Employment Type</p>
                    <p className="font-medium text-gray-900 capitalize">{selectedStaff.employmentType.replace('_', ' ')}</p>
                  </div>
                  <div className="p-3 bg-white border border-gray-200 rounded-lg">
                    <p className="text-xs text-gray-500">Hire Date</p>
                    <p className="font-medium text-gray-900">{formatDate(selectedStaff.hireDate)}</p>
                  </div>
                  <div className="p-3 bg-white border border-gray-200 rounded-lg">
                    <p className="text-xs text-gray-500">Age</p>
                    <p className="font-medium text-gray-900">{calculateAge(selectedStaff.dateOfBirth)} years</p>
                  </div>
                </div>
              </div>

              {/* Qualifications */}
              {selectedStaff.qualifications.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Qualifications</h4>
                  <div className="space-y-2">
                    {selectedStaff.qualifications.map((qual, idx) => (
                      <div key={idx} className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <Award size={18} className="text-blue-600" />
                        <div>
                          <p className="font-medium text-gray-900">{qual.degree}</p>
                          <p className="text-sm text-gray-600">{qual.institution} • {qual.year}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Licenses */}
              {selectedStaff.licenses.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Professional Licenses</h4>
                  <div className="space-y-2">
                    {selectedStaff.licenses.map((license, idx) => (
                      <div key={idx} className={cn(
                        'flex items-center justify-between p-3 border rounded-lg',
                        license.verified ? 'bg-green-50 border-green-200' : 'bg-orange-50 border-orange-200'
                      )}>
                        <div className="flex items-center gap-3">
                          {license.verified ? (
                            <BadgeCheck size={18} className="text-green-600" />
                          ) : (
                            <AlertCircle size={18} className="text-orange-600" />
                          )}
                          <div>
                            <p className="font-medium text-gray-900">{license.type}</p>
                            <p className="text-sm text-gray-600 font-mono">{license.number}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-500">Expires</p>
                          <p className={cn(
                            'text-sm font-medium',
                            new Date(license.expiryDate) < new Date() ? 'text-red-600' : 'text-gray-700'
                          )}>
                            {formatDate(license.expiryDate)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Emergency Contact */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">Emergency Contact</h4>
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="font-medium text-gray-900">{selectedStaff.emergencyContact.name}</p>
                  <p className="text-sm text-gray-600">{selectedStaff.emergencyContact.relationship}</p>
                  <p className="text-sm text-gray-700 mt-1">{selectedStaff.emergencyContact.phone}</p>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
              <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition">
                <FileText size={18} />
                Documents
              </button>
              {canEdit('staff') && (
                <button className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition">
                  <Edit2 size={18} />
                  Edit Profile
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffManagementPage;
