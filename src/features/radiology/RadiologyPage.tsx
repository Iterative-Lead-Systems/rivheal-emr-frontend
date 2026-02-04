import React, { useState, useMemo } from 'react';
import { useAuthStore } from '@/stores/auth.store';
import { useUIStore } from '@/stores/ui.store';
import { formatDate, cn } from '@/utils';
import {
  Scan,
  Search,
  Plus,
  Eye,
  Download,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  FileText,
  Image,
  X,
  Calendar,
  Activity,
  Maximize2,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Layers,
} from 'lucide-react';

type OrderStatus = 'pending' | 'scheduled' | 'in_progress' | 'completed' | 'reported' | 'cancelled';
type ModalityType = 'xray' | 'ct' | 'mri' | 'ultrasound' | 'mammography' | 'fluoroscopy' | 'nuclear' | 'pet';
type UrgencyLevel = 'routine' | 'urgent' | 'stat';

interface ImagingOrder {
  id: string;
  orderNumber: string;
  patient: {
    id: string;
    name: string;
    rivhealId: string;
    age: number;
    gender: string;
  };
  orderingDoctor: string;
  department: string;
  modality: ModalityType;
  examType: string;
  bodyPart: string;
  clinicalIndication: string;
  urgency: UrgencyLevel;
  status: OrderStatus;
  scheduledDate?: string;
  scheduledTime?: string;
  technologist?: string;
  radiologist?: string;
  orderedAt: string;
  completedAt?: string;
  reportedAt?: string;
  images?: {
    id: string;
    type: string;
    thumbnail: string;
    studyId: string;
  }[];
  report?: {
    findings: string;
    impression: string;
    recommendations?: string;
    reportedBy: string;
    reportedAt: string;
  };
  notes?: string;
}

