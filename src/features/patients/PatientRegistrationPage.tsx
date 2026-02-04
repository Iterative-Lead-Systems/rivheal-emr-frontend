import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthStore } from '@/stores/auth.store';
import { useUIStore } from '@/stores/ui.store';
import { cn, generateRivHealId, calculateAge } from '@/utils';
import {
  Search,
  ArrowLeft,
  User,
  Phone,
  Mail,
  MapPin,
  Heart,
  AlertTriangle,
  UserPlus,
  Check,
  X,
  Loader2,
  Link as LinkIcon,
} from 'lucide-react';
import type { Patient, Gender, BloodGroup, MaritalStatus } from '@/types';

// Mock search results for demonstration
const mockSearchResults: Patient[] = [
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
];

// Validation schema
const patientSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  middleName: z.string().optional(),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
  gender: z.enum(['male', 'female', 'other'], { required_error: 'Gender is required' }),
  bloodGroup: z.enum(['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-']).optional(),
  maritalStatus: z.enum(['single', 'married', 'divorced', 'widowed']).optional(),
  phone: z.string().min(10, 'Please enter a valid phone number'),
  email: z.string().email('Please enter a valid email').optional().or(z.literal('')),
  nationalId: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  occupation: z.string().optional(),
  allergies: z.string().optional(),
  chronicConditions: z.string().optional(),
  emergencyContactName: z.string().min(2, 'Emergency contact name is required'),
  emergencyContactRelationship: z.string().min(2, 'Relationship is required'),
  emergencyContactPhone: z.string().min(10, 'Please enter a valid phone number'),
});

type PatientFormData = z.infer<typeof patientSchema>;

