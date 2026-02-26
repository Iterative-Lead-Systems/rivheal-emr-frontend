import React, { useState } from 'react';
import {
  Home, Users, MapPin, Clock, Star, Phone, CheckCircle, XCircle,
  AlertTriangle, Navigation, DollarSign, Activity, Search, Filter,
  Eye, UserCheck, UserX, MessageSquare, Calendar, Truck, Heart,
  Stethoscope, TestTube, Pill, Syringe, Thermometer, ChevronRight,
} from 'lucide-react';

// Types
interface Practitioner {
  id: string;
  name: string;
  type: 'doctor' | 'nurse' | 'lab_tech' | 'physiotherapist' | 'pharmacist';
  photo: string;
  status: 'online' | 'offline' | 'busy';
  verificationStatus: 'pending' | 'verified' | 'suspended';
  rating: number;
  totalRatings: number;
  completedJobs: number;
  specialization?: string;
  licenseNumber: string;
  licenseExpiry: string;
  phone: string;
  location?: { lat: number; lng: number };
  distance?: number;
  earnings: number;
  joinedDate: string;
}

interface ServiceRequest {
  id: string;
  requestNumber: string;
  patientName: string;
  patientPhone: string;
  serviceType: string;
  status: 'pending' | 'matched' | 'accepted' | 'en_route' | 'arrived' | 'in_progress' | 'completed' | 'cancelled';
  practitioner?: Practitioner;
  address: string;
  symptoms: string;
  requestedAt: string;
  completedAt?: string;
  amount: number;
  rating?: number;
  isEmergency: boolean;
}

// Service type icons
const serviceTypeIcons: Record<string, React.ReactNode> = {
  doctor_visit: <Stethoscope className="h-5 w-5" />,
  nursing_care: <Heart className="h-5 w-5" />,
  lab_collection: <TestTube className="h-5 w-5" />,
  physiotherapy: <Activity className="h-5 w-5" />,
  pharmacy_delivery: <Pill className="h-5 w-5" />,
  injection: <Syringe className="h-5 w-5" />,
  vital_check: <Thermometer className="h-5 w-5" />,
};

// Mock data
const mockPractitioners: Practitioner[] = [
  {
    id: '1',
    name: 'Dr. Chioma Okonkwo',
    type: 'doctor',
    photo: 'CO',
    status: 'online',
    verificationStatus: 'verified',
    rating: 4.9,
    totalRatings: 156,
    completedJobs: 234,
    specialization: 'General Practice',
    licenseNumber: 'MDCN/2019/45678',
    licenseExpiry: '2025-12-31',
    phone: '+234 803 456 7890',
    distance: 2.3,
    earnings: 1250000,
    joinedDate: '2024-03-15',
  },
  {
    id: '2',
    name: 'Nurse Amaka Eze',
    type: 'nurse',
    photo: 'AE',
    status: 'online',
    verificationStatus: 'verified',
    rating: 4.8,
    totalRatings: 89,
    completedJobs: 156,
    licenseNumber: 'NMCN/2020/12345',
    licenseExpiry: '2025-06-30',
    phone: '+234 805 123 4567',
    distance: 1.5,
    earnings: 680000,
    joinedDate: '2024-05-20',
  },
  {
    id: '3',
    name: 'David Adeyemi',
    type: 'lab_tech',
    photo: 'DA',
    status: 'busy',
    verificationStatus: 'verified',
    rating: 4.7,
    totalRatings: 67,
    completedJobs: 98,
    licenseNumber: 'MLSCN/2021/98765',
    licenseExpiry: '2025-09-15',
    phone: '+234 809 876 5432',
    distance: 3.2,
    earnings: 420000,
    joinedDate: '2024-07-10',
  },
  {
    id: '4',
    name: 'Fatima Mohammed',
    type: 'physiotherapist',
    photo: 'FM',
    status: 'offline',
    verificationStatus: 'pending',
    rating: 0,
    totalRatings: 0,
    completedJobs: 0,
    licenseNumber: 'MRTB/2023/54321',
    licenseExpiry: '2026-03-31',
    phone: '+234 807 234 5678',
    earnings: 0,
    joinedDate: '2024-12-01',
  },
];

