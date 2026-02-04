import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/auth.store';
import { formatDate, calculateAge, cn } from '@/utils';
import {
  Search,
  Plus,
  Filter,
  Download,
  MoreVertical,
  Eye,
  Edit,
  Calendar,
  Phone,
  Mail,
  User,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  X,
} from 'lucide-react';
import type { Patient, Gender, BloodGroup } from '@/types';

// Mock patient data
const mockPatients: Patient[] = [
  {
    id: '1',
    rivhealId: 'RH-001234',
    nationalId: '12345678901',
    firstName: 'Chioma',
    lastName: 'Okonkwo',
    dateOfBirth: '1992-05-15',
    gender: 'female',
    bloodGroup: 'O+',
    phone: '+234 801 234 5678',
    email: 'chioma.okonkwo@email.com',
    address: '123 Lekki Phase 1',
    city: 'Lagos',
    state: 'Lagos',
    country: 'Nigeria',
    allergies: ['Penicillin'],
    chronicConditions: ['Asthma'],
    emergencyContact: { name: 'Emeka Okonkwo', relationship: 'Husband', phone: '+234 802 345 6789' },
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
  },
  {
    id: '2',
    rivhealId: 'RH-001235',
    firstName: 'Emeka',
    lastName: 'Nnamdi',
    dateOfBirth: '1979-08-22',
    gender: 'male',
    bloodGroup: 'A+',
    phone: '+234 803 456 7890',
    address: '45 Victoria Island',
    city: 'Lagos',
    state: 'Lagos',
    country: 'Nigeria',
    allergies: [],
    chronicConditions: ['Hypertension', 'Diabetes Type 2'],
    emergencyContact: { name: 'Ada Nnamdi', relationship: 'Wife', phone: '+234 804 567 8901' },
    createdAt: '2024-01-10T10:00:00Z',
    updatedAt: '2024-01-10T10:00:00Z',
  },
  {
    id: '3',
    rivhealId: 'RH-001236',
    nationalId: '98765432101',
    firstName: 'Fatima',
    lastName: 'Ibrahim',
    dateOfBirth: '1966-03-10',
    gender: 'female',
    bloodGroup: 'B+',
    phone: '+234 805 678 9012',
    email: 'fatima.ibrahim@email.com',
    address: '78 Ikoyi',
    city: 'Lagos',
    state: 'Lagos',
    country: 'Nigeria',
    allergies: ['Aspirin', 'Sulfa drugs'],
    chronicConditions: ['Diabetes Type 2', 'Hypertension'],
    emergencyContact: { name: 'Ahmed Ibrahim', relationship: 'Son', phone: '+234 806 789 0123' },
    createdAt: '2024-01-05T10:00:00Z',
    updatedAt: '2024-01-05T10:00:00Z',
  },
  {
    id: '4',
    rivhealId: 'RH-001237',
    firstName: 'Oluwaseun',
    lastName: 'Adeleke',
    dateOfBirth: '1996-11-28',
    gender: 'male',
    bloodGroup: 'O-',
    phone: '+234 807 890 1234',
    address: '22 Surulere',
    city: 'Lagos',
    state: 'Lagos',
    country: 'Nigeria',
    allergies: [],
    chronicConditions: [],
    emergencyContact: { name: 'Bola Adeleke', relationship: 'Mother', phone: '+234 808 901 2345' },
    createdAt: '2024-01-20T10:00:00Z',
    updatedAt: '2024-01-20T10:00:00Z',
  },
  {
    id: '5',
    rivhealId: 'RH-001238',
    firstName: 'Ngozi',
    lastName: 'Eze',
    dateOfBirth: '1988-07-04',
    gender: 'female',
    bloodGroup: 'AB+',
    phone: '+234 809 012 3456',
    email: 'ngozi.eze@email.com',
    address: '56 Ikeja GRA',
    city: 'Lagos',
    state: 'Lagos',
    country: 'Nigeria',
    allergies: ['Latex'],
    chronicConditions: ['Migraine'],
    emergencyContact: { name: 'Chidi Eze', relationship: 'Brother', phone: '+234 810 123 4567' },
    createdAt: '2024-01-18T10:00:00Z',
    updatedAt: '2024-01-18T10:00:00Z',
  },
];

const genderOptions: { value: Gender | ''; label: string }[] = [
  { value: '', label: 'All Genders' },
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
];

