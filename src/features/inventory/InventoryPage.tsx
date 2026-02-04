import React, { useState, useMemo } from 'react';
import { useAuthStore } from '@/stores/auth.store';
import { useUIStore } from '@/stores/ui.store';
import { formatDate, formatCurrency, cn } from '@/utils';
import {
  Package,
  Search,
  Filter,
  Plus,
  Eye,
  Edit2,
  Trash2,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Ban,
  TrendingDown,
  TrendingUp,
  Download,
  Upload,
  BarChart3,
  ShoppingCart,
  Truck,
  Calendar,
  Clock,
  Box,
  Syringe,
  Stethoscope,
  Shield,
  Loader2,
  X,
  ChevronDown,
  RefreshCw,
  FileText,
  QrCode,
} from 'lucide-react';

type StockStatus = 'in_stock' | 'low_stock' | 'out_of_stock' | 'expired' | 'expiring_soon';
type ItemCategory = 'consumable' | 'equipment' | 'ppe' | 'laboratory' | 'surgical' | 'diagnostic' | 'furniture' | 'other';
type MovementType = 'received' | 'dispensed' | 'transferred' | 'expired' | 'damaged' | 'adjustment';

interface InventoryItem {
  id: string;
  sku: string;
  name: string;
  description?: string;
  category: ItemCategory;
  unit: string;
  currentStock: number;
  minStock: number;
  maxStock: number;
  reorderPoint: number;
  unitCost: number;
  sellingPrice?: number;
  supplier?: string;
  location: string;
  expiryDate?: string;
  batchNumber?: string;
  lastRestocked?: string;
  lastUsed?: string;
  status: StockStatus;
  isActive: boolean;
}

interface StockMovement {
  id: string;
  itemId: string;
  itemName: string;
  type: MovementType;
  quantity: number;
  previousStock: number;
  newStock: number;
  reference?: string;
  performedBy: string;
  department?: string;
  notes?: string;
  timestamp: string;
}

interface PurchaseOrder {
  id: string;
  poNumber: string;
  supplier: string;
  items: {
    itemId: string;
    itemName: string;
    quantity: number;
    unitCost: number;
  }[];
  totalAmount: number;
  status: 'draft' | 'pending' | 'approved' | 'ordered' | 'partial' | 'received' | 'cancelled';
  createdBy: string;
  createdAt: string;
  expectedDelivery?: string;
}

