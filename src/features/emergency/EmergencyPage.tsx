import React, { useState, useMemo } from 'react';
import { useAuthStore } from '@/stores/auth.store';
import { useUIStore } from '@/stores/ui.store';
import { cn } from '@/utils';
import {
  Siren,
  Search,
  Plus,
  Eye,
  Phone,
  MapPin,
  Clock,
  AlertTriangle,
  Activity,
  Heart,
  Users,
  Building2,
  Navigation,
  Zap,
  Timer,
  Stethoscope,
  X,
  RefreshCw,
  Send,
  Radio,
  Thermometer,
  Droplet,
} from 'lucide-react';

type TriageLevel = 'resuscitation' | 'emergency' | 'urgent' | 'standard' | 'non_urgent';
type ERPatientStatus = 'waiting' | 'triage' | 'treatment' | 'observation' | 'admitted' | 'discharged' | 'transferred';
type AmbulanceStatus = 'available' | 'dispatched' | 'on_scene' | 'transporting' | 'at_hospital' | 'offline';
type HospitalCapacity = 'available' | 'limited' | 'full' | 'diverting';

interface ERPatient {
  id: string;
  visitsId: string;
  patient: {
    id: string;
    name: string;
    age: number;
    gender: string;
    phone?: string;
    bloodGroup?: string;
  };
  chiefComplaint: string;
  triageLevel: TriageLevel;
  status: ERPatientStatus;
  arrivalTime: string;
  arrivalMode: 'walk_in' | 'ambulance' | 'police' | 'referral';
  assignedDoctor?: string;
  assignedNurse?: string;
  vitals?: {
    temperature: number;
    bloodPressure: string;
    pulse: number;
    respiration: number;
    oxygenSaturation: number;
  };
  notes?: string;
  waitTime?: number; // minutes
}

interface AmbulanceUnit {
  id: string;
  unitNumber: string;
  vehiclePlate: string;
  status: AmbulanceStatus;
  driver: {
    name: string;
    phone: string;
  };
  paramedic?: {
    name: string;
    phone: string;
  };
  currentLocation?: {
    lat: number;
    lng: number;
    address: string;
  };
  currentMission?: {
    id: string;
    patientName: string;
    pickupLocation: string;
    destination: string;
    eta?: string;
  };
  lastUpdate: string;
}

interface NetworkHospital {
  id: string;
  name: string;
  type: 'tertiary' | 'secondary' | 'primary' | 'specialist';
  address: string;
  distance: number; // km
  phone: string;
  capacity: HospitalCapacity;
  erBeds: { available: number; total: number };
  icuBeds: { available: number; total: number };
  specialties: string[];
  equipment: {
    ventilators: boolean;
    dialysis: boolean;
    ctScan: boolean;
    mri: boolean;
    cathLab: boolean;
  };
  lastUpdate: string;
}

