import React, { useState, useMemo } from 'react';
import { useAuthStore } from '@/stores/auth.store';
import { useUIStore } from '@/stores/ui.store';
import { formatDate, cn } from '@/utils';
import {
  BedDouble,
  Search,
  Eye,
  UserPlus,
  Users,
  CheckCircle,
  Activity,
  Thermometer,
  Heart,
  Droplet,
  FileText,
  LogOut,
  X,
  Building2,
  Pill,
} from 'lucide-react';

type BedStatus = 'available' | 'occupied' | 'reserved' | 'maintenance' | 'cleaning';
type AdmissionStatus = 'admitted' | 'discharged' | 'transferred' | 'deceased' | 'absconded';
type WardType = 'general' | 'private' | 'semi_private' | 'icu' | 'nicu' | 'maternity' | 'pediatric' | 'isolation' | 'emergency';

interface Ward {
  id: string;
  name: string;
  type: WardType;
  floor: string;
  totalBeds: number;
  availableBeds: number;
  occupiedBeds: number;
  nurseInCharge: string;
}

interface Bed {
  id: string;
  bedNumber: string;
  wardId: string;
  wardName: string;
  wardType: WardType;
  status: BedStatus;
  dailyRate: number;
  features: string[];
  currentPatient?: {
    id: string;
    name: string;
    admissionId: string;
    admittedDate: string;
    diagnosis: string;
    doctor: string;
  };
}

interface Admission {
  id: string;
  admissionNumber: string;
  patient: {
    id: string;
    name: string;
    rivhealId: string;
    age: number;
    gender: string;
    phone: string;
    bloodGroup: string;
  };
  bed: {
    id: string;
    number: string;
    ward: string;
  };
  admittingDoctor: string;
  attendingDoctor: string;
  department: string;
  diagnosis: string;
  admissionType: 'emergency' | 'elective' | 'transfer';
  admittedAt: string;
  expectedDischarge?: string;
  status: AdmissionStatus;
  vitals?: {
    temperature: number;
    bloodPressure: string;
    pulse: number;
    respiration: number;
    oxygenSaturation: number;
    recordedAt: string;
  };
  notes: {
    id: string;
    type: 'nursing' | 'doctor' | 'procedure' | 'medication';
    content: string;
    author: string;
    createdAt: string;
  }[];
}

// Mock wards
const mockWards: Ward[] = [
  { id: '1', name: 'Male Medical Ward', type: 'general', floor: 'Ground Floor', totalBeds: 20, availableBeds: 5, occupiedBeds: 15, nurseInCharge: 'Blessing Okonkwo' },
  { id: '2', name: 'Female Medical Ward', type: 'general', floor: 'Ground Floor', totalBeds: 20, availableBeds: 8, occupiedBeds: 12, nurseInCharge: 'Amaka Nwosu' },
  { id: '3', name: 'Private Ward A', type: 'private', floor: '1st Floor', totalBeds: 10, availableBeds: 3, occupiedBeds: 7, nurseInCharge: 'Fatima Ahmed' },
  { id: '4', name: 'ICU', type: 'icu', floor: '2nd Floor', totalBeds: 8, availableBeds: 2, occupiedBeds: 6, nurseInCharge: 'Grace Okafor' },
  { id: '5', name: 'Maternity Ward', type: 'maternity', floor: '1st Floor', totalBeds: 15, availableBeds: 4, occupiedBeds: 11, nurseInCharge: 'Chioma Eze' },
  { id: '6', name: 'Pediatric Ward', type: 'pediatric', floor: 'Ground Floor', totalBeds: 12, availableBeds: 6, occupiedBeds: 6, nurseInCharge: 'Ngozi Okoli' },
  { id: '7', name: 'Emergency Holding', type: 'emergency', floor: 'Ground Floor', totalBeds: 6, availableBeds: 1, occupiedBeds: 5, nurseInCharge: 'Emeka Nnamdi' },
];

