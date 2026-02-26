import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users, Clock, Search, Filter, Play, Pause, CheckCircle, XCircle,
  AlertTriangle, User, Calendar, Stethoscope, FileText, MoreVertical,
  ChevronRight, Timer, Activity, RefreshCw, Bell, Phone,
} from 'lucide-react';

// Types
interface QueuePatient {
  id: string;
  ticketNumber: string;
  patientId: string;
  patientName: string;
  patientPhone: string;
  age: number;
  gender: 'male' | 'female';
  department: string;
  doctor: string;
  visitType: 'new' | 'follow_up' | 'emergency';
  status: 'waiting' | 'in_consultation' | 'completed' | 'no_show' | 'cancelled';
  priority: 'normal' | 'urgent' | 'emergency';
  checkedInAt: string;
  estimatedWaitTime: number;
  actualWaitTime?: number;
  consultationStartedAt?: string;
  chiefComplaint?: string;
  vitals?: {
    bp?: string;
    pulse?: number;
    temp?: number;
    weight?: number;
  };
}

// Mock data
const mockQueue: QueuePatient[] = [
  {
    id: '1',
    ticketNumber: 'Q-001',
    patientId: 'PT-2025-0001',
    patientName: 'Mr. Emmanuel Chukwu',
    patientPhone: '+234 803 111 2222',
    age: 45,
    gender: 'male',
    department: 'General Medicine',
    doctor: 'Dr. Adebayo Ogundimu',
    visitType: 'follow_up',
    status: 'in_consultation',
    priority: 'normal',
    checkedInAt: '2025-02-26T08:30:00',
    estimatedWaitTime: 0,
    consultationStartedAt: '2025-02-26T09:15:00',
    chiefComplaint: 'Diabetes follow-up',
    vitals: { bp: '130/85', pulse: 78, temp: 36.8, weight: 82 },
  },
  {
    id: '2',
    ticketNumber: 'Q-002',
    patientId: 'PT-2025-0045',
    patientName: 'Mrs. Ngozi Obi',
    patientPhone: '+234 805 333 4444',
    age: 38,
    gender: 'female',
    department: 'General Medicine',
    doctor: 'Dr. Adebayo Ogundimu',
    visitType: 'new',
    status: 'waiting',
    priority: 'normal',
    checkedInAt: '2025-02-26T08:45:00',
    estimatedWaitTime: 15,
    chiefComplaint: 'Persistent headache for 3 days',
    vitals: { bp: '120/80', pulse: 72, temp: 37.0, weight: 68 },
  },
  {
    id: '3',
    ticketNumber: 'Q-003',
    patientId: 'PT-2025-0112',
    patientName: 'Chief Adeleke',
    patientPhone: '+234 809 555 6666',
    age: 62,
    gender: 'male',
    department: 'Cardiology',
    doctor: 'Dr. Chioma Nwosu',
    visitType: 'emergency',
    status: 'waiting',
    priority: 'emergency',
    checkedInAt: '2025-02-26T09:00:00',
    estimatedWaitTime: 5,
    chiefComplaint: 'Chest pain and shortness of breath',
    vitals: { bp: '160/100', pulse: 98, temp: 37.2, weight: 95 },
  },
  {
    id: '4',
    ticketNumber: 'Q-004',
    patientId: 'PT-2025-0078',
    patientName: 'Miss Aisha Bello',
    patientPhone: '+234 803 777 8888',
    age: 28,
    gender: 'female',
    department: 'General Medicine',
    doctor: 'Dr. Adebayo Ogundimu',
    visitType: 'new',
    status: 'waiting',
    priority: 'normal',
    checkedInAt: '2025-02-26T09:10:00',
    estimatedWaitTime: 30,
    chiefComplaint: 'Fever and body aches',
    vitals: { bp: '110/70', pulse: 88, temp: 38.5, weight: 55 },
  },
  {
    id: '5',
    ticketNumber: 'Q-005',
    patientId: 'PT-2025-0023',
    patientName: 'Mr. David Okoro',
    patientPhone: '+234 807 999 0000',
    age: 52,
    gender: 'male',
    department: 'General Medicine',
    doctor: 'Dr. Adebayo Ogundimu',
    visitType: 'follow_up',
    status: 'completed',
    priority: 'normal',
    checkedInAt: '2025-02-26T08:00:00',
    estimatedWaitTime: 0,
    actualWaitTime: 45,
    consultationStartedAt: '2025-02-26T08:45:00',
    chiefComplaint: 'Hypertension follow-up',
    vitals: { bp: '140/90', pulse: 76, temp: 36.6, weight: 78 },
  },
];

const departments = [
  'All Departments',
  'General Medicine',
  'Cardiology',
  'Pediatrics',
  'Orthopedics',
  'Gynecology',
  'Dermatology',
];

