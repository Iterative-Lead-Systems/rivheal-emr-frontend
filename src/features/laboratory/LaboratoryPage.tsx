import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '@/stores/auth.store';
import { useUIStore } from '@/stores/ui.store';
import { formatDate, cn } from '@/utils';
import {
  FlaskConical,
  Search,
  Filter,
  Clock,
  User,
  Check,
  AlertCircle,
  FileText,
  Printer,
  Eye,
  Edit,
  ChevronDown,
  ChevronUp,
  Loader2,
  TestTube,
  Droplets,
  Activity,
} from 'lucide-react';

type LabStatus = 'ordered' | 'sample_collected' | 'processing' | 'completed' | 'cancelled';
type Priority = 'routine' | 'urgent' | 'stat';

interface LabOrder {
  id: string;
  patientId: string;
  patientName: string;
  rivhealId: string;
  doctorName: string;
  department: string;
  testName: string;
  testCode: string;
  priority: Priority;
  status: LabStatus;
  orderedAt: string;
  collectedAt?: string;
  completedAt?: string;
  results?: {
    parameter: string;
    value: string;
    unit: string;
    referenceRange: string;
    flag?: 'low' | 'high' | 'critical';
  }[];
  notes?: string;
}

// Mock lab orders
const mockLabOrders: LabOrder[] = [
  {
    id: '1',
    patientId: '1',
    patientName: 'Chioma Okonkwo',
    rivhealId: 'RH-001234',
    doctorName: 'Dr. Adaeze Obi',
    department: 'General Medicine',
    testName: 'Complete Blood Count',
    testCode: 'CBC',
    priority: 'routine',
    status: 'completed',
    orderedAt: '2024-01-25T08:00:00Z',
    collectedAt: '2024-01-25T08:30:00Z',
    completedAt: '2024-01-25T10:00:00Z',
    results: [
      { parameter: 'Hemoglobin', value: '12.5', unit: 'g/dL', referenceRange: '12.0-16.0' },
      { parameter: 'WBC', value: '8.2', unit: 'x10³/µL', referenceRange: '4.0-11.0' },
      { parameter: 'Platelets', value: '180', unit: 'x10³/µL', referenceRange: '150-400' },
      { parameter: 'RBC', value: '4.5', unit: 'x10⁶/µL', referenceRange: '4.0-5.5' },
      { parameter: 'Hematocrit', value: '38', unit: '%', referenceRange: '36-46' },
    ],
  },
  {
    id: '2',
    patientId: '2',
    patientName: 'Emeka Nnamdi',
    rivhealId: 'RH-001235',
    doctorName: 'Dr. Adaeze Obi',
    department: 'General Medicine',
    testName: 'Fasting Blood Sugar',
    testCode: 'FBS',
    priority: 'urgent',
    status: 'processing',
    orderedAt: '2024-01-25T09:00:00Z',
    collectedAt: '2024-01-25T09:15:00Z',
  },
  {
    id: '3',
    patientId: '3',
    patientName: 'Fatima Ibrahim',
    rivhealId: 'RH-001236',
    doctorName: 'Dr. Chukwuemeka Okafor',
    department: 'Cardiology',
    testName: 'Lipid Profile',
    testCode: 'LIPID',
    priority: 'routine',
    status: 'sample_collected',
    orderedAt: '2024-01-25T10:00:00Z',
    collectedAt: '2024-01-25T10:30:00Z',
  },
  {
    id: '4',
    patientId: '4',
    patientName: 'Oluwaseun Adeleke',
    rivhealId: 'RH-001237',
    doctorName: 'Dr. Adaeze Obi',
    department: 'General Medicine',
    testName: 'Malaria Parasite',
    testCode: 'MP',
    priority: 'stat',
    status: 'ordered',
    orderedAt: '2024-01-25T11:00:00Z',
    notes: 'Patient presents with fever for 3 days',
  },
  {
    id: '5',
    patientId: '5',
    patientName: 'Ngozi Eze',
    rivhealId: 'RH-001238',
    doctorName: 'Dr. Adaeze Obi',
    department: 'General Medicine',
    testName: 'Liver Function Test',
    testCode: 'LFT',
    priority: 'routine',
    status: 'ordered',
    orderedAt: '2024-01-25T11:30:00Z',
  },
];

const statusConfig: Record<LabStatus, { label: string; color: string; icon: React.ElementType }> = {
  ordered: { label: 'Ordered', color: 'bg-blue-100 text-blue-700', icon: Clock },
  sample_collected: { label: 'Sample Collected', color: 'bg-yellow-100 text-yellow-700', icon: Droplets },
  processing: { label: 'Processing', color: 'bg-purple-100 text-purple-700', icon: Activity },
  completed: { label: 'Completed', color: 'bg-green-100 text-green-700', icon: Check },
  cancelled: { label: 'Cancelled', color: 'bg-gray-100 text-gray-700', icon: AlertCircle },
};

