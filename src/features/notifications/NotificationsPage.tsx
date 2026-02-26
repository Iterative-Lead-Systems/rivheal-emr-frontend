import React, { useState } from 'react';
import {
  Bell, Mail, MessageSquare, Phone, Settings, Search, Filter,
  CheckCircle, XCircle, Clock, AlertTriangle, Info, User, Calendar,
  FileText, Pill, TestTube, CreditCard, Heart, Activity, Trash2,
  MoreVertical, Check, X, RefreshCw, Send, Eye, Archive,
} from 'lucide-react';

// Types
interface Notification {
  id: string;
  type: 'appointment' | 'lab_result' | 'prescription' | 'payment' | 'emergency' | 'system' | 'reminder';
  channel: 'push' | 'sms' | 'email' | 'in_app';
  title: string;
  message: string;
  recipient: string;
  recipientType: 'patient' | 'staff' | 'doctor';
  status: 'pending' | 'sent' | 'delivered' | 'failed' | 'read';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  createdAt: string;
  sentAt?: string;
  readAt?: string;
  metadata?: Record<string, any>;
}

interface NotificationTemplate {
  id: string;
  name: string;
  type: string;
  channel: string;
  subject?: string;
  body: string;
  variables: string[];
  isActive: boolean;
}

// Type icons
const typeIcons: Record<string, React.ReactNode> = {
  appointment: <Calendar className="h-4 w-4" />,
  lab_result: <TestTube className="h-4 w-4" />,
  prescription: <Pill className="h-4 w-4" />,
  payment: <CreditCard className="h-4 w-4" />,
  emergency: <AlertTriangle className="h-4 w-4" />,
  system: <Settings className="h-4 w-4" />,
  reminder: <Clock className="h-4 w-4" />,
};

const channelIcons: Record<string, React.ReactNode> = {
  push: <Bell className="h-4 w-4" />,
  sms: <Phone className="h-4 w-4" />,
  email: <Mail className="h-4 w-4" />,
  in_app: <MessageSquare className="h-4 w-4" />,
};

// Mock data
const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'appointment',
    channel: 'sms',
    title: 'Appointment Reminder',
    message: 'Dear Mr. Chukwu, your appointment with Dr. Okonkwo is scheduled for tomorrow at 10:00 AM.',
    recipient: 'Mr. Emmanuel Chukwu',
    recipientType: 'patient',
    status: 'delivered',
    priority: 'normal',
    createdAt: '2025-02-26T08:00:00',
    sentAt: '2025-02-26T08:00:05',
  },
  {
    id: '2',
    type: 'lab_result',
    channel: 'push',
    title: 'Lab Results Ready',
    message: 'Your lab results are now available. Please check your patient portal or visit the hospital.',
    recipient: 'Mrs. Ngozi Obi',
    recipientType: 'patient',
    status: 'read',
    priority: 'high',
    createdAt: '2025-02-26T07:30:00',
    sentAt: '2025-02-26T07:30:02',
    readAt: '2025-02-26T07:45:00',
  },
  {
    id: '3',
    type: 'emergency',
    channel: 'sms',
    title: 'Emergency Alert',
    message: 'URGENT: Critical patient admission in ER. Your presence is required immediately.',
    recipient: 'Dr. Ahmed Yusuf',
    recipientType: 'doctor',
    status: 'delivered',
    priority: 'urgent',
    createdAt: '2025-02-26T09:15:00',
    sentAt: '2025-02-26T09:15:01',
  },
  {
    id: '4',
    type: 'payment',
    channel: 'email',
    title: 'Payment Confirmation',
    message: 'Your payment of ₦25,000 has been received. Invoice #INV-2025-0456.',
    recipient: 'Chief Adeleke',
    recipientType: 'patient',
    status: 'sent',
    priority: 'normal',
    createdAt: '2025-02-26T08:45:00',
    sentAt: '2025-02-26T08:45:10',
  },
  {
    id: '5',
    type: 'prescription',
    channel: 'push',
    title: 'Prescription Refill Reminder',
    message: 'Your Metformin prescription will expire in 3 days. Please request a refill.',
    recipient: 'Mrs. Fatima Bello',
    recipientType: 'patient',
    status: 'pending',
    priority: 'normal',
    createdAt: '2025-02-26T10:00:00',
  },
  {
    id: '6',
    type: 'system',
    channel: 'in_app',
    title: 'System Maintenance',
    message: 'Scheduled maintenance on February 28, 2025 from 2:00 AM to 4:00 AM.',
    recipient: 'All Staff',
    recipientType: 'staff',
    status: 'delivered',
    priority: 'low',
    createdAt: '2025-02-25T14:00:00',
    sentAt: '2025-02-25T14:00:00',
  },
];

