// ============================================
// BASE TYPES
// ============================================

export interface BaseEntity {
  id: string; // UUID
  createdAt: string;
  updatedAt: string;
}

export interface AuditableEntity extends BaseEntity {
  createdBy?: string;
  updatedBy?: string;
}

// ============================================
// LOCALIZATION TYPES
// ============================================

export type Currency = 'NGN' | 'USD' | 'GHS' | 'KES' | 'ZAR' | 'GBP' | 'EUR';
export type DateFormat = 'DD/MM/YYYY' | 'MM/DD/YYYY' | 'YYYY-MM-DD';
export type TimeFormat = '12h' | '24h';

export interface LocalizationSettings {
  country: string;
  currency: Currency;
  currencySymbol: string;
  dateFormat: DateFormat;
  timeFormat: TimeFormat;
  timezone: string;
  language: string;
}

// ============================================
// HOSPITAL & BRANCH TYPES
// ============================================

export interface Hospital extends AuditableEntity {
  name: string;
  slug: string; // URL-friendly identifier
  email: string;
  phone: string;
  address?: string;
  city?: string;
  state?: string;
  country: string;
  logoUrl?: string;
  primaryColor?: string;
  localization: LocalizationSettings;
  settings: HospitalSettings;
  isActive: boolean;
}

export interface HospitalSettings {
  shareStaffAcrossBranches: boolean;
  shareInventoryAcrossBranches: boolean;
  centralizedBilling: boolean;
  requireAppointmentForVisit: boolean;
  allowWalkIns: boolean;
  defaultConsultationDuration: number; // minutes
  workingHours: WorkingHours;
}

export interface WorkingHours {
  monday: DaySchedule;
  tuesday: DaySchedule;
  wednesday: DaySchedule;
  thursday: DaySchedule;
  friday: DaySchedule;
  saturday: DaySchedule;
  sunday: DaySchedule;
}

export interface DaySchedule {
  isOpen: boolean;
  openTime?: string; // HH:mm
  closeTime?: string; // HH:mm
  breakStart?: string;
  breakEnd?: string;
}

export interface Branch extends AuditableEntity {
  hospitalId: string;
  name: string;
  code: string; // Short code like "LK" for Lekki
  email?: string;
  phone?: string;
  address: string;
  city: string;
  state: string;
  isHeadquarters: boolean;
  isActive: boolean;
}

// ============================================
// USER & AUTHENTICATION TYPES
// ============================================

export interface User extends AuditableEntity {
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatarUrl?: string;
  isActive: boolean;
  lastLoginAt?: string;
  emailVerifiedAt?: string;
}

export interface Staff extends User {
  hospitalId: string;
  staffId: string; // Hospital-specific staff ID
  employeeCode?: string;
  designation?: string;
  department?: string;
  specialization?: string;
  licenseNumber?: string; // MDCN number for doctors
  branches: StaffBranch[];
  roles: Role[];
}

export interface StaffBranch {
  branchId: string;
  branch: Branch;
  isPrimary: boolean;
  assignedAt: string;
}

export interface AuthUser {
  user: Staff;
  hospital: Hospital;
  currentBranch: Branch;
  availableBranches: Branch[];
  permissions: Permission[];
  token: string;
  refreshToken: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface LoginResponse {
  user: Staff;
  hospital: Hospital;
  branches: Branch[];
  token: string;
  refreshToken: string;
  requiresBranchSelection: boolean;
}

// ============================================
// RBAC TYPES
// ============================================

export type ModuleKey =
  | 'dashboard'
  | 'patients'
  | 'appointments'
  | 'opd'
  | 'laboratory'
  | 'radiology'
  | 'pharmacy'
  | 'billing'
  | 'inventory'
  | 'ward'
  | 'emergency'
  | 'reports'
  | 'staff'
  | 'roles'
  | 'settings';

export type ActionKey = 'view' | 'create' | 'edit' | 'delete' | 'export' | 'approve';

export interface Permission {
  module: ModuleKey;
  action: ActionKey;
}

export interface Role extends BaseEntity {
  hospitalId: string;
  name: string;
  description?: string;
  isSystem: boolean; // System roles cannot be deleted
  permissions: Permission[];
}

export const SYSTEM_ROLES = {
  SUPER_ADMIN: 'super_admin',
  DOCTOR: 'doctor',
  NURSE: 'nurse',
  RECEPTIONIST: 'receptionist',
  LAB_TECHNICIAN: 'lab_technician',
  PHARMACIST: 'pharmacist',
  CASHIER: 'cashier',
} as const;

// ============================================
// PATIENT TYPES
// ============================================

export type Gender = 'male' | 'female' | 'other';
export type BloodGroup = 'A+' | 'A-' | 'B+' | 'B-' | 'O+' | 'O-' | 'AB+' | 'AB-';
export type MaritalStatus = 'single' | 'married' | 'divorced' | 'widowed';

export interface Patient extends AuditableEntity {
  rivhealId: string; // RH-XXXXXX (global unique identifier)
  nationalId?: string; // NIN for Nigeria
  firstName: string;
  middleName?: string;
  lastName: string;
  dateOfBirth: string;
  gender: Gender;
  bloodGroup?: BloodGroup;
  maritalStatus?: MaritalStatus;
  phone: string;
  email?: string;
  address?: string;
  city?: string;
  state?: string;
  country: string;
  occupation?: string;
  photoUrl?: string;
  allergies: string[];
  chronicConditions: string[];
  emergencyContact: EmergencyContact;
}

export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
  email?: string;
  address?: string;
}

