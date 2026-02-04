import React, { useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useUIStore } from '@/stores/ui.store';
import { cn, formatDate } from '@/utils';
import {
  ArrowLeft,
  User,
  Heart,
  Thermometer,
  Activity,
  Wind,
  Droplet,
  FileText,
  Pill,
  FlaskConical,
  Stethoscope,
  Save,
  Send,
  Plus,
  Trash2,
  AlertTriangle,
  Clock,
  Printer,
  History,
  ChevronDown,
  ChevronUp,
  Check,
  Loader2,
} from 'lucide-react';

// Schema for vitals
const vitalsSchema = z.object({
  bloodPressureSystolic: z.string().optional(),
  bloodPressureDiastolic: z.string().optional(),
  pulseRate: z.string().optional(),
  temperature: z.string().optional(),
  respiratoryRate: z.string().optional(),
  oxygenSaturation: z.string().optional(),
  weight: z.string().optional(),
  height: z.string().optional(),
});

// Schema for consultation
const consultationSchema = z.object({
  chiefComplaint: z.string().min(5, 'Chief complaint is required'),
  historyOfPresentIllness: z.string().optional(),
  pastMedicalHistory: z.string().optional(),
  physicalExamination: z.string().optional(),
  assessment: z.string().min(5, 'Assessment is required'),
  plan: z.string().min(5, 'Plan is required'),
});

type VitalsData = z.infer<typeof vitalsSchema>;
type ConsultationData = z.infer<typeof consultationSchema>;

interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
}

interface LabOrder {
  id: string;
  testName: string;
  priority: 'routine' | 'urgent' | 'stat';
  notes: string;
}

interface Diagnosis {
  id: string;
  code: string;
  description: string;
  type: 'primary' | 'secondary';
}

// Mock patient data
const mockPatient = {
  id: '1',
  rivhealId: 'RH-001234',
  firstName: 'Chioma',
  middleName: 'Adaeze',
  lastName: 'Okonkwo',
  dateOfBirth: '1992-05-15',
  gender: 'female',
  bloodGroup: 'O+',
  phone: '+234 801 234 5678',
  allergies: ['Penicillin', 'Aspirin'],
  chronicConditions: ['Asthma'],
};

// Common medications (mock)
const commonMedications = [
  'Paracetamol 500mg',
  'Ibuprofen 400mg',
  'Amoxicillin 500mg',
  'Metformin 500mg',
  'Lisinopril 10mg',
  'Omeprazole 20mg',
  'Metronidazole 400mg',
  'Ciprofloxacin 500mg',
  'Salbutamol Inhaler',
  'Prednisolone 5mg',
];

// Common lab tests
const commonLabTests = [
  'Complete Blood Count (CBC)',
  'Fasting Blood Sugar (FBS)',
  'Lipid Profile',
  'Liver Function Test (LFT)',
  'Kidney Function Test (RFT)',
  'Urinalysis',
  'Malaria Parasite',
  'Widal Test',
  'HIV Screening',
  'Hepatitis B Surface Antigen',
];

// Common ICD-10 codes
const commonDiagnoses = [
  { code: 'J45.9', description: 'Asthma, unspecified' },
  { code: 'I10', description: 'Essential (primary) hypertension' },
  { code: 'E11.9', description: 'Type 2 diabetes mellitus without complications' },
  { code: 'J06.9', description: 'Acute upper respiratory infection, unspecified' },
  { code: 'K30', description: 'Functional dyspepsia' },
  { code: 'M54.5', description: 'Low back pain' },
  { code: 'G43.9', description: 'Migraine, unspecified' },
  { code: 'B54', description: 'Unspecified malaria' },
];

type TabKey = 'vitals' | 'consultation' | 'prescriptions' | 'lab_orders' | 'diagnosis';