// Mock ER patients
const mockERPatients: ERPatient[] = [
  {
    id: '1',
    visitsId: 'ER-2024-001',
    patient: { id: '1', name: 'Adaora Nwachukwu', age: 45, gender: 'Female', phone: '+234 803 111 2222', bloodGroup: 'O+' },
    chiefComplaint: 'Chest pain, shortness of breath',
    triageLevel: 'emergency',
    status: 'treatment',
    arrivalTime: '2024-01-25T08:30:00Z',
    arrivalMode: 'ambulance',
    assignedDoctor: 'Dr. Chukwuemeka Okafor',
    assignedNurse: 'Nurse Grace Okafor',
    vitals: { temperature: 37.1, bloodPressure: '160/100', pulse: 110, respiration: 24, oxygenSaturation: 94 },
  },
  {
    id: '2',
    visitsId: 'ER-2024-002',
    patient: { id: '2', name: 'Oluwaseun Adeleke', age: 28, gender: 'Male', phone: '+234 807 333 4444' },
    chiefComplaint: 'Road traffic accident - multiple trauma',
    triageLevel: 'resuscitation',
    status: 'treatment',
    arrivalTime: '2024-01-25T09:15:00Z',
    arrivalMode: 'ambulance',
    assignedDoctor: 'Dr. Adaeze Obi',
    assignedNurse: 'Nurse Emeka Nnamdi',
    vitals: { temperature: 36.5, bloodPressure: '90/60', pulse: 130, respiration: 28, oxygenSaturation: 91 },
    notes: 'GCS 12, multiple lacerations, suspected fractures',
  },
  {
    id: '3',
    visitsId: 'ER-2024-003',
    patient: { id: '3', name: 'Fatima Abdullahi', age: 5, gender: 'Female' },
    chiefComplaint: 'High fever, convulsions',
    triageLevel: 'urgent',
    status: 'triage',
    arrivalTime: '2024-01-25T09:45:00Z',
    arrivalMode: 'walk_in',
    waitTime: 15,
  },
  {
    id: '4',
    visitsId: 'ER-2024-004',
    patient: { id: '4', name: 'Chinedu Okoro', age: 35, gender: 'Male', phone: '+234 809 555 6666' },
    chiefComplaint: 'Severe abdominal pain',
    triageLevel: 'urgent',
    status: 'waiting',
    arrivalTime: '2024-01-25T10:00:00Z',
    arrivalMode: 'walk_in',
    waitTime: 30,
  },
  {
    id: '5',
    visitsId: 'ER-2024-005',
    patient: { id: '5', name: 'Blessing Okonkwo', age: 22, gender: 'Female' },
    chiefComplaint: 'Laceration on hand',
    triageLevel: 'standard',
    status: 'waiting',
    arrivalTime: '2024-01-25T10:15:00Z',
    arrivalMode: 'walk_in',
    waitTime: 45,
  },
];

// Mock ambulances
const mockAmbulances: AmbulanceUnit[] = [
  {
    id: '1',
    unitNumber: 'AMB-001',
    vehiclePlate: 'LG-234-AMB',
    status: 'transporting',
    driver: { name: 'Ibrahim Musa', phone: '+234 803 777 8888' },
    paramedic: { name: 'Nurse Amaka Nwosu', phone: '+234 807 999 0000' },
    currentLocation: { lat: 6.5244, lng: 3.3792, address: 'Third Mainland Bridge, Lagos' },
    currentMission: {
      id: 'M001',
      patientName: 'Unknown Male',
      pickupLocation: 'Lekki-Epe Expressway',
      destination: 'RivHeal Hospital',
      eta: '8 minutes',
    },
    lastUpdate: '2024-01-25T10:20:00Z',
  },
  {
    id: '2',
    unitNumber: 'AMB-002',
    vehiclePlate: 'LG-567-AMB',
    status: 'available',
    driver: { name: 'Emeka Okafor', phone: '+234 809 111 2222' },
    currentLocation: { lat: 6.4541, lng: 3.3947, address: 'RivHeal Hospital Bay' },
    lastUpdate: '2024-01-25T10:15:00Z',
  },
  {
    id: '3',
    unitNumber: 'AMB-003',
    vehiclePlate: 'LG-890-AMB',
    status: 'on_scene',
    driver: { name: 'Tunde Bakare', phone: '+234 811 333 4444' },
    paramedic: { name: 'Nurse Fatima Ahmed', phone: '+234 813 555 6666' },
    currentLocation: { lat: 6.4698, lng: 3.5852, address: 'Ajah Market Area' },
    currentMission: {
      id: 'M002',
      patientName: 'Elderly Woman',
      pickupLocation: 'Ajah Market',
      destination: 'RivHeal Hospital',
    },
    lastUpdate: '2024-01-25T10:18:00Z',
  },
  {
    id: '4',
    unitNumber: 'AMB-004',
    vehiclePlate: 'LG-123-AMB',
    status: 'offline',
    driver: { name: 'John Obi', phone: '+234 815 777 8888' },
    lastUpdate: '2024-01-25T06:00:00Z',
  },
];

