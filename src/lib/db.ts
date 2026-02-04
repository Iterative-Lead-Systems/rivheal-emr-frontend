import Dexie, { Table } from 'dexie';
import type {
  Patient,
  Appointment,
  Visit,
  Prescription,
  LabOrder,
  Bill,
  SyncQueueItem,
  SyncConflict,
  Staff,
  Hospital,
  Branch,
  Role,
} from '@/types';

// Extended types for offline storage
interface OfflinePatient extends Patient {
  syncStatus: 'synced' | 'pending' | 'conflict' | 'error';
  localUpdatedAt: string;
  serverUpdatedAt?: string;
}

interface OfflineAppointment extends Appointment {
  syncStatus: 'synced' | 'pending' | 'conflict' | 'error';
  localUpdatedAt: string;
  serverUpdatedAt?: string;
}

interface OfflineVisit extends Visit {
  syncStatus: 'synced' | 'pending' | 'conflict' | 'error';
  localUpdatedAt: string;
  serverUpdatedAt?: string;
}

// Define database schema
class RivHealDatabase extends Dexie {
  // Core tables
  patients!: Table<OfflinePatient, string>;
  appointments!: Table<OfflineAppointment, string>;
  visits!: Table<OfflineVisit, string>;
  prescriptions!: Table<Prescription, string>;
  labOrders!: Table<LabOrder, string>;
  bills!: Table<Bill, string>;
  
  // Reference tables (cached from server)
  staff!: Table<Staff, string>;
  hospitals!: Table<Hospital, string>;
  branches!: Table<Branch, string>;
  roles!: Table<Role, string>;
  
  // Sync management
  syncQueue!: Table<SyncQueueItem, string>;
  syncConflicts!: Table<SyncConflict, string>;
  
  // Metadata
  metadata!: Table<{ key: string; value: string }, string>;

  constructor() {
    super('RivHealEMR');

    // Define schema with indexes
    this.version(1).stores({
      // Core tables
      patients: 'id, rivhealId, nationalId, phone, email, syncStatus, localUpdatedAt',
      appointments: 'id, patientId, branchId, doctorId, appointmentDate, status, syncStatus',
      visits: 'id, patientId, branchId, visitDate, status, syncStatus',
      prescriptions: 'id, visitId, patientId, prescribedBy, status',
      labOrders: 'id, visitId, patientId, orderedBy, status',
      bills: 'id, patientId, branchId, billNumber, status',
      
      // Reference tables
      staff: 'id, hospitalId, email, employeeCode',
      hospitals: 'id, slug',
      branches: 'id, hospitalId, code',
      roles: 'id, hospitalId, name',
      
      // Sync management
      syncQueue: 'id, entityType, entityId, action, createdAt',
      syncConflicts: 'id, entityType, entityId, resolvedAt',
      
      // Metadata
      metadata: 'key',
    });
  }
}

// Create database instance
export const db = new RivHealDatabase();