export interface PatientHospitalLink extends BaseEntity {
  patientId: string;
  hospitalId: string;
  branchId: string; // Branch where patient was first registered
  attachedBy: string; // Staff ID who attached
  status: 'active' | 'inactive';
  notes?: string;
}

export interface PatientWithLink extends Patient {
  hospitalLink: PatientHospitalLink;
}

// ============================================
// APPOINTMENT TYPES
// ============================================

export type AppointmentStatus =
  | 'scheduled'
  | 'confirmed'
  | 'checked_in'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'no_show';

export type AppointmentType =
  | 'new_visit'
  | 'follow_up'
  | 'review'
  | 'emergency'
  | 'consultation'
  | 'procedure';

export interface Appointment extends AuditableEntity {
  patientId: string;
  patient?: Patient;
  hospitalId: string;
  branchId: string;
  departmentId?: string;
  doctorId?: string;
  doctor?: Staff;
  appointmentDate: string;
  startTime: string;
  endTime?: string;
  type: AppointmentType;
  status: AppointmentStatus;
  reasonForVisit?: string;
  notes?: string;
  queueNumber?: number;
  checkedInAt?: string;
  consultationStartedAt?: string;
  consultationEndedAt?: string;
}

// ============================================
// CLINICAL TYPES
// ============================================

export interface Vitals extends BaseEntity {
  visitId: string;
  patientId: string;
  recordedBy: string;
  temperature?: number; // Celsius
  bloodPressureSystolic?: number;
  bloodPressureDiastolic?: number;
  pulseRate?: number; // bpm
  respiratoryRate?: number; // breaths/min
  oxygenSaturation?: number; // percentage
  weight?: number; // kg
  height?: number; // cm
  bmi?: number;
  bloodGlucose?: number; // mg/dL
  painLevel?: number; // 0-10
  notes?: string;
}

export interface Visit extends AuditableEntity {
  patientId: string;
  patient?: Patient;
  hospitalId: string;
  branchId: string;
  appointmentId?: string;
  visitNumber: string; // Auto-generated
  visitDate: string;
  visitType: AppointmentType;
  chiefComplaint: string;
  vitals?: Vitals;
  consultation?: Consultation;
  prescriptions: Prescription[];
  labOrders: LabOrder[];
  status: 'active' | 'completed' | 'discharged';
}

export interface Consultation extends BaseEntity {
  visitId: string;
  doctorId: string;
  doctor?: Staff;
  // SOAP Notes
  subjective?: string; // Patient's description
  objective?: string; // Doctor's observations
  assessment?: string; // Diagnosis/Assessment
  plan?: string; // Treatment plan
  // Additional
  presentingComplaints?: string;
  historyOfPresentIllness?: string;
  pastMedicalHistory?: string;
  familyHistory?: string;
  socialHistory?: string;
  reviewOfSystems?: string;
  physicalExamination?: string;
  diagnosis: Diagnosis[];
  followUpDate?: string;
  followUpNotes?: string;
}

export interface Diagnosis {
  code: string; // ICD-10 code
  description: string;
  type: 'primary' | 'secondary' | 'differential';
  notes?: string;
}

// ============================================
// PRESCRIPTION TYPES
// ============================================

export interface Prescription extends BaseEntity {
  visitId: string;
  patientId: string;
  prescribedBy: string;
  prescriber?: Staff;
  medications: PrescriptionItem[];
  notes?: string;
  status: 'pending' | 'dispensed' | 'partially_dispensed' | 'cancelled';
}

export interface PrescriptionItem {
  id: string;
  drugId?: string;
  drugName: string;
  genericName?: string;
  dosage: string;
  frequency: string;
  duration: string;
  quantity: number;
  route: string; // oral, IV, IM, etc.
  instructions?: string;
  isDispensed: boolean;
  dispensedQuantity?: number;
}