const priorityConfig: Record<Priority, { label: string; color: string }> = {
  routine: { label: 'Routine', color: 'bg-gray-100 text-gray-700' },
  urgent: { label: 'Urgent', color: 'bg-orange-100 text-orange-700' },
  stat: { label: 'STAT', color: 'bg-red-100 text-red-700' },
};

export const LaboratoryPage: React.FC = () => {
  const addToast = useUIStore((state) => state.addToast);
  const canEdit = useAuthStore((state) => state.canEdit);

  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<LabStatus | ''>('');
  const [priorityFilter, setPriorityFilter] = useState<Priority | ''>('');
  const [selectedOrder, setSelectedOrder] = useState<LabOrder | null>(null);
  const [showResultsModal, setShowResultsModal] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // Filter orders
  const filteredOrders = useMemo(() => {
    return mockLabOrders.filter((order) => {
      const matchesSearch =
        !searchQuery ||
        order.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.rivhealId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.testName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.testCode.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = !statusFilter || order.status === statusFilter;
      const matchesPriority = !priorityFilter || order.priority === priorityFilter;

      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [searchQuery, statusFilter, priorityFilter]);

  // Stats
  const stats = useMemo(() => ({
    ordered: mockLabOrders.filter((o) => o.status === 'ordered').length,
    sampleCollected: mockLabOrders.filter((o) => o.status === 'sample_collected').length,
    processing: mockLabOrders.filter((o) => o.status === 'processing').length,
    completed: mockLabOrders.filter((o) => o.status === 'completed').length,
  }), []);

  // Update status
  const updateStatus = async (orderId: string, newStatus: LabStatus) => {
    setIsUpdating(true);
    await new Promise((resolve) => setTimeout(resolve, 500));
    setIsUpdating(false);
    addToast('success', 'Status Updated', `Lab order status updated to ${statusConfig[newStatus].label}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Laboratory</h1>
          <p className="text-gray-500">Manage lab orders and test results</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div
          onClick={() => setStatusFilter('ordered')}
          className={cn(
            'bg-white rounded-xl border shadow-sm p-4 cursor-pointer transition hover:shadow-md',
            statusFilter === 'ordered' ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-100'
          )}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Clock size={20} className="text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.ordered}</p>
              <p className="text-sm text-gray-500">Pending Collection</p>
            </div>
          </div>
        </div>

        <div
          onClick={() => setStatusFilter('sample_collected')}
          className={cn(
            'bg-white rounded-xl border shadow-sm p-4 cursor-pointer transition hover:shadow-md',
            statusFilter === 'sample_collected' ? 'border-yellow-500 ring-2 ring-yellow-200' : 'border-gray-100'
          )}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Droplets size={20} className="text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.sampleCollected}</p>
              <p className="text-sm text-gray-500">Samples Collected</p>
            </div>
          </div>
        </div>

        <div
          onClick={() => setStatusFilter('processing')}
          className={cn(
            'bg-white rounded-xl border shadow-sm p-4 cursor-pointer transition hover:shadow-md',
            statusFilter === 'processing' ? 'border-purple-500 ring-2 ring-purple-200' : 'border-gray-100'
          )}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Activity size={20} className="text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.processing}</p>
              <p className="text-sm text-gray-500">Processing</p>
            </div>
          </div>
        </div>

        <div
          onClick={() => setStatusFilter('completed')}
          className={cn(
            'bg-white rounded-xl border shadow-sm p-4 cursor-pointer transition hover:shadow-md',
            statusFilter === 'completed' ? 'border-green-500 ring-2 ring-green-200' : 'border-gray-100'
          )}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Check size={20} className="text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.completed}</p>
              <p className="text-sm text-gray-500">Completed Today</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search by patient, ID, or test..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
            />
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as LabStatus | '')}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
          >
            <option value="">All Statuses</option>
            {Object.entries(statusConfig).map(([key, { label }]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value as Priority | '')}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
          >
            <option value="">All Priorities</option>
            {Object.entries(priorityConfig).map(([key, { label }]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>

          {(statusFilter || priorityFilter) && (
            <button
              onClick={() => {
                setStatusFilter('');
                setPriorityFilter('');
              }}
              className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900"
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Patient</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Test</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Ordered By</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Priority</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Time</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredOrders.map((order) => {
                const status = statusConfig[order.status];
                const priority = priorityConfig[order.priority];
                const StatusIcon = status.icon;

                return (
                  <tr key={order.id} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-teal-600 rounded-full flex items-center justify-center text-white font-medium text-sm">
                          {order.patientName.split(' ').map((n) => n[0]).join('')}
                        </div>
                        <div>
                          <Link to={`/patients/${order.patientId}`} className="font-medium text-gray-900 hover:text-teal-600">
                            {order.patientName}
                          </Link>
                          <p className="text-xs text-gray-500 font-mono">{order.rivhealId}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <TestTube size={16} className="text-gray-400" />
                        <div>
                          <p className="font-medium text-gray-900">{order.testName}</p>
                          <p className="text-xs text-gray-500 font-mono">{order.testCode}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-gray-900">{order.doctorName}</p>
                      <p className="text-xs text-gray-500">{order.department}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn('px-2 py-1 rounded-full text-xs font-medium uppercase', priority.color)}>
                        {priority.label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn('inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium', status.color)}>
                        <StatusIcon size={12} />
                        {status.label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm text-gray-900">
                        {new Date(order.orderedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatDate(order.orderedAt)}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        {order.status === 'ordered' && canEdit('laboratory') && (
                          <button
                            onClick={() => updateStatus(order.id, 'sample_collected')}
                            className="px-3 py-1 text-sm bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 transition"
                          >
                            Collect Sample
                          </button>
                        )}
                        {order.status === 'sample_collected' && canEdit('laboratory') && (
                          <button
                            onClick={() => updateStatus(order.id, 'processing')}
                            className="px-3 py-1 text-sm bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition"
                          >
                            Start Processing
                          </button>
                        )}
                        {order.status === 'processing' && canEdit('laboratory') && (
                          <button
                            onClick={() => {
                              setSelectedOrder(order);
                              setShowResultsModal(true);
                            }}
                            className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition"
                          >
                            Enter Results
                          </button>
                        )}
                        {order.status === 'completed' && order.results && (
                          <button
                            onClick={() => {
                              setSelectedOrder(order);
                              setShowResultsModal(true);
                            }}
                            className="p-1.5 text-teal-600 hover:bg-teal-50 rounded transition"
                            title="View Results"
                          >
                            <Eye size={16} />
                          </button>
                        )}
                        {order.status === 'completed' && (
                          <button
                            className="p-1.5 text-gray-600 hover:bg-gray-100 rounded transition"
                            title="Print"
                          >
                            <Printer size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredOrders.length === 0 && (
          <div className="p-12 text-center">
            <FlaskConical size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">No lab orders</h3>
            <p className="text-gray-500">No lab orders match your search criteria</p>
          </div>
        )}
      </div>

      {/* Results Modal */}
      {showResultsModal && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  {selectedOrder.status === 'completed' ? 'Lab Results' : 'Enter Lab Results'}
                </h2>
                <p className="text-sm text-gray-500">{selectedOrder.testName} - {selectedOrder.patientName}</p>
              </div>
              <button
                onClick={() => {
                  setShowResultsModal(false);
                  setSelectedOrder(null);
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                ✕
              </button>
            </div>

            <div className="p-6">
              {/* Patient Info */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Patient</p>
                    <p className="font-medium text-gray-900">{selectedOrder.patientName}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">RivHeal ID</p>
                    <p className="font-medium text-gray-900 font-mono">{selectedOrder.rivhealId}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Ordered By</p>
                    <p className="font-medium text-gray-900">{selectedOrder.doctorName}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Order Date</p>
                    <p className="font-medium text-gray-900">{formatDate(selectedOrder.orderedAt)}</p>
                  </div>
                </div>
              </div>

              {/* Results Table */}
              {selectedOrder.results ? (
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="text-left px-4 py-2 text-xs font-medium text-gray-500 uppercase">Parameter</th>
                        <th className="text-left px-4 py-2 text-xs font-medium text-gray-500 uppercase">Result</th>
                        <th className="text-left px-4 py-2 text-xs font-medium text-gray-500 uppercase">Unit</th>
                        <th className="text-left px-4 py-2 text-xs font-medium text-gray-500 uppercase">Reference</th>
                        <th className="text-left px-4 py-2 text-xs font-medium text-gray-500 uppercase">Flag</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {selectedOrder.results.map((result, i) => (
                        <tr key={i}>
                          <td className="px-4 py-3 font-medium text-gray-900">{result.parameter}</td>
                          <td className="px-4 py-3 text-gray-900">{result.value}</td>
                          <td className="px-4 py-3 text-gray-500">{result.unit}</td>
                          <td className="px-4 py-3 text-gray-500">{result.referenceRange}</td>
                          <td className="px-4 py-3">
                            {result.flag && (
                              <span className={cn(
                                'px-2 py-0.5 rounded text-xs font-medium',
                                result.flag === 'high' ? 'bg-red-100 text-red-700' :
                                result.flag === 'low' ? 'bg-blue-100 text-blue-700' :
                                'bg-red-200 text-red-800'
                              )}>
                                {result.flag.toUpperCase()}
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-sm text-gray-500">Enter results for {selectedOrder.testName}</p>
                  {/* Would have form fields for entering results here */}
                  <div className="p-8 border-2 border-dashed border-gray-200 rounded-lg text-center text-gray-500">
                    Result entry form would go here based on test type
                  </div>
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
              {selectedOrder.status === 'completed' && (
                <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition">
                  <Printer size={18} />
                  Print Report
                </button>
              )}
              <button
                onClick={() => {
                  setShowResultsModal(false);
                  setSelectedOrder(null);
                }}
                className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition"
              >
                {selectedOrder.status === 'completed' ? 'Close' : 'Save Results'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LaboratoryPage;