// Mock inventory data
const mockInventory: InventoryItem[] = [
  {
    id: '1',
    sku: 'CON-GLV-001',
    name: 'Surgical Gloves (Latex) - Medium',
    category: 'ppe',
    unit: 'pairs',
    currentStock: 500,
    minStock: 200,
    maxStock: 1000,
    reorderPoint: 300,
    unitCost: 150,
    sellingPrice: 200,
    supplier: 'MedSupply Nigeria',
    location: 'Store A - Shelf 1',
    expiryDate: '2025-12-31',
    batchNumber: 'BTH-2024-001',
    lastRestocked: '2024-01-15',
    status: 'in_stock',
    isActive: true,
  },
  {
    id: '2',
    sku: 'CON-SYR-001',
    name: 'Disposable Syringes 5ml',
    category: 'consumable',
    unit: 'units',
    currentStock: 150,
    minStock: 300,
    maxStock: 1000,
    reorderPoint: 400,
    unitCost: 50,
    sellingPrice: 100,
    supplier: 'MedSupply Nigeria',
    location: 'Store A - Shelf 2',
    expiryDate: '2026-06-30',
    batchNumber: 'BTH-2024-002',
    lastRestocked: '2024-01-10',
    status: 'low_stock',
    isActive: true,
  },
  {
    id: '3',
    sku: 'CON-CTN-001',
    name: 'Cotton Wool Roll 500g',
    category: 'consumable',
    unit: 'rolls',
    currentStock: 0,
    minStock: 50,
    maxStock: 200,
    reorderPoint: 75,
    unitCost: 1500,
    sellingPrice: 2000,
    supplier: 'HealthCare Supplies Ltd',
    location: 'Store A - Shelf 3',
    lastRestocked: '2023-12-01',
    status: 'out_of_stock',
    isActive: true,
  },
  {
    id: '4',
    sku: 'EQP-BP-001',
    name: 'Digital Blood Pressure Monitor',
    category: 'equipment',
    unit: 'units',
    currentStock: 10,
    minStock: 5,
    maxStock: 20,
    reorderPoint: 8,
    unitCost: 25000,
    supplier: 'MedEquip Africa',
    location: 'Equipment Store - Bay 1',
    status: 'in_stock',
    isActive: true,
  },
  {
    id: '5',
    sku: 'LAB-TUB-001',
    name: 'Blood Collection Tubes (EDTA)',
    category: 'laboratory',
    unit: 'units',
    currentStock: 800,
    minStock: 200,
    maxStock: 1500,
    reorderPoint: 400,
    unitCost: 100,
    sellingPrice: 150,
    supplier: 'Lab Essentials Nigeria',
    location: 'Lab Store - Shelf 1',
    expiryDate: '2024-03-15',
    batchNumber: 'BTH-2023-089',
    lastRestocked: '2023-09-01',
    status: 'expiring_soon',
    isActive: true,
  },
  {
    id: '6',
    sku: 'SRG-SUT-001',
    name: 'Surgical Sutures (Vicryl 3-0)',
    category: 'surgical',
    unit: 'packs',
    currentStock: 75,
    minStock: 50,
    maxStock: 200,
    reorderPoint: 80,
    unitCost: 3500,
    sellingPrice: 5000,
    supplier: 'Surgical Supplies Co',
    location: 'Theatre Store - Shelf 1',
    expiryDate: '2025-08-30',
    batchNumber: 'BTH-2024-015',
    lastRestocked: '2024-01-05',
    status: 'low_stock',
    isActive: true,
  },
  {
    id: '7',
    sku: 'PPE-MSK-001',
    name: 'N95 Respirator Masks',
    category: 'ppe',
    unit: 'units',
    currentStock: 300,
    minStock: 100,
    maxStock: 500,
    reorderPoint: 150,
    unitCost: 500,
    sellingPrice: 800,
    supplier: 'SafetyFirst Nigeria',
    location: 'Store B - Shelf 1',
    expiryDate: '2025-10-31',
    batchNumber: 'BTH-2024-003',
    lastRestocked: '2024-01-20',
    status: 'in_stock',
    isActive: true,
  },
  {
    id: '8',
    sku: 'DGN-THR-001',
    name: 'Digital Thermometer',
    category: 'diagnostic',
    unit: 'units',
    currentStock: 25,
    minStock: 10,
    maxStock: 50,
    reorderPoint: 15,
    unitCost: 3000,
    supplier: 'MedEquip Africa',
    location: 'Equipment Store - Bay 2',
    status: 'in_stock',
    isActive: true,
  },
];

// Mock stock movements
const mockMovements: StockMovement[] = [
  {
    id: '1',
    itemId: '1',
    itemName: 'Surgical Gloves (Latex) - Medium',
    type: 'dispensed',
    quantity: 50,
    previousStock: 550,
    newStock: 500,
    performedBy: 'Blessing Okonkwo',
    department: 'Surgery',
    timestamp: '2024-01-25T10:30:00Z',
  },
  {
    id: '2',
    itemId: '2',
    itemName: 'Disposable Syringes 5ml',
    type: 'dispensed',
    quantity: 100,
    previousStock: 250,
    newStock: 150,
    performedBy: 'Ngozi Eze',
    department: 'Pharmacy',
    timestamp: '2024-01-25T09:15:00Z',
  },
  {
    id: '3',
    itemId: '7',
    itemName: 'N95 Respirator Masks',
    type: 'received',
    quantity: 200,
    previousStock: 100,
    newStock: 300,
    reference: 'PO-2024-005',
    performedBy: 'Admin User',
    timestamp: '2024-01-20T14:00:00Z',
  },
];

// Mock purchase orders
const mockPurchaseOrders: PurchaseOrder[] = [
  {
    id: '1',
    poNumber: 'PO-2024-006',
    supplier: 'MedSupply Nigeria',
    items: [
      { itemId: '2', itemName: 'Disposable Syringes 5ml', quantity: 500, unitCost: 50 },
      { itemId: '3', itemName: 'Cotton Wool Roll 500g', quantity: 100, unitCost: 1500 },
    ],
    totalAmount: 175000,
    status: 'pending',
    createdBy: 'Admin User',
    createdAt: '2024-01-25T08:00:00Z',
    expectedDelivery: '2024-02-01',
  },
  {
    id: '2',
    poNumber: 'PO-2024-005',
    supplier: 'SafetyFirst Nigeria',
    items: [
      { itemId: '7', itemName: 'N95 Respirator Masks', quantity: 200, unitCost: 500 },
    ],
    totalAmount: 100000,
    status: 'received',
    createdBy: 'Admin User',
    createdAt: '2024-01-18T10:00:00Z',
    expectedDelivery: '2024-01-20',
  },
];