// Mock network hospitals
const mockNetworkHospitals: NetworkHospital[] = [
  {
    id: '1',
    name: 'Lagos University Teaching Hospital',
    type: 'tertiary',
    address: 'Idi-Araba, Lagos',
    distance: 12.5,
    phone: '+234 1 234 5678',
    capacity: 'limited',
    erBeds: { available: 3, total: 20 },
    icuBeds: { available: 1, total: 15 },
    specialties: ['Cardiology', 'Neurology', 'Trauma', 'Pediatrics', 'Obstetrics'],
    equipment: { ventilators: true, dialysis: true, ctScan: true, mri: true, cathLab: true },
    lastUpdate: '2024-01-25T10:00:00Z',
  },
  {
    id: '2',
    name: 'Reddington Hospital',
    type: 'secondary',
    address: 'Victoria Island, Lagos',
    distance: 5.2,
    phone: '+234 1 345 6789',
    capacity: 'available',
    erBeds: { available: 5, total: 10 },
    icuBeds: { available: 2, total: 6 },
    specialties: ['General Medicine', 'Surgery', 'Pediatrics'],
    equipment: { ventilators: true, dialysis: true, ctScan: true, mri: false, cathLab: false },
    lastUpdate: '2024-01-25T10:05:00Z',
  },
  {
    id: '3',
    name: 'Evercare Hospital',
    type: 'secondary',
    address: 'Lekki Phase 1, Lagos',
    distance: 3.8,
    phone: '+234 1 456 7890',
    capacity: 'available',
    erBeds: { available: 4, total: 8 },
    icuBeds: { available: 2, total: 4 },
    specialties: ['Cardiology', 'General Medicine', 'Surgery'],
    equipment: { ventilators: true, dialysis: false, ctScan: true, mri: true, cathLab: true },
    lastUpdate: '2024-01-25T10:10:00Z',
  },
  {
    id: '4',
    name: 'First Consultants Medical Centre',
    type: 'secondary',
    address: 'Obalende, Lagos',
    distance: 8.3,
    phone: '+234 1 567 8901',
    capacity: 'full',
    erBeds: { available: 0, total: 12 },
    icuBeds: { available: 0, total: 5 },
    specialties: ['General Medicine', 'Surgery', 'Obstetrics'],
    equipment: { ventilators: true, dialysis: true, ctScan: true, mri: false, cathLab: false },
    lastUpdate: '2024-01-25T09:55:00Z',
  },
  {
    id: '5',
    name: 'National Orthopaedic Hospital',
    type: 'specialist',
    address: 'Igbobi, Lagos',
    distance: 15.7,
    phone: '+234 1 678 9012',
    capacity: 'available',
    erBeds: { available: 6, total: 15 },
    icuBeds: { available: 3, total: 8 },
    specialties: ['Orthopaedics', 'Trauma', 'Spine Surgery'],
    equipment: { ventilators: true, dialysis: false, ctScan: true, mri: true, cathLab: false },
    lastUpdate: '2024-01-25T10:08:00Z',
  },
];

const triageConfig: Record<TriageLevel, { label: string; color: string; bgColor: string; priority: number }> = {
  resuscitation: { label: 'Resuscitation', color: 'text-red-700', bgColor: 'bg-red-100 border-red-500', priority: 1 },
  emergency: { label: 'Emergency', color: 'text-orange-700', bgColor: 'bg-orange-100 border-orange-500', priority: 2 },
  urgent: { label: 'Urgent', color: 'text-yellow-700', bgColor: 'bg-yellow-100 border-yellow-500', priority: 3 },
  standard: { label: 'Standard', color: 'text-green-700', bgColor: 'bg-green-100 border-green-500', priority: 4 },
  non_urgent: { label: 'Non-Urgent', color: 'text-blue-700', bgColor: 'bg-blue-100 border-blue-500', priority: 5 },
};

