import React, { useState } from 'react';
import {
  Building, MapPin, Phone, Mail, Clock, Users, Bed, Activity,
  Plus, Search, Edit2, MoreVertical, CheckCircle, XCircle, Star,
  Globe, Settings, AlertTriangle, Ambulance, TestTube, Pill, Eye,
} from 'lucide-react';

// Types
interface Branch {
  id: string;
  code: string;
  name: string;
  type: 'main' | 'satellite' | 'clinic' | 'diagnostic';
  status: 'active' | 'inactive' | 'suspended';
  isMainBranch: boolean;
  address: string;
  city: string;
  state: string;
  phone: string;
  email: string;
  manager?: string;
  bedCapacity: number;
  icuCapacity: number;
  erCapacity: number;
  hasEmergency: boolean;
  hasPharmacy: boolean;
  hasLaboratory: boolean;
  hasRadiology: boolean;
  staffCount: number;
  todayPatients: number;
  occupancyRate: number;
  operatingHours: Record<string, { open: string; close: string }>;
}

// Mock data
const mockBranches: Branch[] = [
  {
    id: '1',
    code: 'BR-001',
    name: 'RivHeal Medical Center - Victoria Island',
    type: 'main',
    status: 'active',
    isMainBranch: true,
    address: '15 Adeola Odeku Street, Victoria Island',
    city: 'Lagos',
    state: 'Lagos',
    phone: '+234 (1) 234 5678',
    email: 'vi@rivheal.com',
    manager: 'Dr. Adebayo Johnson',
    bedCapacity: 150,
    icuCapacity: 20,
    erCapacity: 15,
    hasEmergency: true,
    hasPharmacy: true,
    hasLaboratory: true,
    hasRadiology: true,
    staffCount: 245,
    todayPatients: 187,
    occupancyRate: 78,
    operatingHours: {
      monday: { open: '00:00', close: '23:59' },
      tuesday: { open: '00:00', close: '23:59' },
      wednesday: { open: '00:00', close: '23:59' },
      thursday: { open: '00:00', close: '23:59' },
      friday: { open: '00:00', close: '23:59' },
      saturday: { open: '00:00', close: '23:59' },
      sunday: { open: '00:00', close: '23:59' },
    },
  },
  {
    id: '2',
    code: 'BR-002',
    name: 'RivHeal Clinic - Lekki',
    type: 'satellite',
    status: 'active',
    isMainBranch: false,
    address: '23 Admiralty Way, Lekki Phase 1',
    city: 'Lagos',
    state: 'Lagos',
    phone: '+234 (1) 345 6789',
    email: 'lekki@rivheal.com',
    manager: 'Dr. Ngozi Okonkwo',
    bedCapacity: 50,
    icuCapacity: 5,
    erCapacity: 8,
    hasEmergency: true,
    hasPharmacy: true,
    hasLaboratory: true,
    hasRadiology: false,
    staffCount: 89,
    todayPatients: 65,
    occupancyRate: 62,
    operatingHours: {
      monday: { open: '07:00', close: '22:00' },
      tuesday: { open: '07:00', close: '22:00' },
      wednesday: { open: '07:00', close: '22:00' },
      thursday: { open: '07:00', close: '22:00' },
      friday: { open: '07:00', close: '22:00' },
      saturday: { open: '08:00', close: '18:00' },
      sunday: { open: '09:00', close: '16:00' },
    },
  },
  {
    id: '3',
    code: 'BR-003',
    name: 'RivHeal Clinic - Ikeja',
    type: 'clinic',
    status: 'active',
    isMainBranch: false,
    address: '45 Allen Avenue, Ikeja',
    city: 'Lagos',
    state: 'Lagos',
    phone: '+234 (1) 456 7890',
    email: 'ikeja@rivheal.com',
    manager: 'Dr. Fatima Bello',
    bedCapacity: 30,
    icuCapacity: 0,
    erCapacity: 5,
    hasEmergency: false,
    hasPharmacy: true,
    hasLaboratory: true,
    hasRadiology: false,
    staffCount: 45,
    todayPatients: 42,
    occupancyRate: 45,
    operatingHours: {
      monday: { open: '08:00', close: '20:00' },
      tuesday: { open: '08:00', close: '20:00' },
      wednesday: { open: '08:00', close: '20:00' },
      thursday: { open: '08:00', close: '20:00' },
      friday: { open: '08:00', close: '20:00' },
      saturday: { open: '09:00', close: '16:00' },
    },
  },
  {
    id: '4',
    code: 'BR-004',
    name: 'RivHeal Diagnostics - Ikoyi',
    type: 'diagnostic',
    status: 'active',
    isMainBranch: false,
    address: '8 Bourdillon Road, Ikoyi',
    city: 'Lagos',
    state: 'Lagos',
    phone: '+234 (1) 567 8901',
    email: 'diagnostics@rivheal.com',
    manager: 'Dr. Emmanuel Okoro',
    bedCapacity: 0,
    icuCapacity: 0,
    erCapacity: 0,
    hasEmergency: false,
    hasPharmacy: false,
    hasLaboratory: true,
    hasRadiology: true,
    staffCount: 32,
    todayPatients: 78,
    occupancyRate: 0,
    operatingHours: {
      monday: { open: '07:00', close: '19:00' },
      tuesday: { open: '07:00', close: '19:00' },
      wednesday: { open: '07:00', close: '19:00' },
      thursday: { open: '07:00', close: '19:00' },
      friday: { open: '07:00', close: '19:00' },
      saturday: { open: '08:00', close: '14:00' },
    },
  },
];