const bloodGroupOptions: { value: BloodGroup | ''; label: string }[] = [
  { value: '', label: 'All Blood Groups' },
  { value: 'A+', label: 'A+' },
  { value: 'A-', label: 'A-' },
  { value: 'B+', label: 'B+' },
  { value: 'B-', label: 'B-' },
  { value: 'O+', label: 'O+' },
  { value: 'O-', label: 'O-' },
  { value: 'AB+', label: 'AB+' },
  { value: 'AB-', label: 'AB-' },
];

export const PatientListPage: React.FC = () => {
  const navigate = useNavigate();
  const hospital = useAuthStore((state) => state.hospital);
  const canCreate = useAuthStore((state) => state.canCreate);

  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [genderFilter, setGenderFilter] = useState<Gender | ''>('');
  const [bloodGroupFilter, setBloodGroupFilter] = useState<BloodGroup | ''>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPatients, setSelectedPatients] = useState<string[]>([]);
  const itemsPerPage = 10;

  // Filter patients
  const filteredPatients = useMemo(() => {
    return mockPatients.filter((patient) => {
      // Search filter
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch =
        !searchQuery ||
        patient.firstName.toLowerCase().includes(searchLower) ||
        patient.lastName.toLowerCase().includes(searchLower) ||
        patient.rivhealId.toLowerCase().includes(searchLower) ||
        patient.phone.includes(searchQuery) ||
        (patient.email && patient.email.toLowerCase().includes(searchLower)) ||
        (patient.nationalId && patient.nationalId.includes(searchQuery));

      // Gender filter
      const matchesGender = !genderFilter || patient.gender === genderFilter;

      // Blood group filter
      const matchesBloodGroup = !bloodGroupFilter || patient.bloodGroup === bloodGroupFilter;

      return matchesSearch && matchesGender && matchesBloodGroup;
    });
  }, [searchQuery, genderFilter, bloodGroupFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredPatients.length / itemsPerPage);
  const paginatedPatients = filteredPatients.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Selection handlers
  const toggleSelectAll = () => {
    if (selectedPatients.length === paginatedPatients.length) {
      setSelectedPatients([]);
    } else {
      setSelectedPatients(paginatedPatients.map((p) => p.id));
    }
  };

  const toggleSelectPatient = (id: string) => {
    setSelectedPatients((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery('');
    setGenderFilter('');
    setBloodGroupFilter('');
    setCurrentPage(1);
  };

  const hasActiveFilters = searchQuery || genderFilter || bloodGroupFilter;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Patients</h1>
          <p className="text-gray-500">
            Manage patient records for {hospital?.name}
          </p>
        </div>
        {canCreate('patients') && (
          <Link
            to="/patients/new"
            className="inline-flex items-center justify-center gap-2 bg-teal-600 text-white px-4 py-2.5 rounded-lg hover:bg-teal-700 transition shadow-lg"
          >
            <Plus size={20} />
            New Patient
          </Link>
        )}
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search Input */}
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search by name, RivHeal ID, phone, email, or NIN..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>

          {/* Filter Toggle & Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={cn(
                'flex items-center gap-2 px-4 py-2.5 border rounded-lg transition',
                showFilters
                  ? 'bg-teal-50 border-teal-300 text-teal-700'
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              )}
            >
              <SlidersHorizontal size={18} />
              Filters
              {hasActiveFilters && (
                <span className="w-2 h-2 bg-teal-500 rounded-full" />
              )}
            </button>

            <button className="flex items-center gap-2 px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition">
              <Download size={18} />
              Export
            </button>
          </div>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Gender
              </label>
              <select
                value={genderFilter}
                onChange={(e) => {
                  setGenderFilter(e.target.value as Gender | '');
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
              >
                {genderOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Blood Group
              </label>
              <select
                value={bloodGroupFilter}
                onChange={(e) => {
                  setBloodGroupFilter(e.target.value as BloodGroup | '');
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
              >
                {bloodGroupOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2 lg:col-span-2 flex items-end">
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:text-gray-900 transition"
                >
                  <X size={16} />
                  Clear all filters
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Results Summary */}
      <div className="flex items-center justify-between text-sm text-gray-500">
        <p>
          Showing {paginatedPatients.length} of {filteredPatients.length} patients
          {hasActiveFilters && ' (filtered)'}
        </p>
        {selectedPatients.length > 0 && (
          <p className="text-teal-600 font-medium">
            {selectedPatients.length} selected
          </p>
        )}
      </div>

      {/* Patient Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-4 py-3 w-12">
                  <input
                    type="checkbox"
                    checked={
                      paginatedPatients.length > 0 &&
                      selectedPatients.length === paginatedPatients.length
                    }
                    onChange={toggleSelectAll}
                    className="w-4 h-4 text-teal-600 rounded focus:ring-teal-500"
                  />
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">
                  Patient ID
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">
                  Name
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">
                  Age / Gender
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">
                  Contact
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">
                  Blood Group
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">
                  Conditions
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginatedPatients.map((patient) => (
                <tr
                  key={patient.id}
                  className={cn(
                    'hover:bg-gray-50 transition cursor-pointer',
                    selectedPatients.includes(patient.id) && 'bg-teal-50'
                  )}
                  onClick={() => navigate(`/patients/${patient.id}`)}
                >
                  <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={selectedPatients.includes(patient.id)}
                      onChange={() => toggleSelectPatient(patient.id)}
                      className="w-4 h-4 text-teal-600 rounded focus:ring-teal-500"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-mono text-sm text-teal-600 bg-teal-50 px-2 py-1 rounded">
                      {patient.rivhealId}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-teal-600 rounded-full flex items-center justify-center text-white font-medium">
                        {patient.firstName[0]}
                        {patient.lastName[0]}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {patient.firstName} {patient.lastName}
                        </p>
                        {patient.nationalId && (
                          <p className="text-xs text-gray-500">
                            NIN: {patient.nationalId}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-gray-900">
                      {calculateAge(patient.dateOfBirth)} years
                    </p>
                    <p className="text-sm text-gray-500 capitalize">
                      {patient.gender}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 text-gray-600">
                      <Phone size={14} />
                      <span className="text-sm">{patient.phone}</span>
                    </div>
                    {patient.email && (
                      <div className="flex items-center gap-1 text-gray-500 mt-1">
                        <Mail size={14} />
                        <span className="text-xs truncate max-w-[150px]">
                          {patient.email}
                        </span>
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {patient.bloodGroup ? (
                      <span className="px-2 py-1 bg-red-50 text-red-700 rounded-full text-sm font-medium">
                        {patient.bloodGroup}
                      </span>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {patient.chronicConditions.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {patient.chronicConditions.slice(0, 2).map((condition, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 bg-orange-50 text-orange-700 rounded text-xs"
                          >
                            {condition}
                          </span>
                        ))}
                        {patient.chronicConditions.length > 2 && (
                          <span className="text-xs text-gray-500">
                            +{patient.chronicConditions.length - 2}
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-gray-400 text-sm">None</span>
                    )}
                  </td>
                  <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center gap-1">
                      <Link
                        to={`/patients/${patient.id}`}
                        className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
                        title="View Details"
                      >
                        <Eye size={18} />
                      </Link>
                      <Link
                        to={`/patients/${patient.id}/edit`}
                        className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
                        title="Edit"
                      >
                        <Edit size={18} />
                      </Link>
                      <Link
                        to={`/appointments/new?patientId=${patient.id}`}
                        className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
                        title="Book Appointment"
                      >
                        <Calendar size={18} />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {paginatedPatients.length === 0 && (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <User size={32} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">No patients found</h3>
            <p className="text-gray-500 mb-4">
              {hasActiveFilters
                ? 'Try adjusting your search or filters'
                : 'Get started by registering your first patient'}
            </p>
            {hasActiveFilters ? (
              <button
                onClick={clearFilters}
                className="text-teal-600 hover:text-teal-700 font-medium"
              >
                Clear all filters
              </button>
            ) : (
              <Link
                to="/patients/new"
                className="inline-flex items-center gap-2 text-teal-600 hover:text-teal-700 font-medium"
              >
                <Plus size={18} />
                Register New Patient
              </Link>
            )}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Page {currentPage} of {totalPages}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={18} />
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={cn(
                      'w-10 h-10 rounded-lg font-medium transition',
                      currentPage === pageNum
                        ? 'bg-teal-600 text-white'
                        : 'hover:bg-gray-100 text-gray-600'
                    )}
                  >
                    {pageNum}
                  </button>
                );
              })}
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientListPage;