const ambulanceStatusConfig: Record<AmbulanceStatus, { label: string; color: string; dotColor: string }> = {
  available: { label: 'Available', color: 'text-green-700', dotColor: 'bg-green-500' },
  dispatched: { label: 'Dispatched', color: 'text-blue-700', dotColor: 'bg-blue-500' },
  on_scene: { label: 'On Scene', color: 'text-orange-700', dotColor: 'bg-orange-500' },
  transporting: { label: 'Transporting', color: 'text-purple-700', dotColor: 'bg-purple-500 animate-pulse' },
  at_hospital: { label: 'At Hospital', color: 'text-teal-700', dotColor: 'bg-teal-500' },
  offline: { label: 'Offline', color: 'text-gray-500', dotColor: 'bg-gray-400' },
};

const capacityConfig: Record<HospitalCapacity, { label: string; color: string; bgColor: string }> = {
  available: { label: 'Available', color: 'text-green-700', bgColor: 'bg-green-100' },
  limited: { label: 'Limited', color: 'text-yellow-700', bgColor: 'bg-yellow-100' },
  full: { label: 'Full', color: 'text-red-700', bgColor: 'bg-red-100' },
  diverting: { label: 'Diverting', color: 'text-gray-700', bgColor: 'bg-gray-100' },
};

type TabView = 'er_queue' | 'ambulances' | 'network';

