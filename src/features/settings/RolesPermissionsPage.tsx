import React, { useState } from 'react';
import { useUIStore } from '@/stores/ui.store';
import { cn } from '@/utils';
import {
  Plus,
  Edit,
  Trash2,
  Shield,
  Users,
  Check,
  X,
  Loader2,
  Search,
  ChevronDown,
  ChevronUp,
  Lock,
  Copy,
  AlertTriangle,
} from 'lucide-react';
import type { Role, Permission, ModuleKey, ActionKey } from '@/types';

// Module definitions with descriptions
const modules: { key: ModuleKey; label: string; description: string }[] = [
  { key: 'dashboard', label: 'Dashboard', description: 'View dashboard and statistics' },
  { key: 'patients', label: 'Patients', description: 'Manage patient records' },
  { key: 'appointments', label: 'Appointments', description: 'Schedule and manage appointments' },
  { key: 'opd', label: 'OPD / Consultation', description: 'Outpatient consultations' },
  { key: 'laboratory', label: 'Laboratory', description: 'Lab orders and results' },
  { key: 'radiology', label: 'Radiology', description: 'Imaging orders and results' },
  { key: 'pharmacy', label: 'Pharmacy', description: 'Prescriptions and dispensing' },
  { key: 'billing', label: 'Billing', description: 'Bills and payments' },
  { key: 'inventory', label: 'Inventory', description: 'Stock management' },
  { key: 'ward', label: 'Ward Management', description: 'Bed and ward allocation' },
  { key: 'emergency', label: 'Emergency', description: 'Emergency department' },
  { key: 'reports', label: 'Reports', description: 'Generate and view reports' },
  { key: 'staff', label: 'Staff Management', description: 'Manage staff records' },
  { key: 'roles', label: 'Roles & Permissions', description: 'Manage roles and access' },
  { key: 'settings', label: 'Settings', description: 'Hospital configuration' },
];

const actions: { key: ActionKey; label: string }[] = [
  { key: 'view', label: 'View' },
  { key: 'create', label: 'Create' },
  { key: 'edit', label: 'Edit' },
  { key: 'delete', label: 'Delete' },
  { key: 'export', label: 'Export' },
  { key: 'approve', label: 'Approve' },
];

