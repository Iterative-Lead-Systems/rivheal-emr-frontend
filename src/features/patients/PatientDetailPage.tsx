import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '@/stores/auth.store';
import { formatDate, calculateAge, formatCurrency, cn } from '@/utils';
import {
  ArrowLeft,
  Edit,
  Calendar,
  Phone,
  Mail,
  MapPin,
  Heart,
  AlertTriangle,
  User,
  FileText,
  Pill,
  FlaskConical,
  Receipt,
  Clock,
  Plus,
  MoreVertical,
  Droplet,
  Activity,
} from 'lucide-react';
import type { Patient, Visit } from '@/types';

// Mock patient data
const mockPatient: Patient = {
  id: '1',
  rivhealId: 'RH-001234',
  nationalId: '12345678901',
  firstName: 'Chioma',
  middleName: 'Adaeze',
  lastName: 'Okonkwo',
  dateOfBirth: '1992-05-15',
  gender: 'female',
  bloodGroup: 'O+',
  maritalStatus: 'married',
  phone: '+234 801 234 5678',
  email: 'chioma.okonkwo@email.com',
  address: '123 Lekki Phase 1',
  city: 'Lagos',
  state: 'Lagos',
  country: 'Nigeria',
  occupation: 'Software Engineer',
  allergies: ['Penicillin', 'Aspirin'],
  chronicConditions: ['Asthma'],
  emergencyContact: {
    name: 'Emeka Okonkwo',
    relationship: 'Husband',
    phone: '+234 802 345 6789',
    email: 'emeka.okonkwo@email.com',
  },
  createdAt: '2024-01-15T10:00:00Z',
  updatedAt: '2024-01-15T10:00:00Z',
};

// Mock visit history
const mockVisits = [
  {
    id: '1',
    visitNumber: 'VIS-2024-001',
    visitDate: '2024-01-20',
    visitType: 'follow_up',
    chiefComplaint: 'Routine asthma checkup',
    doctor: 'Dr. Adaeze Obi',
    department: 'General Medicine',
    status: 'completed',
    diagnosis: 'Asthma - controlled',
  },
  {
    id: '2',
    visitNumber: 'VIS-2024-002',
    visitDate: '2024-01-25',
    visitType: 'consultation',
    chiefComplaint: 'Headache and fatigue',
    doctor: 'Dr. Emeka Nnamdi',
    department: 'Internal Medicine',
    status: 'completed',
    diagnosis: 'Tension headache',
  },
];

// Mock prescriptions
const mockPrescriptions = [
  {
    id: '1',
    date: '2024-01-25',
    medications: ['Paracetamol 500mg', 'Vitamin B Complex'],
    prescribedBy: 'Dr. Emeka Nnamdi',
    status: 'dispensed',
  },
  {
    id: '2',
    date: '2024-01-20',
    medications: ['Salbutamol Inhaler', 'Prednisolone 5mg'],
    prescribedBy: 'Dr. Adaeze Obi',
    status: 'dispensed',
  },
];

// Mock lab results
const mockLabResults = [
  {
    id: '1',
    date: '2024-01-25',
    tests: ['Complete Blood Count', 'Lipid Profile'],
    orderedBy: 'Dr. Emeka Nnamdi',
    status: 'completed',
  },
];

type TabKey = 'overview' | 'visits' | 'prescriptions' | 'labs' | 'billing';