const mockRequests: ServiceRequest[] = [
  {
    id: '1',
    requestNumber: 'HC-20250226-0001',
    patientName: 'Mr. Chukwu Emmanuel',
    patientPhone: '+234 803 111 2222',
    serviceType: 'nursing_care',
    status: 'in_progress',
    practitioner: mockPractitioners[1],
    address: '15 Admiralty Way, Lekki Phase 1, Lagos',
    symptoms: 'Post-surgery wound dressing and IV medication',
    requestedAt: '2025-02-26T09:30:00',
    amount: 15000,
    isEmergency: false,
  },
  {
    id: '2',
    requestNumber: 'HC-20250226-0002',
    patientName: 'Mrs. Ngozi Obi',
    patientPhone: '+234 805 333 4444',
    serviceType: 'lab_collection',
    status: 'en_route',
    practitioner: mockPractitioners[2],
    address: '8 Banana Island Road, Ikoyi, Lagos',
    symptoms: 'Routine blood work - FBC, Lipid profile, Blood sugar',
    requestedAt: '2025-02-26T10:15:00',
    amount: 8500,
    isEmergency: false,
  },
  {
    id: '3',
    requestNumber: 'HC-20250226-0003',
    patientName: 'Chief Adeleke',
    patientPhone: '+234 809 555 6666',
    serviceType: 'doctor_visit',
    status: 'pending',
    address: '22 Victoria Island, Lagos',
    symptoms: 'Persistent headache and dizziness for 3 days',
    requestedAt: '2025-02-26T11:00:00',
    amount: 25000,
    isEmergency: true,
  },
  {
    id: '4',
    requestNumber: 'HC-20250225-0015',
    patientName: 'Miss Aisha Bello',
    patientPhone: '+234 803 777 8888',
    serviceType: 'physiotherapy',
    status: 'completed',
    practitioner: mockPractitioners[0],
    address: '45 Allen Avenue, Ikeja, Lagos',
    symptoms: 'Post-stroke rehabilitation session',
    requestedAt: '2025-02-25T14:00:00',
    completedAt: '2025-02-25T15:30:00',
    amount: 20000,
    rating: 5,
    isEmergency: false,
  },
];

const serviceTypes = [
  { id: 'doctor_visit', name: 'Doctor Visit', price: 25000, icon: <Stethoscope className="h-5 w-5" /> },
  { id: 'nursing_care', name: 'Nursing Care', price: 15000, icon: <Heart className="h-5 w-5" /> },
  { id: 'lab_collection', name: 'Lab Collection', price: 8500, icon: <TestTube className="h-5 w-5" /> },
  { id: 'physiotherapy', name: 'Physiotherapy', price: 20000, icon: <Activity className="h-5 w-5" /> },
  { id: 'pharmacy_delivery', name: 'Pharmacy Delivery', price: 2500, icon: <Pill className="h-5 w-5" /> },
  { id: 'injection', name: 'Injection', price: 5000, icon: <Syringe className="h-5 w-5" /> },
  { id: 'vital_check', name: 'Vital Signs Check', price: 7500, icon: <Thermometer className="h-5 w-5" /> },
];

