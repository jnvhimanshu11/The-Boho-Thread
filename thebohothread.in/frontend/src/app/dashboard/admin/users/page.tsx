'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, Shield, ShieldOff, Users } from 'lucide-react';
import toast from 'react-hot-toast';
import Sidebar from '@/components/layout/Sidebar';
import apiClient from '@/lib/api-client';
import { User } from '@/types';
import { formatDate, getInitials } from '@/lib/utils';

export default function AdminUsersPage() {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-users', search, roleFilter],
    queryFn: async () => {
      const params = new URLSearchParams({ search, role: roleFilter });
      const { data } = await apiClient.get(`/admin/users?${params}`);
      return data;
    },
  });

  const toggleMutation = useMutation({
    mutationFn: (id: string) => apiClient.patch(`/admin/users/${id}/toggle-active`),
    onSuccess: () => {
      toast.success('User status updated');
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
    onError: () => toast.error('Failed to update user'),
  });

  const users: User[] = data?.data?.data ?? [];

  const ROLE_BADGES: Record<string, string> = {
    student: 'badge-info',
    admin: 'badge bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    school_admin: 'badge bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-950">
      <Sidebar role="admin" />
      <main className="flex-1 overflow-y-auto">
        <div className="p-6 lg:p-8 max-w-6xl mx-auto">
          <div className="page-header">
            <div>
              <h1 className="page-title">Manage Users</h1>
              <p className="text-slate-500 text-sm">{data?.data?.total ?? 0} total users</p>
            </div>
          </div>

          {/* Filters */}
          <div className="card p-4 mb-6 flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name or email..." className="input-field pl-9" />
            </div>
            <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="input-field w-44">
              <option value="">All Roles</option>
              <option value="student">Student</option>
              <option value="school_admin">School Admin</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          {/* Role stats */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            {[
              { label: 'Students', value: users.filter(u => u.role === 'student').length, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
              { label: 'School Admins', value: users.filter(u => u.role === 'school_admin').length, color: 'text-orange-600', bg: 'bg-orange-50 dark:bg-orange-900/20' },
              { label: 'Admins', value: users.filter(u => u.role === 'admin').length, color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-900/20' },
            ].map((s) => (
              <div key={s.label} className={`card p-4 flex items-center gap-3`}>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${s.bg}`}>
                  <Users className={`w-5 h-5 ${s.color}`} />
                </div>
                <div>
                  <div className={`font-bold text-xl ${s.color}`}>{s.value}</div>
                  <div className="text-xs text-slate-500">{s.label}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="table-header">User</th>
                    <th className="table-header">Role</th>
                    <th className="table-header">Class</th>
                    <th className="table-header">Joined</th>
                    <th className="table-header">Status</th>
                    <th className="table-header">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {isLoading
                    ? Array.from({ length: 8 }).map((_, i) => (
                        <tr key={i}>{Array.from({ length: 6 }).map((_, j) => (
                          <td key={j} className="table-cell"><div className="h-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" /></td>
                        ))}</tr>
                      ))
                    : users.length === 0
                    ? <tr><td colSpan={6} className="table-cell text-center py-12 text-slate-400">No users found</td></tr>
                    : users.map((user) => (
                      <tr key={user._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="table-cell">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center text-primary-700 dark:text-primary-400 font-bold text-sm">
                              {getInitials(user.name)}
                            </div>
                            <div>
                              <p className="font-medium text-slate-900 dark:text-white">{user.name}</p>
                              <p className="text-xs text-slate-400">{user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="table-cell">
                          <span className={ROLE_BADGES[user.role] || 'badge'}>{user.role.replace('_', ' ')}</span>
                        </td>
                        <td className="table-cell text-slate-500">{user.class ? `Class ${user.class}` : '—'}</td>
                        <td className="table-cell text-slate-400 text-xs">{formatDate(user.createdAt)}</td>
                        <td className="table-cell">
                          <span className={`badge ${(user as any).isActive !== false ? 'badge-success' : 'badge-error'}`}>
                            {(user as any).isActive !== false ? 'Active' : 'Disabled'}
                          </span>
                        </td>
                        <td className="table-cell">
                          <button
                            onClick={() => toggleMutation.mutate(user._id)}
                            disabled={toggleMutation.isPending}
                            className={`p-1.5 rounded-lg transition-colors ${
                              (user as any).isActive !== false
                                ? 'text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20'
                                : 'text-slate-400 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20'
                            }`}
                            title={(user as any).isActive !== false ? 'Disable user' : 'Enable user'}
                          >
                            {(user as any).isActive !== false ? <ShieldOff className="w-4 h-4" /> : <Shield className="w-4 h-4" />}
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