const categoryConfig: Record<ItemCategory, { label: string; color: string; icon: React.ElementType }> = {
  consumable: { label: 'Consumable', color: 'bg-blue-100 text-blue-700', icon: Box },
  equipment: { label: 'Equipment', color: 'bg-purple-100 text-purple-700', icon: Stethoscope },
  ppe: { label: 'PPE', color: 'bg-orange-100 text-orange-700', icon: Shield },
  laboratory: { label: 'Laboratory', color: 'bg-teal-100 text-teal-700', icon: Syringe },
  surgical: { label: 'Surgical', color: 'bg-red-100 text-red-700', icon: Package },
  diagnostic: { label: 'Diagnostic', color: 'bg-indigo-100 text-indigo-700', icon: BarChart3 },
  furniture: { label: 'Furniture', color: 'bg-gray-100 text-gray-700', icon: Package },
  other: { label: 'Other', color: 'bg-gray-100 text-gray-600', icon: Package },
};

const statusConfig: Record<StockStatus, { label: string; color: string; icon: React.ElementType }> = {
  in_stock: { label: 'In Stock', color: 'bg-green-100 text-green-700', icon: CheckCircle },
  low_stock: { label: 'Low Stock', color: 'bg-orange-100 text-orange-700', icon: AlertTriangle },
  out_of_stock: { label: 'Out of Stock', color: 'bg-red-100 text-red-700', icon: Ban },
  expired: { label: 'Expired', color: 'bg-gray-100 text-gray-700', icon: XCircle },
  expiring_soon: { label: 'Expiring Soon', color: 'bg-yellow-100 text-yellow-700', icon: Clock },
};

const movementTypeConfig: Record<MovementType, { label: string; color: string; sign: '+' | '-' }> = {
  received: { label: 'Received', color: 'text-green-600', sign: '+' },
  dispensed: { label: 'Dispensed', color: 'text-red-600', sign: '-' },
  transferred: { label: 'Transferred', color: 'text-blue-600', sign: '-' },
  expired: { label: 'Expired', color: 'text-gray-600', sign: '-' },
  damaged: { label: 'Damaged', color: 'text-orange-600', sign: '-' },
  adjustment: { label: 'Adjustment', color: 'text-purple-600', sign: '+' },
};

type TabView = 'inventory' | 'movements' | 'purchase_orders';

