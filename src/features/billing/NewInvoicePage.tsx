import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Search, Plus, Trash2, Calculator, CreditCard, Building2,
  User, FileText, DollarSign, Percent, Save, Send, Printer,
} from 'lucide-react';

interface LineItem {
  id: string;
  description: string;
  category: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  total: number;
}

interface Patient {
  id: string;
  name: string;
  patientId: string;
  phone: string;
  insuranceProvider?: string;
  insuranceNumber?: string;
}

const mockPatients: Patient[] = [
  { id: '1', name: 'Mr. Emmanuel Chukwu', patientId: 'PT-2025-0001', phone: '+234 803 111 2222', insuranceProvider: 'Hygeia HMO', insuranceNumber: 'HYG-123456' },
  { id: '2', name: 'Mrs. Ngozi Obi', patientId: 'PT-2025-0045', phone: '+234 805 333 4444' },
  { id: '3', name: 'Chief Adeleke', patientId: 'PT-2025-0112', phone: '+234 809 555 6666', insuranceProvider: 'AXA Mansard', insuranceNumber: 'AXA-789012' },
];

const serviceCategories = [
  { id: 'consultation', name: 'Consultation', items: [
    { name: 'General Consultation', price: 5000 },
    { name: 'Specialist Consultation', price: 15000 },
    { name: 'Follow-up Consultation', price: 3000 },
  ]},
  { id: 'laboratory', name: 'Laboratory', items: [
    { name: 'Full Blood Count', price: 5000 },
    { name: 'Lipid Profile', price: 8000 },
    { name: 'Liver Function Test', price: 10000 },
    { name: 'Kidney Function Test', price: 10000 },
    { name: 'Urinalysis', price: 2500 },
    { name: 'Blood Sugar (Fasting)', price: 2000 },
  ]},
  { id: 'radiology', name: 'Radiology', items: [
    { name: 'X-Ray (Chest)', price: 8000 },
    { name: 'X-Ray (Other)', price: 6000 },
    { name: 'Ultrasound', price: 15000 },
    { name: 'CT Scan', price: 50000 },
    { name: 'MRI', price: 100000 },
  ]},
  { id: 'pharmacy', name: 'Pharmacy', items: [
    { name: 'Medication (per item)', price: 0 },
  ]},
  { id: 'procedures', name: 'Procedures', items: [
    { name: 'Wound Dressing', price: 3000 },
    { name: 'Injection', price: 1500 },
    { name: 'IV Cannulation', price: 2500 },
    { name: 'ECG', price: 5000 },
  ]},
];

