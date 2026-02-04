import React, { useState, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '@/stores/auth.store';
import { useUIStore } from '@/stores/ui.store';
import { formatDate, formatCurrency, cn } from '@/utils';
import {
  Receipt,
  Search,
  Filter,
  Clock,
  User,
  Check,
  AlertCircle,
  CreditCard,
  Building2,
  Wallet,
  Eye,
  Printer,
  Download,
  ChevronDown,
  ChevronUp,
  Loader2,
  Plus,
  DollarSign,
  CheckCircle,
  XCircle,
  Send,
  FileText,
  TrendingUp,
  Banknote,
  RefreshCw,
} from 'lucide-react';

type InvoiceStatus = 'draft' | 'pending' | 'partial' | 'paid' | 'cancelled' | 'refunded';
type PaymentMethod = 'cash' | 'card' | 'transfer' | 'wallet' | 'hmo';
type ClaimStatus = 'submitted' | 'processing' | 'approved' | 'rejected' | 'paid';

interface InvoiceItem {
  id: string;
  description: string;
  category: 'consultation' | 'laboratory' | 'pharmacy' | 'radiology' | 'procedure' | 'room' | 'other';
  quantity: number;
  unitPrice: number;
  discount?: number;
}

interface Payment {
  id: string;
  amount: number;
  method: PaymentMethod;
  reference?: string;
  paidAt: string;
  paidBy: string;
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  patientId: string;
  patientName: string;
  rivhealId: string;
  visitId: string;
  items: InvoiceItem[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  amountPaid: number;
  balance: number;
  status: InvoiceStatus;
  payments: Payment[];
  hmoProvider?: string;
  hmoCoveragePercent?: number;
  hmoClaimId?: string;
  claimStatus?: ClaimStatus;
  createdAt: string;
  dueDate: string;
  notes?: string;
}

// Mock invoices
const mockInvoices: Invoice[] = [
  {
    id: '1',
    invoiceNumber: 'INV-2024-0001',
    patientId: '1',
    patientName: 'Chioma Okonkwo',
    rivhealId: 'RH-001234',
    visitId: 'V-001',
    items: [
      { id: '1', description: 'General Consultation', category: 'consultation', quantity: 1, unitPrice: 15000 },
      { id: '2', description: 'Complete Blood Count', category: 'laboratory', quantity: 1, unitPrice: 5000 },
      { id: '3', description: 'Paracetamol 500mg x30', category: 'pharmacy', quantity: 1, unitPrice: 1500 },
      { id: '4', description: 'Amoxicillin 500mg x21', category: 'pharmacy', quantity: 1, unitPrice: 3150 },
    ],
    subtotal: 24650,
    discount: 0,
    tax: 0,
    total: 24650,
    amountPaid: 24650,
    balance: 0,
    status: 'paid',
    payments: [
      { id: '1', amount: 24650, method: 'card', reference: 'TRX-789456', paidAt: '2024-01-25T11:00:00Z', paidBy: 'Patient' },
    ],
    createdAt: '2024-01-25T10:30:00Z',
    dueDate: '2024-01-25T23:59:59Z',
  },
  {
    id: '2',
    invoiceNumber: 'INV-2024-0002',
    patientId: '2',
    patientName: 'Emeka Nnamdi',
    rivhealId: 'RH-001235',
    visitId: 'V-002',
    items: [
      { id: '1', description: 'Cardiology Consultation', category: 'consultation', quantity: 1, unitPrice: 25000 },
      { id: '2', description: 'Lipid Profile', category: 'laboratory', quantity: 1, unitPrice: 8000 },
      { id: '3', description: 'ECG', category: 'procedure', quantity: 1, unitPrice: 10000 },
      { id: '4', description: 'Metformin 500mg x60', category: 'pharmacy', quantity: 1, unitPrice: 6000 },
      { id: '5', description: 'Lisinopril 10mg x30', category: 'pharmacy', quantity: 1, unitPrice: 6000 },
    ],
    subtotal: 55000,
    discount: 5500,
    tax: 0,
    total: 49500,
    amountPaid: 9900,
    balance: 39600,
    status: 'partial',
    payments: [
      { id: '1', amount: 9900, method: 'cash', paidAt: '2024-01-25T09:30:00Z', paidBy: 'Patient' },
    ],
    hmoProvider: 'Hygeia HMO',
    hmoCoveragePercent: 80,
    hmoClaimId: 'CLM-HYG-2024-001',
    claimStatus: 'processing',
    createdAt: '2024-01-25T09:00:00Z',
    dueDate: '2024-02-25T23:59:59Z',
    notes: 'HMO claim submitted for balance',
  },
  {
    id: '3',
    invoiceNumber: 'INV-2024-0003',
    patientId: '3',
    patientName: 'Fatima Ibrahim',
    rivhealId: 'RH-001236',
    visitId: 'V-003',
    items: [
      { id: '1', description: 'General Consultation', category: 'consultation', quantity: 1, unitPrice: 15000 },
      { id: '2', description: 'Fasting Blood Sugar', category: 'laboratory', quantity: 1, unitPrice: 3000 },
    ],
    subtotal: 18000,
    discount: 0,
    tax: 0,
    total: 18000,
    amountPaid: 0,
    balance: 18000,
    status: 'pending',
    payments: [],
    createdAt: '2024-01-25T11:30:00Z',
    dueDate: '2024-01-25T23:59:59Z',
  },
  {
    id: '4',
    invoiceNumber: 'INV-2024-0004',
    patientId: '4',
    patientName: 'Oluwaseun Adeleke',
    rivhealId: 'RH-001237',
    visitId: 'V-004',
    items: [
      { id: '1', description: 'Emergency Consultation', category: 'consultation', quantity: 1, unitPrice: 20000 },
      { id: '2', description: 'Malaria Rapid Test', category: 'laboratory', quantity: 1, unitPrice: 2500 },
      { id: '3', description: 'IV Artesunate', category: 'pharmacy', quantity: 3, unitPrice: 3500 },
    ],
    subtotal: 33000,
    discount: 0,
    tax: 0,
    total: 33000,
    amountPaid: 33000,
    balance: 0,
    status: 'paid',
    payments: [
      { id: '1', amount: 33000, method: 'transfer', reference: 'NIP-123456789', paidAt: '2024-01-25T12:00:00Z', paidBy: 'Family member' },
    ],
    createdAt: '2024-01-25T11:45:00Z',
    dueDate: '2024-01-25T23:59:59Z',
  },
];

const statusConfig: Record<InvoiceStatus, { label: string; color: string; icon: React.ElementType }> = {
  draft: { label: 'Draft', color: 'bg-gray-100 text-gray-700', icon: FileText },
  pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-700', icon: Clock },
  partial: { label: 'Partial', color: 'bg-orange-100 text-orange-700', icon: AlertCircle },
  paid: { label: 'Paid', color: 'bg-green-100 text-green-700', icon: CheckCircle },
  cancelled: { label: 'Cancelled', color: 'bg-gray-100 text-gray-700', icon: XCircle },
  refunded: { label: 'Refunded', color: 'bg-red-100 text-red-700', icon: RefreshCw },
};

const claimStatusConfig: Record<ClaimStatus, { label: string; color: string }> = {
  submitted: { label: 'Submitted', color: 'bg-blue-100 text-blue-700' },
  processing: { label: 'Processing', color: 'bg-purple-100 text-purple-700' },
  approved: { label: 'Approved', color: 'bg-green-100 text-green-700' },
  rejected: { label: 'Rejected', color: 'bg-red-100 text-red-700' },
  paid: { label: 'Paid', color: 'bg-teal-100 text-teal-700' },
};

const paymentMethodConfig: Record<PaymentMethod, { label: string; icon: React.ElementType }> = {
  cash: { label: 'Cash', icon: Banknote },
  card: { label: 'Card', icon: CreditCard },
  transfer: { label: 'Bank Transfer', icon: Building2 },
  wallet: { label: 'Wallet', icon: Wallet },
  hmo: { label: 'HMO', icon: Building2 },
};

const categoryLabels: Record<string, string> = {
  consultation: 'Consultation',
  laboratory: 'Laboratory',
  pharmacy: 'Pharmacy',
  radiology: 'Radiology',
  procedure: 'Procedure',
  room: 'Room/Bed',
  other: 'Other',
};

type TabView = 'invoices' | 'payments' | 'hmo_claims';

export const BillingPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const addToast = useUIStore((state) => state.addToast);
  const canEdit = useAuthStore((state) => state.canEdit);
  const canCreate = useAuthStore((state) => state.canCreate);

  // State
  const [activeTab, setActiveTab] = useState<TabView>('invoices');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<InvoiceStatus | ''>('');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [paymentReference, setPaymentReference] = useState('');

  // Filter invoices
  const filteredInvoices = useMemo(() => {
    return mockInvoices.filter((inv) => {
      const matchesSearch =
        !searchQuery ||
        inv.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inv.rivhealId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inv.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = !statusFilter || inv.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [searchQuery, statusFilter]);

  // HMO Claims
  const hmoClaims = useMemo(() => {
    return mockInvoices.filter((inv) => inv.hmoClaimId);
  }, []);

  // Stats
  const stats = useMemo(() => {
    const today = mockInvoices;
    const totalRevenue = today.filter((inv) => inv.status === 'paid').reduce((sum, inv) => sum + inv.total, 0);
    const pendingAmount = today.filter((inv) => ['pending', 'partial'].includes(inv.status)).reduce((sum, inv) => sum + inv.balance, 0);
    const hmoPending = today.filter((inv) => inv.claimStatus && inv.claimStatus !== 'paid').reduce((sum, inv) => sum + inv.balance, 0);

    return {
      totalRevenue,
      pendingAmount,
      hmoPending,
      invoiceCount: today.length,
      pendingCount: today.filter((inv) => inv.status === 'pending').length,
      partialCount: today.filter((inv) => inv.status === 'partial').length,
    };
  }, []);

  // Record payment
  const recordPayment = async () => {
    if (!selectedInvoice || !paymentAmount) return;

    setIsProcessing(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsProcessing(false);
    setShowPaymentModal(false);
    setSelectedInvoice(null);
    setPaymentAmount('');
    setPaymentReference('');
    addToast('success', 'Payment Recorded', `Payment of ${formatCurrency(parseFloat(paymentAmount))} has been recorded.`);
  };

  // Submit HMO claim
  const submitHMOClaim = async (invoice: Invoice) => {
    setIsProcessing(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsProcessing(false);
    addToast('success', 'Claim Submitted', `HMO claim for ${invoice.invoiceNumber} has been submitted.`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Billing & Payments</h1>
          <p className="text-gray-500">Manage invoices, payments, and HMO claims</p>
        </div>

        <div className="flex items-center gap-3">
          {/* Tab Toggle */}
          <div className="flex items-center bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setActiveTab('invoices')}
              className={cn(
                'flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition',
                activeTab === 'invoices' ? 'bg-white shadow text-gray-900' : 'text-gray-600 hover:text-gray-900'
              )}
            >
              <Receipt size={16} />
              Invoices
            </button>
            <button
              onClick={() => setActiveTab('hmo_claims')}
              className={cn(
                'flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition',
                activeTab === 'hmo_claims' ? 'bg-white shadow text-gray-900' : 'text-gray-600 hover:text-gray-900'
              )}
            >
              <Building2 size={16} />
              HMO Claims
            </button>
          </div>

          {canCreate('billing') && (
            <Link
              to="/billing/new"
              className="inline-flex items-center justify-center gap-2 bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition"
            >
              <Plus size={18} />
              New Invoice
            </Link>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <TrendingUp size={20} className="text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalRevenue)}</p>
              <p className="text-sm text-gray-500">Today's Revenue</p>
            </div>
          </div>
        </div>

        <div
          onClick={() => { setActiveTab('invoices'); setStatusFilter('pending'); }}
          className={cn(
            'bg-white rounded-xl border shadow-sm p-4 cursor-pointer transition hover:shadow-md',
            statusFilter === 'pending' ? 'border-yellow-500 ring-2 ring-yellow-200' : 'border-gray-100'
          )}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Clock size={20} className="text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.pendingAmount)}</p>
              <p className="text-sm text-gray-500">Pending ({stats.pendingCount})</p>
            </div>
          </div>
        </div>

        <div
          onClick={() => { setActiveTab('invoices'); setStatusFilter('partial'); }}
          className={cn(
            'bg-white rounded-xl border shadow-sm p-4 cursor-pointer transition hover:shadow-md',
            statusFilter === 'partial' ? 'border-orange-500 ring-2 ring-orange-200' : 'border-gray-100'
          )}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <AlertCircle size={20} className="text-orange-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.partialCount}</p>
              <p className="text-sm text-gray-500">Partial Payments</p>
            </div>
          </div>
        </div>

        <div
          onClick={() => setActiveTab('hmo_claims')}
          className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 cursor-pointer transition hover:shadow-md"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Building2 size={20} className="text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.hmoPending)}</p>
              <p className="text-sm text-gray-500">HMO Pending</p>
            </div>
          </div>
        </div>
      </div>

      {/* Invoices Tab */}
      {activeTab === 'invoices' && (
        <>
          {/* Filters */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Search by patient, ID, or invoice number..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                />
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as InvoiceStatus | '')}
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

          {/* Invoices Table */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Invoice</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Patient</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Items</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Total</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Paid</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Balance</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredInvoices.map((inv) => {
                    const status = statusConfig[inv.status];
                    const StatusIcon = status.icon;

                    return (
                      <tr key={inv.id} className="hover:bg-gray-50 transition">
                        <td className="px-4 py-3">
                          <p className="font-mono font-medium text-gray-900">{inv.invoiceNumber}</p>
                          <p className="text-xs text-gray-500">
                            {formatDate(inv.createdAt)}
                          </p>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-teal-600 rounded-full flex items-center justify-center text-white font-medium text-sm">
                              {inv.patientName.split(' ').map((n) => n[0]).join('')}
                            </div>
                            <div>
                              <Link to={`/patients/${inv.patientId}`} className="font-medium text-gray-900 hover:text-teal-600">
                                {inv.patientName}
                              </Link>
                              <p className="text-xs text-gray-500 font-mono">{inv.rivhealId}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <p className="font-medium text-gray-900">{inv.items.length} items</p>
                          <p className="text-xs text-gray-500 truncate max-w-[120px]">
                            {inv.items.map((i) => categoryLabels[i.category]).slice(0, 2).join(', ')}
                            {inv.items.length > 2 && '...'}
                          </p>
                        </td>
                        <td className="px-4 py-3">
                          <p className="font-bold text-gray-900">{formatCurrency(inv.total)}</p>
                          {inv.discount > 0 && (
                            <p className="text-xs text-green-600">-{formatCurrency(inv.discount)} disc.</p>
                          )}
                        </td>
                        <td className="px-4 py-3 text-green-600 font-medium">
                          {formatCurrency(inv.amountPaid)}
                        </td>
                        <td className="px-4 py-3">
                          <span className={cn(
                            'font-medium',
                            inv.balance > 0 ? 'text-red-600' : 'text-gray-400'
                          )}>
                            {formatCurrency(inv.balance)}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={cn('inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium', status.color)}>
                            <StatusIcon size={12} />
                            {status.label}
                          </span>
                          {inv.hmoProvider && (
                            <p className="text-xs text-purple-600 mt-1">{inv.hmoProvider}</p>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => {
                                setSelectedInvoice(inv);
                                setShowInvoiceModal(true);
                              }}
                              className="p-1.5 text-teal-600 hover:bg-teal-50 rounded transition"
                              title="View"
                            >
                              <Eye size={16} />
                            </button>

                            {['pending', 'partial'].includes(inv.status) && canEdit('billing') && (
                              <button
                                onClick={() => {
                                  setSelectedInvoice(inv);
                                  setPaymentAmount(inv.balance.toString());
                                  setShowPaymentModal(true);
                                }}
                                className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition flex items-center gap-1"
                              >
                                <DollarSign size={14} />
                                Pay
                              </button>
                            )}

                            <button className="p-1.5 text-gray-600 hover:bg-gray-100 rounded transition" title="Print">
                              <Printer size={16} />
                            </button>

                            <button className="p-1.5 text-gray-600 hover:bg-gray-100 rounded transition" title="Download PDF">
                              <Download size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {filteredInvoices.length === 0 && (
              <div className="p-12 text-center">
                <Receipt size={48} className="mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-1">No invoices</h3>
                <p className="text-gray-500">No invoices match your search criteria</p>
              </div>
            )}
          </div>
        </>
      )}

      {/* HMO Claims Tab */}
      {activeTab === 'hmo_claims' && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">HMO Claims</h2>
            <p className="text-sm text-gray-500">Track insurance claims and reimbursements</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Claim ID</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Invoice</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Patient</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">HMO Provider</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Claim Amount</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Coverage</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {hmoClaims.map((claim) => {
                  const claimStatus = claim.claimStatus ? claimStatusConfig[claim.claimStatus] : null;
                  const claimAmount = claim.total * ((claim.hmoCoveragePercent || 0) / 100);

                  return (
                    <tr key={claim.hmoClaimId} className="hover:bg-gray-50 transition">
                      <td className="px-4 py-3">
                        <p className="font-mono font-medium text-gray-900">{claim.hmoClaimId}</p>
                        <p className="text-xs text-gray-500">{formatDate(claim.createdAt)}</p>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => {
                            setSelectedInvoice(claim);
                            setShowInvoiceModal(true);
                          }}
                          className="font-mono text-teal-600 hover:underline"
                        >
                          {claim.invoiceNumber}
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-900">{claim.patientName}</p>
                        <p className="text-xs text-gray-500 font-mono">{claim.rivhealId}</p>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Building2 size={16} className="text-purple-500" />
                          <span className="font-medium text-gray-900">{claim.hmoProvider}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-bold text-gray-900">{formatCurrency(claimAmount)}</p>
                        <p className="text-xs text-gray-500">of {formatCurrency(claim.total)}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                          {claim.hmoCoveragePercent}%
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {claimStatus && (
                          <span className={cn('px-2 py-1 rounded-full text-xs font-medium', claimStatus.color)}>
                            {claimStatus.label}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          {claim.claimStatus === 'submitted' && (
                            <button className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition flex items-center gap-1">
                              <RefreshCw size={14} />
                              Follow Up
                            </button>
                          )}
                          {claim.claimStatus === 'approved' && (
                            <button className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition flex items-center gap-1">
                              <Check size={14} />
                              Mark Paid
                            </button>
                          )}
                          <button className="p-1.5 text-gray-600 hover:bg-gray-100 rounded transition" title="Download">
                            <Download size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {hmoClaims.length === 0 && (
            <div className="p-12 text-center">
              <Building2 size={48} className="mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-1">No HMO claims</h3>
              <p className="text-gray-500">No HMO claims have been submitted yet</p>
            </div>
          )}
        </div>
      )}

      {/* Invoice Detail Modal */}
      {showInvoiceModal && selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Invoice {selectedInvoice.invoiceNumber}</h2>
                <p className="text-sm text-gray-500">{formatDate(selectedInvoice.createdAt)}</p>
              </div>
              <button
                onClick={() => {
                  setShowInvoiceModal(false);
                  setSelectedInvoice(null);
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Patient Info */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm text-gray-500">Patient</p>
                  <p className="font-medium text-gray-900">{selectedInvoice.patientName}</p>
                  <p className="text-sm text-gray-500 font-mono">{selectedInvoice.rivhealId}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <span className={cn(
                    'inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium',
                    statusConfig[selectedInvoice.status].color
                  )}>
                    {statusConfig[selectedInvoice.status].label}
                  </span>
                </div>
              </div>

              {/* Invoice Items */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3">Invoice Items</h3>
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="text-left px-4 py-2 text-xs font-medium text-gray-500">Description</th>
                        <th className="text-left px-4 py-2 text-xs font-medium text-gray-500">Category</th>
                        <th className="text-left px-4 py-2 text-xs font-medium text-gray-500">Qty</th>
                        <th className="text-left px-4 py-2 text-xs font-medium text-gray-500">Price</th>
                        <th className="text-left px-4 py-2 text-xs font-medium text-gray-500">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {selectedInvoice.items.map((item) => (
                        <tr key={item.id}>
                          <td className="px-4 py-3 font-medium text-gray-900">{item.description}</td>
                          <td className="px-4 py-3">
                            <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs">
                              {categoryLabels[item.category]}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-gray-600">{item.quantity}</td>
                          <td className="px-4 py-3 text-gray-600">{formatCurrency(item.unitPrice)}</td>
                          <td className="px-4 py-3 font-medium text-gray-900">{formatCurrency(item.quantity * item.unitPrice)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-gray-50">
                      <tr>
                        <td colSpan={4} className="px-4 py-2 text-right text-gray-600">Subtotal:</td>
                        <td className="px-4 py-2 font-medium text-gray-900">{formatCurrency(selectedInvoice.subtotal)}</td>
                      </tr>
                      {selectedInvoice.discount > 0 && (
                        <tr>
                          <td colSpan={4} className="px-4 py-2 text-right text-green-600">Discount:</td>
                          <td className="px-4 py-2 font-medium text-green-600">-{formatCurrency(selectedInvoice.discount)}</td>
                        </tr>
                      )}
                      <tr className="border-t border-gray-200">
                        <td colSpan={4} className="px-4 py-3 text-right font-bold text-gray-900">Total:</td>
                        <td className="px-4 py-3 font-bold text-gray-900 text-lg">{formatCurrency(selectedInvoice.total)}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              {/* Payments History */}
              {selectedInvoice.payments.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Payment History</h3>
                  <div className="space-y-2">
                    {selectedInvoice.payments.map((payment) => {
                      const methodConfig = paymentMethodConfig[payment.method];
                      const MethodIcon = methodConfig.icon;
                      return (
                        <div key={payment.id} className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                          <div className="flex items-center gap-3">
                            <MethodIcon size={18} className="text-green-600" />
                            <div>
                              <p className="font-medium text-gray-900">{formatCurrency(payment.amount)}</p>
                              <p className="text-xs text-gray-500">
                                {methodConfig.label} • {formatDate(payment.paidAt)} • {payment.paidBy}
                              </p>
                            </div>
                          </div>
                          {payment.reference && (
                            <span className="text-xs font-mono text-gray-500">{payment.reference}</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Balance Due */}
              {selectedInvoice.balance > 0 && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center justify-between">
                  <div>
                    <p className="font-medium text-red-700">Balance Due</p>
                    <p className="text-sm text-red-600">Due by {formatDate(selectedInvoice.dueDate)}</p>
                  </div>
                  <p className="text-2xl font-bold text-red-700">{formatCurrency(selectedInvoice.balance)}</p>
                </div>
              )}

              {/* HMO Info */}
              {selectedInvoice.hmoProvider && (
                <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Building2 size={20} className="text-purple-600" />
                      <div>
                        <p className="font-medium text-purple-700">{selectedInvoice.hmoProvider}</p>
                        <p className="text-sm text-purple-600">
                          Coverage: {selectedInvoice.hmoCoveragePercent}% • Claim: {selectedInvoice.hmoClaimId}
                        </p>
                      </div>
                    </div>
                    {selectedInvoice.claimStatus && (
                      <span className={cn('px-2 py-1 rounded-full text-xs font-medium', claimStatusConfig[selectedInvoice.claimStatus].color)}>
                        {claimStatusConfig[selectedInvoice.claimStatus].label}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
              <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition">
                <Printer size={18} />
                Print
              </button>
              {['pending', 'partial'].includes(selectedInvoice.status) && (
                <button
                  onClick={() => {
                    setShowInvoiceModal(false);
                    setPaymentAmount(selectedInvoice.balance.toString());
                    setShowPaymentModal(true);
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition"
                >
                  <DollarSign size={18} />
                  Record Payment
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">Record Payment</h2>
              <p className="text-sm text-gray-500">{selectedInvoice.invoiceNumber} • Balance: {formatCurrency(selectedInvoice.balance)}</p>
            </div>

            <div className="p-6 space-y-4">
              {/* Amount */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₦</span>
                  <input
                    type="number"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                    placeholder="0.00"
                  />
                </div>
                {parseFloat(paymentAmount) > selectedInvoice.balance && (
                  <p className="text-sm text-orange-600 mt-1">Amount exceeds balance</p>
                )}
              </div>

              {/* Payment Method */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
                <div className="grid grid-cols-2 gap-2">
                  {(Object.entries(paymentMethodConfig) as [PaymentMethod, { label: string; icon: React.ElementType }][])
                    .filter(([key]) => key !== 'hmo')
                    .map(([key, { label, icon: Icon }]) => (
                      <button
                        key={key}
                        onClick={() => setPaymentMethod(key)}
                        className={cn(
                          'flex items-center gap-2 p-3 border rounded-lg transition',
                          paymentMethod === key
                            ? 'border-teal-500 bg-teal-50 text-teal-700'
                            : 'border-gray-200 hover:border-gray-300'
                        )}
                      >
                        <Icon size={18} />
                        <span className="text-sm font-medium">{label}</span>
                      </button>
                    ))}
                </div>
              </div>

              {/* Reference */}
              {['card', 'transfer'].includes(paymentMethod) && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Reference Number (Optional)
                  </label>
                  <input
                    type="text"
                    value={paymentReference}
                    onChange={(e) => setPaymentReference(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                    placeholder="Transaction reference"
                  />
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowPaymentModal(false);
                  setSelectedInvoice(null);
                  setPaymentAmount('');
                  setPaymentReference('');
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={recordPayment}
                disabled={!paymentAmount || parseFloat(paymentAmount) <= 0 || isProcessing}
                className="flex items-center gap-2 px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition disabled:opacity-50"
              >
                {isProcessing ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} />}
                Record Payment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BillingPage;