// ============================================
// LABORATORY TYPES
// ============================================

export type LabOrderStatus =
  | 'ordered'
  | 'sample_collected'
  | 'processing'
  | 'completed'
  | 'cancelled';

export interface LabOrder extends BaseEntity {
  visitId: string;
  patientId: string;
  orderedBy: string;
  orderer?: Staff;
  tests: LabTest[];
  priority: 'routine' | 'urgent' | 'stat';
  clinicalNotes?: string;
  status: LabOrderStatus;
}

export interface LabTest {
  id: string;
  testCatalogId: string;
  testName: string;
  testCode: string;
  category: string;
  sampleType?: string;
  sampleCollectedAt?: string;
  sampleCollectedBy?: string;
  result?: LabResult;
  status: LabOrderStatus;
}

export interface LabResult {
  value: string;
  unit?: string;
  referenceRange?: string;
  isAbnormal: boolean;
  remarks?: string;
  verifiedBy?: string;
  verifiedAt?: string;
}

// ============================================
// BILLING TYPES
// ============================================

export type BillStatus = 'draft' | 'pending' | 'partial' | 'paid' | 'cancelled' | 'refunded';
export type PaymentMethod = 'cash' | 'card' | 'transfer' | 'hmo' | 'wallet';

export interface Bill extends AuditableEntity {
  visitId?: string;
  patientId: string;
  patient?: Patient;
  hospitalId: string;
  branchId: string;
  billNumber: string;
  items: BillItem[];
  subtotal: number;
  discount: number;
  discountReason?: string;
  tax: number;
  total: number;
  amountPaid: number;
  balance: number;
  currency: Currency;
  status: BillStatus;
  dueDate?: string;
  payments: Payment[];
  hmoDetails?: HMODetails;
}

export interface BillItem {
  id: string;
  description: string;
  category: 'consultation' | 'lab' | 'pharmacy' | 'procedure' | 'ward' | 'other';
  quantity: number;
  unitPrice: number;
  total: number;
  referenceId?: string; // Link to lab order, prescription, etc.
}

export interface Payment extends BaseEntity {
  billId: string;
  amount: number;
  currency: Currency;
  method: PaymentMethod;
  reference?: string;
  receivedBy: string;
  notes?: string;
}

export interface HMODetails {
  hmoId: string;
  hmoName: string;
  policyNumber: string;
  enrolleeId: string;
  authorizationCode?: string;
  coveredAmount: number;
  patientResponsibility: number;
}

// ============================================
// INVENTORY TYPES
// ============================================

export interface InventoryItem extends AuditableEntity {
  hospitalId: string;
  branchId?: string; // null if shared across branches
  name: string;
  genericName?: string;
  sku: string;
  category: 'drug' | 'consumable' | 'equipment' | 'reagent';
  unit: string;
  quantity: number;
  reorderLevel: number;
  costPrice: number;
  sellingPrice: number;
  expiryDate?: string;
  batchNumber?: string;
  supplier?: string;
  location?: string;
  isActive: boolean;
}

// ============================================
// SYNC & OFFLINE TYPES
// ============================================

export type SyncStatus = 'synced' | 'pending' | 'conflict' | 'error';

export interface SyncableEntity {
  syncStatus: SyncStatus;
  localUpdatedAt: string;
  serverUpdatedAt?: string;
  syncError?: string;
}

export interface SyncQueueItem {
  id: string;
  entityType: string;
  entityId: string;
  action: 'create' | 'update' | 'delete';
  data: Record<string, unknown>;
  createdAt: string;
  attempts: number;
  lastAttemptAt?: string;
  error?: string;
}

export interface SyncConflict {
  id: string;
  entityType: string;
  entityId: string;
  localData: Record<string, unknown>;
  serverData: Record<string, unknown>;
  localUpdatedAt: string;
  serverUpdatedAt: string;
  resolvedAt?: string;
  resolution?: 'local' | 'server' | 'merged';
}

// ============================================
// API RESPONSE TYPES
// ============================================

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Array<{
      field: string;
      message: string;
    }>;
  };
}

// ============================================
// UI TYPES
// ============================================

export interface NavItem {
  key: ModuleKey;
  label: string;
  icon: string;
  path: string;
  children?: NavItem[];
}

export interface BreadcrumbItem {
  label: string;
  path?: string;
}

export interface TableColumn<T> {
  key: keyof T | string;
  label: string;
  sortable?: boolean;
  width?: string;
  render?: (value: unknown, row: T) => React.ReactNode;
}

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}
