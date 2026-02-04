import React, { useState } from 'react';
import { useAuthStore } from '@/stores/auth.store';
import { formatCurrency, cn } from '@/utils';
import {
  BarChart3,
  Users,
  Calendar,
  DollarSign,
  Activity,
  BedDouble,
  Stethoscope,
  TestTube,
  Pill,
  FileText,
  Download,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  PieChart,
  LineChart,
  CheckCircle,
  AlertTriangle,
  Printer,
  Mail,
} from 'lucide-react';

type ReportType = 'overview' | 'patients' | 'revenue' | 'clinical' | 'operational';
type DateRange = 'today' | 'week' | 'month' | 'quarter' | 'year' | 'custom';

interface MetricCard {
  label: string;
  value: string | number;
  change: number;
  changeLabel: string;
  icon: React.ElementType;
  color: string;
}

interface ChartData {
  label: string;
  value: number;
  color?: string;
}

// Mock data for reports
const mockOverviewMetrics: MetricCard[] = [
  { label: 'Total Patients', value: '12,458', change: 12.5, changeLabel: 'vs last month', icon: Users, color: 'blue' },
  { label: 'Total Revenue', value: '₦45.2M', change: 8.3, changeLabel: 'vs last month', icon: DollarSign, color: 'green' },
  { label: 'Appointments', value: '3,247', change: -2.1, changeLabel: 'vs last month', icon: Calendar, color: 'purple' },
  { label: 'Bed Occupancy', value: '78%', change: 5.2, changeLabel: 'vs last month', icon: BedDouble, color: 'orange' },
];

const mockRevenueByDepartment: ChartData[] = [
  { label: 'Consultation', value: 15200000, color: '#3B82F6' },
  { label: 'Laboratory', value: 8500000, color: '#10B981' },
  { label: 'Pharmacy', value: 12300000, color: '#8B5CF6' },
  { label: 'Radiology', value: 5800000, color: '#F59E0B' },
  { label: 'Procedures', value: 3400000, color: '#EF4444' },
];

const mockPatientsByGender: ChartData[] = [
  { label: 'Male', value: 5432, color: '#3B82F6' },
  { label: 'Female', value: 6826, color: '#EC4899' },
  { label: 'Other', value: 200, color: '#6B7280' },
];

const mockMonthlyTrend = [
  { month: 'Aug', patients: 2100, revenue: 32000000 },
  { month: 'Sep', patients: 2350, revenue: 35000000 },
  { month: 'Oct', patients: 2800, revenue: 38000000 },
  { month: 'Nov', patients: 2600, revenue: 41000000 },
  { month: 'Dec', patients: 3100, revenue: 43000000 },
  { month: 'Jan', patients: 3247, revenue: 45200000 },
];

const mockTopDoctors = [
  { name: 'Dr. Adaeze Obi', department: 'General Medicine', consultations: 245, revenue: 4900000 },
  { name: 'Dr. Chukwuemeka Okafor', department: 'Cardiology', consultations: 189, revenue: 5670000 },
  { name: 'Dr. Amina Hassan', department: 'Obstetrics', consultations: 156, revenue: 3900000 },
  { name: 'Dr. Emeka Nwosu', department: 'Radiology', consultations: 312, revenue: 4680000 },
  { name: 'Dr. Fatima Ahmed', department: 'Pediatrics', consultations: 198, revenue: 2970000 },
];

const mockLabTestVolume = [
  { test: 'Full Blood Count', count: 1245, revenue: 1868000 },
  { test: 'Malaria Parasite', count: 987, revenue: 987000 },
  { test: 'Liver Function Test', count: 654, revenue: 1962000 },
  { test: 'Lipid Profile', count: 543, revenue: 1629000 },
  { test: 'Blood Sugar', count: 1532, revenue: 1225000 },
];

const mockOperationalMetrics = [
  { metric: 'Average Wait Time', value: '32 mins', target: '< 30 mins', status: 'warning' },
  { metric: 'Patient Satisfaction', value: '4.2/5', target: '> 4.0', status: 'good' },
  { metric: 'No-Show Rate', value: '8.5%', target: '< 10%', status: 'good' },
  { metric: 'Bed Turnover', value: '3.2 days', target: '< 4 days', status: 'good' },
  { metric: 'Lab TAT', value: '4.5 hrs', target: '< 4 hrs', status: 'warning' },
  { metric: 'ER Wait Time', value: '18 mins', target: '< 20 mins', status: 'good' },
];