// Mock beds
const mockBeds: Bed[] = [
  { id: '1', bedNumber: 'MMW-001', wardId: '1', wardName: 'Male Medical Ward', wardType: 'general', status: 'occupied', dailyRate: 15000, features: ['Oxygen Port', 'Call Bell'], currentPatient: { id: '1', name: 'Chukwuemeka Obi', admissionId: 'ADM-2024-001', admittedDate: '2024-01-20', diagnosis: 'Pneumonia', doctor: 'Dr. Adaeze Obi' } },
  { id: '2', bedNumber: 'MMW-002', wardId: '1', wardName: 'Male Medical Ward', wardType: 'general', status: 'available', dailyRate: 15000, features: ['Oxygen Port', 'Call Bell'] },
  { id: '3', bedNumber: 'MMW-003', wardId: '1', wardName: 'Male Medical Ward', wardType: 'general', status: 'cleaning', dailyRate: 15000, features: ['Oxygen Port', 'Call Bell'] },
  { id: '4', bedNumber: 'PVT-A01', wardId: '3', wardName: 'Private Ward A', wardType: 'private', status: 'occupied', dailyRate: 50000, features: ['AC', 'TV', 'Ensuite', 'Oxygen Port'], currentPatient: { id: '2', name: 'Fatima Mohammed', admissionId: 'ADM-2024-002', admittedDate: '2024-01-22', diagnosis: 'Post-Surgery Recovery', doctor: 'Dr. Chukwuemeka Okafor' } },
  { id: '5', bedNumber: 'PVT-A02', wardId: '3', wardName: 'Private Ward A', wardType: 'private', status: 'reserved', dailyRate: 50000, features: ['AC', 'TV', 'Ensuite', 'Oxygen Port'] },
  { id: '6', bedNumber: 'ICU-001', wardId: '4', wardName: 'ICU', wardType: 'icu', status: 'occupied', dailyRate: 150000, features: ['Ventilator', 'Cardiac Monitor', 'Central Line'], currentPatient: { id: '3', name: 'Emmanuel Adeyemi', admissionId: 'ADM-2024-003', admittedDate: '2024-01-24', diagnosis: 'Acute MI', doctor: 'Dr. Chukwuemeka Okafor' } },
  { id: '7', bedNumber: 'ICU-002', wardId: '4', wardName: 'ICU', wardType: 'icu', status: 'available', dailyRate: 150000, features: ['Ventilator', 'Cardiac Monitor', 'Central Line'] },
  { id: '8', bedNumber: 'MAT-001', wardId: '5', wardName: 'Maternity Ward', wardType: 'maternity', status: 'occupied', dailyRate: 25000, features: ['Baby Cot', 'Call Bell'], currentPatient: { id: '4', name: 'Blessing Adekunle', admissionId: 'ADM-2024-004', admittedDate: '2024-01-25', diagnosis: 'Labor & Delivery', doctor: 'Dr. Amina Hassan' } },
];