const mockTemplates: NotificationTemplate[] = [
  {
    id: '1',
    name: 'Appointment Reminder - 24h',
    type: 'appointment',
    channel: 'sms',
    body: 'Dear {{patient_name}}, your appointment with {{doctor_name}} is scheduled for {{date}} at {{time}}. Reply CONFIRM to confirm or call us to reschedule.',
    variables: ['patient_name', 'doctor_name', 'date', 'time'],
    isActive: true,
  },
  {
    id: '2',
    name: 'Lab Results Ready',
    type: 'lab_result',
    channel: 'push',
    body: 'Your lab results for {{test_name}} are now available. Please check your patient portal.',
    variables: ['test_name'],
    isActive: true,
  },
  {
    id: '3',
    name: 'Payment Receipt',
    type: 'payment',
    channel: 'email',
    subject: 'Payment Confirmation - RivHeal Medical',
    body: 'Dear {{patient_name}}, we have received your payment of {{amount}} for {{service}}. Invoice: {{invoice_number}}.',
    variables: ['patient_name', 'amount', 'service', 'invoice_number'],
    isActive: true,
  },
];

export const NotificationsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'notifications' | 'templates' | 'settings'>('notifications');
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedNotifications, setSelectedNotifications] = useState<string[]>([]);

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      sent: 'bg-blue-100 text-blue-800',
      delivered: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
      read: 'bg-gray-100 text-gray-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      low: 'text-gray-500',
      normal: 'text-blue-500',
      high: 'text-orange-500',
      urgent: 'text-red-500',
    };
    return colors[priority] || 'text-gray-500';
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      appointment: 'bg-blue-100 text-blue-800',
      lab_result: 'bg-purple-100 text-purple-800',
      prescription: 'bg-green-100 text-green-800',
      payment: 'bg-teal-100 text-teal-800',
      emergency: 'bg-red-100 text-red-800',
      system: 'bg-gray-100 text-gray-800',
      reminder: 'bg-yellow-100 text-yellow-800',
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  const filteredNotifications = mockNotifications.filter(notif => {
    const matchesSearch = notif.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         notif.recipient.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'all' || notif.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || notif.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  const stats = {
    total: mockNotifications.length,
    pending: mockNotifications.filter(n => n.status === 'pending').length,
    delivered: mockNotifications.filter(n => n.status === 'delivered').length,
    failed: mockNotifications.filter(n => n.status === 'failed').length,
  };

  const toggleSelect = (id: string) => {
    setSelectedNotifications(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedNotifications.length === filteredNotifications.length) {
      setSelectedNotifications([]);
    } else {
      setSelectedNotifications(filteredNotifications.map(n => n.id));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          <p className="text-gray-600 mt-1">Manage SMS, email, and push notifications</p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Sync
          </button>
          <button className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 flex items-center gap-2">
            <Send className="h-4 w-4" />
            Send Notification
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-xl">
              <Bell className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              <p className="text-sm text-gray-500">Total Sent Today</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-yellow-100 rounded-xl">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
              <p className="text-sm text-gray-500">Pending</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 rounded-xl">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.delivered}</p>
              <p className="text-sm text-gray-500">Delivered</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-red-100 rounded-xl">
              <XCircle className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.failed}</p>
              <p className="text-sm text-gray-500">Failed</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-xl border border-gray-100">
        {/* Tabs */}
        <div className="border-b border-gray-100">
          <div className="flex gap-1 p-2">
            {[
              { id: 'notifications', label: 'Notification History', icon: <Bell className="h-4 w-4" /> },
              { id: 'templates', label: 'Templates', icon: <FileText className="h-4 w-4" /> },
              { id: 'settings', label: 'Settings', icon: <Settings className="h-4 w-4" /> },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? 'bg-teal-50 text-teal-700'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {activeTab === 'notifications' && (
          <>
            {/* Search & Filter */}
            <div className="p-4 border-b border-gray-100">
              <div className="flex gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search notifications..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-200 rounded-lg"
                >
                  <option value="all">All Types</option>
                  <option value="appointment">Appointment</option>
                  <option value="lab_result">Lab Result</option>
                  <option value="prescription">Prescription</option>
                  <option value="payment">Payment</option>
                  <option value="emergency">Emergency</option>
                  <option value="system">System</option>
                </select>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-200 rounded-lg"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="sent">Sent</option>
                  <option value="delivered">Delivered</option>
                  <option value="failed">Failed</option>
                  <option value="read">Read</option>
                </select>
              </div>

              {selectedNotifications.length > 0 && (
                <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-100">
                  <span className="text-sm text-gray-600">
                    {selectedNotifications.length} selected
                  </span>
                  <button className="px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg flex items-center gap-1">
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </button>
                  <button className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50 rounded-lg flex items-center gap-1">
                    <Archive className="h-4 w-4" />
                    Archive
                  </button>
                  <button className="px-3 py-1.5 text-sm text-teal-600 hover:bg-teal-50 rounded-lg flex items-center gap-1">
                    <RefreshCw className="h-4 w-4" />
                    Retry Failed
                  </button>
                </div>
              )}
            </div>

            {/* Notifications List */}
            <div className="divide-y divide-gray-100">
              {/* Select All Header */}
              <div className="p-3 bg-gray-50 flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={selectedNotifications.length === filteredNotifications.length && filteredNotifications.length > 0}
                  onChange={toggleSelectAll}
                  className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                />
                <span className="text-sm text-gray-500">Select All</span>
              </div>

              {filteredNotifications.map(notif => (
                <div key={notif.id} className="p-4 hover:bg-gray-50 flex items-start gap-4">
                  <input
                    type="checkbox"
                    checked={selectedNotifications.includes(notif.id)}
                    onChange={() => toggleSelect(notif.id)}
                    className="mt-1 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                  />
                  <div className={`p-2 rounded-lg ${getTypeColor(notif.type)}`}>
                    {typeIcons[notif.type]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900">{notif.title}</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs ${getStatusColor(notif.status)}`}>
                        {notif.status}
                      </span>
                      {notif.priority === 'urgent' && (
                        <AlertTriangle className={`h-4 w-4 ${getPriorityColor(notif.priority)}`} />
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mt-1 truncate">{notif.message}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {notif.recipient}
                      </span>
                      <span className="flex items-center gap-1">
                        {channelIcons[notif.channel]}
                        {notif.channel.toUpperCase()}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(notif.createdAt).toLocaleString('en-NG')}
                      </span>
                    </div>
                  </div>
                  <button className="p-2 hover:bg-gray-100 rounded-lg">
                    <MoreVertical className="h-4 w-4 text-gray-400" />
                  </button>
                </div>
              ))}
            </div>
          </>
        )}

        {activeTab === 'templates' && (
          <div className="p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-gray-900">Notification Templates</h3>
              <button className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 text-sm">
                + Create Template
              </button>
            </div>
            <div className="space-y-3">
              {mockTemplates.map(template => (
                <div key={template.id} className="p-4 border border-gray-100 rounded-xl">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-gray-900">{template.name}</h4>
                        <span className={`px-2 py-0.5 rounded-full text-xs ${getTypeColor(template.type)}`}>
                          {template.type}
                        </span>
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs flex items-center gap-1">
                          {channelIcons[template.channel]}
                          {template.channel}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-2">{template.body}</p>
                      <div className="flex gap-2 mt-2">
                        {template.variables.map(v => (
                          <span key={v} className="px-2 py-0.5 bg-teal-50 text-teal-700 rounded text-xs">
                            {`{{${v}}}`}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded-full text-xs ${template.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                        {template.isActive ? 'Active' : 'Inactive'}
                      </span>
                      <button className="p-2 hover:bg-gray-100 rounded-lg">
                        <MoreVertical className="h-4 w-4 text-gray-400" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="p-6 space-y-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Channel Configuration</h3>
              <div className="space-y-4">
                {[
                  { channel: 'SMS', provider: 'Termii', status: 'Connected', icon: <Phone className="h-5 w-5" /> },
                  { channel: 'Email', provider: 'SendGrid', status: 'Connected', icon: <Mail className="h-5 w-5" /> },
                  { channel: 'Push', provider: 'Firebase', status: 'Connected', icon: <Bell className="h-5 w-5" /> },
                ].map(item => (
                  <div key={item.channel} className="flex items-center justify-between p-4 border border-gray-100 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gray-100 rounded-lg">
                        {item.icon}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{item.channel} Notifications</p>
                        <p className="text-sm text-gray-500">Provider: {item.provider}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                        {item.status}
                      </span>
                      <button className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm hover:bg-gray-50">
                        Configure
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Default Settings</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">Appointment Reminders</p>
                    <p className="text-sm text-gray-500">Send reminders 24h and 1h before appointments</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" defaultChecked className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:ring-2 peer-focus:ring-teal-500 rounded-full peer peer-checked:bg-teal-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full"></div>
                  </label>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">Lab Result Alerts</p>
                    <p className="text-sm text-gray-500">Notify patients when lab results are ready</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" defaultChecked className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:ring-2 peer-focus:ring-teal-500 rounded-full peer peer-checked:bg-teal-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full"></div>
                  </label>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">Payment Confirmations</p>
                    <p className="text-sm text-gray-500">Send receipts after successful payments</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" defaultChecked className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:ring-2 peer-focus:ring-teal-500 rounded-full peer peer-checked:bg-teal-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full"></div>
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