// Mock roles data
const mockRoles: Role[] = [
  {
    id: '1',
    hospitalId: '1',
    name: 'Super Admin',
    description: 'Full system access',
    isSystem: true,
    permissions: modules.flatMap((m) => actions.map((a) => ({ module: m.key, action: a.key }))),
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '2',
    hospitalId: '1',
    name: 'Doctor',
    description: 'Medical practitioner with clinical access',
    isSystem: true,
    permissions: [
      { module: 'dashboard', action: 'view' },
      { module: 'patients', action: 'view' },
      { module: 'patients', action: 'create' },
      { module: 'patients', action: 'edit' },
      { module: 'appointments', action: 'view' },
      { module: 'appointments', action: 'create' },
      { module: 'opd', action: 'view' },
      { module: 'opd', action: 'create' },
      { module: 'opd', action: 'edit' },
      { module: 'laboratory', action: 'view' },
      { module: 'laboratory', action: 'create' },
      { module: 'radiology', action: 'view' },
      { module: 'radiology', action: 'create' },
      { module: 'pharmacy', action: 'view' },
      { module: 'billing', action: 'view' },
      { module: 'reports', action: 'view' },
    ],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '3',
    hospitalId: '1',
    name: 'Nurse',
    description: 'Nursing staff with patient care access',
    isSystem: true,
    permissions: [
      { module: 'dashboard', action: 'view' },
      { module: 'patients', action: 'view' },
      { module: 'patients', action: 'edit' },
      { module: 'appointments', action: 'view' },
      { module: 'opd', action: 'view' },
      { module: 'opd', action: 'edit' },
      { module: 'laboratory', action: 'view' },
      { module: 'pharmacy', action: 'view' },
      { module: 'ward', action: 'view' },
      { module: 'ward', action: 'edit' },
    ],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '4',
    hospitalId: '1',
    name: 'Receptionist',
    description: 'Front desk operations',
    isSystem: true,
    permissions: [
      { module: 'dashboard', action: 'view' },
      { module: 'patients', action: 'view' },
      { module: 'patients', action: 'create' },
      { module: 'patients', action: 'edit' },
      { module: 'appointments', action: 'view' },
      { module: 'appointments', action: 'create' },
      { module: 'appointments', action: 'edit' },
      { module: 'billing', action: 'view' },
      { module: 'billing', action: 'create' },
    ],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '5',
    hospitalId: '1',
    name: 'Lab Technician',
    description: 'Laboratory operations',
    isSystem: true,
    permissions: [
      { module: 'dashboard', action: 'view' },
      { module: 'patients', action: 'view' },
      { module: 'laboratory', action: 'view' },
      { module: 'laboratory', action: 'create' },
      { module: 'laboratory', action: 'edit' },
      { module: 'inventory', action: 'view' },
    ],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '6',
    hospitalId: '1',
    name: 'Pharmacist',
    description: 'Pharmacy operations',
    isSystem: true,
    permissions: [
      { module: 'dashboard', action: 'view' },
      { module: 'patients', action: 'view' },
      { module: 'pharmacy', action: 'view' },
      { module: 'pharmacy', action: 'create' },
      { module: 'pharmacy', action: 'edit' },
      { module: 'inventory', action: 'view' },
      { module: 'inventory', action: 'edit' },
    ],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '7',
    hospitalId: '1',
    name: 'Cashier',
    description: 'Billing and payment processing',
    isSystem: true,
    permissions: [
      { module: 'dashboard', action: 'view' },
      { module: 'patients', action: 'view' },
      { module: 'billing', action: 'view' },
      { module: 'billing', action: 'create' },
      { module: 'billing', action: 'edit' },
      { module: 'reports', action: 'view' },
    ],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
];

export const RolesPermissionsPage: React.FC = () => {
  const addToast = useUIStore((state) => state.addToast);

  // State
  const [roles, setRoles] = useState<Role[]>(mockRoles);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedPermissions, setEditedPermissions] = useState<Permission[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState<Role | null>(null);
  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleDescription, setNewRoleDescription] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [expandedModules, setExpandedModules] = useState<ModuleKey[]>([]);

  // Select a role
  const handleSelectRole = (role: Role) => {
    setSelectedRole(role);
    setEditedPermissions([...role.permissions]);
    setIsEditing(false);
  };

  // Toggle permission
  const togglePermission = (module: ModuleKey, action: ActionKey) => {
    const hasPermission = editedPermissions.some(
      (p) => p.module === module && p.action === action
    );

    if (hasPermission) {
      setEditedPermissions(
        editedPermissions.filter((p) => !(p.module === module && p.action === action))
      );
    } else {
      setEditedPermissions([...editedPermissions, { module, action }]);
    }
  };

  // Toggle all actions for a module
  const toggleModuleAll = (module: ModuleKey) => {
    const modulePermissions = editedPermissions.filter((p) => p.module === module);
    const allChecked = modulePermissions.length === actions.length;

    if (allChecked) {
      setEditedPermissions(editedPermissions.filter((p) => p.module !== module));
    } else {
      const otherPermissions = editedPermissions.filter((p) => p.module !== module);
      const allModulePermissions = actions.map((a) => ({ module, action: a.key }));
      setEditedPermissions([...otherPermissions, ...allModulePermissions]);
    }
  };

  // Check if permission exists
  const hasPermission = (module: ModuleKey, action: ActionKey) => {
    return editedPermissions.some((p) => p.module === module && p.action === action);
  };

  // Get module permission count
  const getModulePermissionCount = (module: ModuleKey) => {
    return editedPermissions.filter((p) => p.module === module).length;
  };

  // Toggle module expansion
  const toggleModuleExpansion = (module: ModuleKey) => {
    setExpandedModules((prev) =>
      prev.includes(module) ? prev.filter((m) => m !== module) : [...prev, module]
    );
  };

  // Save permissions
  const handleSave = async () => {
    if (!selectedRole) return;

    setIsSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));

    setRoles((prev) =>
      prev.map((r) =>
        r.id === selectedRole.id ? { ...r, permissions: editedPermissions } : r
      )
    );
    setSelectedRole({ ...selectedRole, permissions: editedPermissions });
    setIsEditing(false);
    setIsSaving(false);
    addToast('success', 'Permissions Updated', `Permissions for ${selectedRole.name} have been saved.`);
  };

  // Create new role
  const handleCreateRole = async () => {
    if (!newRoleName.trim()) return;

    setIsSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const newRole: Role = {
      id: String(Date.now()),
      hospitalId: '1',
      name: newRoleName,
      description: newRoleDescription,
      isSystem: false,
      permissions: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setRoles([...roles, newRole]);
    setShowCreateModal(false);
    setNewRoleName('');
    setNewRoleDescription('');
    setIsSaving(false);
    handleSelectRole(newRole);
    setIsEditing(true);
    addToast('success', 'Role Created', `${newRole.name} role has been created.`);
  };

  // Duplicate role
  const handleDuplicateRole = (role: Role) => {
    const newRole: Role = {
      ...role,
      id: String(Date.now()),
      name: `${role.name} (Copy)`,
      isSystem: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setRoles([...roles, newRole]);
    handleSelectRole(newRole);
    addToast('success', 'Role Duplicated', `${newRole.name} has been created.`);
  };

  // Delete role
  const handleDeleteRole = async () => {
    if (!roleToDelete) return;

    setIsSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 500));

    setRoles((prev) => prev.filter((r) => r.id !== roleToDelete.id));
    if (selectedRole?.id === roleToDelete.id) {
      setSelectedRole(null);
    }
    setShowDeleteModal(false);
    setRoleToDelete(null);
    setIsSaving(false);
    addToast('success', 'Role Deleted', 'The role has been deleted.');
  };

  // Filter roles
  const filteredRoles = roles.filter(
    (role) =>
      role.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      role.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Roles & Permissions</h1>
          <p className="text-gray-500">Manage access control for your hospital staff</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center justify-center gap-2 bg-teal-600 text-white px-4 py-2.5 rounded-lg hover:bg-teal-700 transition shadow-lg"
        >
          <Plus size={20} />
          Create Role
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Roles List */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
          <div className="p-4 border-b border-gray-100">
            <div className="relative">
              <input
                type="text"
                placeholder="Search roles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
              />
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
          </div>

          <div className="divide-y divide-gray-100 max-h-[600px] overflow-y-auto">
            {filteredRoles.map((role) => (
              <div
                key={role.id}
                onClick={() => handleSelectRole(role)}
                className={cn(
                  'p-4 cursor-pointer transition hover:bg-gray-50',
                  selectedRole?.id === role.id && 'bg-teal-50 border-l-4 border-l-teal-600'
                )}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        'w-10 h-10 rounded-lg flex items-center justify-center',
                        role.isSystem ? 'bg-purple-100' : 'bg-teal-100'
                      )}
                    >
                      {role.isSystem ? (
                        <Lock size={18} className="text-purple-600" />
                      ) : (
                        <Shield size={18} className="text-teal-600" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-gray-900">{role.name}</p>
                        {role.isSystem && (
                          <span className="text-xs px-1.5 py-0.5 bg-purple-100 text-purple-700 rounded">
                            System
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 line-clamp-1">{role.description}</p>
                    </div>
                  </div>
                </div>
                <div className="mt-2 flex items-center gap-2 text-xs text-gray-400">
                  <Users size={12} />
                  <span>{role.permissions.length} permissions</span>
                </div>
              </div>
            ))}

            {filteredRoles.length === 0 && (
              <div className="p-8 text-center text-gray-500">
                No roles found
              </div>
            )}
          </div>
        </div>

        {/* Permissions Editor */}
        <div className="lg:col-span-2">
          {selectedRole ? (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
              {/* Role Header */}
              <div className="px-6 py-4 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        'w-12 h-12 rounded-lg flex items-center justify-center',
                        selectedRole.isSystem ? 'bg-purple-100' : 'bg-teal-100'
                      )}
                    >
                      {selectedRole.isSystem ? (
                        <Lock size={24} className="text-purple-600" />
                      ) : (
                        <Shield size={24} className="text-teal-600" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-lg font-semibold text-gray-900">{selectedRole.name}</h2>
                        {selectedRole.isSystem && (
                          <span className="text-xs px-2 py-0.5 bg-purple-100 text-purple-700 rounded">
                            System Role
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500">{selectedRole.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {!selectedRole.isSystem && (
                      <>
                        <button
                          onClick={() => handleDuplicateRole(selectedRole)}
                          className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
                          title="Duplicate"
                        >
                          <Copy size={18} />
                        </button>
                        <button
                          onClick={() => {
                            setRoleToDelete(selectedRole);
                            setShowDeleteModal(true);
                          }}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                          title="Delete"
                        >
                          <Trash2 size={18} />
                        </button>
                      </>
                    )}
                    {isEditing ? (
                      <>
                        <button
                          onClick={() => {
                            setIsEditing(false);
                            setEditedPermissions([...selectedRole.permissions]);
                          }}
                          className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleSave}
                          disabled={isSaving}
                          className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition disabled:opacity-50"
                        >
                          {isSaving ? (
                            <Loader2 size={18} className="animate-spin" />
                          ) : (
                            <Check size={18} />
                          )}
                          Save
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => setIsEditing(true)}
                        disabled={selectedRole.name === 'Super Admin'}
                        className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Edit size={18} />
                        Edit Permissions
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Permissions Grid */}
              <div className="p-6">
                {selectedRole.name === 'Super Admin' && (
                  <div className="mb-4 p-3 bg-purple-50 border border-purple-200 rounded-lg flex items-center gap-2 text-purple-700">
                    <Lock size={16} />
                    <span className="text-sm">Super Admin has full access and cannot be modified.</span>
                  </div>
                )}

                <div className="space-y-2">
                  {modules.map((module) => {
                    const permCount = getModulePermissionCount(module.key);
                    const isExpanded = expandedModules.includes(module.key);
                    const allChecked = permCount === actions.length;

                    return (
                      <div key={module.key} className="border border-gray-200 rounded-lg overflow-hidden">
                        {/* Module Header */}
                        <div
                          className={cn(
                            'flex items-center justify-between px-4 py-3 cursor-pointer transition',
                            isExpanded ? 'bg-gray-50' : 'hover:bg-gray-50'
                          )}
                          onClick={() => toggleModuleExpansion(module.key)}
                        >
                          <div className="flex items-center gap-3">
                            {isEditing && selectedRole.name !== 'Super Admin' && (
                              <input
                                type="checkbox"
                                checked={allChecked}
                                onChange={(e) => {
                                  e.stopPropagation();
                                  toggleModuleAll(module.key);
                                }}
                                className="w-4 h-4 text-teal-600 rounded focus:ring-teal-500"
                              />
                            )}
                            <div>
                              <p className="font-medium text-gray-900">{module.label}</p>
                              <p className="text-xs text-gray-500">{module.description}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-sm text-gray-500">
                              {permCount}/{actions.length} permissions
                            </span>
                            {isExpanded ? (
                              <ChevronUp size={18} className="text-gray-400" />
                            ) : (
                              <ChevronDown size={18} className="text-gray-400" />
                            )}
                          </div>
                        </div>

                        {/* Module Permissions */}
                        {isExpanded && (
                          <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                              {actions.map((action) => {
                                const checked = hasPermission(module.key, action.key);
                                return (
                                  <label
                                    key={action.key}
                                    className={cn(
                                      'flex items-center gap-2 px-3 py-2 rounded-lg border transition',
                                      checked
                                        ? 'bg-teal-50 border-teal-300 text-teal-700'
                                        : 'bg-white border-gray-200 text-gray-600',
                                      isEditing && selectedRole.name !== 'Super Admin'
                                        ? 'cursor-pointer hover:border-teal-300'
                                        : 'cursor-default'
                                    )}
                                  >
                                    <input
                                      type="checkbox"
                                      checked={checked}
                                      disabled={!isEditing || selectedRole.name === 'Super Admin'}
                                      onChange={() => togglePermission(module.key, action.key)}
                                      className="w-4 h-4 text-teal-600 rounded focus:ring-teal-500 disabled:cursor-default"
                                    />
                                    <span className="text-sm capitalize">{action.label}</span>
                                  </label>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield size={32} className="text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">Select a Role</h3>
              <p className="text-gray-500">Choose a role from the list to view and edit permissions</p>
            </div>
          )}
        </div>
      </div>

      {/* Create Role Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">Create New Role</h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newRoleName}
                  onChange={(e) => setNewRoleName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                  placeholder="e.g., Senior Doctor"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={newRoleDescription}
                  onChange={(e) => setNewRoleDescription(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                  placeholder="Describe this role's responsibilities..."
                />
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setNewRoleName('');
                  setNewRoleDescription('');
                }}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateRole}
                disabled={!newRoleName.trim() || isSaving}
                className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition disabled:opacity-50"
              >
                {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
                Create Role
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && roleToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="p-6 text-center">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle size={24} className="text-red-600" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Delete Role?</h2>
              <p className="text-gray-500">
                Are you sure you want to delete <span className="font-medium text-gray-900">{roleToDelete.name}</span>? 
                This action cannot be undone.
              </p>
            </div>
            <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setRoleToDelete(null);
                }}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteRole}
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

export default RolesPermissionsPage;