// Mock imaging orders
const mockOrders: ImagingOrder[] = [
  {
    id: '1',
    orderNumber: 'RAD-2024-001',
    patient: { id: '1', name: 'Chukwuemeka Obi', rivhealId: 'RH-PAT-0001', age: 45, gender: 'Male' },
    orderingDoctor: 'Dr. Adaeze Obi',
    department: 'General Medicine',
    modality: 'xray',
    examType: 'Chest X-Ray',
    bodyPart: 'Chest',
    clinicalIndication: 'Persistent cough, rule out pneumonia',
    urgency: 'routine',
    status: 'reported',
    scheduledDate: '2024-01-25',
    scheduledTime: '09:00',
    technologist: 'John Okafor',
    radiologist: 'Dr. Emeka Nwosu',
    orderedAt: '2024-01-24T14:00:00Z',
    completedAt: '2024-01-25T09:30:00Z',
    reportedAt: '2024-01-25T11:00:00Z',
    images: [
      { id: 'img1', type: 'PA View', thumbnail: '/images/chest-xray-thumb.jpg', studyId: 'STD-001' },
      { id: 'img2', type: 'Lateral View', thumbnail: '/images/chest-xray-lat-thumb.jpg', studyId: 'STD-001' },
    ],
    report: {
      findings: 'Bilateral lung fields are clear. No focal consolidation or effusion. Cardiac silhouette is within normal limits. Mediastinal contours are unremarkable. No pneumothorax.',
      impression: 'Normal chest radiograph. No evidence of pneumonia or other acute cardiopulmonary process.',
      recommendations: 'Clinical correlation recommended. Follow-up imaging if symptoms persist.',
      reportedBy: 'Dr. Emeka Nwosu',
      reportedAt: '2024-01-25T11:00:00Z',
    },
  },
  {
    id: '2',
    orderNumber: 'RAD-2024-002',
    patient: { id: '2', name: 'Fatima Mohammed', rivhealId: 'RH-PAT-0002', age: 35, gender: 'Female' },
    orderingDoctor: 'Dr. Chukwuemeka Okafor',
    department: 'Surgery',
    modality: 'ct',
    examType: 'CT Abdomen with Contrast',
    bodyPart: 'Abdomen',
    clinicalIndication: 'Post-cholecystectomy follow-up, abdominal pain',
    urgency: 'urgent',
    status: 'completed',
    scheduledDate: '2024-01-25',
    scheduledTime: '11:00',
    technologist: 'Blessing Eze',
    orderedAt: '2024-01-25T08:00:00Z',
    completedAt: '2024-01-25T11:45:00Z',
    images: [
      { id: 'img3', type: 'Axial Series', thumbnail: '/images/ct-abd-thumb.jpg', studyId: 'STD-002' },
    ],
    notes: 'Patient allergic to iodine - used non-ionic contrast',
  },
  {
    id: '3',
    orderNumber: 'RAD-2024-003',
    patient: { id: '3', name: 'Emmanuel Adeyemi', rivhealId: 'RH-PAT-0003', age: 58, gender: 'Male' },
    orderingDoctor: 'Dr. Chukwuemeka Okafor',
    department: 'Cardiology',
    modality: 'ct',
    examType: 'CT Coronary Angiography',
    bodyPart: 'Heart',
    clinicalIndication: 'Post-MI evaluation, assess coronary anatomy',
    urgency: 'stat',
    status: 'in_progress',
    scheduledDate: '2024-01-25',
    scheduledTime: '14:00',
    technologist: 'John Okafor',
    orderedAt: '2024-01-25T10:00:00Z',
  },
  {
    id: '4',
    orderNumber: 'RAD-2024-004',
    patient: { id: '4', name: 'Ngozi Eze', rivhealId: 'RH-PAT-0004', age: 42, gender: 'Female' },
    orderingDoctor: 'Dr. Amina Hassan',
    department: 'Orthopedics',
    modality: 'mri',
    examType: 'MRI Lumbar Spine',
    bodyPart: 'Spine',
    clinicalIndication: 'Chronic low back pain, radiculopathy',
    urgency: 'routine',
    status: 'scheduled',
    scheduledDate: '2024-01-26',
    scheduledTime: '10:00',
    orderedAt: '2024-01-25T09:00:00Z',
  },
  {
    id: '5',
    orderNumber: 'RAD-2024-005',
    patient: { id: '5', name: 'Blessing Adekunle', rivhealId: 'RH-PAT-0005', age: 28, gender: 'Female' },
    orderingDoctor: 'Dr. Amina Hassan',
    department: 'Obstetrics',
    modality: 'ultrasound',
    examType: 'Obstetric Ultrasound',
    bodyPart: 'Pelvis',
    clinicalIndication: 'Pregnancy dating, fetal assessment',
    urgency: 'routine',
    status: 'pending',
    orderedAt: '2024-01-25T11:00:00Z',
  },
];

const modalityConfig: Record<ModalityType, { label: string; color: string; icon: string }> = {
  xray: { label: 'X-Ray', color: 'bg-blue-100 text-blue-700', icon: '📷' },
  ct: { label: 'CT Scan', color: 'bg-purple-100 text-purple-700', icon: '🔬' },
  mri: { label: 'MRI', color: 'bg-indigo-100 text-indigo-700', icon: '🧲' },
  ultrasound: { label: 'Ultrasound', color: 'bg-teal-100 text-teal-700', icon: '📡' },
  mammography: { label: 'Mammography', color: 'bg-pink-100 text-pink-700', icon: '🩺' },
  fluoroscopy: { label: 'Fluoroscopy', color: 'bg-orange-100 text-orange-700', icon: '📹' },
  nuclear: { label: 'Nuclear Medicine', color: 'bg-yellow-100 text-yellow-700', icon: '☢️' },
  pet: { label: 'PET Scan', color: 'bg-red-100 text-red-700', icon: '🎯' },
};