export const EmergencyPage: React.FC = () => {
  const addToast = useUIStore((state) => state.addToast);
  const canCreate = useAuthStore((state) => state.canCreate);

  // State
  const [activeTab, setActiveTab] = useState<TabView>('er_queue');
  const [searchQuery, setSearchQuery] = useState('');
  const [triageFilter, setTriageFilter] = useState<TriageLevel | ''>('');
  const [selectedPatient, setSelectedPatient] = useState<ERPatient | null>(null);
  const [showReferralModal, setShowReferralModal] = useState(false);
  const [selectedHospital, setSelectedHospital] = useState<NetworkHospital | null>(null);

  // Stats
  const stats = useMemo(() => {
    const resus = mockERPatients.filter(p => p.triageLevel === 'resuscitation').length;
    const emergency = mockERPatients.filter(p => p.triageLevel === 'emergency').length;
    const waiting = mockERPatients.filter(p => p.status === 'waiting').length;
    const avgWait = mockERPatients.filter(p => p.waitTime).reduce((sum, p) => sum + (p.waitTime || 0), 0) / waiting || 0;
    const ambulancesActive = mockAmbulances.filter(a => ['dispatched', 'on_scene', 'transporting'].includes(a.status)).length;
    const ambulancesAvailable = mockAmbulances.filter(a => a.status === 'available').length;

    return {
      totalER: mockERPatients.length,
      critical: resus + emergency,
      waiting,
      avgWaitTime: Math.round(avgWait),
      ambulancesActive,
      ambulancesAvailable,
      networkHospitals: mockNetworkHospitals.filter(h => h.capacity !== 'full').length,
    };
  }, []);

  // Sort ER patients by triage priority
  const sortedERPatients = useMemo(() => {
    let filtered = mockERPatients.filter(p => {
      const matchesSearch = !searchQuery ||
        p.patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.visitsId.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesTriage = !triageFilter || p.triageLevel === triageFilter;
      return matchesSearch && matchesTriage;
    });

    return filtered.sort((a, b) => {
      const priorityA = triageConfig[a.triageLevel].priority;
      const priorityB = triageConfig[b.triageLevel].priority;
      return priorityA - priorityB;
    });
  }, [searchQuery, triageFilter]);

  // Get wait time in minutes since arrival
  const getWaitMinutes = (arrivalTime: string) => {
    const now = new Date();
    const arrival = new Date(arrivalTime);
    return Math.floor((now.getTime() - arrival.getTime()) / (1000 * 60));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Zap className="text-red-500" />
            Emergency Department
          </h1>
          <p className="text-gray-500">ER queue, ambulance dispatch, and hospital network</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setActiveTab('er_queue')}
              className={cn(
                'flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition',
                activeTab === 'er_queue' ? 'bg-white shadow text-gray-900' : 'text-gray-600'
              )}
            >
              <Users size={16} />
              ER Queue
            </button>
            <button
              onClick={() => setActiveTab('ambulances')}
              className={cn(
                'flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition',
                activeTab === 'ambulances' ? 'bg-white shadow text-gray-900' : 'text-gray-600'
              )}
            >
              <Siren size={16} />
              Ambulances
            </button>
            <button
              onClick={() => setActiveTab('network')}
              className={cn(
                'flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition',
                activeTab === 'network' ? 'bg-white shadow text-gray-900' : 'text-gray-600'
              )}
            >
              <Building2 size={16} />
              Network
            </button>
          </div>

          <button className="flex items-center gap-2 px-3 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50">
            <RefreshCw size={16} />
          </button>

          {canCreate('emergency') && (
            <button className="inline-flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition">
              <Plus size={18} />
              New ER Case
            </button>
          )}
        </div>
      </div>

      {/* Critical Alert Banner */}
      {stats.critical > 0 && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg flex items-center gap-3">
          <AlertTriangle className="text-red-500" size={24} />
          <div>
            <p className="font-semibold text-red-800">{stats.critical} Critical Patient{stats.critical > 1 ? 's' : ''}</p>
            <p className="text-sm text-red-600">Requiring immediate attention</p>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <Activity size={20} className="text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.totalER}</p>
              <p className="text-sm text-gray-500">In ER</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <AlertTriangle size={20} className="text-orange-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.critical}</p>
              <p className="text-sm text-gray-500">Critical</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Clock size={20} className="text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.waiting}</p>
              <p className="text-sm text-gray-500">Waiting</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Timer size={20} className="text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.avgWaitTime}m</p>
              <p className="text-sm text-gray-500">Avg Wait</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Siren size={20} className="text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.ambulancesActive}</p>
              <p className="text-sm text-gray-500">En Route</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Building2 size={20} className="text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.networkHospitals}</p>
              <p className="text-sm text-gray-500">Accepting</p>
            </div>
          </div>
        </div>
      </div>

      {/* ER Queue Tab */}
      {activeTab === 'er_queue' && (
        <>
          {/* Triage Legend & Filters */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
              <div className="flex flex-wrap gap-2">
                {Object.entries(triageConfig).map(([key, config]) => (
                  <button
                    key={key}
                    onClick={() => setTriageFilter(triageFilter === key ? '' : key as TriageLevel)}
                    className={cn(
                      'px-3 py-1.5 rounded-lg text-xs font-medium border-2 transition',
                      config.bgColor,
                      triageFilter === key ? 'ring-2 ring-offset-1 ring-gray-400' : ''
                    )}
                  >
                    {config.label}
                  </button>
                ))}
              </div>

              <div className="relative">
                <input
                  type="text"
                  placeholder="Search patient..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm w-64"
                />
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
            </div>
          </div>

          {/* ER Queue */}
          <div className="space-y-3">
            {sortedERPatients.map((erPatient) => {
              const triage = triageConfig[erPatient.triageLevel];
              const waitMins = getWaitMinutes(erPatient.arrivalTime);

              return (
                <div
                  key={erPatient.id}
                  className={cn(
                    'bg-white rounded-xl border-l-4 shadow-sm overflow-hidden',
                    triage.bgColor.replace('bg-', 'border-')
                  )}
                >
                  <div className="p-4">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      {/* Patient Info */}
                      <div className="flex items-start gap-4">
                        <div className={cn('w-14 h-14 rounded-xl flex items-center justify-center text-white font-bold',
                          erPatient.triageLevel === 'resuscitation' ? 'bg-red-500' :
                          erPatient.triageLevel === 'emergency' ? 'bg-orange-500' :
                          erPatient.triageLevel === 'urgent' ? 'bg-yellow-500' :
                          erPatient.triageLevel === 'standard' ? 'bg-green-500' : 'bg-blue-500'
                        )}>
                          {erPatient.patient.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-gray-900">{erPatient.patient.name}</h3>
                            <span className={cn('px-2 py-0.5 rounded text-xs font-medium', triage.bgColor, triage.color)}>
                              {triage.label}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                            <span>{erPatient.visitsId}</span>
                            <span>•</span>
                            <span>{erPatient.patient.age}y, {erPatient.patient.gender}</span>
                            {erPatient.patient.bloodGroup && (
                              <>
                                <span>•</span>
                                <span className="text-red-600 font-medium">{erPatient.patient.bloodGroup}</span>
                              </>
                            )}
                          </div>
                          <p className="text-sm text-gray-700 mt-1">
                            <span className="font-medium">Complaint:</span> {erPatient.chiefComplaint}
                          </p>
                        </div>
                      </div>

                      {/* Status & Time */}
                      <div className="flex flex-wrap items-center gap-4 lg:gap-6">
                        <div className="text-center">
                          <p className="text-xs text-gray-500">Arrival</p>
                          <p className="font-medium">{new Date(erPatient.arrivalTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                          <p className="text-xs text-gray-400 capitalize">{erPatient.arrivalMode.replace('_', ' ')}</p>
                        </div>

                        <div className="text-center">
                          <p className="text-xs text-gray-500">Wait Time</p>
                          <p className={cn(
                            'font-bold',
                            waitMins > 60 ? 'text-red-600' : waitMins > 30 ? 'text-orange-600' : 'text-green-600'
                          )}>
                            {waitMins} min
                          </p>
                        </div>

                        <div className="text-center">
                          <p className="text-xs text-gray-500">Status</p>
                          <span className={cn(
                            'px-2 py-1 rounded text-xs font-medium',
                            erPatient.status === 'treatment' ? 'bg-blue-100 text-blue-700' :
                            erPatient.status === 'waiting' ? 'bg-yellow-100 text-yellow-700' :
                            erPatient.status === 'triage' ? 'bg-purple-100 text-purple-700' :
                            'bg-gray-100 text-gray-700'
                          )}>
                            {erPatient.status.charAt(0).toUpperCase() + erPatient.status.slice(1)}
                          </span>
                        </div>

                        {erPatient.assignedDoctor && (
                          <div className="text-center">
                            <p className="text-xs text-gray-500">Doctor</p>
                            <p className="font-medium text-sm">{erPatient.assignedDoctor}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Vitals Strip */}
                    {erPatient.vitals && (
                      <div className="mt-3 p-2 bg-gray-50 rounded-lg flex flex-wrap gap-4 text-sm">
                        <div className="flex items-center gap-1">
                          <Thermometer size={14} className="text-orange-500" />
                          <span>{erPatient.vitals.temperature}°C</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Heart size={14} className="text-red-500" />
                          <span>{erPatient.vitals.bloodPressure}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Activity size={14} className="text-blue-500" />
                          <span>{erPatient.vitals.pulse} bpm</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Droplet size={14} className="text-teal-500" />
                          <span>SpO2: {erPatient.vitals.oxygenSaturation}%</span>
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="mt-3 flex flex-wrap gap-2">
                      <button className="flex items-center gap-1 px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">
                        <Eye size={14} />
                        View
                      </button>
                      {erPatient.status === 'waiting' && (
                        <button className="flex items-center gap-1 px-3 py-1.5 text-sm bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200">
                          <Stethoscope size={14} />
                          Start Triage
                        </button>
                      )}
                      {erPatient.status === 'triage' && (
                        <button className="flex items-center gap-1 px-3 py-1.5 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200">
                          <Activity size={14} />
                          Start Treatment
                        </button>
                      )}
                      <button
                        onClick={() => {
                          setSelectedPatient(erPatient);
                          setShowReferralModal(true);
                        }}
                        className="flex items-center gap-1 px-3 py-1.5 text-sm bg-teal-100 text-teal-700 rounded-lg hover:bg-teal-200"
                      >
                        <Send size={14} />
                        Transfer/Refer
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Ambulances Tab */}
      {activeTab === 'ambulances' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {mockAmbulances.map((ambulance) => {
            const status = ambulanceStatusConfig[ambulance.status];

            return (
              <div key={ambulance.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                      <Siren size={24} className="text-red-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{ambulance.unitNumber}</h3>
                      <p className="text-sm text-gray-500">{ambulance.vehiclePlate}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={cn('w-3 h-3 rounded-full', status.dotColor)} />
                    <span className={cn('text-sm font-medium', status.color)}>{status.label}</span>
                  </div>
                </div>

                {/* Crew */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Driver:</span>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{ambulance.driver.name}</span>
                      <a href={`tel:${ambulance.driver.phone}`} className="text-teal-600">
                        <Phone size={14} />
                      </a>
                    </div>
                  </div>
                  {ambulance.paramedic && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Paramedic:</span>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{ambulance.paramedic.name}</span>
                        <a href={`tel:${ambulance.paramedic.phone}`} className="text-teal-600">
                          <Phone size={14} />
                        </a>
                      </div>
                    </div>
                  )}
                </div>

                {/* Current Mission */}
                {ambulance.currentMission && (
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg mb-4">
                    <p className="text-xs font-medium text-yellow-800 mb-2">ACTIVE MISSION</p>
                    <div className="space-y-1 text-sm">
                      <p><span className="text-gray-500">Patient:</span> {ambulance.currentMission.patientName}</p>
                      <p><span className="text-gray-500">From:</span> {ambulance.currentMission.pickupLocation}</p>
                      <p><span className="text-gray-500">To:</span> {ambulance.currentMission.destination}</p>
                      {ambulance.currentMission.eta && (
                        <p className="text-orange-600 font-medium">ETA: {ambulance.currentMission.eta}</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Location */}
                {ambulance.currentLocation && (
                  <div className="flex items-start gap-2 text-sm text-gray-600">
                    <MapPin size={16} className="text-gray-400 mt-0.5" />
                    <span>{ambulance.currentLocation.address}</span>
                  </div>
                )}

                {/* Actions */}
                <div className="mt-4 flex gap-2">
                  {ambulance.status === 'available' && (
                    <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
                      <Radio size={16} />
                      Dispatch
                    </button>
                  )}
                  <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                    <Navigation size={16} />
                    Track
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                    <Phone size={16} />
                    Call
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Network Tab */}
      {activeTab === 'network' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <p className="text-sm text-gray-600 mb-3">Real-time bed availability across partner hospitals</p>
            <div className="flex flex-wrap gap-3">
              {Object.entries(capacityConfig).map(([key, config]) => (
                <div key={key} className="flex items-center gap-2">
                  <span className={cn('w-3 h-3 rounded-full', config.bgColor)} />
                  <span className="text-sm text-gray-600">{config.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {mockNetworkHospitals.map((hospital) => {
              const capacity = capacityConfig[hospital.capacity];

              return (
                <div key={hospital.id} className={cn(
                  'bg-white rounded-xl border-l-4 shadow-sm p-5',
                  hospital.capacity === 'available' ? 'border-green-500' :
                  hospital.capacity === 'limited' ? 'border-yellow-500' :
                  hospital.capacity === 'full' ? 'border-red-500' : 'border-gray-500'
                )}>
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-900">{hospital.name}</h3>
                        <span className={cn('px-2 py-0.5 rounded text-xs font-medium', capacity.bgColor, capacity.color)}>
                          {capacity.label}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500">{hospital.type.charAt(0).toUpperCase() + hospital.type.slice(1)} Hospital</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-900">{hospital.distance} km</p>
                      <p className="text-xs text-gray-500">Distance</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                    <MapPin size={14} />
                    <span>{hospital.address}</span>
                  </div>

                  {/* Bed Availability */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-500">ER Beds</p>
                      <p className="text-lg font-bold">
                        <span className={hospital.erBeds.available === 0 ? 'text-red-600' : 'text-green-600'}>
                          {hospital.erBeds.available}
                        </span>
                        <span className="text-gray-400 text-sm">/{hospital.erBeds.total}</span>
                      </p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-500">ICU Beds</p>
                      <p className="text-lg font-bold">
                        <span className={hospital.icuBeds.available === 0 ? 'text-red-600' : 'text-green-600'}>
                          {hospital.icuBeds.available}
                        </span>
                        <span className="text-gray-400 text-sm">/{hospital.icuBeds.total}</span>
                      </p>
                    </div>
                  </div>

                  {/* Equipment */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {hospital.equipment.ventilators && <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">Ventilator</span>}
                    {hospital.equipment.ctScan && <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs">CT Scan</span>}
                    {hospital.equipment.mri && <span className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded text-xs">MRI</span>}
                    {hospital.equipment.cathLab && <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs">Cath Lab</span>}
                    {hospital.equipment.dialysis && <span className="px-2 py-1 bg-teal-100 text-teal-700 rounded text-xs">Dialysis</span>}
                  </div>

                  {/* Specialties */}
                  <div className="text-sm text-gray-600 mb-4">
                    <span className="font-medium">Specialties: </span>
                    {hospital.specialties.join(', ')}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <a
                      href={`tel:${hospital.phone}`}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      <Phone size={16} />
                      Call
                    </a>
                    {hospital.capacity !== 'full' && (
                      <button
                        onClick={() => setSelectedHospital(hospital)}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
                      >
                        <Send size={16} />
                        Request Bed
                      </button>
                    )}
                  </div>

                  <p className="text-xs text-gray-400 mt-3">
                    Last updated: {new Date(hospital.lastUpdate).toLocaleTimeString()}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Referral Modal */}
      {showReferralModal && selectedPatient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Transfer / Refer Patient</h2>
                <p className="text-sm text-gray-500">{selectedPatient.patient.name} - {selectedPatient.chiefComplaint}</p>
              </div>
              <button onClick={() => setShowReferralModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X size={20} />
              </button>
            </div>

            <div className="p-6">
              <p className="text-sm text-gray-600 mb-4">Select a hospital with available capacity:</p>
              
              <div className="space-y-3">
                {mockNetworkHospitals.filter(h => h.capacity !== 'full').map((hospital) => (
                  <div
                    key={hospital.id}
                    onClick={() => setSelectedHospital(hospital)}
                    className={cn(
                      'p-4 border-2 rounded-lg cursor-pointer transition',
                      selectedHospital?.id === hospital.id ? 'border-teal-500 bg-teal-50' : 'border-gray-200 hover:border-gray-300'
                    )}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium text-gray-900">{hospital.name}</h4>
                        <p className="text-sm text-gray-500">{hospital.address}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-teal-600">{hospital.distance} km</p>
                        <p className="text-xs text-gray-500">ER: {hospital.erBeds.available} beds</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
              <button
                onClick={() => setShowReferralModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  addToast('success', 'Referral Sent', `Patient referred to ${selectedHospital?.name}`);
                  setShowReferralModal(false);
                  setSelectedPatient(null);
                  setSelectedHospital(null);
                }}
                disabled={!selectedHospital}
                className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50"
              >
                Send Referral
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmergencyPage;