export const PatientRegistrationPage: React.FC = () => {
  const navigate = useNavigate();
  const hospital = useAuthStore((state) => state.hospital);
  const currentBranch = useAuthStore((state) => state.currentBranch);
  const addToast = useUIStore((state) => state.addToast);

  // State
  const [step, setStep] = useState<'search' | 'register'>('search');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Patient[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<PatientFormData>({
    resolver: zodResolver(patientSchema),
    defaultValues: {
      gender: undefined,
    },
  });

  // Search handler
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setHasSearched(false);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Mock search - in production this would search the global patient database
    const results = mockSearchResults.filter(
      (p) =>
        p.rivhealId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.phone.includes(searchQuery) ||
        (p.nationalId && p.nationalId.includes(searchQuery)) ||
        `${p.firstName} ${p.lastName}`.toLowerCase().includes(searchQuery.toLowerCase())
    );

    setSearchResults(results);
    setIsSearching(false);
    setHasSearched(true);
  };

  // Attach existing patient to hospital
  const handleAttachPatient = async (patient: Patient) => {
    setIsSubmitting(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    addToast('success', 'Patient Attached', `${patient.firstName} ${patient.lastName} has been attached to your hospital.`);
    navigate(`/patients/${patient.id}`);
  };

  // Register new patient
  const onSubmit = async (data: PatientFormData) => {
    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const newPatient = {
        ...data,
        rivhealId: generateRivHealId(),
        allergies: data.allergies ? data.allergies.split(',').map((a) => a.trim()) : [],
        chronicConditions: data.chronicConditions
          ? data.chronicConditions.split(',').map((c) => c.trim())
          : [],
      };

      addToast('success', 'Patient Registered', `${newPatient.firstName} ${newPatient.lastName} has been registered with ID ${newPatient.rivhealId}`);
      navigate('/patients');
    } catch (error) {
      addToast('error', 'Registration Failed', 'An error occurred while registering the patient.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => (step === 'register' ? setStep('search') : navigate('/patients'))}
          className="p-2 hover:bg-gray-100 rounded-lg transition"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {step === 'search' ? 'Find or Register Patient' : 'Register New Patient'}
          </h1>
          <p className="text-gray-500">
            {step === 'search'
              ? 'Search for existing patient or register a new one'
              : `Registering at ${currentBranch?.name || hospital?.name}`}
          </p>
        </div>
      </div>

      {/* Step 1: Search */}
      {step === 'search' && (
        <div className="space-y-6">
          {/* Search Card */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search size={32} className="text-teal-600" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">Search Existing Patients</h2>
              <p className="text-gray-500 text-sm mt-1">
                Search by RivHeal ID, NIN, phone number, or name
              </p>
            </div>

            <div className="flex gap-3">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Enter RivHeal ID, NIN, phone, or name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
              <button
                onClick={handleSearch}
                disabled={!searchQuery.trim() || isSearching}
                className="px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSearching ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Searching...
                  </>
                ) : (
                  <>
                    <Search size={18} />
                    Search
                  </>
                )}
              </button>
            </div>

            {/* Search Results */}
            {hasSearched && (
              <div className="mt-6">
                {searchResults.length > 0 ? (
                  <div className="space-y-3">
                    <p className="text-sm text-gray-500">
                      Found {searchResults.length} patient(s) matching your search:
                    </p>
                    {searchResults.map((patient) => (
                      <div
                        key={patient.id}
                        className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-teal-300 hover:bg-teal-50 transition"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-teal-600 rounded-full flex items-center justify-center text-white font-medium">
                            {patient.firstName[0]}
                            {patient.lastName[0]}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {patient.firstName} {patient.lastName}
                            </p>
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                              <span className="font-mono text-teal-600">{patient.rivhealId}</span>
                              <span>{calculateAge(patient.dateOfBirth)} years, {patient.gender}</span>
                              <span>{patient.phone}</span>
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => handleAttachPatient(patient)}
                          disabled={isSubmitting}
                          className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition disabled:opacity-50"
                        >
                          <LinkIcon size={16} />
                          Attach to Hospital
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 bg-gray-50 rounded-lg">
                    <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-3">
                      <User size={24} className="text-gray-400" />
                    </div>
                    <p className="text-gray-600 font-medium">No existing patient found</p>
                    <p className="text-gray-500 text-sm mt-1">
                      Would you like to register a new patient?
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Register New Button */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <UserPlus size={24} className="text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Register New Patient</h3>
                  <p className="text-sm text-gray-500">
                    Patient not in system? Create a new record
                  </p>
                </div>
              </div>
              <button
                onClick={() => setStep('register')}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
              >
                Register New
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Registration Form */}
      {step === 'register' && (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Personal Information */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
            <div className="px-6 py-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <User size={20} className="text-teal-600" />
                <h2 className="font-semibold text-gray-900">Personal Information</h2>
              </div>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  First Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  {...register('firstName')}
                  className={cn('input', errors.firstName && 'input-error')}
                  placeholder="Enter first name"
                />
                {errors.firstName && (
                  <p className="text-sm text-red-500 mt-1">{errors.firstName.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Middle Name
                </label>
                <input
                  type="text"
                  {...register('middleName')}
                  className="input"
                  placeholder="Enter middle name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  {...register('lastName')}
                  className={cn('input', errors.lastName && 'input-error')}
                  placeholder="Enter last name"
                />
                {errors.lastName && (
                  <p className="text-sm text-red-500 mt-1">{errors.lastName.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date of Birth <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  {...register('dateOfBirth')}
                  className={cn('input', errors.dateOfBirth && 'input-error')}
                />
                {errors.dateOfBirth && (
                  <p className="text-sm text-red-500 mt-1">{errors.dateOfBirth.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Gender <span className="text-red-500">*</span>
                </label>
                <select
                  {...register('gender')}
                  className={cn('input', errors.gender && 'input-error')}
                >
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
                {errors.gender && (
                  <p className="text-sm text-red-500 mt-1">{errors.gender.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Marital Status
                </label>
                <select {...register('maritalStatus')} className="input">
                  <option value="">Select status</option>
                  <option value="single">Single</option>
                  <option value="married">Married</option>
                  <option value="divorced">Divorced</option>
                  <option value="widowed">Widowed</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Blood Group
                </label>
                <select {...register('bloodGroup')} className="input">
                  <option value="">Select blood group</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  NIN (National ID)
                </label>
                <input
                  type="text"
                  {...register('nationalId')}
                  className="input"
                  placeholder="Enter NIN"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Occupation
                </label>
                <input
                  type="text"
                  {...register('occupation')}
                  className="input"
                  placeholder="Enter occupation"
                />
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
            <div className="px-6 py-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <Phone size={20} className="text-teal-600" />
                <h2 className="font-semibold text-gray-900">Contact Information</h2>
              </div>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  {...register('phone')}
                  className={cn('input', errors.phone && 'input-error')}
                  placeholder="+234 800 000 0000"
                />
                {errors.phone && (
                  <p className="text-sm text-red-500 mt-1">{errors.phone.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  {...register('email')}
                  className={cn('input', errors.email && 'input-error')}
                  placeholder="email@example.com"
                />
                {errors.email && (
                  <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address
                </label>
                <input
                  type="text"
                  {...register('address')}
                  className="input"
                  placeholder="Street address"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  City
                </label>
                <input
                  type="text"
                  {...register('city')}
                  className="input"
                  placeholder="City"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  State
                </label>
                <input
                  type="text"
                  {...register('state')}
                  className="input"
                  placeholder="State"
                />
              </div>
            </div>
          </div>

          {/* Medical Information */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
            <div className="px-6 py-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <Heart size={20} className="text-teal-600" />
                <h2 className="font-semibold text-gray-900">Medical Information</h2>
              </div>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Allergies
                </label>
                <input
                  type="text"
                  {...register('allergies')}
                  className="input"
                  placeholder="Comma-separated (e.g., Penicillin, Aspirin)"
                />
                <p className="text-xs text-gray-500 mt-1">Separate multiple allergies with commas</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Chronic Conditions
                </label>
                <input
                  type="text"
                  {...register('chronicConditions')}
                  className="input"
                  placeholder="Comma-separated (e.g., Diabetes, Hypertension)"
                />
                <p className="text-xs text-gray-500 mt-1">Separate multiple conditions with commas</p>
              </div>
            </div>
          </div>

          {/* Emergency Contact */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
            <div className="px-6 py-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <AlertTriangle size={20} className="text-teal-600" />
                <h2 className="font-semibold text-gray-900">Emergency Contact</h2>
              </div>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contact Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  {...register('emergencyContactName')}
                  className={cn('input', errors.emergencyContactName && 'input-error')}
                  placeholder="Full name"
                />
                {errors.emergencyContactName && (
                  <p className="text-sm text-red-500 mt-1">{errors.emergencyContactName.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Relationship <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  {...register('emergencyContactRelationship')}
                  className={cn('input', errors.emergencyContactRelationship && 'input-error')}
                  placeholder="e.g., Spouse, Parent"
                />
                {errors.emergencyContactRelationship && (
                  <p className="text-sm text-red-500 mt-1">{errors.emergencyContactRelationship.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  {...register('emergencyContactPhone')}
                  className={cn('input', errors.emergencyContactPhone && 'input-error')}
                  placeholder="+234 800 000 0000"
                />
                {errors.emergencyContactPhone && (
                  <p className="text-sm text-red-500 mt-1">{errors.emergencyContactPhone.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-4">
            <button
              type="button"
              onClick={() => setStep('search')}
              className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Registering...
                </>
              ) : (
                <>
                  <Check size={18} />
                  Register Patient
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default PatientRegistrationPage;