export const NewInvoicePage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [patientSearch, setPatientSearch] = useState('');
  const [showPatientSearch, setShowPatientSearch] = useState(false);
  const [lineItems, setLineItems] = useState<LineItem[]>([]);
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'transfer' | 'hmo'>('cash');
  const [globalDiscount, setGlobalDiscount] = useState(0);

  const addLineItem = (description: string, category: string, price: number) => {
    const newItem: LineItem = {
      id: Date.now().toString(),
      description,
      category,
      quantity: 1,
      unitPrice: price,
      discount: 0,
      total: price,
    };
    setLineItems([...lineItems, newItem]);
  };

  const updateLineItem = (id: string, field: keyof LineItem, value: number) => {
    setLineItems(lineItems.map(item => {
      if (item.id === id) {
        const updated = { ...item, [field]: value };
        updated.total = (updated.quantity * updated.unitPrice) * (1 - updated.discount / 100);
        return updated;
      }
      return item;
    }));
  };

  const removeLineItem = (id: string) => {
    setLineItems(lineItems.filter(item => item.id !== id));
  };

  const subtotal = lineItems.reduce((sum, item) => sum + item.total, 0);
  const discountAmount = subtotal * (globalDiscount / 100);
  const total = subtotal - discountAmount;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(amount);
  };

  const filteredPatients = mockPatients.filter(p => 
    p.name.toLowerCase().includes(patientSearch.toLowerCase()) ||
    p.patientId.toLowerCase().includes(patientSearch.toLowerCase())
  );

  const handleSave = (status: 'draft' | 'pending' | 'sent') => {
    // In real app, save to backend
    console.log('Saving invoice:', { patient: selectedPatient, lineItems, total, status });
    navigate('/billing');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/billing')} className="p-2 hover:bg-gray-100 rounded-lg">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">New Invoice</h1>
          <p className="text-gray-600">Create a new billing invoice</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="col-span-2 space-y-6">
          {/* Patient Selection */}
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <User className="h-5 w-5 text-teal-600" />
              Patient Information
            </h3>

            {!selectedPatient ? (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search patient by name or ID..."
                  value={patientSearch}
                  onChange={(e) => { setPatientSearch(e.target.value); setShowPatientSearch(true); }}
                  onFocus={() => setShowPatientSearch(true)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500"
                />
                {showPatientSearch && patientSearch && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {filteredPatients.map(patient => (
                      <div
                        key={patient.id}
                        className="p-3 hover:bg-gray-50 cursor-pointer"
                        onClick={() => { setSelectedPatient(patient); setShowPatientSearch(false); setPatientSearch(''); }}
                      >
                        <p className="font-medium">{patient.name}</p>
                        <p className="text-sm text-gray-500">{patient.patientId} • {patient.phone}</p>
                        {patient.insuranceProvider && (
                          <p className="text-sm text-teal-600">{patient.insuranceProvider}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center">
                    <User className="h-6 w-6 text-teal-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{selectedPatient.name}</p>
                    <p className="text-sm text-gray-500">{selectedPatient.patientId} • {selectedPatient.phone}</p>
                    {selectedPatient.insuranceProvider && (
                      <p className="text-sm text-teal-600 flex items-center gap-1">
                        <Building2 className="h-3.5 w-3.5" />
                        {selectedPatient.insuranceProvider} - {selectedPatient.insuranceNumber}
                      </p>
                    )}
                  </div>
                </div>
                <button onClick={() => setSelectedPatient(null)} className="text-gray-400 hover:text-gray-600">
                  Change
                </button>
              </div>
            )}
          </div>

          {/* Line Items */}
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FileText className="h-5 w-5 text-teal-600" />
              Invoice Items
            </h3>

            {/* Service Quick Add */}
            <div className="mb-4 flex flex-wrap gap-2">
              {serviceCategories.map(category => (
                <div key={category.id} className="relative group">
                  <button className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm">
                    {category.name}
                  </button>
                  <div className="absolute z-10 left-0 mt-1 w-64 bg-white border border-gray-200 rounded-lg shadow-lg hidden group-hover:block">
                    {category.items.map((item, idx) => (
                      <button
                        key={idx}
                        onClick={() => addLineItem(item.name, category.name, item.price)}
                        className="w-full px-3 py-2 text-left hover:bg-gray-50 flex justify-between items-center"
                      >
                        <span className="text-sm">{item.name}</span>
                        <span className="text-sm text-gray-500">{item.price > 0 ? formatCurrency(item.price) : 'Variable'}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Items Table */}
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase w-24">Qty</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase w-32">Unit Price</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase w-24">Disc %</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase w-32">Total</th>
                    <th className="px-4 py-3 w-12"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {lineItems.map(item => (
                    <tr key={item.id}>
                      <td className="px-4 py-3">
                        <input
                          type="text"
                          value={item.description}
                          onChange={(e) => updateLineItem(item.id, 'description', e.target.value as any)}
                          className="w-full border-0 focus:ring-0 p-0"
                        />
                        <span className="text-xs text-gray-500">{item.category}</span>
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => updateLineItem(item.id, 'quantity', parseInt(e.target.value) || 1)}
                          className="w-full border border-gray-200 rounded px-2 py-1 text-center"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          min="0"
                          value={item.unitPrice}
                          onChange={(e) => updateLineItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                          className="w-full border border-gray-200 rounded px-2 py-1"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={item.discount}
                          onChange={(e) => updateLineItem(item.id, 'discount', parseFloat(e.target.value) || 0)}
                          className="w-full border border-gray-200 rounded px-2 py-1 text-center"
                        />
                      </td>
                      <td className="px-4 py-3 text-right font-medium">
                        {formatCurrency(item.total)}
                      </td>
                      <td className="px-4 py-3">
                        <button onClick={() => removeLineItem(item.id)} className="text-red-500 hover:text-red-700">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {lineItems.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                        No items added. Click on a service category above to add items.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Add Custom Item */}
            <button
              onClick={() => addLineItem('Custom Item', 'Other', 0)}
              className="mt-3 px-4 py-2 border border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-teal-500 hover:text-teal-600 flex items-center gap-2 w-full justify-center"
            >
              <Plus className="h-4 w-4" />
              Add Custom Item
            </button>
          </div>

          {/* Notes */}
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Notes</h3>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any additional notes for this invoice..."
              className="w-full border border-gray-200 rounded-lg p-3 h-24 focus:ring-2 focus:ring-teal-500"
            />
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Payment Method */}
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-teal-600" />
              Payment Method
            </h3>
            <div className="space-y-2">
              {[
                { id: 'cash', label: 'Cash', icon: '💵' },
                { id: 'card', label: 'Card', icon: '💳' },
                { id: 'transfer', label: 'Bank Transfer', icon: '🏦' },
                { id: 'hmo', label: 'HMO / Insurance', icon: '🏥' },
              ].map(method => (
                <label
                  key={method.id}
                  className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer border-2 transition-colors ${
                    paymentMethod === method.id ? 'border-teal-500 bg-teal-50' : 'border-transparent bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value={method.id}
                    checked={paymentMethod === method.id}
                    onChange={(e) => setPaymentMethod(e.target.value as any)}
                    className="sr-only"
                  />
                  <span className="text-xl">{method.icon}</span>
                  <span className="font-medium">{method.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Summary */}
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Calculator className="h-5 w-5 text-teal-600" />
              Summary
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-500">Subtotal</span>
                <span className="font-medium">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500 flex items-center gap-2">
                  Discount
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={globalDiscount}
                    onChange={(e) => setGlobalDiscount(parseFloat(e.target.value) || 0)}
                    className="w-16 border border-gray-200 rounded px-2 py-1 text-center text-sm"
                  />
                  %
                </span>
                <span className="text-red-600">-{formatCurrency(discountAmount)}</span>
              </div>
              <div className="border-t border-gray-200 pt-3 flex justify-between">
                <span className="font-semibold text-gray-900">Total</span>
                <span className="text-xl font-bold text-teal-600">{formatCurrency(total)}</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <button
              onClick={() => handleSave('pending')}
              disabled={!selectedPatient || lineItems.length === 0}
              className="w-full px-4 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Save className="h-4 w-4" />
              Save Invoice
            </button>
            <button
              onClick={() => handleSave('sent')}
              disabled={!selectedPatient || lineItems.length === 0}
              className="w-full px-4 py-3 border border-teal-600 text-teal-600 rounded-lg hover:bg-teal-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Send className="h-4 w-4" />
              Save & Send to Patient
            </button>
            <button
              onClick={() => handleSave('draft')}
              className="w-full px-4 py-3 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 flex items-center justify-center gap-2"
            >
              Save as Draft
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewInvoicePage;