export const OPDQueuePage: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('All Departments');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedPatient, setSelectedPatient] = useState<QueuePatient | null>(null);

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      waiting: 'bg-yellow-100 text-yellow-800',
      in_consultation: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      no_show: 'bg-gray-100 text-gray-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      normal: 'bg-gray-100 text-gray-600',
      urgent: 'bg-orange-100 text-orange-800',
      emergency: 'bg-red-100 text-red-800',
    };
    return colors[priority] || 'bg-gray-100 text-gray-600';
  };

  const getVisitTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      new: 'bg-teal-100 text-teal-800',
      follow_up: 'bg-purple-100 text-purple-800',
      emergency: 'bg-red-100 text-red-800',
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  const filteredQueue = mockQueue.filter(patient => {
    const matchesSearch = patient.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         patient.ticketNumber.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDepartment = departmentFilter === 'All Departments' || patient.department === departmentFilter;
    const matchesStatus = statusFilter === 'all' || patient.status === statusFilter;
    return matchesSearch && matchesDepartment && matchesStatus;
  });

  const stats = {
    totalWaiting: mockQueue.filter(p => p.status === 'waiting').length,
    inConsultation: mockQueue.filter(p => p.status === 'in_consultation').length,
    completed: mockQueue.filter(p => p.status === 'completed').length,
    avgWaitTime: 25,
  };

  const startConsultation = (patient: QueuePatient) => {
    navigate(`/opd/${patient.id}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">OPD Queue</h1>
          <p className="text-gray-600 mt-1">Manage patient queue and consultations</p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
          <button className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 flex items-center gap-2">
            <Users className="h-4 w-4" />
            Check-in Patient
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-yellow-100 rounded-xl">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.totalWaiting}</p>
              <p className="text-sm text-gray-500">Waiting</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-xl">
              <Stethoscope className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.inConsultation}</p>
              <p className="text-sm text-gray-500">In Consultation</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 rounded-xl">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.completed}</p>
              <p className="text-sm text-gray-500">Completed Today</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-100 rounded-xl">
              <Timer className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.avgWaitTime} min</p>
              <p className="text-sm text-gray-500">Avg Wait Time</p>
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
                placeholder="Search by name or ticket number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500"
            >
              {departments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500"
            >
              <option value="all">All Status</option>
              <option value="waiting">Waiting</option>
              <option value="in_consultation">In Consultation</option>
              <option value="completed">Completed</option>
              <option value="no_show">No Show</option>
            </select>
          </div>
        </div>

        {/* Queue List */}
        <div className="divide-y divide-gray-100">
          {filteredQueue.map((patient, index) => (
            <div
              key={patient.id}
              className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                patient.priority === 'emergency' ? 'bg-red-50 hover:bg-red-100' : ''
              }`}
              onClick={() => setSelectedPatient(patient)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {/* Queue Number */}
                  <div className={`w-14 h-14 rounded-xl flex flex-col items-center justify-center ${
                    patient.status === 'in_consultation' ? 'bg-blue-600 text-white' :
                    patient.priority === 'emergency' ? 'bg-red-600 text-white' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    <span className="text-xs">Queue</span>
                    <span className="text-lg font-bold">{patient.ticketNumber.split('-')[1]}</span>
                  </div>

                  {/* Patient Info */}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-900">{patient.patientName}</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs ${getVisitTypeColor(patient.visitType)}`}>
                        {patient.visitType.replace('_', ' ')}
                      </span>
                      {patient.priority !== 'normal' && (
                        <span className={`px-2 py-0.5 rounded-full text-xs ${getPriorityColor(patient.priority)}`}>
                          {patient.priority.toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                      <span>{patient.patientId}</span>
                      <span>{patient.age}y, {patient.gender === 'male' ? 'M' : 'F'}</span>
                      <span className="flex items-center gap-1">
                        <Stethoscope className="h-3.5 w-3.5" />
                        {patient.doctor}
                      </span>
                    </div>
                    {patient.chiefComplaint && (
                      <p className="text-sm text-gray-600 mt-1">
                        <span className="text-gray-400">Complaint:</span> {patient.chiefComplaint}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  {/* Vitals Summary */}
                  {patient.vitals && (
                    <div className="flex gap-3 text-sm">
                      {patient.vitals.bp && (
                        <div className="px-2 py-1 bg-gray-100 rounded">
                          <span className="text-gray-500">BP:</span> {patient.vitals.bp}
                        </div>
                      )}
                      {patient.vitals.temp && (
                        <div className={`px-2 py-1 rounded ${patient.vitals.temp > 37.5 ? 'bg-red-100 text-red-700' : 'bg-gray-100'}`}>
                          <span className="text-gray-500">Temp:</span> {patient.vitals.temp}°C
                        </div>
                      )}
                    </div>
                  )}

                  {/* Wait Time */}
                  <div className="text-right">
                    <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(patient.status)}`}>
                      {patient.status.replace('_', ' ')}
                    </span>
                    {patient.status === 'waiting' && (
                      <p className="text-sm text-gray-500 mt-1">
                        <Clock className="h-3.5 w-3.5 inline mr-1" />
                        ~{patient.estimatedWaitTime} min wait
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    {patient.status === 'waiting' && (
                      <button
                        onClick={(e) => { e.stopPropagation(); startConsultation(patient); }}
                        className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 flex items-center gap-2"
                      >
                        <Play className="h-4 w-4" />
                        Start
                      </button>
                    )}
                    {patient.status === 'in_consultation' && (
                      <button
                        onClick={(e) => { e.stopPropagation(); startConsultation(patient); }}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                      >
                        <FileText className="h-4 w-4" />
                        Continue
                      </button>
                    )}
                    <button
                      onClick={(e) => e.stopPropagation()}
                      className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50"
                    >
                      <MoreVertical className="h-4 w-4 text-gray-400" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredQueue.length === 0 && (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">No patients in queue</h3>
            <p className="text-gray-500 mt-1">Check-in patients to start consultations</p>
          </div>
        )}
      </div>

      {/* Patient Detail Slide-over */}
      {selectedPatient && (
        <div className="fixed inset-0 bg-black/50 flex justify-end z-50" onClick={() => setSelectedPatient(null)}>
          <div className="bg-white w-full max-w-lg h-full overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-gray-100 sticky top-0 bg-white">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">Patient Details</h2>
                <button onClick={() => setSelectedPatient(null)} className="p-2 hover:bg-gray-100 rounded-lg">
                  <XCircle className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Patient Header */}
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center">
                  <User className="h-8 w-8 text-teal-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">{selectedPatient.patientName}</h3>
                  <p className="text-gray-500">{selectedPatient.patientId}</p>
                  <div className="flex gap-2 mt-1">
                    <span className={`px-2 py-0.5 rounded-full text-xs ${getStatusColor(selectedPatient.status)}`}>
                      {selectedPatient.status.replace('_', ' ')}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-xs ${getVisitTypeColor(selectedPatient.visitType)}`}>
                      {selectedPatient.visitType.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Contact */}
              <div className="flex gap-3">
                <button className="flex-1 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 flex items-center justify-center gap-2">
                  <Phone className="h-4 w-4" />
                  Call
                </button>
                <button className="flex-1 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 flex items-center justify-center gap-2">
                  <Bell className="h-4 w-4" />
                  Notify
                </button>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Age / Gender</p>
                  <p className="font-medium">{selectedPatient.age} years, {selectedPatient.gender}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="font-medium">{selectedPatient.patientPhone}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Department</p>
                  <p className="font-medium">{selectedPatient.department}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Doctor</p>
                  <p className="font-medium">{selectedPatient.doctor}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-gray-500">Chief Complaint</p>
                  <p className="font-medium">{selectedPatient.chiefComplaint || 'Not recorded'}</p>
                </div>
              </div>

              {/* Vitals */}
              {selectedPatient.vitals && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Vital Signs</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-500">Blood Pressure</p>
                      <p className="text-lg font-semibold">{selectedPatient.vitals.bp || '-'}</p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-500">Pulse</p>
                      <p className="text-lg font-semibold">{selectedPatient.vitals.pulse || '-'} bpm</p>
                    </div>
                    <div className={`p-3 rounded-lg ${selectedPatient.vitals.temp && selectedPatient.vitals.temp > 37.5 ? 'bg-red-50' : 'bg-gray-50'}`}>
                      <p className="text-xs text-gray-500">Temperature</p>
                      <p className="text-lg font-semibold">{selectedPatient.vitals.temp || '-'}°C</p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-500">Weight</p>
                      <p className="text-lg font-semibold">{selectedPatient.vitals.weight || '-'} kg</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="pt-4 border-t border-gray-100 space-y-3">
                {selectedPatient.status === 'waiting' && (
                  <button
                    onClick={() => startConsultation(selectedPatient)}
                    className="w-full px-4 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 flex items-center justify-center gap-2"
                  >
                    <Play className="h-4 w-4" />
                    Start Consultation
                  </button>
                )}
                {selectedPatient.status === 'in_consultation' && (
                  <button
                    onClick={() => startConsultation(selectedPatient)}
                    className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
                  >
                    <FileText className="h-4 w-4" />
                    Continue Consultation
                  </button>
                )}
                <button className="w-full px-4 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 flex items-center justify-center gap-2">
                  <FileText className="h-4 w-4" />
                  View Medical History
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OPDQueuePage;