const statusConfig: Record<OrderStatus, { label: string; color: string; icon: React.ElementType }> = {
  pending: { label: 'Pending', color: 'bg-gray-100 text-gray-700', icon: Clock },
  scheduled: { label: 'Scheduled', color: 'bg-blue-100 text-blue-700', icon: Calendar },
  in_progress: { label: 'In Progress', color: 'bg-yellow-100 text-yellow-700', icon: Activity },
  completed: { label: 'Completed', color: 'bg-teal-100 text-teal-700', icon: CheckCircle },
  reported: { label: 'Reported', color: 'bg-green-100 text-green-700', icon: FileText },
  cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-700', icon: XCircle },
};

const urgencyConfig: Record<UrgencyLevel, { label: string; color: string }> = {
  routine: { label: 'Routine', color: 'bg-gray-100 text-gray-600' },
  urgent: { label: 'Urgent', color: 'bg-orange-100 text-orange-700' },
  stat: { label: 'STAT', color: 'bg-red-100 text-red-700' },
};

type TabView = 'worklist' | 'schedule' | 'reports';

export const RadiologyPage: React.FC = () => {
  const addToast = useUIStore((state) => state.addToast);
  const canCreate = useAuthStore((state) => state.canCreate);
  const canEdit = useAuthStore((state) => state.canEdit);

  // State
  const [activeTab, setActiveTab] = useState<TabView>('worklist');
  const [searchQuery, setSearchQuery] = useState('');
  const [modalityFilter, setModalityFilter] = useState<ModalityType | ''>('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | ''>('');
  const [selectedOrder, setSelectedOrder] = useState<ImagingOrder | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showViewerModal, setShowViewerModal] = useState(false);

  // Stats
  const stats = useMemo(() => ({
    pending: mockOrders.filter(o => o.status === 'pending').length,
    scheduled: mockOrders.filter(o => o.status === 'scheduled').length,
    inProgress: mockOrders.filter(o => o.status === 'in_progress').length,
    awaitingReport: mockOrders.filter(o => o.status === 'completed').length,
    completedToday: mockOrders.filter(o => o.status === 'reported' && o.reportedAt?.startsWith('2024-01-25')).length,
    stat: mockOrders.filter(o => o.urgency === 'stat' && !['reported', 'cancelled'].includes(o.status)).length,
  }), []);

  // Filter orders
  const filteredOrders = useMemo(() => {
    return mockOrders.filter((order) => {
      const matchesSearch = !searchQuery ||
        order.patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.patient.rivhealId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.examType.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesModality = !modalityFilter || order.modality === modalityFilter;
      const matchesStatus = !statusFilter || order.status === statusFilter;
      return matchesSearch && matchesModality && matchesStatus;
    });
  }, [searchQuery, modalityFilter, statusFilter]);

  // Group by status for worklist
  const worklistOrders = useMemo(() => {
    const statOrders = filteredOrders.filter(o => o.urgency === 'stat' && !['reported', 'cancelled'].includes(o.status));
    const inProgress = filteredOrders.filter(o => o.status === 'in_progress' && o.urgency !== 'stat');
    const awaitingReport = filteredOrders.filter(o => o.status === 'completed');
    const scheduled = filteredOrders.filter(o => o.status === 'scheduled');
    const pending = filteredOrders.filter(o => o.status === 'pending');
    
    return { statOrders, inProgress, awaitingReport, scheduled, pending };
  }, [filteredOrders]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Radiology</h1>
          <p className="text-gray-500">Imaging orders, PACS viewer, and reports</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setActiveTab('worklist')}
              className={cn(
                'flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition',
                activeTab === 'worklist' ? 'bg-white shadow text-gray-900' : 'text-gray-600'
              )}
            >
              <Layers size={16} />
              Worklist
            </button>
            <button
              onClick={() => setActiveTab('schedule')}
              className={cn(
                'flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition',
                activeTab === 'schedule' ? 'bg-white shadow text-gray-900' : 'text-gray-600'
              )}
            >
              <Calendar size={16} />
              Schedule
            </button>
            <button
              onClick={() => setActiveTab('reports')}
              className={cn(
                'flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition',
                activeTab === 'reports' ? 'bg-white shadow text-gray-900' : 'text-gray-600'
              )}
            >
              <FileText size={16} />
              Reports
            </button>
          </div>

          {canCreate('radiology') && (
            <button className="inline-flex items-center gap-2 bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition">
              <Plus size={18} />
              New Order
            </button>
          )}
        </div>
      </div>

      {/* STAT Alert */}
      {stats.stat > 0 && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg flex items-center gap-3">
          <AlertTriangle className="text-red-500" size={24} />
          <div>
            <p className="font-semibold text-red-800">{stats.stat} STAT Order{stats.stat > 1 ? 's' : ''} Pending</p>
            <p className="text-sm text-red-600">Requires immediate attention</p>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <div
          onClick={() => setStatusFilter('pending')}
          className={cn(
            'bg-white rounded-xl border shadow-sm p-4 cursor-pointer transition hover:shadow-md',
            statusFilter === 'pending' ? 'border-gray-500 ring-2 ring-gray-200' : 'border-gray-100'
          )}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
              <Clock size={20} className="text-gray-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
              <p className="text-sm text-gray-500">Pending</p>
            </div>
          </div>
        </div>

        <div
          onClick={() => setStatusFilter('scheduled')}
          className={cn(
            'bg-white rounded-xl border shadow-sm p-4 cursor-pointer transition hover:shadow-md',
            statusFilter === 'scheduled' ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-100'
          )}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Calendar size={20} className="text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.scheduled}</p>
              <p className="text-sm text-gray-500">Scheduled</p>
            </div>
          </div>
        </div>

        <div
          onClick={() => setStatusFilter('in_progress')}
          className={cn(
            'bg-white rounded-xl border shadow-sm p-4 cursor-pointer transition hover:shadow-md',
            statusFilter === 'in_progress' ? 'border-yellow-500 ring-2 ring-yellow-200' : 'border-gray-100'
          )}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Activity size={20} className="text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.inProgress}</p>
              <p className="text-sm text-gray-500">In Progress</p>
            </div>
          </div>
        </div>

        <div
          onClick={() => setStatusFilter('completed')}
          className={cn(
            'bg-white rounded-xl border shadow-sm p-4 cursor-pointer transition hover:shadow-md',
            statusFilter === 'completed' ? 'border-teal-500 ring-2 ring-teal-200' : 'border-gray-100'
          )}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
              <Image size={20} className="text-teal-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.awaitingReport}</p>
              <p className="text-sm text-gray-500">Awaiting Report</p>
            </div>
          </div>
        </div>

        <div
          onClick={() => setStatusFilter('reported')}
          className={cn(
            'bg-white rounded-xl border shadow-sm p-4 cursor-pointer transition hover:shadow-md',
            statusFilter === 'reported' ? 'border-green-500 ring-2 ring-green-200' : 'border-gray-100'
          )}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle size={20} className="text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.completedToday}</p>
              <p className="text-sm text-gray-500">Reported Today</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-red-200 shadow-sm p-4 bg-red-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <AlertTriangle size={20} className="text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-red-600">{stats.stat}</p>
              <p className="text-sm text-red-600">STAT</p>
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
              placeholder="Search by patient, order #, or exam type..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
            />
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>

          <select
            value={modalityFilter}
            onChange={(e) => setModalityFilter(e.target.value as ModalityType | '')}
            className="px-3 py-2 border border-gray-300 rounded-lg"
          >
            <option value="">All Modalities</option>
            {Object.entries(modalityConfig).map(([key, { label }]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as OrderStatus | '')}
            className="px-3 py-2 border border-gray-300 rounded-lg"
          >
            <option value="">All Status</option>
            {Object.entries(statusConfig).map(([key, { label }]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>

          {(modalityFilter || statusFilter) && (
            <button
              onClick={() => { setModalityFilter(''); setStatusFilter(''); }}
              className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900"
            >
              Clear
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
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Order</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Patient</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Exam</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Modality</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Urgency</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Schedule</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredOrders.map((order) => {
                const modality = modalityConfig[order.modality];
                const status = statusConfig[order.status];
                const StatusIcon = status.icon;
                const urgency = urgencyConfig[order.urgency];

                return (
                  <tr key={order.id} className={cn(
                    'hover:bg-gray-50 transition',
                    order.urgency === 'stat' && !['reported', 'cancelled'].includes(order.status) && 'bg-red-50'
                  )}>
                    <td className="px-4 py-3">
                      <p className="font-mono font-medium text-gray-900">{order.orderNumber}</p>
                      <p className="text-xs text-gray-500">{formatDate(order.orderedAt)}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">{order.patient.name}</p>
                      <p className="text-xs text-gray-500">{order.patient.rivhealId} • {order.patient.age}y</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">{order.examType}</p>
                      <p className="text-xs text-gray-500">{order.bodyPart}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn('px-2 py-1 rounded text-xs font-medium', modality.color)}>
                        {modality.icon} {modality.label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn('px-2 py-1 rounded text-xs font-medium', urgency.color)}>
                        {urgency.label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {order.scheduledDate ? (
                        <>
                          <p className="text-gray-900">{formatDate(order.scheduledDate)}</p>
                          <p className="text-xs text-gray-500">{order.scheduledTime}</p>
                        </>
                      ) : (
                        <span className="text-gray-400">Not scheduled</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn('inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium', status.color)}>
                        <StatusIcon size={12} />
                        {status.label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => {
                            setSelectedOrder(order);
                            setShowDetailModal(true);
                          }}
                          className="p-1.5 text-teal-600 hover:bg-teal-50 rounded transition"
                          title="View Details"
                        >
                          <Eye size={16} />
                        </button>
                        
                        {order.images && order.images.length > 0 && (
                          <button
                            onClick={() => {
                              setSelectedOrder(order);
                              setShowViewerModal(true);
                            }}
                            className="p-1.5 text-purple-600 hover:bg-purple-50 rounded transition"
                            title="View Images"
                          >
                            <Image size={16} />
                          </button>
                        )}

                        {order.status === 'completed' && canEdit('radiology') && (
                          <button
                            onClick={() => {
                              setSelectedOrder(order);
                              setShowReportModal(true);
                            }}
                            className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200 transition"
                          >
                            Report
                          </button>
                        )}

                        {order.report && (
                          <button className="p-1.5 text-gray-600 hover:bg-gray-100 rounded transition" title="Download Report">
                            <Download size={16} />
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
            <Scan size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">No orders found</h3>
            <p className="text-gray-500">No imaging orders match your search criteria</p>
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      {showDetailModal && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Order Details</h2>
                <p className="text-sm text-gray-500">{selectedOrder.orderNumber}</p>
              </div>
              <button onClick={() => setShowDetailModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Patient & Order Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-3">Patient Information</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Name:</span>
                      <span className="font-medium">{selectedOrder.patient.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">RivHeal ID:</span>
                      <span className="font-mono">{selectedOrder.patient.rivhealId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Age/Gender:</span>
                      <span>{selectedOrder.patient.age}y, {selectedOrder.patient.gender}</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-teal-50 rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-3">Exam Details</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Modality:</span>
                      <span className={cn('px-2 py-0.5 rounded', modalityConfig[selectedOrder.modality].color)}>
                        {modalityConfig[selectedOrder.modality].label}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Exam:</span>
                      <span className="font-medium">{selectedOrder.examType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Body Part:</span>
                      <span>{selectedOrder.bodyPart}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Ordering Doctor:</span>
                      <span>{selectedOrder.orderingDoctor}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Clinical Indication */}
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-2">Clinical Indication</h3>
                <p className="text-gray-700">{selectedOrder.clinicalIndication}</p>
              </div>

              {/* Report */}
              {selectedOrder.report && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-3">Radiology Report</h3>
                  <div className="space-y-4 text-sm">
                    <div>
                      <p className="text-gray-500 font-medium mb-1">Findings:</p>
                      <p className="text-gray-700">{selectedOrder.report.findings}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 font-medium mb-1">Impression:</p>
                      <p className="text-gray-900 font-medium">{selectedOrder.report.impression}</p>
                    </div>
                    {selectedOrder.report.recommendations && (
                      <div>
                        <p className="text-gray-500 font-medium mb-1">Recommendations:</p>
                        <p className="text-gray-700">{selectedOrder.report.recommendations}</p>
                      </div>
                    )}
                    <div className="pt-2 border-t border-green-200 text-xs text-gray-500">
                      Reported by {selectedOrder.report.reportedBy} on {formatDate(selectedOrder.report.reportedAt)}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
              {selectedOrder.images && selectedOrder.images.length > 0 && (
                <button
                  onClick={() => {
                    setShowDetailModal(false);
                    setShowViewerModal(true);
                  }}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  <Maximize2 size={18} />
                  View Images
                </button>
              )}
              {selectedOrder.report && (
                <button className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700">
                  <Download size={18} />
                  Download Report
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Image Viewer Modal (PACS-like) */}
      {showViewerModal && selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black flex flex-col">
          <div className="flex items-center justify-between px-4 py-3 bg-gray-900">
            <div className="flex items-center gap-4">
              <h2 className="text-white font-semibold">{selectedOrder.patient.name} - {selectedOrder.examType}</h2>
              <span className="text-gray-400 text-sm">{selectedOrder.orderNumber}</span>
            </div>
            <div className="flex items-center gap-2">
              <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded">
                <ZoomIn size={20} />
              </button>
              <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded">
                <ZoomOut size={20} />
              </button>
              <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded">
                <RotateCw size={20} />
              </button>
              <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded">
                <Maximize2 size={20} />
              </button>
              <button
                onClick={() => setShowViewerModal(false)}
                className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded ml-4"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          <div className="flex-1 flex">
            {/* Thumbnail sidebar */}
            <div className="w-24 bg-gray-900 p-2 space-y-2 overflow-y-auto">
              {selectedOrder.images?.map((img, idx) => (
                <div
                  key={img.id}
                  className="aspect-square bg-gray-800 rounded border-2 border-teal-500 cursor-pointer flex items-center justify-center"
                >
                  <Image size={24} className="text-gray-600" />
                </div>
              ))}
            </div>

            {/* Main viewer */}
            <div className="flex-1 flex items-center justify-center bg-black">
              <div className="text-center">
                <div className="w-96 h-96 bg-gray-800 rounded-lg flex items-center justify-center mb-4">
                  <div className="text-center text-gray-500">
                    <Image size={64} className="mx-auto mb-2" />
                    <p>DICOM Viewer</p>
                    <p className="text-sm">(Integration with PACS required)</p>
                  </div>
                </div>
                <p className="text-gray-400 text-sm">
                  {selectedOrder.images?.[0]?.type || 'Image'} - Study ID: {selectedOrder.images?.[0]?.studyId}
                </p>
              </div>
            </div>

            {/* Info panel */}
            <div className="w-64 bg-gray-900 p-4 text-white text-sm">
              <h3 className="font-semibold mb-4">Study Information</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-gray-400">Patient</p>
                  <p>{selectedOrder.patient.name}</p>
                </div>
                <div>
                  <p className="text-gray-400">Exam</p>
                  <p>{selectedOrder.examType}</p>
                </div>
                <div>
                  <p className="text-gray-400">Date</p>
                  <p>{selectedOrder.completedAt ? formatDate(selectedOrder.completedAt) : '-'}</p>
                </div>
                <div>
                  <p className="text-gray-400">Technologist</p>
                  <p>{selectedOrder.technologist || '-'}</p>
                </div>
                <div>
                  <p className="text-gray-400">Images</p>
                  <p>{selectedOrder.images?.length || 0} series</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RadiologyPage;
