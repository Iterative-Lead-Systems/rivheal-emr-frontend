import React, { useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthStore } from '@/stores/auth.store';
import { useUIStore } from '@/stores/ui.store';
import { cn, formatDate } from '@/utils';
import {
  ArrowLeft,
  Search,
  User,
  Calendar,
  Clock,
  Stethoscope,
  Check,
  Loader2,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
} from 'lucide-react';
import type { Patient, AppointmentType } from '@/types';

// Mock patients for search
const mockPatients: Patient[] = [
  {
    id: '1',
    rivhealId: 'RH-001234',
    firstName: 'Chioma',
    lastName: 'Okonkwo',
    dateOfBirth: '1992-05-15',
    gender: 'female',
    phone: '+234 801 234 5678',
    allergies: [],
    chronicConditions: [],
    emergencyContact: { name: '', relationship: '', phone: '' },
    createdAt: '',
    updatedAt: '',
  },
  {
    id: '2',
    rivhealId: 'RH-001235',
    firstName: 'Emeka',
    lastName: 'Nnamdi',
    dateOfBirth: '1979-08-22',
    gender: 'male',
    phone: '+234 803 456 7890',
    allergies: [],
    chronicConditions: ['Hypertension'],
    emergencyContact: { name: '', relationship: '', phone: '' },
    createdAt: '',
    updatedAt: '',
  },
];

// Mock doctors
const mockDoctors = [
  { id: 'd1', name: 'Dr. Adaeze Obi', department: 'General Medicine', specialization: 'General Physician' },
  { id: 'd2', name: 'Dr. Emeka Nnamdi', department: 'Cardiology', specialization: 'Cardiologist' },
  { id: 'd3', name: 'Dr. Fatima Hassan', department: 'Pediatrics', specialization: 'Pediatrician' },
  { id: 'd4', name: 'Dr. Chukwudi Okafor', department: 'Orthopedics', specialization: 'Orthopedic Surgeon' },
];

// Mock time slots
const generateTimeSlots = (date: string, doctorId: string) => {
  const slots = [];
  const bookedSlots = ['09:00', '10:30', '14:00']; // Mock booked slots
  
  for (let hour = 8; hour < 17; hour++) {
    for (let min = 0; min < 60; min += 30) {
      if (hour === 12 && min === 0) continue; // Lunch break start
      if (hour === 12 && min === 30) continue; // Lunch break
      if (hour === 13 && min === 0) continue; // Lunch break end
      
      const time = `${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`;
      const isBooked = bookedSlots.includes(time);
      slots.push({ time, available: !isBooked });
    }
  }
  return slots;
};

const appointmentTypes: { value: AppointmentType; label: string; description: string }[] = [
  { value: 'consultation', label: 'Consultation', description: 'General medical consultation' },
  { value: 'follow_up', label: 'Follow-up', description: 'Follow-up on previous visit' },
  { value: 'new_patient', label: 'New Patient', description: 'First time visit' },
  { value: 'telemedicine', label: 'Telemedicine', description: 'Video consultation' },
];

