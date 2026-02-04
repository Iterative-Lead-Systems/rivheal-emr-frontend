import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '@/stores/auth.store';
import { useUIStore } from '@/stores/ui.store';
import { formatDate, formatCurrency, cn } from '@/utils';
import {
  Pill,
  Search,
  Clock,
  Check,
  AlertCircle,
  AlertTriangle,
  Package,
  Truck,
  Eye,
  Printer,
  RefreshCw,
  Loader2,
  ExternalLink,
  Ban,
  CheckCircle,
  XCircle,
} from 'lucide-react';

type PrescriptionStatus = 'pending' | 'processing' | 'dispensed' | 'partially_dispensed' | 'cancelled' | 'sent_to_pharmarun';
type StockLevel = 'in_stock' | 'low_stock' | 'out_of_stock';

interface PrescriptionItem {
  id: string;
  drugName: string;
  dosage: string;
  frequency: string;
  duration: string;
  quantity: number;
  unitPrice: number;
  stockLevel: StockLevel;
  stockQuantity: number;
  dispensed: boolean;
  dispensedQuantity?: number;
}

interface Prescription {
  id: string;
  patientId: string;
  patientName: string;
  rivhealId: string;
  doctorName: string;
  department: string;
  visitId: string;
  status: PrescriptionStatus;
  items: PrescriptionItem[];
  createdAt: string;
  dispensedAt?: string;
  dispensedBy?: string;
  notes?: string;
  pharmarunOrderId?: string;
}

// Mock prescriptions
const mockPrescriptions: Prescription[] = [
  {
    id: 'RX-001',
    patientId: '1',
    patientName: 'Chioma Okonkwo',
    rivhealId: 'RH-001234',
    doctorName: 'Dr. Adaeze Obi',
    department: 'General Medicine',
    visitId: 'V-001',
    status: 'pending',
    items: [
      {
        id: '1',
        drugName: 'Paracetamol 500mg',
        dosage: '2 tablets',
        frequency: 'Three times daily',
        duration: '5 days',
        quantity: 30,
        unitPrice: 50,
        stockLevel: 'in_stock',
        stockQuantity: 500,
        dispensed: false,
      },
      {
        id: '2',
        drugName: 'Amoxicillin 500mg',
        dosage: '1 capsule',
        frequency: 'Three times daily',
        duration: '7 days',
        quantity: 21,
        unitPrice: 150,
        stockLevel: 'low_stock',
        stockQuantity: 45,
        dispensed: false,
      },
    ],
    createdAt: '2024-01-25T10:30:00Z',
    notes: 'Take medications after meals',
  },
  {
    id: 'RX-002',
    patientId: '2',
    patientName: 'Emeka Nnamdi',
    rivhealId: 'RH-001235',
    doctorName: 'Dr. Adaeze Obi',
    department: 'General Medicine',
    visitId: 'V-002',
    status: 'processing',
    items: [
      {
        id: '1',
        drugName: 'Metformin 500mg',
        dosage: '1 tablet',
        frequency: 'Twice daily',
        duration: '30 days',
        quantity: 60,
        unitPrice: 100,
        stockLevel: 'in_stock',
        stockQuantity: 1000,
        dispensed: false,
      },
      {
        id: '2',
        drugName: 'Lisinopril 10mg',
        dosage: '1 tablet',
        frequency: 'Once daily',
        duration: '30 days',
        quantity: 30,
        unitPrice: 200,
        stockLevel: 'in_stock',
        stockQuantity: 200,
        dispensed: false,
      },
    ],
    createdAt: '2024-01-25T09:15:00Z',
  },
  {
    id: 'RX-003',
    patientId: '3',
    patientName: 'Fatima Ibrahim',
    rivhealId: 'RH-001236',
    doctorName: 'Dr. Chukwuemeka Okafor',
    department: 'Cardiology',
    visitId: 'V-003',
    status: 'dispensed',
    items: [
      {
        id: '1',
        drugName: 'Aspirin 75mg',
        dosage: '1 tablet',
        frequency: 'Once daily',
        duration: '30 days',
        quantity: 30,
        unitPrice: 80,
        stockLevel: 'in_stock',
        stockQuantity: 800,
        dispensed: true,
        dispensedQuantity: 30,
      },
      {
        id: '2',
        drugName: 'Atorvastatin 20mg',
        dosage: '1 tablet',
        frequency: 'At bedtime',
        duration: '30 days',
        quantity: 30,
        unitPrice: 250,
        stockLevel: 'in_stock',
        stockQuantity: 150,
        dispensed: true,
        dispensedQuantity: 30,
      },
    ],
    createdAt: '2024-01-25T08:00:00Z',
    dispensedAt: '2024-01-25T08:30:00Z',
    dispensedBy: 'Pharm. Ngozi Eze',
  },
  {
    id: 'RX-004',
    patientId: '4',
    patientName: 'Oluwaseun Adeleke',
    rivhealId: 'RH-001237',
    doctorName: 'Dr. Adaeze Obi',
    department: 'General Medicine',
    visitId: 'V-004',
    status: 'sent_to_pharmarun',
    items: [
      {
        id: '1',
        drugName: 'Insulin Glargine 100IU/mL',
        dosage: '20 units',
        frequency: 'Once daily',
        duration: '30 days',
        quantity: 3,
        unitPrice: 8500,
        stockLevel: 'out_of_stock',
        stockQuantity: 0,
        dispensed: false,
      },
    ],
    createdAt: '2024-01-25T11:00:00Z',
    pharmarunOrderId: 'PHR-78234',
    notes: 'Patient opted for home delivery via Pharmarun',
  },
];

