'use client';

import { useState } from 'react';
import { Download, TrendingUp, Users, IndianRupee, CalendarCheck, FileText } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from 'recharts';
import Sidebar from '@/components/layout/Sidebar';
import { formatCurrency } from '@/lib/utils';

const MONTHLY_DATA = [
  { month: 'Jan', collected: 420000, pending: 80000, students: 1180 },
  { month: 'Feb', collected: 380000, pending: 120000, students: 1195 },
  { month: 'Mar', collected: 510000, pending: 60000, students: 1210 },
  { month: 'Apr', collected: 460000, pending: 90000, students: 1220 },
  { month: 'May', collected: 430000, pending: 110000, students: 1230 },
  { month: 'Jun', collected: 490000, pending: 75000, students: 1240 },
];

const CLASS_DISTRIBUTION = [
  { name: 'Class 6', value: 140 },
  { name: 'Class 7', value: 155 },
  { name: 'Class 8', value: 162 },
  { name: 'Class 9', value: 178 },
  { name: 'Class 10', value: 210 },
  { name: 'Class 11', value: 185 },
  { name: 'Class 12', value: 210 },
];

const FEE_STATUS_DATA = [
  { name: 'Paid', value: 890, color: '#22c55e' },
  { name: 'Partial', value: 180, color: '#f59e0b' },
  { name: 'Pending', value: 120, color: '#3b82f6' },
  { name: 'Overdue', value: 50, color: '#ef4444' },
];

const ATTENDANCE_DATA = [
  { month: 'Jan', rate: 92 },
  { month: 'Feb', rate: 89 },
  { month: 'Mar', rate: 94 },
  { month: 'Apr', rate: 91 },
  { month: 'May', rate: 93 },
  { month: 'Jun', rate: 94 },
];

export default function ReportsPage() {
  const [reportType, setReportType] = useState<'fees' | 'attendance' | 'students'>('fees');

  const exportReport = () => {
    // In real app: call API to generate PDF/Excel
    alert('Report export would trigger here — connects to backend PDF generation');
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-950">
      <Sidebar role="school_admin" />

      <main className="flex-1 overflow-y-auto">
        <div className="p-6 lg:p-8 max-w-6xl mx-auto">
          {/* Header */}
          <div className="page-header">
            <div>
              <h1 className="page-title">Reports & Analytics</h1>
              <p className="text-slate-500 text-sm">Academic Year 2024–25</p>
            </div>
            <button onClick={exportReport} className="btn-primary flex items-center gap-2">
              <Download className="w-4 h-4" /> Export Report
            </button>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Total Students', value: '1,240', icon: Users, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
              { label: 'Total Revenue', value: '₹28.9L', icon: IndianRupee, color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/20' },
              { label: 'Avg Attendance', value: '92.2%', icon: CalendarCheck, color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-900/20' },
              { label: 'Fee Collection', value: '87.3%', icon: TrendingUp, color: 'text-orange-600', bg: 'bg-orange-50 dark:bg-orange-900/20' },
            ].map((s) => (
              <div key={s.label} className="stat-card">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${s.bg}`}>
                  <s.icon className={`w-5 h-5 ${s.color}`} />
                </div>
                <div>
                  <div className="font-bold text-xl text-slate-900 dark:text-white">{s.value}</div>
                  <div className="text-xs text-slate-500">{s.label}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Charts Row 1 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Monthly Fee Collection */}
            <div className="card p-5">
              <h3 className="font-display font-bold text-slate-900 dark:text-white mb-5">Monthly Fee Collection</h3>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={MONTHLY_DATA}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}K`} />
                  <Tooltip formatter={(v: number) => formatCurrency(v)} />
                  <Legend />
                  <Bar dataKey="collected" name="Collected" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="pending" name="Pending" fill="#f97316" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Fee Status Pie */}
            <div className="card p-5">
              <h3 className="font-display font-bold text-slate-900 dark:text-white mb-5">Fee Status Distribution</h3>
              <div className="flex items-center gap-6">
                <ResponsiveContainer width="60%" height={200}>
                  <PieChart>
                    <Pie data={FEE_STATUS_DATA} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value">
                      {FEE_STATUS_DATA.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-3">
                  {FEE_STATUS_DATA.map((s) => (
                    <div key={s.name} className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ background: s.color }} />
                      <span className="text-sm text-slate-600 dark:text-slate-400">{s.name}</span>
                      <span className="font-bold text-slate-900 dark:text-white ml-auto">{s.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Charts Row 2 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Attendance Trend */}
            <div className="card p-5">
              <h3 className="font-display font-bold text-slate-900 dark:text-white mb-5">Attendance Rate Trend</h3>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={ATTENDANCE_DATA}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis domain={[80, 100]} tick={{ fontSize: 12 }} tickFormatter={(v) => `${v}%`} />
                  <Tooltip formatter={(v: number) => `${v}%`} />
                  <Line type="monotone" dataKey="rate" name="Attendance %" stroke="#4f46e5" strokeWidth={2} dot={{ fill: '#4f46e5', r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Class Distribution */}
            <div className="card p-5">
              <h3 className="font-display font-bold text-slate-900 dark:text-white mb-5">Students per Class</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={CLASS_DISTRIBUTION} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis type="number" tick={{ fontSize: 12 }} />
                  <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={65} />
                  <Tooltip />
                  <Bar dataKey="value" name="Students" fill="#6366f1" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Quick Export Buttons */}
          <div className="card p-5">
            <h3 className="font-display font-bold text-slate-900 dark:text-white mb-4">Export Reports</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { label: 'Fee Collection Report', icon: IndianRupee, color: 'text-green-600' },
                { label: 'Attendance Report', icon: CalendarCheck, color: 'text-purple-600' },
                { label: 'Student List', icon: Users, color: 'text-blue-600' },
              ].map((r) => (
                <button
                  key={r.label}
                  onClick={exportReport}
                  className="flex items-center gap-3 p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left"
                >
                  <div className={`p-2 rounded-lg bg-slate-100 dark:bg-slate-800 ${r.color}`}>
                    <r.icon className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-medium text-sm text-slate-900 dark:text-white">{r.label}</p>
                    <p className="text-xs text-slate-400">Download Excel / PDF</p>
                  </div>
                  <Download className="w-4 h-4 text-slate-400 ml-auto" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