const schema = z.object({
  chiefComplaint: z.string().min(10, 'Please describe the reason for visit (at least 10 characters)'),
  notes: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export const NewAppointmentPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const addToast = useUIStore((state) => state.addToast);
  const currentBranch = useAuthStore((state) => state.currentBranch);

  // Pre-selected patient from URL
  const preselectedPatientId = searchParams.get('patientId');

  // State
  const [step, setStep] = useState<'patient' | 'doctor' | 'datetime' | 'details'>(
    preselectedPatientId ? 'doctor' : 'patient'
  );
  const [patientSearch, setPatientSearch] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(
    preselectedPatientId ? mockPatients.find((p) => p.id === preselectedPatientId) || null : null
  );
  const [selectedDoctor, setSelectedDoctor] = useState<typeof mockDoctors[0] | null>(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [appointmentType, setAppointmentType] = useState<AppointmentType>('consultation');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  // Search patients
  const filteredPatients = useMemo(() => {
    if (!patientSearch) return [];
    return mockPatients.filter(
      (p) =>
        p.firstName.toLowerCase().includes(patientSearch.toLowerCase()) ||
        p.lastName.toLowerCase().includes(patientSearch.toLowerCase()) ||
        p.rivhealId.toLowerCase().includes(patientSearch.toLowerCase()) ||
        p.phone.includes(patientSearch)
    );
  }, [patientSearch]);

  // Time slots
  const timeSlots = useMemo(() => {
    if (!selectedDate || !selectedDoctor) return [];
    return generateTimeSlots(selectedDate, selectedDoctor.id);
  }, [selectedDate, selectedDoctor]);

  // Generate week dates
  const weekDates = useMemo(() => {
    const dates = [];
    const today = new Date();
    for (let i = 0; i < 14; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push({
        date: date.toISOString().split('T')[0],
        day: date.toLocaleDateString('en-US', { weekday: 'short' }),
        dayNum: date.getDate(),
        month: date.toLocaleDateString('en-US', { month: 'short' }),
        isWeekend: date.getDay() === 0 || date.getDay() === 6,
      });
    }
    return dates;
  }, []);

  // Submit
  const onSubmit = async (data: FormData) => {
    if (!selectedPatient || !selectedDoctor || !selectedDate || !selectedTime) return;

    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));

    addToast(
      'success',
      'Appointment Booked',
      `Appointment scheduled for ${selectedPatient.firstName} ${selectedPatient.lastName} on ${formatDate(selectedDate)} at ${selectedTime}`
    );
    navigate('/appointments');
  };

  // Step navigation
  const canProceed = () => {
    switch (step) {
      case 'patient': return !!selectedPatient;
      case 'doctor': return !!selectedDoctor;
      case 'datetime': return !!selectedDate && !!selectedTime;
      case 'details': return true;
      default: return false;
    }
  };

  const nextStep = () => {
    if (step === 'patient') setStep('doctor');
    else if (step === 'doctor') setStep('datetime');
    else if (step === 'datetime') setStep('details');
  };

  const prevStep = () => {
    if (step === 'doctor') setStep('patient');
    else if (step === 'datetime') setStep('doctor');
    else if (step === 'details') setStep('datetime');
  };

  const steps = [
    { key: 'patient', label: 'Patient', icon: User },
    { key: 'doctor', label: 'Doctor', icon: Stethoscope },
    { key: 'datetime', label: 'Date & Time', icon: Calendar },
    { key: 'details', label: 'Details', icon: Check },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/appointments')}
          className="p-2 hover:bg-gray-100 rounded-lg transition"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Book Appointment</h1>
          <p className="text-gray-500">Schedule a new appointment at {currentBranch?.name}</p>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
        <div className="flex items-center justify-between">
          {steps.map((s, index) => (
            <React.Fragment key={s.key}>
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    'w-10 h-10 rounded-full flex items-center justify-center transition',
                    step === s.key
                      ? 'bg-teal-600 text-white'
                      : steps.findIndex((x) => x.key === step) > index
                      ? 'bg-teal-100 text-teal-600'
                      : 'bg-gray-100 text-gray-400'
                  )}
                >
                  <s.icon size={20} />
                </div>
                <span
                  className={cn(
                    'font-medium hidden sm:block',
                    step === s.key ? 'text-gray-900' : 'text-gray-500'
                  )}
                >
                  {s.label}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    'flex-1 h-1 mx-4 rounded',
                    steps.findIndex((x) => x.key === step) > index ? 'bg-teal-500' : 'bg-gray-200'
                  )}
                />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
        {/* Patient Selection */}
        {step === 'patient' && (
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Select Patient</h2>
            
            <div className="relative mb-4">
              <input
                type="text"
                placeholder="Search by name, RivHeal ID, or phone..."
                value={patientSearch}
                onChange={(e) => setPatientSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
              />
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>

            {/* Search Results */}
            {filteredPatients.length > 0 && (
              <div className="space-y-2 mb-4">
                {filteredPatients.map((patient) => (
                  <div
                    key={patient.id}
                    onClick={() => setSelectedPatient(patient)}
                    className={cn(
                      'p-4 border rounded-lg cursor-pointer transition',
                      selectedPatient?.id === patient.id
                        ? 'border-teal-500 bg-teal-50'
                        : 'border-gray-200 hover:border-gray-300'
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-teal-600 rounded-full flex items-center justify-center text-white font-medium">
                          {patient.firstName[0]}{patient.lastName[0]}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {patient.firstName} {patient.lastName}
                          </p>
                          <p className="text-sm text-gray-500">
                            {patient.rivhealId} • {patient.phone}
                          </p>
                        </div>
                      </div>
                      {selectedPatient?.id === patient.id && (
                        <Check size={20} className="text-teal-600" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Selected Patient Display */}
            {selectedPatient && (
              <div className="p-4 bg-teal-50 border border-teal-200 rounded-lg">
                <p className="text-sm text-teal-600 font-medium mb-1">Selected Patient</p>
                <p className="text-gray-900 font-semibold">
                  {selectedPatient.firstName} {selectedPatient.lastName}
                </p>
                <p className="text-sm text-gray-600">{selectedPatient.rivhealId}</p>
              </div>
            )}

            {patientSearch && filteredPatients.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No patients found. <button className="text-teal-600 hover:underline">Register new patient</button>
              </div>
            )}
          </div>
        )}

        {/* Doctor Selection */}
        {step === 'doctor' && (
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Select Doctor</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {mockDoctors.map((doctor) => (
                <div
                  key={doctor.id}
                  onClick={() => setSelectedDoctor(doctor)}
                  className={cn(
                    'p-4 border rounded-lg cursor-pointer transition',
                    selectedDoctor?.id === doctor.id
                      ? 'border-teal-500 bg-teal-50'
                      : 'border-gray-200 hover:border-gray-300'
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-medium">
                        {doctor.name.split(' ').slice(1).map((n) => n[0]).join('')}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{doctor.name}</p>
                        <p className="text-sm text-gray-500">{doctor.specialization}</p>
                        <p className="text-xs text-teal-600">{doctor.department}</p>
                      </div>
                    </div>
                    {selectedDoctor?.id === doctor.id && (
                      <Check size={20} className="text-teal-600" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Date & Time Selection */}
        {step === 'datetime' && (
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Select Date & Time</h2>
            
            {/* Date Selection */}
            <div className="mb-6">
              <p className="text-sm font-medium text-gray-700 mb-3">Select Date</p>
              <div className="flex gap-2 overflow-x-auto pb-2">
                {weekDates.map((d) => (
                  <button
                    key={d.date}
                    onClick={() => {
                      setSelectedDate(d.date);
                      setSelectedTime('');
                    }}
                    disabled={d.isWeekend}
                    className={cn(
                      'flex-shrink-0 w-16 p-3 rounded-lg border text-center transition',
                      selectedDate === d.date
                        ? 'border-teal-500 bg-teal-50 text-teal-700'
                        : d.isWeekend
                        ? 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
                        : 'border-gray-200 hover:border-gray-300'
                    )}
                  >
                    <p className="text-xs text-gray-500">{d.day}</p>
                    <p className="text-lg font-bold">{d.dayNum}</p>
                    <p className="text-xs">{d.month}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Time Selection */}
            {selectedDate && (
              <div>
                <p className="text-sm font-medium text-gray-700 mb-3">Select Time</p>
                <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
                  {timeSlots.map((slot) => (
                    <button
                      key={slot.time}
                      onClick={() => slot.available && setSelectedTime(slot.time)}
                      disabled={!slot.available}
                      className={cn(
                        'p-2 rounded-lg border text-sm font-medium transition',
                        selectedTime === slot.time
                          ? 'border-teal-500 bg-teal-50 text-teal-700'
                          : !slot.available
                          ? 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed line-through'
                          : 'border-gray-200 hover:border-gray-300'
                      )}
                    >
                      {slot.time}
                    </button>
                  ))}
                </div>
                {!timeSlots.some((s) => s.available) && (
                  <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center gap-2 text-yellow-700">
                    <AlertCircle size={18} />
                    <span className="text-sm">No available slots for this date. Please select another date.</span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Details */}
        {step === 'details' && (
          <form onSubmit={handleSubmit(onSubmit)} className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Appointment Details</h2>

            {/* Summary */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Patient</p>
                  <p className="font-medium text-gray-900">
                    {selectedPatient?.firstName} {selectedPatient?.lastName}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Doctor</p>
                  <p className="font-medium text-gray-900">{selectedDoctor?.name}</p>
                </div>
                <div>
                  <p className="text-gray-500">Date</p>
                  <p className="font-medium text-gray-900">{formatDate(selectedDate)}</p>
                </div>
                <div>
                  <p className="text-gray-500">Time</p>
                  <p className="font-medium text-gray-900">{selectedTime}</p>
                </div>
              </div>
            </div>

            {/* Appointment Type */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Appointment Type
              </label>
              <div className="grid grid-cols-2 gap-3">
                {appointmentTypes.map((type) => (
                  <label
                    key={type.value}
                    className={cn(
                      'p-3 border rounded-lg cursor-pointer transition',
                      appointmentType === type.value
                        ? 'border-teal-500 bg-teal-50'
                        : 'border-gray-200 hover:border-gray-300'
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="appointmentType"
                        value={type.value}
                        checked={appointmentType === type.value}
                        onChange={() => setAppointmentType(type.value)}
                        className="text-teal-600 focus:ring-teal-500"
                      />
                      <div>
                        <p className="font-medium text-gray-900">{type.label}</p>
                        <p className="text-xs text-gray-500">{type.description}</p>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Chief Complaint */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reason for Visit / Chief Complaint <span className="text-red-500">*</span>
              </label>
              <textarea
                {...register('chiefComplaint')}
                rows={3}
                className={cn(
                  'w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500',
                  errors.chiefComplaint ? 'border-red-500' : 'border-gray-300'
                )}
                placeholder="Describe the reason for this appointment..."
              />
              {errors.chiefComplaint && (
                <p className="text-sm text-red-500 mt-1">{errors.chiefComplaint.message}</p>
              )}
            </div>

            {/* Additional Notes */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Additional Notes (Optional)
              </label>
              <textarea
                {...register('notes')}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                placeholder="Any additional information..."
              />
            </div>

            {/* Submit button is in the footer */}
          </form>
        )}

        {/* Footer Navigation */}
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
          <button
            onClick={step === 'patient' ? () => navigate('/appointments') : prevStep}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
          >
            <ChevronLeft size={18} />
            {step === 'patient' ? 'Cancel' : 'Back'}
          </button>

          {step === 'details' ? (
            <button
              onClick={handleSubmit(onSubmit)}
              disabled={isSubmitting}
              className="flex items-center gap-2 px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Booking...
                </>
              ) : (
                <>
                  <Check size={18} />
                  Book Appointment
                </>
              )}
            </button>
          ) : (
            <button
              onClick={nextStep}
              disabled={!canProceed()}
              className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
              <ChevronRight size={18} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default NewAppointmentPage;