// Database helper functions
export const offlineDb = {
  // ==========================================
  // PATIENT OPERATIONS
  // ==========================================
  
  async getPatient(id: string): Promise<OfflinePatient | undefined> {
    return db.patients.get(id);
  },

  async getPatientByRivHealId(rivhealId: string): Promise<OfflinePatient | undefined> {
    return db.patients.where('rivhealId').equals(rivhealId).first();
  },

  async getPatientByPhone(phone: string): Promise<OfflinePatient | undefined> {
    return db.patients.where('phone').equals(phone).first();
  },

  async searchPatients(query: string, limit = 20): Promise<OfflinePatient[]> {
    const lowerQuery = query.toLowerCase();
    return db.patients
      .filter((patient) => {
        return (
          patient.firstName.toLowerCase().includes(lowerQuery) ||
          patient.lastName.toLowerCase().includes(lowerQuery) ||
          patient.rivhealId.toLowerCase().includes(lowerQuery) ||
          patient.phone.includes(query) ||
          (patient.email && patient.email.toLowerCase().includes(lowerQuery))
        );
      })
      .limit(limit)
      .toArray();
  },

  async savePatient(patient: OfflinePatient): Promise<string> {
    const now = new Date().toISOString();
    const patientData = {
      ...patient,
      localUpdatedAt: now,
      syncStatus: 'pending' as const,
    };
    
    await db.patients.put(patientData);
    
    // Add to sync queue
    await this.addToSyncQueue('patient', patient.id, patient.id ? 'update' : 'create', patientData);
    
    return patient.id;
  },

  async getPendingPatients(): Promise<OfflinePatient[]> {
    return db.patients.where('syncStatus').equals('pending').toArray();
  },

  // ==========================================
  // APPOINTMENT OPERATIONS
  // ==========================================

  async getAppointmentsByDate(branchId: string, date: string): Promise<OfflineAppointment[]> {
    return db.appointments
      .where('branchId')
      .equals(branchId)
      .and((apt) => apt.appointmentDate === date)
      .toArray();
  },

  async getAppointmentsByPatient(patientId: string): Promise<OfflineAppointment[]> {
    return db.appointments.where('patientId').equals(patientId).toArray();
  },

  async saveAppointment(appointment: OfflineAppointment): Promise<string> {
    const now = new Date().toISOString();
    const appointmentData = {
      ...appointment,
      localUpdatedAt: now,
      syncStatus: 'pending' as const,
    };
    
    await db.appointments.put(appointmentData);
    await this.addToSyncQueue('appointment', appointment.id, appointment.id ? 'update' : 'create', appointmentData);
    
    return appointment.id;
  },

  // ==========================================
  // VISIT OPERATIONS
  // ==========================================

  async getVisitsByPatient(patientId: string): Promise<OfflineVisit[]> {
    return db.visits.where('patientId').equals(patientId).toArray();
  },

  async getActiveVisit(patientId: string): Promise<OfflineVisit | undefined> {
    return db.visits
      .where('patientId')
      .equals(patientId)
      .and((visit) => visit.status === 'active')
      .first();
  },

  async saveVisit(visit: OfflineVisit): Promise<string> {
    const now = new Date().toISOString();
    const visitData = {
      ...visit,
      localUpdatedAt: now,
      syncStatus: 'pending' as const,
    };
    
    await db.visits.put(visitData);
    await this.addToSyncQueue('visit', visit.id, visit.id ? 'update' : 'create', visitData);
    
    return visit.id;
  },

  // ==========================================
  // SYNC QUEUE OPERATIONS
  // ==========================================

  async addToSyncQueue(
    entityType: string,
    entityId: string,
    action: 'create' | 'update' | 'delete',
    data: Record<string, unknown>
  ): Promise<void> {
    const queueItem: SyncQueueItem = {
      id: crypto.randomUUID(),
      entityType,
      entityId,
      action,
      data,
      createdAt: new Date().toISOString(),
      attempts: 0,
    };
    
    await db.syncQueue.put(queueItem);
  },

  async getSyncQueue(): Promise<SyncQueueItem[]> {
    return db.syncQueue.orderBy('createdAt').toArray();
  },

  async removeSyncQueueItem(id: string): Promise<void> {
    await db.syncQueue.delete(id);
  },

  async incrementSyncAttempt(id: string): Promise<void> {
    await db.syncQueue.update(id, {
      attempts: (await db.syncQueue.get(id))?.attempts ?? 0 + 1,
      lastAttemptAt: new Date().toISOString(),
    });
  },

  async getSyncQueueCount(): Promise<number> {
    return db.syncQueue.count();
  },

  // ==========================================
  // SYNC CONFLICT OPERATIONS
  // ==========================================

  async addSyncConflict(conflict: Omit<SyncConflict, 'id'>): Promise<string> {
    const id = crypto.randomUUID();
    await db.syncConflicts.put({ ...conflict, id });
    return id;
  },

  async getSyncConflicts(): Promise<SyncConflict[]> {
    return db.syncConflicts.filter((c) => !c.resolvedAt).toArray();
  },

  async resolveConflict(id: string, resolution: 'local' | 'server' | 'merged'): Promise<void> {
    await db.syncConflicts.update(id, {
      resolvedAt: new Date().toISOString(),
      resolution,
    });
  },

  // ==========================================
  // REFERENCE DATA OPERATIONS
  // ==========================================

  async cacheStaff(staff: Staff[]): Promise<void> {
    await db.staff.bulkPut(staff);
  },

  async getStaff(id: string): Promise<Staff | undefined> {
    return db.staff.get(id);
  },

  async getAllStaff(): Promise<Staff[]> {
    return db.staff.toArray();
  },

  async cacheHospital(hospital: Hospital): Promise<void> {
    await db.hospitals.put(hospital);
  },

  async cacheBranches(branches: Branch[]): Promise<void> {
    await db.branches.bulkPut(branches);
  },

  async cacheRoles(roles: Role[]): Promise<void> {
    await db.roles.bulkPut(roles);
  },

  // ==========================================
  // METADATA OPERATIONS
  // ==========================================

  async setMetadata(key: string, value: string): Promise<void> {
    await db.metadata.put({ key, value });
  },

  async getMetadata(key: string): Promise<string | undefined> {
    const item = await db.metadata.get(key);
    return item?.value;
  },

  async getLastSyncTime(): Promise<string | undefined> {
    return this.getMetadata('lastSyncAt');
  },

  async setLastSyncTime(time: string): Promise<void> {
    return this.setMetadata('lastSyncAt', time);
  },

  // ==========================================
  // DATABASE MANAGEMENT
  // ==========================================

  async clearAll(): Promise<void> {
    await Promise.all([
      db.patients.clear(),
      db.appointments.clear(),
      db.visits.clear(),
      db.prescriptions.clear(),
      db.labOrders.clear(),
      db.bills.clear(),
      db.syncQueue.clear(),
      db.syncConflicts.clear(),
      db.metadata.clear(),
    ]);
  },

  async clearSyncData(): Promise<void> {
    await Promise.all([
      db.syncQueue.clear(),
      db.syncConflicts.clear(),
    ]);
  },

  async getDatabaseSize(): Promise<number> {
    // Estimate database size
    const estimate = await navigator.storage?.estimate?.();
    return estimate?.usage || 0;
  },
};

export default db;