// Mock inventory
const mockInventory = [
  { id: '1', name: 'Paracetamol 500mg', category: 'Analgesic', stock: 500, minStock: 100, unitPrice: 50, expiryDate: '2025-06-30' },
  { id: '2', name: 'Amoxicillin 500mg', category: 'Antibiotic', stock: 45, minStock: 100, unitPrice: 150, expiryDate: '2024-12-15' },
  { id: '3', name: 'Metformin 500mg', category: 'Antidiabetic', stock: 1000, minStock: 200, unitPrice: 100, expiryDate: '2025-03-20' },
  { id: '4', name: 'Lisinopril 10mg', category: 'Antihypertensive', stock: 200, minStock: 50, unitPrice: 200, expiryDate: '2025-08-10' },
  { id: '5', name: 'Aspirin 75mg', category: 'Antiplatelet', stock: 800, minStock: 200, unitPrice: 80, expiryDate: '2025-04-25' },
  { id: '6', name: 'Atorvastatin 20mg', category: 'Statin', stock: 150, minStock: 50, unitPrice: 250, expiryDate: '2025-07-15' },
  { id: '7', name: 'Omeprazole 20mg', category: 'PPI', stock: 300, minStock: 100, unitPrice: 120, expiryDate: '2025-02-28' },
  { id: '8', name: 'Insulin Glargine 100IU/mL', category: 'Antidiabetic', stock: 0, minStock: 20, unitPrice: 8500, expiryDate: '2024-06-30' },
];

const statusConfig: Record<PrescriptionStatus, { label: string; color: string; icon: React.ElementType }> = {
  pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-700', icon: Clock },
  processing: { label: 'Processing', color: 'bg-blue-100 text-blue-700', icon: RefreshCw },
  dispensed: { label: 'Dispensed', color: 'bg-green-100 text-green-700', icon: CheckCircle },
  partially_dispensed: { label: 'Partial', color: 'bg-orange-100 text-orange-700', icon: AlertCircle },
  cancelled: { label: 'Cancelled', color: 'bg-gray-100 text-gray-700', icon: XCircle },
  sent_to_pharmarun: { label: 'Pharmarun', color: 'bg-purple-100 text-purple-700', icon: Truck },
};

const stockLevelConfig: Record<StockLevel, { label: string; color: string }> = {
  in_stock: { label: 'In Stock', color: 'text-green-600' },
  low_stock: { label: 'Low Stock', color: 'text-orange-600' },
  out_of_stock: { label: 'Out of Stock', color: 'text-red-600' },
};

