import React, { useState } from 'react';
import { useAuthStore } from '@/stores/auth.store';
import { useUIStore } from '@/stores/ui.store';
import { cn, formatDate } from '@/utils';
import {
  Building2,
  Globe,
  Palette,
  MapPin,
  Plus,
  Edit,
  Trash2,
  Check,
  X,
  Loader2,
  Upload,
  Clock,
  DollarSign,
  Calendar,
  Phone,
  Mail,
  Star,
  AlertTriangle,
} from 'lucide-react';
import type { Hospital, Branch, Currency, DateFormat, TimeFormat } from '@/types';

type SettingsTab = 'general' | 'localization' | 'branches' | 'branding';

// Nigerian states for dropdown
const nigerianStates = [
  'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue', 'Borno',
  'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu', 'FCT', 'Gombe',
  'Imo', 'Jigawa', 'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Kogi', 'Kwara',
  'Lagos', 'Nasarawa', 'Niger', 'Ogun', 'Ondo', 'Osun', 'Oyo', 'Plateau',
  'Rivers', 'Sokoto', 'Taraba', 'Yobe', 'Zamfara',
];

const currencies: { value: Currency; label: string }[] = [
  { value: 'NGN', label: '₦ Nigerian Naira (NGN)' },
  { value: 'USD', label: '$ US Dollar (USD)' },
  { value: 'EUR', label: '€ Euro (EUR)' },
  { value: 'GBP', label: '£ British Pound (GBP)' },
];