// Mock admissions
const mockAdmissions: Admission[] = [
  {
    id: '1',
    admissionNumber: 'ADM-2024-001',
    patient: { id: '1', name: 'Chukwuemeka Obi', rivhealId: 'RH-PAT-0001', age: 45, gender: 'Male', phone: '+234 803 456 7890', bloodGroup: 'O+' },
    bed: { id: '1', number: 'MMW-001', ward: 'Male Medical Ward' },
    admittingDoctor: 'Dr. Adaeze Obi',
    attendingDoctor: 'Dr. Adaeze Obi',
    department: 'General Medicine',
    diagnosis: 'Community Acquired Pneumonia',
    admissionType: 'emergency',
    admittedAt: '2024-01-20T14:30:00Z',
    expectedDischarge: '2024-01-27',
    status: 'admitted',
    vitals: { temperature: 37.2, bloodPressure: '120/80', pulse: 78, respiration: 18, oxygenSaturation: 97, recordedAt: '2024-01-25T08:00:00Z' },
    notes: [
      { id: '1', type: 'nursing', content: 'Patient resting comfortably. Vitals stable. Oxygen therapy continued at 2L/min.', author: 'Nurse Blessing Okonkwo', createdAt: '2024-01-25T08:00:00Z' },
      { id: '2', type: 'doctor', content: 'Responding well to antibiotics. Continue current treatment. Review chest X-ray tomorrow.', author: 'Dr. Adaeze Obi', createdAt: '2024-01-25T10:00:00Z' },
    ],
  },
  {
    id: '2',
    admissionNumber: 'ADM-2024-002',
    patient: { id: '2', name: 'Fatima Mohammed', rivhealId: 'RH-PAT-0002', age: 35, gender: 'Female', phone: '+234 807 890 1234', bloodGroup: 'A+' },
    bed: { id: '4', number: 'PVT-A01', ward: 'Private Ward A' },
    admittingDoctor: 'Dr. Chukwuemeka Okafor',
    attendingDoctor: 'Dr. Chukwuemeka Okafor',
    department: 'Surgery',
    diagnosis: 'Post Cholecystectomy',
    admissionType: 'elective',
    admittedAt: '2024-01-22T09:00:00Z',
    expectedDischarge: '2024-01-26',
    status: 'admitted',
    vitals: { temperature: 36.8, bloodPressure: '118/75', pulse: 72, respiration: 16, oxygenSaturation: 99, recordedAt: '2024-01-25T08:30:00Z' },
    notes: [
      { id: '3', type: 'nursing', content: 'Wound dressing changed. No signs of infection. Patient mobilizing well.', author: 'Nurse Fatima Ahmed', createdAt: '2024-01-25T09:00:00Z' },
    ],
  },
  {
    id: '3',
    admissionNumber: 'ADM-2024-003',
    patient: { id: '3', name: 'Emmanuel Adeyemi', rivhealId: 'RH-PAT-0003', age: 58, gender: 'Male', phone: '+234 809 012 3456', bloodGroup: 'B+' },
    bed: { id: '6', number: 'ICU-001', ward: 'ICU' },
    admittingDoctor: 'Dr. Chukwuemeka Okafor',
    attendingDoctor: 'Dr. Chukwuemeka Okafor',
    department: 'Cardiology',
    diagnosis: 'Acute Myocardial Infarction (STEMI)',
    admissionType: 'emergency',
    admittedAt: '2024-01-24T03:45:00Z',
    status: 'admitted',
    vitals: { temperature: 37.0, bloodPressure: '130/85', pulse: 88, respiration: 20, oxygenSaturation: 95, recordedAt: '2024-01-25T06:00:00Z' },
    notes: [
      { id: '4', type: 'doctor', content: 'Post-PCI Day 1. Cardiac enzymes trending down. Continue dual antiplatelet therapy.', author: 'Dr. Chukwuemeka Okafor', createdAt: '2024-01-25T07:00:00Z' },
      { id: '5', type: 'nursing', content: 'Continuous cardiac monitoring. Patient comfortable. Family visited.', author: 'Nurse Grace Okafor', createdAt: '2024-01-25T08:00:00Z' },
    ],
  },
  {
    id: '4',
    admissionNumber: 'ADM-2024-004',
    patient: { id: '4', name: 'Blessing Adekunle', rivhealId: 'RH-PAT-0004', age: 28, gender: 'Female', phone: '+234 811 234 5678', bloodGroup: 'O+' },
    bed: { id: '8', number: 'MAT-001', ward: 'Maternity Ward' },
    admittingDoctor: 'Dr. Amina Hassan',
    attendingDoctor: 'Dr. Amina Hassan',
    department: 'Obstetrics',
    diagnosis: 'Term Pregnancy in Labor',
    admissionType: 'elective',
    admittedAt: '2024-01-25T02:00:00Z',
    status: 'admitted',
    vitals: { temperature: 36.9, bloodPressure: '115/70', pulse: 82, respiration: 18, oxygenSaturation: 99, recordedAt: '2024-01-25T08:00:00Z' },
    notes: [
      { id: '6', type: 'nursing', content: 'Cervix 6cm dilated. FHR normal. Contractions regular.', author: 'Nurse Chioma Eze', createdAt: '2024-01-25T08:00:00Z' },
    ],
  },
];

const wardTypeConfig: Record<WardType, { label: string; color: string }> = {
  general: { label: 'General', color: 'bg-blue-100 text-blue-700' },
  private: { label: 'Private', color: 'bg-purple-100 text-purple-700' },
  semi_private: { label: 'Semi-Private', color: 'bg-indigo-100 text-indigo-700' },
  icu: { label: 'ICU', color: 'bg-red-100 text-red-700' },
  nicu: { label: 'NICU', color: 'bg-pink-100 text-pink-700' },
  maternity: { label: 'Maternity', color: 'bg-rose-100 text-rose-700' },
  pediatric: { label: 'Pediatric', color: 'bg-cyan-100 text-cyan-700' },
  isolation: { label: 'Isolation', color: 'bg-orange-100 text-orange-700' },
  emergency: { label: 'Emergency', color: 'bg-yellow-100 text-yellow-700' },
};