export const ConsultationPage: React.FC = () => {
  const { visitId } = useParams();
  const [searchParams] = useSearchParams();
  const appointmentId = searchParams.get('appointmentId');
  const navigate = useNavigate();
  const addToast = useUIStore((state) => state.addToast);

  const isNewConsultation = !visitId;

  // State
  const [activeTab, setActiveTab] = useState<TabKey>('vitals');
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  // Medications state
  const [medications, setMedications] = useState<Medication[]>([]);
  const [newMedication, setNewMedication] = useState<Partial<Medication>>({});

  // Lab orders state
  const [labOrders, setLabOrders] = useState<LabOrder[]>([]);
  const [newLabOrder, setNewLabOrder] = useState<Partial<LabOrder>>({});

  // Diagnoses state
  const [diagnoses, setDiagnoses] = useState<Diagnosis[]>([]);

  // Vitals form
  const vitalsForm = useForm<VitalsData>({
    resolver: zodResolver(vitalsSchema),
    defaultValues: {
      bloodPressureSystolic: '',
      bloodPressureDiastolic: '',
      pulseRate: '',
      temperature: '',
      respiratoryRate: '',
      oxygenSaturation: '',
      weight: '',
      height: '',
    },
  });

  // Consultation form
  const consultationForm = useForm<ConsultationData>({
    resolver: zodResolver(consultationSchema),
    defaultValues: {
      chiefComplaint: '',
      historyOfPresentIllness: '',
      pastMedicalHistory: '',
      physicalExamination: '',
      assessment: '',
      plan: '',
    },
  });

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

  // Calculate BMI
  const calculateBMI = () => {
    const weight = parseFloat(vitalsForm.watch('weight') || '0');
    const height = parseFloat(vitalsForm.watch('height') || '0') / 100; // convert cm to m
    if (weight && height) {
      return (weight / (height * height)).toFixed(1);
    }
    return '-';
  };

  // Add medication
  const addMedication = () => {
    if (newMedication.name && newMedication.dosage) {
      setMedications([
        ...medications,
        {
          id: String(Date.now()),
          name: newMedication.name,
          dosage: newMedication.dosage,
          frequency: newMedication.frequency || 'Once daily',
          duration: newMedication.duration || '7 days',
          instructions: newMedication.instructions || '',
        },
      ]);
      setNewMedication({});
    }
  };

  // Remove medication
  const removeMedication = (id: string) => {
    setMedications(medications.filter((m) => m.id !== id));
  };

  // Add lab order
  const addLabOrder = () => {
    if (newLabOrder.testName) {
      setLabOrders([
        ...labOrders,
        {
          id: String(Date.now()),
          testName: newLabOrder.testName,
          priority: newLabOrder.priority || 'routine',
          notes: newLabOrder.notes || '',
        },
      ]);
      setNewLabOrder({});
    }
  };

  // Remove lab order
  const removeLabOrder = (id: string) => {
    setLabOrders(labOrders.filter((l) => l.id !== id));
  };

  // Add diagnosis
  const addDiagnosis = (diagnosis: typeof commonDiagnoses[0], type: 'primary' | 'secondary') => {
    if (!diagnoses.find((d) => d.code === diagnosis.code)) {
      setDiagnoses([
        ...diagnoses,
        {
          id: String(Date.now()),
          code: diagnosis.code,
          description: diagnosis.description,
          type,
        },
      ]);
    }
  };

  // Remove diagnosis
  const removeDiagnosis = (id: string) => {
    setDiagnoses(diagnoses.filter((d) => d.id !== id));
  };

  // Save draft
  const saveDraft = async () => {
    setIsSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSaving(false);
    addToast('success', 'Draft Saved', 'Consultation draft has been saved.');
  };

  // Complete consultation
  const completeConsultation = async () => {
    // Validate consultation form
    const isValid = await consultationForm.trigger();
    if (!isValid) {
      setActiveTab('consultation');
      return;
    }

    if (diagnoses.length === 0) {
      addToast('error', 'Diagnosis Required', 'Please add at least one diagnosis.');
      setActiveTab('diagnosis');
      return;
    }

    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsSubmitting(false);
    addToast('success', 'Consultation Completed', 'Patient consultation has been saved and completed.');
    navigate('/appointments');
  };

  const tabs: { key: TabKey; label: string; icon: React.ElementType }[] = [
    { key: 'vitals', label: 'Vitals', icon: Heart },
    { key: 'consultation', label: 'SOAP Notes', icon: FileText },
    { key: 'diagnosis', label: 'Diagnosis', icon: Stethoscope },
    { key: 'prescriptions', label: 'Prescriptions', icon: Pill },
    { key: 'lab_orders', label: 'Lab Orders', icon: FlaskConical },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isNewConsultation ? 'New Consultation' : 'Continue Consultation'}
            </h1>
            <p className="text-gray-500">
              {formatDate(new Date().toISOString())} • Dr. Adaeze Obi
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={saveDraft}
            disabled={isSaving}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
          >
            {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            Save Draft
          </button>
          <button
            onClick={completeConsultation}
            disabled={isSubmitting}
            className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition disabled:opacity-50"
          >
            {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
            Complete
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Patient Card */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-teal-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
                {mockPatient.firstName[0]}{mockPatient.lastName[0]}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">
                  {mockPatient.firstName} {mockPatient.lastName}
                </h3>
                <p className="text-sm text-gray-500 font-mono">{mockPatient.rivhealId}</p>
              </div>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Age</span>
                <span className="font-medium">{calculateAge(mockPatient.dateOfBirth)} years</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Gender</span>
                <span className="font-medium capitalize">{mockPatient.gender}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Blood Group</span>
                <span className="font-medium text-red-600">{mockPatient.bloodGroup}</span>
              </div>
            </div>

            {/* Allergies Alert */}
            {mockPatient.allergies.length > 0 && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center gap-2 text-red-700 font-medium mb-2">
                  <AlertTriangle size={16} />
                  Allergies
                </div>
                <div className="flex flex-wrap gap-1">
                  {mockPatient.allergies.map((allergy, i) => (
                    <span key={i} className="px-2 py-0.5 bg-red-100 text-red-700 rounded text-xs">
                      {allergy}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Chronic Conditions */}
            {mockPatient.chronicConditions.length > 0 && (
              <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                <div className="flex items-center gap-2 text-orange-700 font-medium mb-2">
                  <Activity size={16} />
                  Chronic Conditions
                </div>
                <div className="flex flex-wrap gap-1">
                  {mockPatient.chronicConditions.map((condition, i) => (
                    <span key={i} className="px-2 py-0.5 bg-orange-100 text-orange-700 rounded text-xs">
                      {condition}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="mt-4 pt-4 border-t border-gray-100 space-y-2">
              <button
                onClick={() => setShowHistory(!showHistory)}
                className="w-full flex items-center justify-between px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition"
              >
                <span className="flex items-center gap-2">
                  <History size={16} />
                  Previous Visits
                </span>
                {showHistory ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
              <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition">
                <Printer size={16} />
                Print Summary
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          {/* Tabs */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
            <div className="border-b border-gray-100 px-4">
              <nav className="flex gap-4 overflow-x-auto">
                {tabs.map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={cn(
                      'flex items-center gap-2 py-4 px-2 border-b-2 font-medium text-sm whitespace-nowrap transition',
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

            <div className="p-6">
              {/* Vitals Tab */}
              {activeTab === 'vitals' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {/* Blood Pressure */}
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Blood Pressure (mmHg)
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          {...vitalsForm.register('bloodPressureSystolic')}
                          placeholder="Systolic"
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                        />
                        <span className="text-gray-400">/</span>
                        <input
                          type="number"
                          {...vitalsForm.register('bloodPressureDiastolic')}
                          placeholder="Diastolic"
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                        />
                      </div>
                    </div>

                    {/* Pulse Rate */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        <div className="flex items-center gap-1">
                          <Heart size={14} className="text-red-500" />
                          Pulse (bpm)
                        </div>
                      </label>
                      <input
                        type="number"
                        {...vitalsForm.register('pulseRate')}
                        placeholder="72"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                      />
                    </div>

                    {/* Temperature */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        <div className="flex items-center gap-1">
                          <Thermometer size={14} className="text-orange-500" />
                          Temp (°C)
                        </div>
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        {...vitalsForm.register('temperature')}
                        placeholder="36.5"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                      />
                    </div>

                    {/* Respiratory Rate */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        <div className="flex items-center gap-1">
                          <Wind size={14} className="text-blue-500" />
                          Resp Rate
                        </div>
                      </label>
                      <input
                        type="number"
                        {...vitalsForm.register('respiratoryRate')}
                        placeholder="16"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                      />
                    </div>

                    {/* SpO2 */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        <div className="flex items-center gap-1">
                          <Droplet size={14} className="text-blue-500" />
                          SpO2 (%)
                        </div>
                      </label>
                      <input
                        type="number"
                        {...vitalsForm.register('oxygenSaturation')}
                        placeholder="98"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                      />
                    </div>

                    {/* Weight */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Weight (kg)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        {...vitalsForm.register('weight')}
                        placeholder="70"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                      />
                    </div>

                    {/* Height */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Height (cm)
                      </label>
                      <input
                        type="number"
                        {...vitalsForm.register('height')}
                        placeholder="170"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                      />
                    </div>
                  </div>

                  {/* BMI Display */}
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-500">Calculated BMI</p>
                    <p className="text-2xl font-bold text-gray-900">{calculateBMI()}</p>
                  </div>
                </div>
              )}

              {/* SOAP Notes Tab */}
              {activeTab === 'consultation' && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Chief Complaint (Subjective) <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      {...consultationForm.register('chiefComplaint')}
                      rows={3}
                      className={cn(
                        'w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500',
                        consultationForm.formState.errors.chiefComplaint ? 'border-red-500' : 'border-gray-300'
                      )}
                      placeholder="Patient presents with..."
                    />
                    {consultationForm.formState.errors.chiefComplaint && (
                      <p className="text-sm text-red-500 mt-1">{consultationForm.formState.errors.chiefComplaint.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      History of Present Illness
                    </label>
                    <textarea
                      {...consultationForm.register('historyOfPresentIllness')}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                      placeholder="Duration, onset, severity, associated symptoms..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Physical Examination (Objective)
                    </label>
                    <textarea
                      {...consultationForm.register('physicalExamination')}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                      placeholder="General appearance, cardiovascular, respiratory..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Assessment <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      {...consultationForm.register('assessment')}
                      rows={3}
                      className={cn(
                        'w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500',
                        consultationForm.formState.errors.assessment ? 'border-red-500' : 'border-gray-300'
                      )}
                      placeholder="Clinical impression and diagnosis..."
                    />
                    {consultationForm.formState.errors.assessment && (
                      <p className="text-sm text-red-500 mt-1">{consultationForm.formState.errors.assessment.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Plan <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      {...consultationForm.register('plan')}
                      rows={3}
                      className={cn(
                        'w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500',
                        consultationForm.formState.errors.plan ? 'border-red-500' : 'border-gray-300'
                      )}
                      placeholder="Treatment plan, medications, follow-up..."
                    />
                    {consultationForm.formState.errors.plan && (
                      <p className="text-sm text-red-500 mt-1">{consultationForm.formState.errors.plan.message}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Diagnosis Tab */}
              {activeTab === 'diagnosis' && (
                <div className="space-y-6">
                  {/* Added Diagnoses */}
                  {diagnoses.length > 0 && (
                    <div className="space-y-2">
                      <h3 className="text-sm font-medium text-gray-700">Selected Diagnoses</h3>
                      {diagnoses.map((diagnosis) => (
                        <div
                          key={diagnosis.id}
                          className={cn(
                            'flex items-center justify-between p-3 rounded-lg border',
                            diagnosis.type === 'primary' ? 'bg-teal-50 border-teal-200' : 'bg-gray-50 border-gray-200'
                          )}
                        >
                          <div className="flex items-center gap-3">
                            <span className={cn(
                              'px-2 py-0.5 rounded text-xs font-medium',
                              diagnosis.type === 'primary' ? 'bg-teal-100 text-teal-700' : 'bg-gray-200 text-gray-600'
                            )}>
                              {diagnosis.type === 'primary' ? 'Primary' : 'Secondary'}
                            </span>
                            <div>
                              <p className="font-medium text-gray-900">{diagnosis.description}</p>
                              <p className="text-sm text-gray-500 font-mono">{diagnosis.code}</p>
                            </div>
                          </div>
                          <button
                            onClick={() => removeDiagnosis(diagnosis.id)}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded transition"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Common Diagnoses */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Quick Add (ICD-10)</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {commonDiagnoses.map((diagnosis) => (
                        <div
                          key={diagnosis.code}
                          className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
                        >
                          <div>
                            <p className="font-medium text-gray-900 text-sm">{diagnosis.description}</p>
                            <p className="text-xs text-gray-500 font-mono">{diagnosis.code}</p>
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => addDiagnosis(diagnosis, 'primary')}
                              disabled={diagnoses.some((d) => d.code === diagnosis.code)}
                              className="px-2 py-1 text-xs bg-teal-100 text-teal-700 rounded hover:bg-teal-200 transition disabled:opacity-50"
                            >
                              Primary
                            </button>
                            <button
                              onClick={() => addDiagnosis(diagnosis, 'secondary')}
                              disabled={diagnoses.some((d) => d.code === diagnosis.code)}
                              className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition disabled:opacity-50"
                            >
                              Secondary
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Prescriptions Tab */}
              {activeTab === 'prescriptions' && (
                <div className="space-y-6">
                  {/* Added Medications */}
                  {medications.length > 0 && (
                    <div className="space-y-2">
                      <h3 className="text-sm font-medium text-gray-700">Prescribed Medications</h3>
                      {medications.map((med) => (
                        <div
                          key={med.id}
                          className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg"
                        >
                          <div>
                            <p className="font-medium text-gray-900">{med.name}</p>
                            <p className="text-sm text-gray-600">
                              {med.dosage} • {med.frequency} • {med.duration}
                            </p>
                            {med.instructions && (
                              <p className="text-xs text-gray-500 mt-1">{med.instructions}</p>
                            )}
                          </div>
                          <button
                            onClick={() => removeMedication(med.id)}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded transition"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add Medication Form */}
                  <div className="p-4 border border-gray-200 rounded-lg space-y-4">
                    <h3 className="text-sm font-medium text-gray-700">Add Medication</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <div className="col-span-2">
                        <select
                          value={newMedication.name || ''}
                          onChange={(e) => setNewMedication({ ...newMedication, name: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                        >
                          <option value="">Select medication...</option>
                          {commonMedications.map((med) => (
                            <option key={med} value={med}>{med}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <input
                          type="text"
                          value={newMedication.dosage || ''}
                          onChange={(e) => setNewMedication({ ...newMedication, dosage: e.target.value })}
                          placeholder="Dosage (e.g., 1 tablet)"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                        />
                      </div>
                      <div>
                        <select
                          value={newMedication.frequency || ''}
                          onChange={(e) => setNewMedication({ ...newMedication, frequency: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                        >
                          <option value="">Frequency</option>
                          <option value="Once daily">Once daily</option>
                          <option value="Twice daily">Twice daily</option>
                          <option value="Three times daily">Three times daily</option>
                          <option value="Four times daily">Four times daily</option>
                          <option value="As needed">As needed (PRN)</option>
                          <option value="At bedtime">At bedtime</option>
                        </select>
                      </div>
                      <div>
                        <select
                          value={newMedication.duration || ''}
                          onChange={(e) => setNewMedication({ ...newMedication, duration: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                        >
                          <option value="">Duration</option>
                          <option value="3 days">3 days</option>
                          <option value="5 days">5 days</option>
                          <option value="7 days">7 days</option>
                          <option value="10 days">10 days</option>
                          <option value="14 days">14 days</option>
                          <option value="1 month">1 month</option>
                          <option value="Ongoing">Ongoing</option>
                        </select>
                      </div>
                      <div className="col-span-2">
                        <input
                          type="text"
                          value={newMedication.instructions || ''}
                          onChange={(e) => setNewMedication({ ...newMedication, instructions: e.target.value })}
                          placeholder="Special instructions (optional)"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                        />
                      </div>
                      <div>
                        <button
                          onClick={addMedication}
                          disabled={!newMedication.name || !newMedication.dosage}
                          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition disabled:opacity-50"
                        >
                          <Plus size={18} />
                          Add
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Lab Orders Tab */}
              {activeTab === 'lab_orders' && (
                <div className="space-y-6">
                  {/* Added Lab Orders */}
                  {labOrders.length > 0 && (
                    <div className="space-y-2">
                      <h3 className="text-sm font-medium text-gray-700">Ordered Tests</h3>
                      {labOrders.map((order) => (
                        <div
                          key={order.id}
                          className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <span className={cn(
                              'px-2 py-0.5 rounded text-xs font-medium uppercase',
                              order.priority === 'stat' ? 'bg-red-100 text-red-700' :
                              order.priority === 'urgent' ? 'bg-orange-100 text-orange-700' :
                              'bg-gray-100 text-gray-700'
                            )}>
                              {order.priority}
                            </span>
                            <div>
                              <p className="font-medium text-gray-900">{order.testName}</p>
                              {order.notes && <p className="text-sm text-gray-500">{order.notes}</p>}
                            </div>
                          </div>
                          <button
                            onClick={() => removeLabOrder(order.id)}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded transition"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add Lab Order Form */}
                  <div className="p-4 border border-gray-200 rounded-lg space-y-4">
                    <h3 className="text-sm font-medium text-gray-700">Order Lab Test</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <select
                          value={newLabOrder.testName || ''}
                          onChange={(e) => setNewLabOrder({ ...newLabOrder, testName: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                        >
                          <option value="">Select test...</option>
                          {commonLabTests.map((test) => (
                            <option key={test} value={test}>{test}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <select
                          value={newLabOrder.priority || 'routine'}
                          onChange={(e) => setNewLabOrder({ ...newLabOrder, priority: e.target.value as 'routine' | 'urgent' | 'stat' })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                        >
                          <option value="routine">Routine</option>
                          <option value="urgent">Urgent</option>
                          <option value="stat">STAT</option>
                        </select>
                      </div>
                      <div>
                        <button
                          onClick={addLabOrder}
                          disabled={!newLabOrder.testName}
                          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition disabled:opacity-50"
                        >
                          <Plus size={18} />
                          Add Test
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Quick Add Tests */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Quick Add</h3>
                    <div className="flex flex-wrap gap-2">
                      {commonLabTests.slice(0, 6).map((test) => (
                        <button
                          key={test}
                          onClick={() => setNewLabOrder({ ...newLabOrder, testName: test })}
                          className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm hover:bg-gray-50 transition"
                        >
                          {test}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConsultationPage;
