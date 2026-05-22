'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, Download, Upload, Trash2, Edit3, Phone, ChevronLeft, ChevronRight, Filter } from 'lucide-react';
import toast from 'react-hot-toast';
import Sidebar from '@/components/layout/Sidebar';
import { studentsApi } from '@/lib/crm-api';
import { Student } from '@/types';
import { formatDate, CLASSES } from '@/lib/utils';
import StudentFormModal from '@/components/crm/StudentFormModal';

export default function StudentsPage() {
  const [search, setSearch] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [page, setPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['students', search, selectedClass, page],
    queryFn: () => studentsApi.getAll({ search, class: selectedClass, page }),
  });

  const deleteMutation = useMutation({
    mutationFn: studentsApi.delete,
    onSuccess: () => {
      toast.success('Student deleted');
      queryClient.invalidateQueries({ queryKey: ['students'] });
    },
    onError: () => toast.error('Failed to delete student'),
  });

  const handleExport = async () => {
    try {
      const blob = await studentsApi.exportExcel();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'students.xlsx';
      a.click();
    } catch {
      toast.error('Export failed');
    }
  };

  const students = data?.data?.data ?? [];
  const total = data?.data?.total ?? 0;
  const totalPages = data?.data?.totalPages ?? 1;

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-950">
      <Sidebar role="school_admin" />

      <main className="flex-1 overflow-y-auto">
        <div className="p-6 lg:p-8 max-w-6xl mx-auto">
          {/* Header */}
          <div className="page-header">
            <div>
              <h1 className="page-title">Students</h1>
              <p className="text-slate-500 text-sm">{total} total students</p>
            </div>
            <div className="flex gap-3">
              <button onClick={handleExport} className="btn-secondary text-sm flex items-center gap-2">
                <Download className="w-4 h-4" /> Export
              </button>
              <button onClick={() => { setEditingStudent(null); setShowForm(true); }} className="btn-primary text-sm flex items-center gap-2">
                <Plus className="w-4 h-4" /> Add Student
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="card p-4 mb-6 flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                placeholder="Search by name, roll number..."
                className="input-field pl-9"
              />
            </div>
            <select
              value={selectedClass}
              onChange={(e) => { setSelectedClass(e.target.value); setPage(1); }}
              className="input-field w-40"
            >
              <option value="">All Classes</option>
              {CLASSES.map((cls) => <option key={cls} value={cls}>Class {cls}</option>)}
            </select>
          </div>

          {/* Table */}
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="table-header">Student</th>
                    <th className="table-header">Roll No.</th>
                    <th className="table-header">Class</th>
                    <th className="table-header">Parent</th>
                    <th className="table-header">Joined</th>
                    <th className="table-header">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {isLoading ? (
                    Array.from({ length: 8 }).map((_, i) => (
                      <tr key={i}>
                        {Array.from({ length: 6 }).map((_, j) => (
                          <td key={j} className="table-cell">
                            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
                          </td>
                        ))}
                      </tr>
                    ))
                  ) : students.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="table-cell text-center py-12 text-slate-400">
                        No students found. Add your first student!
                      </td>
                    </tr>
                  ) : (
                    students.map((student: Student) => (
                      <tr key={student._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="table-cell">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center text-primary-700 dark:text-primary-400 font-bold text-sm">
                              {student.name[0].toUpperCase()}
                            </div>
                            <div>
                              <p className="font-medium text-slate-900 dark:text-white">{student.name}</p>
                              <p className="text-xs text-slate-400">{student.gender}</p>
                            </div>
                          </div>
                        </td>
                        <td className="table-cell font-mono text-slate-600 dark:text-slate-300">{student.rollNumber}</td>
                        <td className="table-cell">
                          <span className="badge badge-info">{student.class}-{student.section}</span>
                        </td>
                        <td className="table-cell">
                          <p className="text-sm">{student.parentName}</p>
                          <p className="text-xs text-slate-400 flex items-center gap-1">
                            <Phone className="w-3 h-3" /> {student.parentPhone}
                          </p>
                        </td>
                        <td className="table-cell text-slate-400">{formatDate(student.createdAt)}</td>
                        <td className="table-cell">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => { setEditingStudent(student); setShowForm(true); }}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                if (confirm('Delete this student?')) deleteMutation.mutate(student._id);
                              }}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <p className="text-sm text-slate-500">
                  Page {page} of {totalPages}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="btn-secondary p-2 disabled:opacity-50"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="btn-secondary p-2 disabled:opacity-50"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {showForm && (
        <StudentFormModal
          student={editingStudent}
          onClose={() => { setShowForm(false); setEditingStudent(null); }}
          onSuccess={() => {
            setShowForm(false);
            setEditingStudent(null);
            queryClient.invalidateQueries({ queryKey: ['students'] });
          }}
        />
      )}
    </div>
  );
}