const bedStatusConfig: Record<BedStatus, { label: string; color: string; bgColor: string }> = {
  available: { label: 'Available', color: 'text-green-700', bgColor: 'bg-green-100 border-green-300' },
  occupied: { label: 'Occupied', color: 'text-red-700', bgColor: 'bg-red-100 border-red-300' },
  reserved: { label: 'Reserved', color: 'text-yellow-700', bgColor: 'bg-yellow-100 border-yellow-300' },
  maintenance: { label: 'Maintenance', color: 'text-gray-700', bgColor: 'bg-gray-100 border-gray-300' },
  cleaning: { label: 'Cleaning', color: 'text-blue-700', bgColor: 'bg-blue-100 border-blue-300' },
};

type TabView = 'overview' | 'beds' | 'admissions';

export const WardManagementPage: React.FC = () => {
  const addToast = useUIStore((state) => state.addToast);
  const canCreate = useAuthStore((state) => state.canCreate);
  const canEdit = useAuthStore((state) => state.canEdit);

  // State
  const [activeTab, setActiveTab] = useState<TabView>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [wardFilter, setWardFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<BedStatus | ''>('');
  const [selectedAdmission, setSelectedAdmission] = useState<Admission | null>(null);
  const [showAdmissionModal, setShowAdmissionModal] = useState(false);
  const [showDischargeModal, setShowDischargeModal] = useState(false);
  const [showVitalsModal, setShowVitalsModal] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [noteType, setNoteType] = useState<'nursing' | 'doctor'>('nursing');

  // Stats
  const stats = useMemo(() => {
    const totalBeds = mockWards.reduce((sum, w) => sum + w.totalBeds, 0);
    const occupiedBeds = mockWards.reduce((sum, w) => sum + w.occupiedBeds, 0);
    const availableBeds = mockWards.reduce((sum, w) => sum + w.availableBeds, 0);
    const icuOccupied = mockWards.filter(w => w.type === 'icu').reduce((sum, w) => sum + w.occupiedBeds, 0);
    const icuTotal = mockWards.filter(w => w.type === 'icu').reduce((sum, w) => sum + w.totalBeds, 0);
    
    return {
      totalBeds,
      occupiedBeds,
      availableBeds,
      occupancyRate: Math.round((occupiedBeds / totalBeds) * 100),
      icuOccupancy: `${icuOccupied}/${icuTotal}`,
      activeAdmissions: mockAdmissions.filter(a => a.status === 'admitted').length,
      dischargeToday: 2, // Mock
    };
  }, []);

  // Filter beds
  const filteredBeds = useMemo(() => {
    return mockBeds.filter((bed) => {
      const matchesSearch = !searchQuery ||
        bed.bedNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        bed.currentPatient?.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesWard = !wardFilter || bed.wardId === wardFilter;
      const matchesStatus = !statusFilter || bed.status === statusFilter;
      return matchesSearch && matchesWard && matchesStatus;
    });
  }, [searchQuery, wardFilter, statusFilter]);

  // Filter admissions
  const filteredAdmissions = useMemo(() => {
    return mockAdmissions.filter((admission) => {
      const matchesSearch = !searchQuery ||
        admission.patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        admission.admissionNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        admission.patient.rivhealId.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch && admission.status === 'admitted';
    });
  }, [searchQuery]);

  // Calculate days admitted
  const getDaysAdmitted = (admittedAt: string) => {
    const now = new Date();
    const admitted = new Date(admittedAt);
    const diff = Math.floor((now.getTime() - admitted.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Ward Management</h1>
          <p className="text-gray-500">Manage beds, admissions, and inpatient care</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setActiveTab('overview')}
              className={cn(
                'flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition',
                activeTab === 'overview' ? 'bg-white shadow text-gray-900' : 'text-gray-600 hover:text-gray-900'
              )}
            >
              <Building2 size={16} />
              Overview
            </button>
            <button
              onClick={() => setActiveTab('beds')}
              className={cn(
                'flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition',
                activeTab === 'beds' ? 'bg-white shadow text-gray-900' : 'text-gray-600 hover:text-gray-900'
              )}
            >
              <BedDouble size={16} />
              Beds
            </button>
            <button
              onClick={() => setActiveTab('admissions')}
              className={cn(
                'flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition',
                activeTab === 'admissions' ? 'bg-white shadow text-gray-900' : 'text-gray-600 hover:text-gray-900'
              )}
            >
              <Users size={16} />
              Admissions
            </button>
          </div>

          {canCreate('ward') && (
            <button className="inline-flex items-center gap-2 bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition">
              <UserPlus size={18} />
              New Admission
            </button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <BedDouble size={20} className="text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.totalBeds}</p>
              <p className="text-sm text-gray-500">Total Beds</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <Users size={20} className="text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.occupiedBeds}</p>
              <p className="text-sm text-gray-500">Occupied</p>
            </div>
          </div>
        </div>

        <div
          onClick={() => { setActiveTab('beds'); setStatusFilter('available'); }}
          className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 cursor-pointer hover:shadow-md transition"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle size={20} className="text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.availableBeds}</p>
              <p className="text-sm text-gray-500">Available</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Activity size={20} className="text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.occupancyRate}%</p>
              <p className="text-sm text-gray-500">Occupancy</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <Heart size={20} className="text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.icuOccupancy}</p>
              <p className="text-sm text-gray-500">ICU Beds</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <LogOut size={20} className="text-orange-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.dischargeToday}</p>
              <p className="text-sm text-gray-500">Due Today</p>
            </div>
          </div>
        </div>
      </div>

      {/* Overview Tab - Ward Cards */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {mockWards.map((ward) => {
            const occupancyPercent = Math.round((ward.occupiedBeds / ward.totalBeds) * 100);
            const wardType = wardTypeConfig[ward.type];

            return (
              <div key={ward.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-gray-900">{ward.name}</h3>
                    <p className="text-sm text-gray-500">{ward.floor}</p>
                  </div>
                  <span className={cn('px-2 py-1 rounded-full text-xs font-medium', wardType.color)}>
                    {wardType.label}
                  </span>
                </div>

                <div className="space-y-3">
                  {/* Occupancy Bar */}
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Occupancy</span>
                      <span className="font-medium">{occupancyPercent}%</span>
                    </div>
                    <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={cn(
                          'h-full rounded-full transition-all',
                          occupancyPercent > 90 ? 'bg-red-500' :
                          occupancyPercent > 70 ? 'bg-orange-500' : 'bg-green-500'
                        )}
                        style={{ width: `${occupancyPercent}%` }}
                      />
                    </div>
                  </div>

                  {/* Bed Counts */}
                  <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                    <div className="text-center">
                      <p className="text-lg font-bold text-gray-900">{ward.totalBeds}</p>
                      <p className="text-xs text-gray-500">Total</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold text-red-600">{ward.occupiedBeds}</p>
                      <p className="text-xs text-gray-500">Occupied</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold text-green-600">{ward.availableBeds}</p>
                      <p className="text-xs text-gray-500">Available</p>
                    </div>
                  </div>

                  {/* Nurse in Charge */}
                  <div className="pt-2 border-t border-gray-100">
                    <p className="text-xs text-gray-500">Nurse in Charge</p>
                    <p className="text-sm font-medium text-gray-700">{ward.nurseInCharge}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Beds Tab */}
      {activeTab === 'beds' && (
        <>
          {/* Filters */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Search bed number or patient..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                />
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>

              <select
                value={wardFilter}
                onChange={(e) => setWardFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="">All Wards</option>
                {mockWards.map((ward) => (
                  <option key={ward.id} value={ward.id}>{ward.name}</option>
                ))}
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as BedStatus | '')}
                className="px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="">All Status</option>
                {Object.entries(bedStatusConfig).map(([key, { label }]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Bed Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {filteredBeds.map((bed) => {
              const status = bedStatusConfig[bed.status];
              return (
                <div
                  key={bed.id}
                  className={cn(
                    'p-4 rounded-xl border-2 transition cursor-pointer hover:shadow-md',
                    status.bgColor
                  )}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-gray-900">{bed.bedNumber}</span>
                    <BedDouble size={18} className={status.color} />
                  </div>
                  <p className="text-xs text-gray-500 mb-2">{bed.wardName}</p>
                  <span className={cn('text-xs font-medium', status.color)}>{status.label}</span>
                  
                  {bed.currentPatient && (
                    <div className="mt-2 pt-2 border-t border-gray-200">
                      <p className="text-xs font-medium text-gray-700 truncate">{bed.currentPatient.name}</p>
                      <p className="text-xs text-gray-500">{getDaysAdmitted(bed.currentPatient.admittedDate)} days</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-4 justify-center">
            {Object.entries(bedStatusConfig).map(([key, config]) => (
              <div key={key} className="flex items-center gap-2">
                <div className={cn('w-4 h-4 rounded', config.bgColor, 'border')} />
                <span className="text-sm text-gray-600">{config.label}</span>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Admissions Tab */}
      {activeTab === 'admissions' && (
        <>
          {/* Search */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search by patient name, admission number, or RivHeal ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
              />
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
          </div>

          {/* Admissions List */}
          <div className="space-y-4">
            {filteredAdmissions.map((admission) => {
              const daysAdmitted = getDaysAdmitted(admission.admittedAt);
              
              return (
                <div key={admission.id} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                  <div className="p-5">
                    <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                      {/* Patient Info */}
                      <div className="flex items-start gap-4">
                        <div className="w-14 h-14 bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl flex items-center justify-center text-white font-bold text-lg">
                          {admission.patient.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{admission.patient.name}</h3>
                          <div className="flex flex-wrap items-center gap-2 mt-1 text-sm text-gray-500">
                            <span>{admission.patient.rivhealId}</span>
                            <span>•</span>
                            <span>{admission.patient.age}y, {admission.patient.gender}</span>
                            <span>•</span>
                            <span className="text-red-600 font-medium">{admission.patient.bloodGroup}</span>
                          </div>
                          <p className="text-sm text-gray-700 mt-1">
                            <span className="font-medium">Diagnosis:</span> {admission.diagnosis}
                          </p>
                        </div>
                      </div>

                      {/* Admission Details */}
                      <div className="flex flex-wrap gap-6 text-sm">
                        <div>
                          <p className="text-gray-500">Bed</p>
                          <p className="font-medium text-gray-900">{admission.bed.number}</p>
                          <p className="text-xs text-gray-500">{admission.bed.ward}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Admitted</p>
                          <p className="font-medium text-gray-900">{formatDate(admission.admittedAt)}</p>
                          <p className="text-xs text-orange-600">{daysAdmitted} days</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Doctor</p>
                          <p className="font-medium text-gray-900">{admission.attendingDoctor}</p>
                          <p className="text-xs text-gray-500">{admission.department}</p>
                        </div>
                      </div>
                    </div>

                    {/* Vitals Strip */}
                    {admission.vitals && (
                      <div className="mt-4 p-3 bg-gray-50 rounded-lg flex flex-wrap gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Thermometer size={16} className="text-orange-500" />
                          <span>{admission.vitals.temperature}°C</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Heart size={16} className="text-red-500" />
                          <span>{admission.vitals.bloodPressure} mmHg</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Activity size={16} className="text-blue-500" />
                          <span>{admission.vitals.pulse} bpm</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Droplet size={16} className="text-teal-500" />
                          <span>SpO2: {admission.vitals.oxygenSaturation}%</span>
                        </div>
                        <span className="text-gray-400 text-xs">
                          {new Date(admission.vitals.recordedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="mt-4 flex flex-wrap gap-2">
                      <button
                        onClick={() => {
                          setSelectedAdmission(admission);
                          setShowAdmissionModal(true);
                        }}
                        className="flex items-center gap-1 px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
                      >
                        <Eye size={14} />
                        View
                      </button>
                      <button
                        onClick={() => {
                          setSelectedAdmission(admission);
                          setShowVitalsModal(true);
                        }}
                        className="flex items-center gap-1 px-3 py-1.5 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200"
                      >
                        <Activity size={14} />
                        Record Vitals
                      </button>
                      <button
                        onClick={() => {
                          setSelectedAdmission(admission);
                          setShowNoteModal(true);
                        }}
                        className="flex items-center gap-1 px-3 py-1.5 text-sm bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200"
                      >
                        <FileText size={14} />
                        Add Note
                      </button>
                      <button className="flex items-center gap-1 px-3 py-1.5 text-sm bg-teal-100 text-teal-700 rounded-lg hover:bg-teal-200">
                        <Pill size={14} />
                        Medications
                      </button>
                      <button
                        onClick={() => {
                          setSelectedAdmission(admission);
                          setShowDischargeModal(true);
                        }}
                        className="flex items-center gap-1 px-3 py-1.5 text-sm bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200"
                      >
                        <LogOut size={14} />
                        Discharge
                      </button>
                    </div>
                  </div>

                  {/* Recent Notes */}
                  {admission.notes.length > 0 && (
                    <div className="px-5 py-3 bg-gray-50 border-t border-gray-100">
                      <p className="text-xs font-medium text-gray-500 mb-2">Latest Note</p>
                      <div className="flex items-start gap-2">
                        <div className={cn(
                          'px-2 py-0.5 rounded text-xs font-medium',
                          admission.notes[admission.notes.length - 1].type === 'nursing' ? 'bg-pink-100 text-pink-700' : 'bg-blue-100 text-blue-700'
                        )}>
                          {admission.notes[admission.notes.length - 1].type === 'nursing' ? 'Nursing' : 'Doctor'}
                        </div>
                        <p className="text-sm text-gray-700 flex-1">{admission.notes[admission.notes.length - 1].content}</p>
                        <span className="text-xs text-gray-400">
                          {new Date(admission.notes[admission.notes.length - 1].createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Admission Detail Modal */}
      {showAdmissionModal && selectedAdmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Admission Details</h2>
                <p className="text-sm text-gray-500">{selectedAdmission.admissionNumber}</p>
              </div>
              <button onClick={() => setShowAdmissionModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Patient & Admission Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-3">Patient Information</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Name:</span>
                      <span className="font-medium">{selectedAdmission.patient.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">RivHeal ID:</span>
                      <span className="font-mono">{selectedAdmission.patient.rivhealId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Age/Gender:</span>
                      <span>{selectedAdmission.patient.age}y, {selectedAdmission.patient.gender}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Blood Group:</span>
                      <span className="text-red-600 font-medium">{selectedAdmission.patient.bloodGroup}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Phone:</span>
                      <span>{selectedAdmission.patient.phone}</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-teal-50 rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-3">Admission Details</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Bed:</span>
                      <span className="font-medium">{selectedAdmission.bed.number} - {selectedAdmission.bed.ward}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Admitted:</span>
                      <span>{formatDate(selectedAdmission.admittedAt)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Days:</span>
                      <span className="text-orange-600 font-medium">{getDaysAdmitted(selectedAdmission.admittedAt)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Doctor:</span>
                      <span>{selectedAdmission.attendingDoctor}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Department:</span>
                      <span>{selectedAdmission.department}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Diagnosis */}
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-2">Diagnosis</h3>
                <p className="text-gray-700">{selectedAdmission.diagnosis}</p>
              </div>

              {/* Progress Notes */}
              <div>
                <h3 className="font-medium text-gray-900 mb-3">Progress Notes</h3>
                <div className="space-y-3">
                  {selectedAdmission.notes.map((note) => (
                    <div key={note.id} className="p-3 bg-white border border-gray-200 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className={cn(
                            'px-2 py-0.5 rounded text-xs font-medium',
                            note.type === 'nursing' ? 'bg-pink-100 text-pink-700' : 'bg-blue-100 text-blue-700'
                          )}>
                            {note.type === 'nursing' ? 'Nursing' : 'Doctor'}
                          </span>
                          <span className="text-sm font-medium text-gray-700">{note.author}</span>
                        </div>
                        <span className="text-xs text-gray-500">{formatDate(note.createdAt)}</span>
                      </div>
                      <p className="text-sm text-gray-700">{note.content}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Note Modal */}
      {showNoteModal && selectedAdmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">Add Progress Note</h2>
              <p className="text-sm text-gray-500">{selectedAdmission.patient.name}</p>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Note Type</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setNoteType('nursing')}
                    className={cn(
                      'flex-1 py-2 rounded-lg text-sm font-medium transition',
                      noteType === 'nursing' ? 'bg-pink-100 text-pink-700 border-2 border-pink-500' : 'bg-gray-100 text-gray-600'
                    )}
                  >
                    Nursing Note
                  </button>
                  <button
                    onClick={() => setNoteType('doctor')}
                    className={cn(
                      'flex-1 py-2 rounded-lg text-sm font-medium transition',
                      noteType === 'doctor' ? 'bg-blue-100 text-blue-700 border-2 border-blue-500' : 'bg-gray-100 text-gray-600'
                    )}
                  >
                    Doctor Note
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Note</label>
                <textarea
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                  placeholder="Enter progress note..."
                />
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowNoteModal(false);
                  setNewNote('');
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  addToast('success', 'Note Added', 'Progress note has been added successfully');
                  setShowNoteModal(false);
                  setNewNote('');
                }}
                disabled={!newNote.trim()}
                className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50"
              >
                Save Note
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WardManagementPage;