export const BranchesPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);

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
      main: 'bg-teal-100 text-teal-800',
      satellite: 'bg-blue-100 text-blue-800',
      clinic: 'bg-purple-100 text-purple-800',
      diagnostic: 'bg-orange-100 text-orange-800',
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  const getOccupancyColor = (rate: number) => {
    if (rate >= 90) return 'text-red-600';
    if (rate >= 70) return 'text-yellow-600';
    return 'text-green-600';
  };

  const filteredBranches = mockBranches.filter(branch => {
    const matchesSearch = branch.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         branch.city.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'all' || branch.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const stats = {
    totalBranches: mockBranches.length,
    totalBeds: mockBranches.reduce((sum, b) => sum + b.bedCapacity, 0),
    totalStaff: mockBranches.reduce((sum, b) => sum + b.staffCount, 0),
    todayPatients: mockBranches.reduce((sum, b) => sum + b.todayPatients, 0),
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Branches</h1>
          <p className="text-gray-600 mt-1">Manage hospital branches and locations</p>
        </div>
        <button className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Branch
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-teal-100 rounded-xl">
              <Building className="h-6 w-6 text-teal-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.totalBranches}</p>
              <p className="text-sm text-gray-500">Total Branches</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-xl">
              <Bed className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.totalBeds}</p>
              <p className="text-sm text-gray-500">Total Bed Capacity</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-100 rounded-xl">
              <Users className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.totalStaff}</p>
              <p className="text-sm text-gray-500">Total Staff</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 rounded-xl">
              <Activity className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.todayPatients}</p>
              <p className="text-sm text-gray-500">Patients Today</p>
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
                placeholder="Search branches..."
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
              <option value="main">Main Hospital</option>
              <option value="satellite">Satellite</option>
              <option value="clinic">Clinic</option>
              <option value="diagnostic">Diagnostic Center</option>
            </select>
          </div>
        </div>

        {/* Branches List */}
        <div className="p-4 space-y-4">
          {filteredBranches.map(branch => (
            <div
              key={branch.id}
              className="p-4 border border-gray-100 rounded-xl hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => setSelectedBranch(branch)}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-xl ${branch.isMainBranch ? 'bg-teal-100' : 'bg-gray-100'}`}>
                    <Building className={`h-6 w-6 ${branch.isMainBranch ? 'text-teal-600' : 'text-gray-600'}`} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-900">{branch.name}</h3>
                      {branch.isMainBranch && (
                        <span className="px-2 py-0.5 bg-yellow-100 text-yellow-800 text-xs rounded-full flex items-center gap-1">
                          <Star className="h-3 w-3" />
                          Main Branch
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-1">
                      <span className={`px-2 py-0.5 rounded-full text-xs ${getTypeColor(branch.type)}`}>
                        {branch.type}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-xs ${getStatusColor(branch.status)}`}>
                        {branch.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5" />
                        {branch.city}, {branch.state}
                      </span>
                      <span className="flex items-center gap-1">
                        <Phone className="h-3.5 w-3.5" />
                        {branch.phone}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  {/* Services */}
                  <div className="flex gap-2">
                    {branch.hasEmergency && (
                      <div className="p-2 bg-red-50 rounded-lg" title="Emergency">
                        <Ambulance className="h-4 w-4 text-red-500" />
                      </div>
                    )}
                    {branch.hasLaboratory && (
                      <div className="p-2 bg-purple-50 rounded-lg" title="Laboratory">
                        <TestTube className="h-4 w-4 text-purple-500" />
                      </div>
                    )}
                    {branch.hasPharmacy && (
                      <div className="p-2 bg-green-50 rounded-lg" title="Pharmacy">
                        <Pill className="h-4 w-4 text-green-500" />
                      </div>
                    )}
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-lg font-semibold text-gray-900">{branch.bedCapacity}</p>
                      <p className="text-xs text-gray-500">Beds</p>
                    </div>
                    <div>
                      <p className="text-lg font-semibold text-gray-900">{branch.staffCount}</p>
                      <p className="text-xs text-gray-500">Staff</p>
                    </div>
                    <div>
                      <p className={`text-lg font-semibold ${getOccupancyColor(branch.occupancyRate)}`}>
                        {branch.occupancyRate > 0 ? `${branch.occupancyRate}%` : 'N/A'}
                      </p>
                      <p className="text-xs text-gray-500">Occupancy</p>
                    </div>
                  </div>

                  <button className="p-2 hover:bg-gray-100 rounded-lg">
                    <MoreVertical className="h-4 w-4 text-gray-400" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Branch Detail Modal */}
      {selectedBranch && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setSelectedBranch(null)}>
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`p-4 rounded-xl ${selectedBranch.isMainBranch ? 'bg-teal-100' : 'bg-gray-100'}`}>
                    <Building className={`h-6 w-6 ${selectedBranch.isMainBranch ? 'text-teal-600' : 'text-gray-600'}`} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">{selectedBranch.name}</h2>
                    <p className="text-gray-500">{selectedBranch.code}</p>
                  </div>
                </div>
                <button onClick={() => setSelectedBranch(null)} className="p-2 hover:bg-gray-100 rounded-lg">
                  <XCircle className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Address</p>
                  <p className="font-medium">{selectedBranch.address}</p>
                  <p className="text-sm text-gray-600">{selectedBranch.city}, {selectedBranch.state}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Contact</p>
                  <p className="font-medium">{selectedBranch.phone}</p>
                  <p className="text-sm text-gray-600">{selectedBranch.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Branch Manager</p>
                  <p className="font-medium">{selectedBranch.manager || 'Not assigned'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Staff</p>
                  <p className="font-medium">{selectedBranch.staffCount} members</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-500 mb-2">Capacity</p>
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-3 bg-blue-50 rounded-lg text-center">
                    <Bed className="h-5 w-5 text-blue-600 mx-auto mb-1" />
                    <p className="text-lg font-semibold">{selectedBranch.bedCapacity}</p>
                    <p className="text-xs text-gray-500">General Beds</p>
                  </div>
                  <div className="p-3 bg-orange-50 rounded-lg text-center">
                    <Activity className="h-5 w-5 text-orange-600 mx-auto mb-1" />
                    <p className="text-lg font-semibold">{selectedBranch.icuCapacity}</p>
                    <p className="text-xs text-gray-500">ICU Beds</p>
                  </div>
                  <div className="p-3 bg-red-50 rounded-lg text-center">
                    <Ambulance className="h-5 w-5 text-red-600 mx-auto mb-1" />
                    <p className="text-lg font-semibold">{selectedBranch.erCapacity}</p>
                    <p className="text-xs text-gray-500">ER Beds</p>
                  </div>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-500 mb-2">Available Services</p>
                <div className="flex flex-wrap gap-2">
                  {selectedBranch.hasEmergency && (
                    <span className="px-3 py-1.5 bg-red-50 text-red-700 rounded-lg text-sm flex items-center gap-1">
                      <Ambulance className="h-4 w-4" />
                      Emergency
                    </span>
                  )}
                  {selectedBranch.hasLaboratory && (
                    <span className="px-3 py-1.5 bg-purple-50 text-purple-700 rounded-lg text-sm flex items-center gap-1">
                      <TestTube className="h-4 w-4" />
                      Laboratory
                    </span>
                  )}
                  {selectedBranch.hasPharmacy && (
                    <span className="px-3 py-1.5 bg-green-50 text-green-700 rounded-lg text-sm flex items-center gap-1">
                      <Pill className="h-4 w-4" />
                      Pharmacy
                    </span>
                  )}
                  {selectedBranch.hasRadiology && (
                    <span className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-sm flex items-center gap-1">
                      <Eye className="h-4 w-4" />
                      Radiology
                    </span>
                  )}
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-100">
                <button className="flex-1 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 flex items-center justify-center gap-2">
                  <Edit2 className="h-4 w-4" />
                  Edit Branch
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

export default BranchesPage;
