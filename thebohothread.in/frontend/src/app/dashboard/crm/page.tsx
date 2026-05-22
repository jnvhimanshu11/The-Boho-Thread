'use client';

import { Users, IndianRupee, AlertTriangle, TrendingUp, CalendarCheck, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import Sidebar from '@/components/layout/Sidebar';
import { dashboardApi } from '@/lib/crm-api';
import { formatCurrency, formatDate } from '@/lib/utils';

const MONTHLY_FEES = [
  { month: 'Jan', collected: 420000, pending: 80000 },
  { month: 'Feb', collected: 380000, pending: 120000 },
  { month: 'Mar', collected: 510000, pending: 60000 },
  { month: 'Apr', collected: 460000, pending: 90000 },
  { month: 'May', collected: 430000, pending: 110000 },
  { month: 'Jun', collected: 490000, pending: 75000 },
];

export default function CRMDashboardPage() {
  const { data: statsRes } = useQuery({
    queryKey: ['crm-stats'],
    queryFn: dashboardApi.getStats,
  });

  const stats = statsRes?.data;

  const STAT_CARDS = [
    {
      label: 'Total Students',
      value: stats?.totalStudents ?? 1240,
      icon: Users,
      color: 'text-blue-600',
      bg: 'bg-blue-50 dark:bg-blue-900/20',
      href: '/dashboard/crm/students',
      change: '+12 this month',
    },
    {
      label: 'Fees Collected',
      value: formatCurrency(stats?.feesCollected ?? 420000),
      icon: IndianRupee,
      color: 'text-green-600',
      bg: 'bg-green-50 dark:bg-green-900/20',
      href: '/dashboard/crm/fees',
      change: '↑ 8% vs last month',
    },
    {
      label: 'Fees Pending',
      value: formatCurrency(stats?.feesPending ?? 68000),
      icon: AlertTriangle,
      color: 'text-orange-600',
      bg: 'bg-orange-50 dark:bg-orange-900/20',
      href: '/dashboard/crm/fees?status=pending',
      change: '42 students',
    },
    {
      label: 'Today\'s Attendance',
      value: `${stats?.todayAttendance ?? 94}%`,
      icon: CalendarCheck,
      color: 'text-purple-600',
      bg: 'bg-purple-50 dark:bg-purple-900/20',
      href: '/dashboard/crm/attendance',
      change: '1,165 present',
    },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-950">
      <Sidebar role="school_admin" />

      <main className="flex-1 overflow-y-auto">
        <div className="p-6 lg:p-8 max-w-6xl mx-auto">
          {/* Header */}
          <div className="page-header">
            <div>
              <h1 className="page-title">School Dashboard</h1>
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">{formatDate(new Date())}</p>
            </div>
            <div className="flex gap-3">
              <Link href="/dashboard/crm/students" className="btn-secondary text-sm flex items-center gap-2">
                <Users className="w-4 h-4" /> Add Student
              </Link>
              <Link href="/dashboard/crm/fees" className="btn-primary text-sm flex items-center gap-2">
                <IndianRupee className="w-4 h-4" /> Collect Fee
              </Link>
            </div>
          </div>

          {/* Stat Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {STAT_CARDS.map((card) => (
              <Link key={card.label} href={card.href} className="stat-card hover:shadow-md transition-all hover:-translate-y-0.5">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${card.bg}`}>
                  <card.icon className={`w-5 h-5 ${card.color}`} />
                </div>
                <div className="min-w-0">
                  <div className="font-bold text-lg text-slate-900 dark:text-white">{card.value}</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">{card.label}</div>
                  <div className="text-xs text-green-600 mt-0.5">{card.change}</div>
                </div>
              </Link>
            ))}
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="card p-5">
              <h3 className="font-display font-bold text-slate-900 dark:text-white mb-5">Monthly Fee Collection</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={MONTHLY_FEES}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}K`} />
                  <Tooltip formatter={(v: number) => formatCurrency(v)} />
                  <Bar dataKey="collected" name="Collected" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="pending" name="Pending" fill="#f97316" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="card p-5">
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-display font-bold text-slate-900 dark:text-white">Recent Payments</h3>
                <Link href="/dashboard/crm/fees" className="text-xs text-primary-600 flex items-center gap-1">
                  View all <ChevronRight className="w-3 h-3" />
                </Link>
              </div>
              <div className="space-y-3">
                {[
                  { name: 'Arjun Sharma', class: '10-A', amount: 12000, status: 'paid', date: '2024-06-10' },
                  { name: 'Priya Singh', class: '9-B', amount: 10500, status: 'paid', date: '2024-06-09' },
                  { name: 'Rohan Gupta', class: '11-A', amount: 15000, status: 'partial', date: '2024-06-08' },
                  { name: 'Anjali Verma', class: '8-C', amount: 9000, status: 'pending', date: '2024-06-07' },
                ].map((p) => (
                  <div key={p.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-xs font-bold text-slate-600">
                        {p.name[0]}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900 dark:text-white">{p.name}</p>
                        <p className="text-xs text-slate-400">Class {p.class}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">{formatCurrency(p.amount)}</p>
                      <span className={`badge ${p.status === 'paid' ? 'badge-success' : p.status === 'partial' ? 'badge-warning' : 'badge-error'}`}>
                        {p.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Manage Students', href: '/dashboard/crm/students', icon: Users, color: 'bg-blue-500' },
              { label: 'Collect Fees', href: '/dashboard/crm/fees', icon: IndianRupee, color: 'bg-green-500' },
              { label: 'Mark Attendance', href: '/dashboard/crm/attendance', icon: CalendarCheck, color: 'bg-purple-500' },
              { label: 'View Reports', href: '/dashboard/crm/reports', icon: TrendingUp, color: 'bg-orange-500' },
            ].map((link) => (
              <Link key={link.href} href={link.href} className="card p-4 flex items-center gap-3 hover:shadow-md transition-all hover:-translate-y-0.5">
                <div className={`w-10 h-10 ${link.color} rounded-xl flex items-center justify-center`}>
                  <link.icon className="w-5 h-5 text-white" />
                </div>
                <span className="text-sm font-semibold text-slate-900 dark:text-white">{link.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