export const ReportsPage: React.FC = () => {
  const canView = (useAuthStore((state) => state as any).canView) ?? (() => true);


  // State
  const [activeReport, setActiveReport] = useState<ReportType>('overview');
  const [dateRange, setDateRange] = useState<DateRange>('month');
  const [selectedDepartment, setSelectedDepartment] = useState('');

  // Calculate totals
  const totalRevenue = mockRevenueByDepartment.reduce((sum, d) => sum + d.value, 0);
  const totalPatients = mockPatientsByGender.reduce((sum, d) => sum + d.value, 0);

  // Simple bar chart component
  const SimpleBarChart: React.FC<{ data: ChartData[]; maxValue?: number }> = ({ data, maxValue }) => {
    const max = maxValue || Math.max(...data.map(d => d.value));
    return (
      <div className="space-y-3">
        {data.map((item, idx) => (
          <div key={idx}>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-700">{item.label}</span>
              <span className="font-medium">{typeof item.value === 'number' && item.value > 10000 ? formatCurrency(item.value) : item.value.toLocaleString()}</span>
            </div>
            <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${(item.value / max) * 100}%`,
                  backgroundColor: item.color || '#0D9488',
                }}
              />
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-gray-500">Hospital performance metrics and insights</p>
        </div>

        <div className="flex items-center gap-3">
          {/* Date Range */}
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value as DateRange)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
          >
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
            <option value="year">This Year</option>
          </select>

          <button className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            <RefreshCw size={16} />
          </button>

          <button className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700">
            <Download size={16} />
            Export
          </button>
        </div>
      </div>

      {/* Report Type Tabs */}
      <div className="flex flex-wrap gap-2">
        {[
          { id: 'overview', label: 'Overview', icon: BarChart3 },
          { id: 'patients', label: 'Patients', icon: Users },
          { id: 'revenue', label: 'Revenue', icon: DollarSign },
          { id: 'clinical', label: 'Clinical', icon: Stethoscope },
          { id: 'operational', label: 'Operational', icon: Activity },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveReport(tab.id as ReportType)}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition',
              activeReport === tab.id
                ? 'bg-teal-100 text-teal-700'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            )}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Overview Report */}
      {activeReport === 'overview' && (
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {mockOverviewMetrics.map((metric, idx) => (
              <div key={idx} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">{metric.label}</p>
                    <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
                  </div>
                  <div className={cn(
                    'w-10 h-10 rounded-lg flex items-center justify-center',
                    metric.color === 'blue' ? 'bg-blue-100' :
                    metric.color === 'green' ? 'bg-green-100' :
                    metric.color === 'purple' ? 'bg-purple-100' : 'bg-orange-100'
                  )}>
                    <metric.icon size={20} className={cn(
                      metric.color === 'blue' ? 'text-blue-600' :
                      metric.color === 'green' ? 'text-green-600' :
                      metric.color === 'purple' ? 'text-purple-600' : 'text-orange-600'
                    )} />
                  </div>
                </div>
                <div className="flex items-center gap-1 mt-3 text-sm">
                  {metric.change >= 0 ? (
                    <ArrowUpRight size={16} className="text-green-500" />
                  ) : (
                    <ArrowDownRight size={16} className="text-red-500" />
                  )}
                  <span className={metric.change >= 0 ? 'text-green-600' : 'text-red-600'}>
                    {Math.abs(metric.change)}%
                  </span>
                  <span className="text-gray-400">{metric.changeLabel}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue by Department */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="font-semibold text-gray-900">Revenue by Department</h3>
                  <p className="text-sm text-gray-500">Total: {formatCurrency(totalRevenue)}</p>
                </div>
                <PieChart size={20} className="text-gray-400" />
              </div>
              <SimpleBarChart data={mockRevenueByDepartment} />
            </div>

            {/* Monthly Trend */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="font-semibold text-gray-900">Monthly Trend</h3>
                  <p className="text-sm text-gray-500">Patient visits & revenue</p>
                </div>
                <LineChart size={20} className="text-gray-400" />
              </div>
              <div className="space-y-4">
                {mockMonthlyTrend.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-4">
                    <span className="w-12 text-sm text-gray-500">{item.month}</span>
                    <div className="flex-1 flex items-center gap-2">
                      <div className="flex-1 h-4 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-teal-500 rounded-full"
                          style={{ width: `${(item.patients / 3500) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium w-16">{item.patients}</span>
                    </div>
                    <span className="text-sm text-gray-500 w-20 text-right">{formatCurrency(item.revenue)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Top Performers */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h3 className="font-semibold text-gray-900">Top Performing Doctors</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Doctor</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Department</th>
                    <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase">Consultations</th>
                    <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase">Revenue</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {mockTopDoctors.map((doctor, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center text-teal-700 font-medium text-sm">
                            {idx + 1}
                          </div>
                          <span className="font-medium text-gray-900">{doctor.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-600">{doctor.department}</td>
                      <td className="px-6 py-4 text-right font-medium">{doctor.consultations}</td>
                      <td className="px-6 py-4 text-right font-bold text-green-600">{formatCurrency(doctor.revenue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Patients Report */}
      {activeReport === 'patients' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Users size={20} className="text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Registered</p>
                  <p className="text-2xl font-bold">{totalPatients.toLocaleString()}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle size={20} className="text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">New This Month</p>
                  <p className="text-2xl font-bold">847</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Activity size={20} className="text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Active (30 days)</p>
                  <p className="text-2xl font-bold">3,247</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Gender Distribution */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
              <h3 className="font-semibold text-gray-900 mb-6">Gender Distribution</h3>
              <div className="flex items-center gap-8">
                <div className="relative w-40 h-40">
                  <svg viewBox="0 0 100 100" className="transform -rotate-90">
                    <circle cx="50" cy="50" r="40" fill="none" stroke="#E5E7EB" strokeWidth="20" />
                    <circle
                      cx="50" cy="50" r="40" fill="none" stroke="#3B82F6" strokeWidth="20"
                      strokeDasharray={`${(5432 / totalPatients) * 251.2} 251.2`}
                    />
                    <circle
                      cx="50" cy="50" r="40" fill="none" stroke="#EC4899" strokeWidth="20"
                      strokeDasharray={`${(6826 / totalPatients) * 251.2} 251.2`}
                      strokeDashoffset={`${-(5432 / totalPatients) * 251.2}`}
                    />
                  </svg>
                </div>
                <div className="space-y-3">
                  {mockPatientsByGender.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-gray-700">{item.label}</span>
                      <span className="font-medium">{item.value.toLocaleString()}</span>
                      <span className="text-gray-400">({((item.value / totalPatients) * 100).toFixed(1)}%)</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Age Distribution */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
              <h3 className="font-semibold text-gray-900 mb-6">Age Distribution</h3>
              <SimpleBarChart
                data={[
                  { label: '0-18 years', value: 2845, color: '#10B981' },
                  { label: '19-35 years', value: 3567, color: '#3B82F6' },
                  { label: '36-50 years', value: 2890, color: '#8B5CF6' },
                  { label: '51-65 years', value: 1876, color: '#F59E0B' },
                  { label: '65+ years', value: 1280, color: '#EF4444' },
                ]}
              />
            </div>
          </div>
        </div>
      )}

      {/* Revenue Report */}
      {activeReport === 'revenue' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <p className="text-sm text-gray-500 mb-1">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(45200000)}</p>
              <p className="text-sm text-green-600 mt-1">+8.3% vs last month</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <p className="text-sm text-gray-500 mb-1">Outstanding</p>
              <p className="text-2xl font-bold text-orange-600">{formatCurrency(8500000)}</p>
              <p className="text-sm text-gray-500 mt-1">156 invoices</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <p className="text-sm text-gray-500 mb-1">HMO Claims</p>
              <p className="text-2xl font-bold text-purple-600">{formatCurrency(12300000)}</p>
              <p className="text-sm text-gray-500 mt-1">89 pending</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <p className="text-sm text-gray-500 mb-1">Collection Rate</p>
              <p className="text-2xl font-bold text-green-600">87.2%</p>
              <p className="text-sm text-gray-500 mt-1">Target: 90%</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
              <h3 className="font-semibold text-gray-900 mb-6">Revenue by Department</h3>
              <SimpleBarChart data={mockRevenueByDepartment} />
            </div>

            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
              <h3 className="font-semibold text-gray-900 mb-6">Payment Methods</h3>
              <SimpleBarChart
                data={[
                  { label: 'Cash', value: 18500000, color: '#10B981' },
                  { label: 'Card', value: 12300000, color: '#3B82F6' },
                  { label: 'Bank Transfer', value: 8900000, color: '#8B5CF6' },
                  { label: 'HMO', value: 4200000, color: '#F59E0B' },
                  { label: 'Wallet', value: 1300000, color: '#EF4444' },
                ]}
              />
            </div>
          </div>
        </div>
      )}

      {/* Clinical Report */}
      {activeReport === 'clinical' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Stethoscope size={20} className="text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Consultations</p>
                  <p className="text-2xl font-bold">3,247</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
                  <TestTube size={20} className="text-teal-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Lab Tests</p>
                  <p className="text-2xl font-bold">4,961</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Pill size={20} className="text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Prescriptions</p>
                  <p className="text-2xl font-bold">2,845</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <BedDouble size={20} className="text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Admissions</p>
                  <p className="text-2xl font-bold">187</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Lab Tests */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
              <h3 className="font-semibold text-gray-900 mb-6">Top Laboratory Tests</h3>
              <div className="space-y-4">
                {mockLabTestVolume.map((test, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 bg-teal-100 rounded-full flex items-center justify-center text-teal-700 text-xs font-medium">
                        {idx + 1}
                      </span>
                      <span className="text-gray-700">{test.test}</span>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{test.count.toLocaleString()}</p>
                      <p className="text-xs text-gray-500">{formatCurrency(test.revenue)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Diagnoses */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
              <h3 className="font-semibold text-gray-900 mb-6">Common Diagnoses</h3>
              <SimpleBarChart
                data={[
                  { label: 'Malaria', value: 456, color: '#EF4444' },
                  { label: 'Hypertension', value: 389, color: '#F59E0B' },
                  { label: 'Diabetes', value: 312, color: '#8B5CF6' },
                  { label: 'URTI', value: 287, color: '#3B82F6' },
                  { label: 'UTI', value: 234, color: '#10B981' },
                ]}
              />
            </div>
          </div>
        </div>
      )}

      {/* Operational Report */}
      {activeReport === 'operational' && (
        <div className="space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {mockOperationalMetrics.map((item, idx) => (
              <div key={idx} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">{item.metric}</p>
                    <p className="text-2xl font-bold text-gray-900">{item.value}</p>
                    <p className="text-xs text-gray-400 mt-1">Target: {item.target}</p>
                  </div>
                  <span className={cn(
                    'px-2 py-1 rounded-full text-xs font-medium',
                    item.status === 'good' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                  )}>
                    {item.status === 'good' ? 'On Track' : 'Needs Attention'}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Staff Utilization */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
              <h3 className="font-semibold text-gray-900 mb-6">Staff Utilization</h3>
              <SimpleBarChart
                data={[
                  { label: 'Doctors', value: 85, color: '#3B82F6' },
                  { label: 'Nurses', value: 92, color: '#10B981' },
                  { label: 'Lab Techs', value: 78, color: '#8B5CF6' },
                  { label: 'Pharmacists', value: 88, color: '#F59E0B' },
                  { label: 'Admin', value: 72, color: '#6B7280' },
                ]}
                maxValue={100}
              />
              <p className="text-xs text-gray-500 mt-4">Percentage of capacity utilized</p>
            </div>

            {/* Resource Availability */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
              <h3 className="font-semibold text-gray-900 mb-6">Resource Status</h3>
              <div className="space-y-4">
                {[
                  { resource: 'General Beds', available: 15, total: 52, status: 'good' },
                  { resource: 'ICU Beds', available: 2, total: 8, status: 'warning' },
                  { resource: 'Operating Theaters', available: 1, total: 3, status: 'warning' },
                  { resource: 'Ambulances', available: 2, total: 4, status: 'good' },
                  { resource: 'Ventilators', available: 4, total: 6, status: 'good' },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <span className="text-gray-700">{item.resource}</span>
                    <div className="flex items-center gap-3">
                      <span className={cn(
                        'font-bold',
                        item.status === 'good' ? 'text-green-600' : 'text-orange-600'
                      )}>
                        {item.available}
                      </span>
                      <span className="text-gray-400">/ {item.total}</span>
                      {item.status === 'warning' && (
                        <AlertTriangle size={16} className="text-orange-500" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
        <div className="flex flex-wrap gap-3">
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
            <FileText size={16} />
            Generate Full Report
          </button>
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
            <Printer size={16} />
            Print Dashboard
          </button>
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
            <Mail size={16} />
            Email Report
          </button>
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
            <Calendar size={16} />
            Schedule Report
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;