export const PatientDetailPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const hospital = useAuthStore((state) => state.hospital);
  const canEdit = useAuthStore((state) => state.canEdit);

  const [activeTab, setActiveTab] = useState<TabKey>('overview');

  const patient = mockPatient; // In production, fetch from API

  const tabs: { key: TabKey; label: string; icon: React.ElementType }[] = [
    { key: 'overview', label: 'Overview', icon: User },
    { key: 'visits', label: 'Visit History', icon: FileText },
    { key: 'prescriptions', label: 'Prescriptions', icon: Pill },
    { key: 'labs', label: 'Lab Results', icon: FlaskConical },
    { key: 'billing', label: 'Billing', icon: Receipt },
  ];

  const statusColors: Record<string, string> = {
    completed: 'bg-green-100 text-green-700',
    pending: 'bg-yellow-100 text-yellow-700',
    dispensed: 'bg-green-100 text-green-700',
    active: 'bg-blue-100 text-blue-700',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/patients')}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-teal-600 rounded-full flex items-center justify-center text-white text-xl font-bold shadow-lg">
              {patient.firstName[0]}
              {patient.lastName[0]}
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-gray-900">
                  {patient.firstName} {patient.middleName} {patient.lastName}
                </h1>
                <span className="font-mono text-sm text-teal-600 bg-teal-50 px-2 py-1 rounded">
                  {patient.rivhealId}
                </span>
              </div>
              <div className="flex items-center gap-4 text-gray-500 mt-1">
                <span>{calculateAge(patient.dateOfBirth)} years old</span>
                <span className="capitalize">{patient.gender}</span>
                {patient.bloodGroup && (
                  <span className="flex items-center gap-1">
                    <Droplet size={14} className="text-red-500" />
                    {patient.bloodGroup}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to={`/appointments/new?patientId=${patient.id}`}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
          >
            <Calendar size={18} />
            Book Appointment
          </Link>
          {canEdit('patients') && (
            <Link
              to={`/patients/${patient.id}/edit`}
              className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition"
            >
              <Edit size={18} />
              Edit
            </Link>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-6">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                'flex items-center gap-2 pb-3 px-1 border-b-2 font-medium text-sm transition',
                activeTab === tab.key
                  ? 'border-teal-600 text-teal-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              )}
            >
              <tab.icon size={18} />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Personal Information */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
              <div className="px-6 py-4 border-b border-gray-100">
                <h2 className="font-semibold text-gray-900">Personal Information</h2>
              </div>
              <div className="p-6 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Full Name</p>
                  <p className="font-medium text-gray-900">
                    {patient.firstName} {patient.middleName} {patient.lastName}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Date of Birth</p>
                  <p className="font-medium text-gray-900">
                    {formatDate(patient.dateOfBirth)} ({calculateAge(patient.dateOfBirth)} years)
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Gender</p>
                  <p className="font-medium text-gray-900 capitalize">{patient.gender}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Marital Status</p>
                  <p className="font-medium text-gray-900 capitalize">{patient.maritalStatus || '—'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">NIN</p>
                  <p className="font-medium text-gray-900">{patient.nationalId || '—'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Occupation</p>
                  <p className="font-medium text-gray-900">{patient.occupation || '—'}</p>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
              <div className="px-6 py-4 border-b border-gray-100">
                <h2 className="font-semibold text-gray-900">Contact Information</h2>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                    <Phone size={18} className="text-gray-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Phone</p>
                    <p className="font-medium text-gray-900">{patient.phone}</p>
                  </div>
                </div>
                {patient.email && (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                      <Mail size={18} className="text-gray-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="font-medium text-gray-900">{patient.email}</p>
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                    <MapPin size={18} className="text-gray-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Address</p>
                    <p className="font-medium text-gray-900">
                      {[patient.address, patient.city, patient.state].filter(Boolean).join(', ') || '—'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Emergency Contact */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
                <AlertTriangle size={18} className="text-orange-500" />
                <h2 className="font-semibold text-gray-900">Emergency Contact</h2>
              </div>
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{patient.emergencyContact.name}</p>
                    <p className="text-sm text-gray-500">{patient.emergencyContact.relationship}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-900">{patient.emergencyContact.phone}</p>
                    {patient.emergencyContact.email && (
                      <p className="text-sm text-gray-500">{patient.emergencyContact.email}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Medical Info */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
              <div className="px-6 py-4 border-b border-gray-100">
                <h2 className="font-semibold text-gray-900">Medical Information</h2>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <p className="text-sm text-gray-500 mb-2">Blood Group</p>
                  {patient.bloodGroup ? (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-50 text-red-700 rounded-full font-medium">
                      <Droplet size={14} />
                      {patient.bloodGroup}
                    </span>
                  ) : (
                    <p className="text-gray-400">Not recorded</p>
                  )}
                </div>

                <div>
                  <p className="text-sm text-gray-500 mb-2">Allergies</p>
                  {patient.allergies.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {patient.allergies.map((allergy, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-red-50 text-red-700 rounded text-sm"
                        >
                          {allergy}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-400">No known allergies</p>
                  )}
                </div>

                <div>
                  <p className="text-sm text-gray-500 mb-2">Chronic Conditions</p>
                  {patient.chronicConditions.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {patient.chronicConditions.map((condition, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-orange-50 text-orange-700 rounded text-sm"
                        >
                          {condition}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-400">None</p>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
              <div className="px-6 py-4 border-b border-gray-100">
                <h2 className="font-semibold text-gray-900">Quick Stats</h2>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Total Visits</span>
                  <span className="font-semibold text-gray-900">{mockVisits.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Prescriptions</span>
                  <span className="font-semibold text-gray-900">{mockPrescriptions.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Lab Tests</span>
                  <span className="font-semibold text-gray-900">{mockLabResults.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Member Since</span>
                  <span className="font-semibold text-gray-900">
                    {formatDate(patient.createdAt)}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
              <div className="px-6 py-4 border-b border-gray-100">
                <h2 className="font-semibold text-gray-900">Quick Actions</h2>
              </div>
              <div className="p-4 space-y-2">
                <Link
                  to={`/opd?patientId=${patient.id}`}
                  className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition"
                >
                  <Activity size={18} className="text-teal-600" />
                  <span className="text-gray-700">Start Consultation</span>
                </Link>
                <Link
                  to={`/laboratory/new?patientId=${patient.id}`}
                  className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition"
                >
                  <FlaskConical size={18} className="text-teal-600" />
                  <span className="text-gray-700">Order Lab Test</span>
                </Link>
                <Link
                  to={`/billing/new?patientId=${patient.id}`}
                  className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition"
                >
                  <Receipt size={18} className="text-teal-600" />
                  <span className="text-gray-700">Generate Bill</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Visit History Tab */}
      {activeTab === 'visits' && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Visit History</h2>
            <Link
              to={`/appointments/new?patientId=${patient.id}`}
              className="flex items-center gap-2 px-3 py-1.5 text-sm bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition"
            >
              <Plus size={16} />
              New Visit
            </Link>
          </div>
          <div className="divide-y divide-gray-100">
            {mockVisits.map((visit) => (
              <div key={visit.id} className="p-4 hover:bg-gray-50 transition">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
                      <FileText size={18} className="text-teal-600" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-gray-900">{visit.chiefComplaint}</p>
                        <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium', statusColors[visit.status])}>
                          {visit.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        {visit.doctor} • {visit.department}
                      </p>
                      <p className="text-sm text-gray-500">
                        Diagnosis: {visit.diagnosis}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">{formatDate(visit.visitDate)}</p>
                    <p className="text-xs text-gray-400 mt-1">{visit.visitNumber}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Prescriptions Tab */}
      {activeTab === 'prescriptions' && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Prescriptions</h2>
          </div>
          <div className="divide-y divide-gray-100">
            {mockPrescriptions.map((rx) => (
              <div key={rx.id} className="p-4 hover:bg-gray-50 transition">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Pill size={18} className="text-purple-600" />
                    </div>
                    <div>
                      <div className="flex flex-wrap gap-2 mb-1">
                        {rx.medications.map((med, idx) => (
                          <span key={idx} className="px-2 py-1 bg-purple-50 text-purple-700 rounded text-sm">
                            {med}
                          </span>
                        ))}
                      </div>
                      <p className="text-sm text-gray-500">Prescribed by {rx.prescribedBy}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium', statusColors[rx.status])}>
                      {rx.status}
                    </span>
                    <p className="text-sm text-gray-500 mt-1">{formatDate(rx.date)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Labs Tab */}
      {activeTab === 'labs' && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Lab Results</h2>
            <Link
              to={`/laboratory/new?patientId=${patient.id}`}
              className="flex items-center gap-2 px-3 py-1.5 text-sm bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition"
            >
              <Plus size={16} />
              New Test
            </Link>
          </div>
          <div className="divide-y divide-gray-100">
            {mockLabResults.map((lab) => (
              <div key={lab.id} className="p-4 hover:bg-gray-50 transition">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <FlaskConical size={18} className="text-blue-600" />
                    </div>
                    <div>
                      <div className="flex flex-wrap gap-2 mb-1">
                        {lab.tests.map((test, idx) => (
                          <span key={idx} className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-sm">
                            {test}
                          </span>
                        ))}
                      </div>
                      <p className="text-sm text-gray-500">Ordered by {lab.orderedBy}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium', statusColors[lab.status])}>
                      {lab.status}
                    </span>
                    <p className="text-sm text-gray-500 mt-1">{formatDate(lab.date)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Billing Tab */}
      {activeTab === 'billing' && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Receipt size={32} className="text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-1">No billing records</h3>
          <p className="text-gray-500 mb-4">Billing history will appear here</p>
          <Link
            to={`/billing/new?patientId=${patient.id}`}
            className="inline-flex items-center gap-2 text-teal-600 hover:text-teal-700 font-medium"
          >
            <Plus size={18} />
            Generate New Bill
          </Link>
        </div>
      )}
    </div>
  );
};

export default PatientDetailPage;