type TabView = 'prescriptions' | 'inventory';

export const PharmacyPage: React.FC = () => {
  const addToast = useUIStore((state) => state.addToast);
  const canEdit = useAuthStore((state) => state.canEdit);

  // State
  const [activeTab, setActiveTab] = useState<TabView>('prescriptions');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<PrescriptionStatus | ''>('');
  const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null);
  const [showDispenseModal, setShowDispenseModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [inventorySearch, setInventorySearch] = useState('');
  const [showLowStockOnly, setShowLowStockOnly] = useState(false);

  // Filter prescriptions
  const filteredPrescriptions = useMemo(() => {
    return mockPrescriptions.filter((rx) => {
      const matchesSearch =
        !searchQuery ||
        rx.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rx.rivhealId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rx.id.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = !statusFilter || rx.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [searchQuery, statusFilter]);

  // Filter inventory
  const filteredInventory = useMemo(() => {
    return mockInventory.filter((item) => {
      const matchesSearch =
        !inventorySearch ||
        item.name.toLowerCase().includes(inventorySearch.toLowerCase()) ||
        item.category.toLowerCase().includes(inventorySearch.toLowerCase());

      const matchesLowStock = !showLowStockOnly || item.stock <= item.minStock;

      return matchesSearch && matchesLowStock;
    });
  }, [inventorySearch, showLowStockOnly]);

  // Stats
  const stats = useMemo(() => ({
    pending: mockPrescriptions.filter((rx) => rx.status === 'pending').length,
    processing: mockPrescriptions.filter((rx) => rx.status === 'processing').length,
    dispensedToday: mockPrescriptions.filter((rx) => rx.status === 'dispensed').length,
    lowStockItems: mockInventory.filter((item) => item.stock <= item.minStock && item.stock > 0).length,
    outOfStockItems: mockInventory.filter((item) => item.stock === 0).length,
  }), []);

  // Calculate prescription total
  const calculateTotal = (items: PrescriptionItem[]) => {
    return items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  };

  // Dispense prescription
  const dispensePrescription = async () => {
    if (!selectedPrescription) return;

    setIsProcessing(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsProcessing(false);
    setShowDispenseModal(false);
    setSelectedPrescription(null);
    addToast('success', 'Prescription Dispensed', `Prescription ${selectedPrescription.id} has been dispensed successfully.`);
  };

  // Send to Pharmarun
  const sendToPharmarun = async (prescription: Prescription) => {
    setIsProcessing(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsProcessing(false);
    addToast('success', 'Sent to Pharmarun', `Prescription ${prescription.id} has been forwarded to Pharmarun for delivery.`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pharmacy</h1>
          <p className="text-gray-500">Dispense prescriptions and manage drug inventory</p>
        </div>

        {/* Tab Toggle */}
        <div className="flex items-center bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setActiveTab('prescriptions')}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition',
              activeTab === 'prescriptions' ? 'bg-white shadow text-gray-900' : 'text-gray-600 hover:text-gray-900'
            )}
          >
            <Pill size={18} />
            Prescriptions
          </button>
          <button
            onClick={() => setActiveTab('inventory')}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition',
              activeTab === 'inventory' ? 'bg-white shadow text-gray-900' : 'text-gray-600 hover:text-gray-900'
            )}
          >
            <Package size={18} />
            Inventory
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div
          onClick={() => { setActiveTab('prescriptions'); setStatusFilter('pending'); }}
          className={cn(
            'bg-white rounded-xl border shadow-sm p-4 cursor-pointer transition hover:shadow-md',
            statusFilter === 'pending' && activeTab === 'prescriptions' ? 'border-yellow-500 ring-2 ring-yellow-200' : 'border-gray-100'
          )}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Clock size={20} className="text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
              <p className="text-sm text-gray-500">Pending</p>
            </div>
          </div>
        </div>

        <div
          onClick={() => { setActiveTab('prescriptions'); setStatusFilter('processing'); }}
          className={cn(
            'bg-white rounded-xl border shadow-sm p-4 cursor-pointer transition hover:shadow-md',
            statusFilter === 'processing' && activeTab === 'prescriptions' ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-100'
          )}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <RefreshCw size={20} className="text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.processing}</p>
              <p className="text-sm text-gray-500">Processing</p>
            </div>
          </div>
        </div>

        <div
          onClick={() => { setActiveTab('prescriptions'); setStatusFilter('dispensed'); }}
          className={cn(
            'bg-white rounded-xl border shadow-sm p-4 cursor-pointer transition hover:shadow-md',
            statusFilter === 'dispensed' && activeTab === 'prescriptions' ? 'border-green-500 ring-2 ring-green-200' : 'border-gray-100'
          )}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle size={20} className="text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.dispensedToday}</p>
              <p className="text-sm text-gray-500">Dispensed Today</p>
            </div>
          </div>
        </div>

        <div
          onClick={() => { setActiveTab('inventory'); setShowLowStockOnly(true); }}
          className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 cursor-pointer transition hover:shadow-md"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <AlertTriangle size={20} className="text-orange-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.lowStockItems}</p>
              <p className="text-sm text-gray-500">Low Stock</p>
            </div>
          </div>
        </div>

        <div
          onClick={() => { setActiveTab('inventory'); setShowLowStockOnly(true); }}
          className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 cursor-pointer transition hover:shadow-md"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <Ban size={20} className="text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.outOfStockItems}</p>
              <p className="text-sm text-gray-500">Out of Stock</p>
            </div>
          </div>
        </div>
      </div>

      {/* Prescriptions Tab */}
      {activeTab === 'prescriptions' && (
        <>
          {/* Filters */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Search by patient, ID, or prescription..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                />
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as PrescriptionStatus | '')}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
              >
                <option value="">All Statuses</option>
                {Object.entries(statusConfig).map(([key, { label }]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>

              {statusFilter && (
                <button
                  onClick={() => setStatusFilter('')}
                  className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Prescriptions List */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Rx ID</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Patient</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Doctor</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Items</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Total</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredPrescriptions.map((rx) => {
                    const status = statusConfig[rx.status];
                    const StatusIcon = status.icon;
                    const hasStockIssue = rx.items.some((item) => item.stockLevel !== 'in_stock');

                    return (
                      <tr key={rx.id} className="hover:bg-gray-50 transition">
                        <td className="px-4 py-3">
                          <p className="font-mono font-medium text-gray-900">{rx.id}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(rx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-teal-600 rounded-full flex items-center justify-center text-white font-medium text-sm">
                              {rx.patientName.split(' ').map((n) => n[0]).join('')}
                            </div>
                            <div>
                              <Link to={`/patients/${rx.patientId}`} className="font-medium text-gray-900 hover:text-teal-600">
                                {rx.patientName}
                              </Link>
                              <p className="text-xs text-gray-500 font-mono">{rx.rivhealId}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-gray-900">{rx.doctorName}</p>
                          <p className="text-xs text-gray-500">{rx.department}</p>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-900">{rx.items.length} items</span>
                            {hasStockIssue && (
                              <AlertTriangle size={14} className="text-orange-500" />
                            )}
                          </div>
                          <p className="text-xs text-gray-500 truncate max-w-[150px]">
                            {rx.items.map((i) => i.drugName.split(' ')[0]).join(', ')}
                          </p>
                        </td>
                        <td className="px-4 py-3">
                          <p className="font-medium text-gray-900">{formatCurrency(calculateTotal(rx.items))}</p>
                        </td>
                        <td className="px-4 py-3">
                          <span className={cn('inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium', status.color)}>
                            <StatusIcon size={12} />
                            {status.label}
                          </span>
                          {rx.pharmarunOrderId && (
                            <p className="text-xs text-purple-600 mt-1 font-mono">
                              {rx.pharmarunOrderId}
                            </p>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => {
                                setSelectedPrescription(rx);
                                setShowDispenseModal(true);
                              }}
                              className="p-1.5 text-teal-600 hover:bg-teal-50 rounded transition"
                              title="View Details"
                            >
                              <Eye size={16} />
                            </button>

                            {rx.status === 'pending' && canEdit('pharmacy') && (
                              <>
                                <button
                                  onClick={() => {
                                    setSelectedPrescription(rx);
                                    setShowDispenseModal(true);
                                  }}
                                  className="px-3 py-1 text-sm bg-teal-100 text-teal-700 rounded-lg hover:bg-teal-200 transition"
                                >
                                  Dispense
                                </button>
                                {hasStockIssue && (
                                  <button
                                    onClick={() => sendToPharmarun(rx)}
                                    className="px-3 py-1 text-sm bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition flex items-center gap-1"
                                    title="Send to Pharmarun for delivery"
                                  >
                                    <Truck size={14} />
                                    Pharmarun
                                  </button>
                                )}
                              </>
                            )}

                            {rx.status === 'dispensed' && (
                              <button className="p-1.5 text-gray-600 hover:bg-gray-100 rounded transition" title="Print">
                                <Printer size={16} />
                              </button>
                            )}

                            {rx.status === 'sent_to_pharmarun' && (
                              <a
                                href={`https://pharmarun.com/track/${rx.pharmarunOrderId}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-3 py-1 text-sm bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition flex items-center gap-1"
                              >
                                Track
                                <ExternalLink size={12} />
                              </a>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {filteredPrescriptions.length === 0 && (
              <div className="p-12 text-center">
                <Pill size={48} className="mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-1">No prescriptions</h3>
                <p className="text-gray-500">No prescriptions match your search criteria</p>
              </div>
            )}
          </div>
        </>
      )}

      {/* Inventory Tab */}
      {activeTab === 'inventory' && (
        <>
          {/* Filters */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Search drugs by name or category..."
                  value={inventorySearch}
                  onChange={(e) => setInventorySearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                />
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showLowStockOnly}
                  onChange={(e) => setShowLowStockOnly(e.target.checked)}
                  className="rounded text-teal-600 focus:ring-teal-500"
                />
                <span className="text-sm text-gray-700">Show low stock only</span>
              </label>
            </div>
          </div>

          {/* Inventory Table */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Drug Name</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Category</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Stock</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Min Stock</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Unit Price</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Expiry</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredInventory.map((item) => {
                    const isLowStock = item.stock <= item.minStock && item.stock > 0;
                    const isOutOfStock = item.stock === 0;
                    const isExpiringSoon = new Date(item.expiryDate) <= new Date(Date.now() + 90 * 24 * 60 * 60 * 1000);

                    return (
                      <tr key={item.id} className={cn('hover:bg-gray-50 transition', isOutOfStock && 'bg-red-50')}>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
                              <Pill size={20} className="text-teal-600" />
                            </div>
                            <span className="font-medium text-gray-900">{item.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm">
                            {item.category}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={cn(
                            'font-bold',
                            isOutOfStock ? 'text-red-600' : isLowStock ? 'text-orange-600' : 'text-green-600'
                          )}>
                            {item.stock}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-500">{item.minStock}</td>
                        <td className="px-4 py-3 text-gray-900">{formatCurrency(item.unitPrice)}</td>
                        <td className="px-4 py-3">
                          <span className={cn(
                            'text-sm',
                            isExpiringSoon ? 'text-red-600 font-medium' : 'text-gray-500'
                          )}>
                            {formatDate(item.expiryDate)}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {isOutOfStock ? (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
                              <Ban size={12} />
                              Out of Stock
                            </span>
                          ) : isLowStock ? (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-medium">
                              <AlertTriangle size={12} />
                              Low Stock
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                              <CheckCircle size={12} />
                              In Stock
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {filteredInventory.length === 0 && (
              <div className="p-12 text-center">
                <Package size={48} className="mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-1">No drugs found</h3>
                <p className="text-gray-500">No drugs match your search criteria</p>
              </div>
            )}
          </div>
        </>
      )}

      {/* Dispense Modal */}
      {showDispenseModal && selectedPrescription && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Prescription Details</h2>
                <p className="text-sm text-gray-500">{selectedPrescription.id} • {selectedPrescription.patientName}</p>
              </div>
              <button
                onClick={() => {
                  setShowDispenseModal(false);
                  setSelectedPrescription(null);
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Patient & Doctor Info */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm text-gray-500">Patient</p>
                  <p className="font-medium text-gray-900">{selectedPrescription.patientName}</p>
                  <p className="text-sm text-gray-500 font-mono">{selectedPrescription.rivhealId}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Prescribed By</p>
                  <p className="font-medium text-gray-900">{selectedPrescription.doctorName}</p>
                  <p className="text-sm text-gray-500">{selectedPrescription.department}</p>
                </div>
              </div>

              {/* Prescription Items */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3">Prescribed Items</h3>
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="text-left px-4 py-2 text-xs font-medium text-gray-500">Drug</th>
                        <th className="text-left px-4 py-2 text-xs font-medium text-gray-500">Dosage</th>
                        <th className="text-left px-4 py-2 text-xs font-medium text-gray-500">Qty</th>
                        <th className="text-left px-4 py-2 text-xs font-medium text-gray-500">Price</th>
                        <th className="text-left px-4 py-2 text-xs font-medium text-gray-500">Stock</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {selectedPrescription.items.map((item) => (
                        <tr key={item.id}>
                          <td className="px-4 py-3">
                            <p className="font-medium text-gray-900">{item.drugName}</p>
                            <p className="text-xs text-gray-500">{item.frequency} for {item.duration}</p>
                          </td>
                          <td className="px-4 py-3 text-gray-600">{item.dosage}</td>
                          <td className="px-4 py-3 text-gray-900">{item.quantity}</td>
                          <td className="px-4 py-3 text-gray-900">{formatCurrency(item.quantity * item.unitPrice)}</td>
                          <td className="px-4 py-3">
                            <span className={cn('text-sm font-medium', stockLevelConfig[item.stockLevel].color)}>
                              {item.stockQuantity > 0 ? `${item.stockQuantity} units` : 'Out of stock'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="bg-gray-50">
                        <td colSpan={3} className="px-4 py-3 text-right font-medium text-gray-700">Total:</td>
                        <td colSpan={2} className="px-4 py-3 font-bold text-gray-900">
                          {formatCurrency(calculateTotal(selectedPrescription.items))}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              {/* Notes */}
              {selectedPrescription.notes && (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm font-medium text-yellow-700 mb-1">Special Instructions</p>
                  <p className="text-yellow-800">{selectedPrescription.notes}</p>
                </div>
              )}

              {/* Stock Warning */}
              {selectedPrescription.items.some((item) => item.stockLevel !== 'in_stock') && (
                <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg flex items-start gap-3">
                  <AlertTriangle size={20} className="text-orange-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-orange-700">Stock Issues Detected</p>
                    <p className="text-sm text-orange-600">
                      Some items are low in stock or unavailable. Consider sending to Pharmarun for home delivery.
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-gray-100 flex justify-between">
              <button
                onClick={() => sendToPharmarun(selectedPrescription)}
                disabled={isProcessing || selectedPrescription.status === 'dispensed'}
                className="flex items-center gap-2 px-4 py-2 border border-purple-300 text-purple-700 rounded-lg hover:bg-purple-50 transition disabled:opacity-50"
              >
                <Truck size={18} />
                Send to Pharmarun
              </button>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowDispenseModal(false);
                    setSelectedPrescription(null);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                {selectedPrescription.status !== 'dispensed' && selectedPrescription.status !== 'sent_to_pharmarun' && (
                  <button
                    onClick={dispensePrescription}
                    disabled={isProcessing}
                    className="flex items-center gap-2 px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition disabled:opacity-50"
                  >
                    {isProcessing ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} />}
                    Dispense
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PharmacyPage;
