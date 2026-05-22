'use client';

import { useQuery } from '@tanstack/react-query';
import { BookOpen, Users, Download, Brain, TrendingUp, Eye, FileText, Plus, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Sidebar from '@/components/layout/Sidebar';
import { formatDate } from '@/lib/utils';

const TRAFFIC_DATA = [
  { day: 'Mon', views: 1200, downloads: 340 },
  { day: 'Tue', views: 1900, downloads: 520 },
  { day: 'Wed', views: 1500, downloads: 410 },
  { day: 'Thu', views: 2200, downloads: 680 },
  { day: 'Fri', views: 2800, downloads: 790 },
  { day: 'Sat', views: 3100, downloads: 920 },
  { day: 'Sun', views: 2600, downloads: 740 },
];

const RECENT_NOTES = [
  { title: 'Quadratic Equations – Full Notes', subject: 'Mathematics', class: '10', views: 1200, createdAt: '2024-06-10' },
  { title: 'Light – Reflection and Refraction', subject: 'Science', class: '10', views: 980, createdAt: '2024-06-09' },
  { title: 'Rise of Nationalism in Europe', subject: 'Social Science', class: '10', views: 750, createdAt: '2024-06-08' },
  { title: 'Electrochemistry Short Notes', subject: 'Chemistry', class: '12', views: 640, createdAt: '2024-06-07' },
];

export default function AdminDashboardPage() {
  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-950">
      <Sidebar role="admin" />
      <main className="flex-1 overflow-y-auto">
        <div className="p-6 lg:p-8 max-w-6xl mx-auto">
          <div className="page-header">
            <div>
              <h1 className="page-title">Admin Dashboard</h1>
              <p className="text-slate-500 dark:text-slate-400 text-sm">{formatDate(new Date())}</p>
            </div>
            <Link href="/dashboard/admin/notes" className="btn-primary flex items-center gap-2">
              <Plus className="w-4 h-4" /> Upload Notes
            </Link>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Total Notes', value: '12,450', icon: BookOpen, color: 'text-primary-600', bg: 'bg-primary-50 dark:bg-primary-900/20' },
              { label: 'Total Users', value: '52,310', icon: Users, color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/20' },
              { label: 'PDF Downloads', value: '2.1L', icon: Download, color: 'text-orange-600', bg: 'bg-orange-50 dark:bg-orange-900/20' },
              { label: 'AI Queries', value: '98,400', icon: Brain, color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-900/20' },
            ].map((s) => (
              <div key={s.label} className="stat-card">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${s.bg}`}>
                  <s.icon className={`w-5 h-5 ${s.color}`} />
                </div>
                <div>
                  <div className="font-bold text-xl text-slate-900 dark:text-white">{s.value}</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">{s.label}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <div className="lg:col-span-2 card p-5">
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-display font-bold text-slate-900 dark:text-white">Weekly Traffic</h3>
                <span className="badge badge-success">↑ 18% this week</span>
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={TRAFFIC_DATA}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="views" name="Page Views" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="downloads" name="Downloads" fill="#f97316" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="card p-5">
              <h3 className="font-display font-bold text-slate-900 dark:text-white mb-4">Quick Actions</h3>
              <div className="space-y-2">
                {[
                  { label: 'Upload New Notes', href: '/dashboard/admin/notes', icon: Plus, color: 'text-primary-600' },
                  { label: 'Manage Users', href: '/dashboard/admin/users', icon: Users, color: 'text-green-600' },
                  { label: 'View Analytics', href: '/dashboard/admin/analytics', icon: TrendingUp, color: 'text-orange-600' },
                  { label: 'Content Settings', href: '/dashboard/admin/settings', icon: FileText, color: 'text-purple-600' },
                ].map((a) => (
                  <Link key={a.href} href={a.href} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors group">
                    <a.icon className={`w-4 h-4 ${a.color}`} />
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300 flex-1">{a.label}</span>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-colors" />
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <div className="card overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-700">
              <h3 className="font-display font-bold text-slate-900 dark:text-white">Recently Uploaded Notes</h3>
              <Link href="/dashboard/admin/notes" className="text-sm text-primary-600 flex items-center gap-1">View all <ChevronRight className="w-4 h-4" /></Link>
            </div>
            <table className="w-full">
              <thead className="bg-slate-50 dark:bg-slate-800">
                <tr>
                  <th className="table-header">Title</th>
                  <th className="table-header">Subject</th>
                  <th className="table-header">Class</th>
                  <th className="table-header">Views</th>
                  <th className="table-header">Uploaded</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {RECENT_NOTES.map((n) => (
                  <tr key={n.title} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="table-cell font-medium text-slate-900 dark:text-white">{n.title}</td>
                    <td className="table-cell text-slate-500">{n.subject}</td>
                    <td className="table-cell"><span className="badge badge-info">Class {n.class}</span></td>
                    <td className="table-cell"><span className="flex items-center gap-1 text-slate-500"><Eye className="w-3.5 h-3.5" />{n.views.toLocaleString()}</span></td>
                    <td className="table-cell text-slate-400">{formatDate(n.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