export const HomecarePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'requests' | 'practitioners' | 'services' | 'analytics'>('requests');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedRequest, setSelectedRequest] = useState<ServiceRequest | null>(null);
  const [selectedPractitioner, setSelectedPractitioner] = useState<Practitioner | null>(null);

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      matched: 'bg-blue-100 text-blue-800',
      accepted: 'bg-indigo-100 text-indigo-800',
      en_route: 'bg-purple-100 text-purple-800',
      arrived: 'bg-cyan-100 text-cyan-800',
      in_progress: 'bg-teal-100 text-teal-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
      online: 'bg-green-100 text-green-800',
      offline: 'bg-gray-100 text-gray-800',
      busy: 'bg-orange-100 text-orange-800',
      verified: 'bg-green-100 text-green-800',
      suspended: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(amount);
  };

  const stats = {
    activeRequests: mockRequests.filter(r => !['completed', 'cancelled'].includes(r.status)).length,
    onlinePractitioners: mockPractitioners.filter(p => p.status === 'online').length,
    todayCompleted: mockRequests.filter(r => r.status === 'completed').length,
    todayRevenue: mockRequests.filter(r => r.status === 'completed').reduce((sum, r) => sum + r.amount, 0),
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Home Care Services</h1>
          <p className="text-gray-600 mt-1">Manage on-demand healthcare at patient's doorstep</p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Live Map
          </button>
          <button className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 flex items-center gap-2">
            <Users className="h-4 w-4" />
            Add Practitioner
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-yellow-100 rounded-xl">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.activeRequests}</p>
              <p className="text-sm text-gray-500">Active Requests</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 rounded-xl">
              <Users className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.onlinePractitioners}</p>
              <p className="text-sm text-gray-500">Online Practitioners</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-teal-100 rounded-xl">
              <CheckCircle className="h-6 w-6 text-teal-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.todayCompleted}</p>
              <p className="text-sm text-gray-500">Completed Today</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-100 rounded-xl">
              <DollarSign className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.todayRevenue)}</p>
              <p className="text-sm text-gray-500">Today's Revenue</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl border border-gray-100">
        <div className="border-b border-gray-100">
          <div className="flex gap-1 p-2">
            {[
              { id: 'requests', label: 'Service Requests', icon: <Calendar className="h-4 w-4" /> },
              { id: 'practitioners', label: 'Practitioners', icon: <Users className="h-4 w-4" /> },
              { id: 'services', label: 'Service Types', icon: <Home className="h-4 w-4" /> },
              { id: 'analytics', label: 'Analytics', icon: <Activity className="h-4 w-4" /> },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? 'bg-teal-50 text-teal-700'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Search & Filter */}
        <div className="p-4 border-b border-gray-100">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder={activeTab === 'requests' ? 'Search by request number, patient name...' : 'Search practitioners...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500"
            >
              <option value="all">All Status</option>
              {activeTab === 'requests' ? (
                <>
                  <option value="pending">Pending</option>
                  <option value="en_route">En Route</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                </>
              ) : (
                <>
                  <option value="online">Online</option>
                  <option value="offline">Offline</option>
                  <option value="verified">Verified</option>
                  <option value="pending">Pending Verification</option>
                </>
              )}
            </select>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          {activeTab === 'requests' && (
            <div className="space-y-3">
              {mockRequests.map(request => (
                <div
                  key={request.id}
                  className={`p-4 border rounded-xl hover:shadow-md transition-shadow cursor-pointer ${
                    request.isEmergency ? 'border-red-200 bg-red-50' : 'border-gray-100'
                  }`}
                  onClick={() => setSelectedRequest(request)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-xl ${request.isEmergency ? 'bg-red-100' : 'bg-teal-100'}`}>
                        {serviceTypeIcons[request.serviceType] || <Home className="h-5 w-5" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900">{request.requestNumber}</span>
                          {request.isEmergency && (
                            <span className="px-2 py-0.5 bg-red-600 text-white text-xs rounded-full flex items-center gap-1">
                              <AlertTriangle className="h-3 w-3" />
                              EMERGENCY
                            </span>
                          )}
                          <span className={`px-2 py-0.5 rounded-full text-xs ${getStatusColor(request.status)}`}>
                            {request.status.replace('_', ' ').toUpperCase()}
                          </span>
                        </div>
                        <p className="text-gray-600 mt-1">{request.patientName}</p>
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3.5 w-3.5" />
                            {request.address.substring(0, 30)}...
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" />
                            {new Date(request.requestedAt).toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold text-gray-900">{formatCurrency(request.amount)}</p>
                      {request.practitioner && (
                        <div className="flex items-center gap-2 mt-2">
                          <div className="w-6 h-6 bg-teal-100 rounded-full flex items-center justify-center text-xs font-medium text-teal-700">
                            {request.practitioner.photo}
                          </div>
                          <span className="text-sm text-gray-600">{request.practitioner.name}</span>
                        </div>
                      )}
                      {request.rating && (
                        <div className="flex items-center gap-1 mt-1 justify-end">
                          <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                          <span className="text-sm font-medium">{request.rating}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'practitioners' && (
            <div className="grid grid-cols-2 gap-4">
              {mockPractitioners.map(practitioner => (
                <div
                  key={practitioner.id}
                  className="p-4 border border-gray-100 rounded-xl hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => setSelectedPractitioner(practitioner)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center text-lg font-medium text-teal-700">
                          {practitioner.photo}
                        </div>
                        <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                          practitioner.status === 'online' ? 'bg-green-500' :
                          practitioner.status === 'busy' ? 'bg-orange-500' : 'bg-gray-400'
                        }`} />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{practitioner.name}</p>
                        <p className="text-sm text-gray-500 capitalize">{practitioner.type.replace('_', ' ')}</p>
                        {practitioner.specialization && (
                          <p className="text-xs text-teal-600">{practitioner.specialization}</p>
                        )}
                      </div>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-xs ${getStatusColor(practitioner.verificationStatus)}`}>
                      {practitioner.verificationStatus}
                    </span>
                  </div>
                  <div className="mt-4 grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                        <span className="font-semibold">{practitioner.rating || '-'}</span>
                      </div>
                      <p className="text-xs text-gray-500">{practitioner.totalRatings} reviews</p>
                    </div>
                    <div className="text-center">
                      <p className="font-semibold">{practitioner.completedJobs}</p>
                      <p className="text-xs text-gray-500">Jobs</p>
                    </div>
                    <div className="text-center">
                      <p className="font-semibold text-green-600">{formatCurrency(practitioner.earnings)}</p>
                      <p className="text-xs text-gray-500">Earnings</p>
                    </div>
                  </div>
                  {practitioner.verificationStatus === 'pending' && (
                    <div className="mt-4 flex gap-2">
                      <button className="flex-1 px-3 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 flex items-center justify-center gap-1">
                        <UserCheck className="h-4 w-4" />
                        Verify
                      </button>
                      <button className="flex-1 px-3 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 flex items-center justify-center gap-1">
                        <UserX className="h-4 w-4" />
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {activeTab === 'services' && (
            <div className="grid grid-cols-3 gap-4">
              {serviceTypes.map(service => (
                <div key={service.id} className="p-4 border border-gray-100 rounded-xl hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-teal-100 rounded-xl text-teal-600">
                      {service.icon}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{service.name}</p>
                      <p className="text-lg font-semibold text-teal-600">{formatCurrency(service.price)}</p>
                    </div>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <button className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-50">
                      Edit
                    </button>
                    <button className="px-3 py-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-50">
                      <Eye className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <div className="grid grid-cols-4 gap-4">
                <div className="p-4 bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl text-white">
                  <p className="text-teal-100">Total Requests</p>
                  <p className="text-3xl font-bold mt-1">1,247</p>
                  <p className="text-sm text-teal-100 mt-2">+12% from last month</p>
                </div>
                <div className="p-4 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl text-white">
                  <p className="text-purple-100">Active Practitioners</p>
                  <p className="text-3xl font-bold mt-1">89</p>
                  <p className="text-sm text-purple-100 mt-2">+5 new this week</p>
                </div>
                <div className="p-4 bg-gradient-to-br from-green-500 to-green-600 rounded-xl text-white">
                  <p className="text-green-100">Completion Rate</p>
                  <p className="text-3xl font-bold mt-1">94.5%</p>
                  <p className="text-sm text-green-100 mt-2">+2.3% improvement</p>
                </div>
                <div className="p-4 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl text-white">
                  <p className="text-orange-100">Avg. Response Time</p>
                  <p className="text-3xl font-bold mt-1">4.2 min</p>
                  <p className="text-sm text-orange-100 mt-2">-30s improvement</p>
                </div>
              </div>
              <div className="p-6 border border-gray-100 rounded-xl">
                <h3 className="font-semibold text-gray-900 mb-4">Service Distribution</h3>
                <div className="space-y-3">
                  {[
                    { name: 'Nursing Care', percent: 35, color: 'bg-teal-500' },
                    { name: 'Lab Collection', percent: 28, color: 'bg-purple-500' },
                    { name: 'Doctor Visit', percent: 20, color: 'bg-blue-500' },
                    { name: 'Physiotherapy', percent: 10, color: 'bg-green-500' },
                    { name: 'Others', percent: 7, color: 'bg-gray-400' },
                  ].map(item => (
                    <div key={item.name}>
                      <div className="flex justify-between text-sm mb-1">
                        <span>{item.name}</span>
                        <span className="font-medium">{item.percent}%</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full">
                        <div className={`h-full rounded-full ${item.color}`} style={{ width: `${item.percent}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Request Detail Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setSelectedRequest(null)}>
          <div className="bg-white rounded-2xl w-full max-w-lg p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Request Details</h2>
              <button onClick={() => setSelectedRequest(null)} className="p-2 hover:bg-gray-100 rounded-lg">
                <XCircle className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-xl ${selectedRequest.isEmergency ? 'bg-red-100' : 'bg-teal-100'}`}>
                  {serviceTypeIcons[selectedRequest.serviceType]}
                </div>
                <div>
                  <p className="font-semibold">{selectedRequest.requestNumber}</p>
                  <span className={`px-2 py-0.5 rounded-full text-xs ${getStatusColor(selectedRequest.status)}`}>
                    {selectedRequest.status.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Patient</p>
                  <p className="font-medium">{selectedRequest.patientName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="font-medium">{selectedRequest.patientPhone}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-gray-500">Address</p>
                  <p className="font-medium">{selectedRequest.address}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-gray-500">Symptoms/Notes</p>
                  <p className="font-medium">{selectedRequest.symptoms}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Amount</p>
                  <p className="text-lg font-semibold text-teal-600">{formatCurrency(selectedRequest.amount)}</p>
                </div>
              </div>
              {selectedRequest.status === 'pending' && (
                <button className="w-full py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 flex items-center justify-center gap-2">
                  <Users className="h-4 w-4" />
                  Find Nearby Practitioners
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomecarePage;