export const InventoryPage: React.FC = () => {
  const addToast = useUIStore((state) => state.addToast);
  const canCreate = useAuthStore((state) => state.canCreate);
  const canEdit = useAuthStore((state) => state.canEdit);

  // State
  const [activeTab, setActiveTab] = useState<TabView>('inventory');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<ItemCategory | ''>('');
  const [statusFilter, setStatusFilter] = useState<StockStatus | ''>('');
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showDispenseModal, setShowDispenseModal] = useState(false);
  const [dispenseQuantity, setDispenseQuantity] = useState('');
  const [dispenseDepartment, setDispenseDepartment] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Filter inventory
  const filteredInventory = useMemo(() => {
    return mockInventory.filter((item) => {
      const matchesSearch =
        !searchQuery ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.sku.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory = !categoryFilter || item.category === categoryFilter;
      const matchesStatus = !statusFilter || item.status === statusFilter;

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [searchQuery, categoryFilter, statusFilter]);

  // Stats
  const stats = useMemo(() => {
    const totalValue = mockInventory.reduce((sum, item) => sum + (item.currentStock * item.unitCost), 0);
    const lowStockItems = mockInventory.filter((item) => item.status === 'low_stock').length;
    const outOfStockItems = mockInventory.filter((item) => item.status === 'out_of_stock').length;
    const expiringItems = mockInventory.filter((item) => 
      item.status === 'expiring_soon' || item.status === 'expired'
    ).length;
    const pendingOrders = mockPurchaseOrders.filter((po) => 
      ['pending', 'approved', 'ordered'].includes(po.status)
    ).length;

    return {
      totalItems: mockInventory.length,
      totalValue,
      lowStockItems,
      outOfStockItems,
      expiringItems,
      pendingOrders,
    };
  }, []);

  // Dispense item
  const dispenseItem = async () => {
    if (!selectedItem || !dispenseQuantity || !dispenseDepartment) return;

    setIsProcessing(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsProcessing(false);
    setShowDispenseModal(false);
    setSelectedItem(null);
    setDispenseQuantity('');
    setDispenseDepartment('');
    addToast('success', 'Item Dispensed', `${dispenseQuantity} units of ${selectedItem.name} dispensed to ${dispenseDepartment}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inventory Management</h1>
          <p className="text-gray-500">Manage hospital supplies, equipment, and consumables</p>
        </div>

        <div className="flex items-center gap-3">
          {/* Tab Toggle */}
          <div className="flex items-center bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setActiveTab('inventory')}
              className={cn(
                'flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition',
                activeTab === 'inventory' ? 'bg-white shadow text-gray-900' : 'text-gray-600 hover:text-gray-900'
              )}
            >
              <Package size={16} />
              Stock
            </button>
            <button
              onClick={() => setActiveTab('movements')}
              className={cn(
                'flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition',
                activeTab === 'movements' ? 'bg-white shadow text-gray-900' : 'text-gray-600 hover:text-gray-900'
              )}
            >
              <RefreshCw size={16} />
              Movements
            </button>
            <button
              onClick={() => setActiveTab('purchase_orders')}
              className={cn(
                'flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition',
                activeTab === 'purchase_orders' ? 'bg-white shadow text-gray-900' : 'text-gray-600 hover:text-gray-900'
              )}
            >
              <ShoppingCart size={16} />
              Orders
            </button>
          </div>

          {canCreate('inventory') && (
            <button className="inline-flex items-center justify-center gap-2 bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition">
              <Plus size={18} />
              Add Item
            </button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
              <Package size={20} className="text-gray-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.totalItems}</p>
              <p className="text-sm text-gray-500">Total Items</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <TrendingUp size={20} className="text-green-600" />
            </div>
            <div>
              <p className="text-lg font-bold text-gray-900">{formatCurrency(stats.totalValue)}</p>
              <p className="text-sm text-gray-500">Stock Value</p>
            </div>
          </div>
        </div>

        <div
          onClick={() => { setActiveTab('inventory'); setStatusFilter('low_stock'); }}
          className={cn(
            'bg-white rounded-xl border shadow-sm p-4 cursor-pointer transition hover:shadow-md',
            statusFilter === 'low_stock' ? 'border-orange-500 ring-2 ring-orange-200' : 'border-gray-100'
          )}
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
          onClick={() => { setActiveTab('inventory'); setStatusFilter('out_of_stock'); }}
          className={cn(
            'bg-white rounded-xl border shadow-sm p-4 cursor-pointer transition hover:shadow-md',
            statusFilter === 'out_of_stock' ? 'border-red-500 ring-2 ring-red-200' : 'border-gray-100'
          )}
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

        <div
          onClick={() => { setActiveTab('inventory'); setStatusFilter('expiring_soon'); }}
          className={cn(
            'bg-white rounded-xl border shadow-sm p-4 cursor-pointer transition hover:shadow-md',
            statusFilter === 'expiring_soon' ? 'border-yellow-500 ring-2 ring-yellow-200' : 'border-gray-100'
          )}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Clock size={20} className="text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.expiringItems}</p>
              <p className="text-sm text-gray-500">Expiring</p>
            </div>
          </div>
        </div>

        <div
          onClick={() => setActiveTab('purchase_orders')}
          className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 cursor-pointer transition hover:shadow-md"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Truck size={20} className="text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.pendingOrders}</p>
              <p className="text-sm text-gray-500">Pending PO</p>
            </div>
          </div>
        </div>
      </div>

      {/* Inventory Tab */}
      {activeTab === 'inventory' && (
        <>
          {/* Filters */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Search by name or SKU..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                />
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>

              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value as ItemCategory | '')}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
              >
                <option value="">All Categories</option>
                {Object.entries(categoryConfig).map(([key, { label }]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as StockStatus | '')}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
              >
                <option value="">All Statuses</option>
                {Object.entries(statusConfig).map(([key, { label }]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>

              {(categoryFilter || statusFilter) && (
                <button
                  onClick={() => {
                    setCategoryFilter('');
                    setStatusFilter('');
                  }}
                  className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Inventory Table */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Item</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Category</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Stock</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Value</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Location</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Expiry</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredInventory.map((item) => {
                    const status = statusConfig[item.status];
                    const StatusIcon = status.icon;
                    const category = categoryConfig[item.category];
                    const CategoryIcon = category.icon;
                    const stockPercent = (item.currentStock / item.maxStock) * 100;

                    return (
                      <tr key={item.id} className={cn('hover:bg-gray-50 transition', item.status === 'out_of_stock' && 'bg-red-50')}>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center', category.color)}>
                              <CategoryIcon size={18} />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{item.name}</p>
                              <p className="text-xs text-gray-500 font-mono">{item.sku}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={cn('px-2 py-1 rounded-full text-xs font-medium', category.color)}>
                            {category.label}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="w-32">
                            <div className="flex justify-between text-sm mb-1">
                              <span className={cn(
                                'font-bold',
                                item.currentStock === 0 ? 'text-red-600' : 
                                item.currentStock <= item.minStock ? 'text-orange-600' : 'text-gray-900'
                              )}>
                                {item.currentStock}
                              </span>
                              <span className="text-gray-400">/ {item.maxStock} {item.unit}</span>
                            </div>
                            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className={cn(
                                  'h-full rounded-full transition-all',
                                  stockPercent > 50 ? 'bg-green-500' :
                                  stockPercent > 25 ? 'bg-orange-500' : 'bg-red-500'
                                )}
                                style={{ width: `${Math.min(stockPercent, 100)}%` }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <p className="font-medium text-gray-900">{formatCurrency(item.currentStock * item.unitCost)}</p>
                          <p className="text-xs text-gray-500">{formatCurrency(item.unitCost)}/unit</p>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-sm text-gray-700">{item.location}</p>
                          {item.batchNumber && (
                            <p className="text-xs text-gray-500">Batch: {item.batchNumber}</p>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {item.expiryDate ? (
                            <span className={cn(
                              'text-sm',
                              new Date(item.expiryDate) < new Date() ? 'text-red-600 font-medium' :
                              new Date(item.expiryDate) < new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) ? 'text-yellow-600' :
                              'text-gray-500'
                            )}>
                              {formatDate(item.expiryDate)}
                            </span>
                          ) : (
                            <span className="text-gray-400 text-sm">N/A</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <span className={cn('inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium', status.color)}>
                            <StatusIcon size={12} />
                            {status.label}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => {
                                setSelectedItem(item);
                                setShowDetailModal(true);
                              }}
                              className="p-1.5 text-teal-600 hover:bg-teal-50 rounded transition"
                              title="View"
                            >
                              <Eye size={16} />
                            </button>
                            {item.currentStock > 0 && canEdit('inventory') && (
                              <button
                                onClick={() => {
                                  setSelectedItem(item);
                                  setShowDispenseModal(true);
                                }}
                                className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition"
                              >
                                Dispense
                              </button>
                            )}
                            {item.currentStock <= item.reorderPoint && (
                              <button className="px-2 py-1 text-xs bg-orange-100 text-orange-700 rounded hover:bg-orange-200 transition">
                                Reorder
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

            {filteredInventory.length === 0 && (
              <div className="p-12 text-center">
                <Package size={48} className="mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-1">No items found</h3>
                <p className="text-gray-500">No inventory items match your search criteria</p>
              </div>
            )}
          </div>
        </>
      )}

      {/* Movements Tab */}
      {activeTab === 'movements' && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Stock Movements</h2>
            <p className="text-sm text-gray-500">Track all inventory transactions</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Date/Time</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Item</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Quantity</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Stock Change</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Department</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">By</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {mockMovements.map((movement) => {
                  const config = movementTypeConfig[movement.type];
                  return (
                    <tr key={movement.id} className="hover:bg-gray-50 transition">
                      <td className="px-4 py-3">
                        <p className="text-gray-900">{formatDate(movement.timestamp)}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(movement.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-900">{movement.itemName}</p>
                        {movement.reference && (
                          <p className="text-xs text-gray-500 font-mono">{movement.reference}</p>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className={cn('font-medium', config.color)}>
                          {config.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={cn('font-bold', config.color)}>
                          {config.sign}{movement.quantity}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-gray-500">{movement.previousStock}</span>
                          <span className="text-gray-400">→</span>
                          <span className="font-medium text-gray-900">{movement.newStock}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {movement.department || '-'}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {movement.performedBy}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Purchase Orders Tab */}
      {activeTab === 'purchase_orders' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="font-semibold text-gray-900">Purchase Orders</h2>
            {canCreate('inventory') && (
              <button className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition">
                <Plus size={18} />
                New PO
              </button>
            )}
          </div>

          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">PO Number</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Supplier</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Items</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Total</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Expected</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {mockPurchaseOrders.map((po) => (
                    <tr key={po.id} className="hover:bg-gray-50 transition">
                      <td className="px-4 py-3">
                        <p className="font-mono font-medium text-gray-900">{po.poNumber}</p>
                        <p className="text-xs text-gray-500">{formatDate(po.createdAt)}</p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-900">{po.supplier}</p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-gray-900">{po.items.length} items</p>
                        <p className="text-xs text-gray-500 truncate max-w-[150px]">
                          {po.items.map((i) => i.itemName.split(' ')[0]).join(', ')}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-bold text-gray-900">{formatCurrency(po.totalAmount)}</p>
                      </td>
                      <td className="px-4 py-3">
                        {po.expectedDelivery ? formatDate(po.expectedDelivery) : '-'}
                      </td>
                      <td className="px-4 py-3">
                        <span className={cn(
                          'px-2 py-1 rounded-full text-xs font-medium',
                          po.status === 'received' ? 'bg-green-100 text-green-700' :
                          po.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                          po.status === 'approved' ? 'bg-blue-100 text-blue-700' :
                          po.status === 'ordered' ? 'bg-purple-100 text-purple-700' :
                          'bg-gray-100 text-gray-700'
                        )}>
                          {po.status.charAt(0).toUpperCase() + po.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button className="p-1.5 text-teal-600 hover:bg-teal-50 rounded transition">
                            <Eye size={16} />
                          </button>
                          {po.status === 'pending' && (
                            <button className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200 transition">
                              Approve
                            </button>
                          )}
                          {po.status === 'ordered' && (
                            <button className="px-2 py-1 text-xs bg-teal-100 text-teal-700 rounded hover:bg-teal-200 transition">
                              Receive
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Dispense Modal */}
      {showDispenseModal && selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">Dispense Item</h2>
              <p className="text-sm text-gray-500">{selectedItem.name}</p>
            </div>

            <div className="p-6 space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex justify-between">
                  <span className="text-gray-600">Current Stock:</span>
                  <span className="font-bold text-gray-900">{selectedItem.currentStock} {selectedItem.unit}</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                <input
                  type="number"
                  value={dispenseQuantity}
                  onChange={(e) => setDispenseQuantity(e.target.value)}
                  max={selectedItem.currentStock}
                  min={1}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                  placeholder="Enter quantity"
                />
                {parseInt(dispenseQuantity) > selectedItem.currentStock && (
                  <p className="text-sm text-red-600 mt-1">Exceeds available stock</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                <select
                  value={dispenseDepartment}
                  onChange={(e) => setDispenseDepartment(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                >
                  <option value="">Select department</option>
                  <option value="General Medicine">General Medicine</option>
                  <option value="Surgery">Surgery</option>
                  <option value="Pediatrics">Pediatrics</option>
                  <option value="Cardiology">Cardiology</option>
                  <option value="Laboratory">Laboratory</option>
                  <option value="Emergency">Emergency</option>
                  <option value="Ward">Ward</option>
                </select>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowDispenseModal(false);
                  setSelectedItem(null);
                  setDispenseQuantity('');
                  setDispenseDepartment('');
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={dispenseItem}
                disabled={
                  !dispenseQuantity ||
                  !dispenseDepartment ||
                  parseInt(dispenseQuantity) > selectedItem.currentStock ||
                  isProcessing
                }
                className="flex items-center gap-2 px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition disabled:opacity-50"
              >
                {isProcessing ? <Loader2 size={18} className="animate-spin" /> : <Package size={18} />}
                Dispense
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryPage;