const dateFormats: { value: DateFormat; label: string; example: string }[] = [
  { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY', example: '25/01/2024' },
  { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY', example: '01/25/2024' },
  { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD', example: '2024-01-25' },
];

const timeFormats: { value: TimeFormat; label: string; example: string }[] = [
  { value: '12h', label: '12-hour', example: '2:30 PM' },
  { value: '24h', label: '24-hour', example: '14:30' },
];

const timezones = [
  { value: 'Africa/Lagos', label: 'West Africa Time (WAT) - Lagos' },
  { value: 'Africa/Accra', label: 'Greenwich Mean Time (GMT) - Accra' },
  { value: 'Africa/Johannesburg', label: 'South Africa Standard Time (SAST)' },
  { value: 'Europe/London', label: 'British Summer Time (BST) - London' },
];

export const HospitalSettingsPage: React.FC = () => {
  const hospital = useAuthStore((state) => state.hospital);
  const currentBranch = useAuthStore((state) => state.currentBranch);
  const availableBranches = useAuthStore((state) => state.availableBranches);
  const addToast = useUIStore((state) => state.addToast);

  // State
  const [activeTab, setActiveTab] = useState<SettingsTab>('general');
  const [isSaving, setIsSaving] = useState(false);
  const [showBranchModal, setShowBranchModal] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [branchToDelete, setBranchToDelete] = useState<Branch | null>(null);

  // Form states
  const [generalForm, setGeneralForm] = useState({
    name: hospital?.name || 'Lagos General Hospital',
    email: hospital?.email || 'info@lagosgeneral.com',
    phone: hospital?.phone || '+234 801 234 5678',
    website: hospital?.website || 'https://lagosgeneral.com',
    address: hospital?.address || '123 Medical Drive',
    city: hospital?.city || 'Lagos',
    state: hospital?.state || 'Lagos',
    registrationNumber: 'RC-123456',
    taxId: 'TIN-987654321',
  });

  const [localizationForm, setLocalizationForm] = useState({
    currency: hospital?.localization.currency || 'NGN',
    dateFormat: hospital?.localization.dateFormat || 'DD/MM/YYYY',
    timeFormat: hospital?.localization.timeFormat || '12h',
    timezone: hospital?.localization.timezone || 'Africa/Lagos',
  });

  const [brandingForm, setBrandingForm] = useState({
    primaryColor: '#0d9488',
    secondaryColor: '#dc2626',
    logoUrl: '',
  });

  const [branchForm, setBranchForm] = useState({
    name: '',
    code: '',
    address: '',
    city: '',
    state: 'Lagos',
    phone: '',
    email: '',
    isHeadquarters: false,
  });

  // Mock branches
  const [branches, setBranches] = useState<Branch[]>([
    {
      id: '1',
      hospitalId: '1',
      name: 'Lekki Branch',
      code: 'LGH-LK',
      address: '123 Lekki Phase 1',
      city: 'Lagos',
      state: 'Lagos',
      country: 'Nigeria',
      phone: '+234 801 234 5678',
      email: 'lekki@lagosgeneral.com',
      isHeadquarters: true,
      isActive: true,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    },
    {
      id: '2',
      hospitalId: '1',
      name: 'Victoria Island Branch',
      code: 'LGH-VI',
      address: '456 Adeola Odeku Street',
      city: 'Lagos',
      state: 'Lagos',
      country: 'Nigeria',
      phone: '+234 802 345 6789',
      email: 'vi@lagosgeneral.com',
      isHeadquarters: false,
      isActive: true,
      createdAt: '2024-02-01T00:00:00Z',
      updatedAt: '2024-02-01T00:00:00Z',
    },
  ]);

  const tabs: { key: SettingsTab; label: string; icon: React.ElementType }[] = [
    { key: 'general', label: 'General', icon: Building2 },
    { key: 'localization', label: 'Localization', icon: Globe },
    { key: 'branches', label: 'Branches', icon: MapPin },
    { key: 'branding', label: 'Branding', icon: Palette },
  ];

  // Save handlers
  const handleSaveGeneral = async () => {
    setIsSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSaving(false);
    addToast('success', 'Settings Saved', 'General settings have been updated.');
  };

  const handleSaveLocalization = async () => {
    setIsSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSaving(false);
    addToast('success', 'Settings Saved', 'Localization settings have been updated.');
  };

  const handleSaveBranding = async () => {
    setIsSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSaving(false);
    addToast('success', 'Settings Saved', 'Branding settings have been updated.');
  };

  // Branch handlers
  const handleOpenBranchModal = (branch?: Branch) => {
    if (branch) {
      setEditingBranch(branch);
      setBranchForm({
        name: branch.name,
        code: branch.code,
        address: branch.address || '',
        city: branch.city || '',
        state: branch.state || 'Lagos',
        phone: branch.phone || '',
        email: branch.email || '',
        isHeadquarters: branch.isHeadquarters,
      });
    } else {
      setEditingBranch(null);
      setBranchForm({
        name: '',
        code: '',
        address: '',
        city: '',
        state: 'Lagos',
        phone: '',
        email: '',
        isHeadquarters: false,
      });
    }
    setShowBranchModal(true);
  };

  const handleSaveBranch = async () => {
    setIsSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));

    if (editingBranch) {
      setBranches((prev) =>
        prev.map((b) =>
          b.id === editingBranch.id
            ? { ...b, ...branchForm, updatedAt: new Date().toISOString() }
            : b
        )
      );
      addToast('success', 'Branch Updated', `${branchForm.name} has been updated.`);
    } else {
      const newBranch: Branch = {
        id: String(Date.now()),
        hospitalId: '1',
        ...branchForm,
        country: 'Nigeria',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setBranches([...branches, newBranch]);
      addToast('success', 'Branch Created', `${branchForm.name} has been created.`);
    }

    setShowBranchModal(false);
    setIsSaving(false);
  };

  const handleDeleteBranch = async () => {
    if (!branchToDelete) return;

    setIsSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 500));

    setBranches((prev) => prev.filter((b) => b.id !== branchToDelete.id));
    setShowDeleteModal(false);
    setBranchToDelete(null);
    setIsSaving(false);
    addToast('success', 'Branch Deleted', 'The branch has been deleted.');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Hospital Settings</h1>
        <p className="text-gray-500">Configure your hospital profile and preferences</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-6">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                'flex items-center gap-2 pb-3 px-1 border-b-2 font-medium text-sm transition',
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

      {/* General Settings */}
      {activeTab === 'general' && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">General Information</h2>
            <p className="text-sm text-gray-500">Basic hospital details and contact information</p>
          </div>
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Hospital Name
                </label>
                <input
                  type="text"
                  value={generalForm.name}
                  onChange={(e) => setGeneralForm({ ...generalForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={generalForm.email}
                  onChange={(e) => setGeneralForm({ ...generalForm, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={generalForm.phone}
                  onChange={(e) => setGeneralForm({ ...generalForm, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Website
                </label>
                <input
                  type="url"
                  value={generalForm.website}
                  onChange={(e) => setGeneralForm({ ...generalForm, website: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Registration Number (CAC)
                </label>
                <input
                  type="text"
                  value={generalForm.registrationNumber}
                  onChange={(e) => setGeneralForm({ ...generalForm, registrationNumber: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address
                </label>
                <input
                  type="text"
                  value={generalForm.address}
                  onChange={(e) => setGeneralForm({ ...generalForm, address: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  City
                </label>
                <input
                  type="text"
                  value={generalForm.city}
                  onChange={(e) => setGeneralForm({ ...generalForm, city: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  State
                </label>
                <select
                  value={generalForm.state}
                  onChange={(e) => setGeneralForm({ ...generalForm, state: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                >
                  {nigerianStates.map((state) => (
                    <option key={state} value={state}>{state}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-gray-100">
              <button
                onClick={handleSaveGeneral}
                disabled={isSaving}
                className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition disabled:opacity-50"
              >
                {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} />}
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Localization Settings */}
      {activeTab === 'localization' && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Localization</h2>
            <p className="text-sm text-gray-500">Currency, date, and time preferences</p>
          </div>
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <div className="flex items-center gap-2">
                    <DollarSign size={16} />
                    Currency
                  </div>
                </label>
                <select
                  value={localizationForm.currency}
                  onChange={(e) => setLocalizationForm({ ...localizationForm, currency: e.target.value as Currency })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                >
                  {currencies.map((c) => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <div className="flex items-center gap-2">
                    <Clock size={16} />
                    Timezone
                  </div>
                </label>
                <select
                  value={localizationForm.timezone}
                  onChange={(e) => setLocalizationForm({ ...localizationForm, timezone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                >
                  {timezones.map((tz) => (
                    <option key={tz.value} value={tz.value}>{tz.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <div className="flex items-center gap-2">
                    <Calendar size={16} />
                    Date Format
                  </div>
                </label>
                <div className="space-y-2">
                  {dateFormats.map((df) => (
                    <label
                      key={df.value}
                      className={cn(
                        'flex items-center justify-between p-3 border rounded-lg cursor-pointer transition',
                        localizationForm.dateFormat === df.value
                          ? 'border-teal-500 bg-teal-50'
                          : 'border-gray-200 hover:border-gray-300'
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="dateFormat"
                          value={df.value}
                          checked={localizationForm.dateFormat === df.value}
                          onChange={(e) => setLocalizationForm({ ...localizationForm, dateFormat: e.target.value as DateFormat })}
                          className="text-teal-600 focus:ring-teal-500"
                        />
                        <span className="font-medium">{df.label}</span>
                      </div>
                      <span className="text-gray-500">{df.example}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <div className="flex items-center gap-2">
                    <Clock size={16} />
                    Time Format
                  </div>
                </label>
                <div className="space-y-2">
                  {timeFormats.map((tf) => (
                    <label
                      key={tf.value}
                      className={cn(
                        'flex items-center justify-between p-3 border rounded-lg cursor-pointer transition',
                        localizationForm.timeFormat === tf.value
                          ? 'border-teal-500 bg-teal-50'
                          : 'border-gray-200 hover:border-gray-300'
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="timeFormat"
                          value={tf.value}
                          checked={localizationForm.timeFormat === tf.value}
                          onChange={(e) => setLocalizationForm({ ...localizationForm, timeFormat: e.target.value as TimeFormat })}
                          className="text-teal-600 focus:ring-teal-500"
                        />
                        <span className="font-medium">{tf.label}</span>
                      </div>
                      <span className="text-gray-500">{tf.example}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-gray-100">
              <button
                onClick={handleSaveLocalization}
                disabled={isSaving}
                className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition disabled:opacity-50"
              >
                {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} />}
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Branches */}
      {activeTab === 'branches' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-gray-900">Hospital Branches</h2>
              <p className="text-sm text-gray-500">Manage your hospital locations</p>
            </div>
            <button
              onClick={() => handleOpenBranchModal()}
              className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition"
            >
              <Plus size={18} />
              Add Branch
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {branches.map((branch) => (
              <div
                key={branch.id}
                className="bg-white rounded-xl border border-gray-100 shadow-sm p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      'w-12 h-12 rounded-lg flex items-center justify-center',
                      branch.isHeadquarters ? 'bg-purple-100' : 'bg-teal-100'
                    )}>
                      {branch.isHeadquarters ? (
                        <Star size={24} className="text-purple-600" />
                      ) : (
                        <MapPin size={24} className="text-teal-600" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-900">{branch.name}</h3>
                        {branch.isHeadquarters && (
                          <span className="text-xs px-2 py-0.5 bg-purple-100 text-purple-700 rounded">
                            HQ
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 font-mono">{branch.code}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenBranchModal(branch)}
                      className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
                    >
                      <Edit size={16} />
                    </button>
                    {!branch.isHeadquarters && (
                      <button
                        onClick={() => {
                          setBranchToDelete(branch);
                          setShowDeleteModal(true);
                        }}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <MapPin size={14} />
                    <span>{branch.address}, {branch.city}, {branch.state}</span>
                  </div>
                  {branch.phone && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Phone size={14} />
                      <span>{branch.phone}</span>
                    </div>
                  )}
                  {branch.email && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Mail size={14} />
                      <span>{branch.email}</span>
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400">
                  <span>Created {formatDate(branch.createdAt)}</span>
                  <span className={cn(
                    'px-2 py-0.5 rounded-full',
                    branch.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                  )}>
                    {branch.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Branding */}
      {activeTab === 'branding' && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Branding</h2>
            <p className="text-sm text-gray-500">Customize your hospital's visual identity</p>
          </div>
          <div className="p-6 space-y-6">
            {/* Logo Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hospital Logo
              </label>
              <div className="flex items-center gap-6">
                <div className="w-24 h-24 bg-gray-100 rounded-xl flex items-center justify-center border-2 border-dashed border-gray-300">
                  {brandingForm.logoUrl ? (
                    <img src={brandingForm.logoUrl} alt="Logo" className="w-full h-full object-contain rounded-xl" />
                  ) : (
                    <Building2 size={32} className="text-gray-400" />
                  )}
                </div>
                <div>
                  <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition">
                    <Upload size={18} />
                    Upload Logo
                  </button>
                  <p className="text-xs text-gray-500 mt-2">PNG, JPG up to 2MB. Recommended: 200x200px</p>
                </div>
              </div>
            </div>

            {/* Colors */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Primary Color
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={brandingForm.primaryColor}
                    onChange={(e) => setBrandingForm({ ...brandingForm, primaryColor: e.target.value })}
                    className="w-12 h-12 rounded-lg cursor-pointer border border-gray-300"
                  />
                  <input
                    type="text"
                    value={brandingForm.primaryColor}
                    onChange={(e) => setBrandingForm({ ...brandingForm, primaryColor: e.target.value })}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 font-mono"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">Used for buttons, links, and highlights</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Secondary Color
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={brandingForm.secondaryColor}
                    onChange={(e) => setBrandingForm({ ...brandingForm, secondaryColor: e.target.value })}
                    className="w-12 h-12 rounded-lg cursor-pointer border border-gray-300"
                  />
                  <input
                    type="text"
                    value={brandingForm.secondaryColor}
                    onChange={(e) => setBrandingForm({ ...brandingForm, secondaryColor: e.target.value })}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 font-mono"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">Used for alerts and accent elements</p>
              </div>
            </div>

            {/* Preview */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Preview
              </label>
              <div className="p-6 border border-gray-200 rounded-lg bg-gray-50">
                <div className="flex items-center gap-4 mb-4">
                  <div
                    className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold"
                    style={{ backgroundColor: brandingForm.primaryColor }}
                  >
                    LG
                  </div>
                  <div>
                    <h3 className="font-semibold" style={{ color: brandingForm.primaryColor }}>
                      Lagos General Hospital
                    </h3>
                    <p className="text-sm text-gray-500">Sample Hospital Name</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    className="px-4 py-2 text-white rounded-lg"
                    style={{ backgroundColor: brandingForm.primaryColor }}
                  >
                    Primary Button
                  </button>
                  <button
                    className="px-4 py-2 text-white rounded-lg"
                    style={{ backgroundColor: brandingForm.secondaryColor }}
                  >
                    Secondary Button
                  </button>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-gray-100">
              <button
                onClick={handleSaveBranding}
                disabled={isSaving}
                className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition disabled:opacity-50"
              >
                {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} />}
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Branch Modal */}
      {showBranchModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">
                {editingBranch ? 'Edit Branch' : 'Add New Branch'}
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Branch Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={branchForm.name}
                    onChange={(e) => setBranchForm({ ...branchForm, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                    placeholder="e.g., Ikeja Branch"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Branch Code <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={branchForm.code}
                    onChange={(e) => setBranchForm({ ...branchForm, code: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 font-mono"
                    placeholder="e.g., LGH-IK"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={branchForm.phone}
                    onChange={(e) => setBranchForm({ ...branchForm, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                    placeholder="+234 800 000 0000"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={branchForm.email}
                    onChange={(e) => setBranchForm({ ...branchForm, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                    placeholder="branch@hospital.com"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address
                  </label>
                  <input
                    type="text"
                    value={branchForm.address}
                    onChange={(e) => setBranchForm({ ...branchForm, address: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                    placeholder="Street address"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    value={branchForm.city}
                    onChange={(e) => setBranchForm({ ...branchForm, city: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                    placeholder="City"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    State
                  </label>
                  <select
                    value={branchForm.state}
                    onChange={(e) => setBranchForm({ ...branchForm, state: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                  >
                    {nigerianStates.map((state) => (
                      <option key={state} value={state}>{state}</option>
                    ))}
                  </select>
                </div>
              </div>

              {!editingBranch && (
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={branchForm.isHeadquarters}
                    onChange={(e) => setBranchForm({ ...branchForm, isHeadquarters: e.target.checked })}
                    className="w-4 h-4 text-teal-600 rounded focus:ring-teal-500"
                  />
                  <span className="text-sm text-gray-700">Set as Headquarters</span>
                </label>
              )}
            </div>
            <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
              <button
                onClick={() => setShowBranchModal(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveBranch}
                disabled={!branchForm.name.trim() || !branchForm.code.trim() || isSaving}
                className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition disabled:opacity-50"
              >
                {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} />}
                {editingBranch ? 'Update Branch' : 'Create Branch'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Branch Modal */}
      {showDeleteModal && branchToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="p-6 text-center">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle size={24} className="text-red-600" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Delete Branch?</h2>
              <p className="text-gray-500">
                Are you sure you want to delete <span className="font-medium text-gray-900">{branchToDelete.name}</span>? 
                This will remove all data associated with this branch.
              </p>
            </div>
            <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setBranchToDelete(null);
                }}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteBranch}
                disabled={isSaving}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50"
              >
                {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HospitalSettingsPage;
