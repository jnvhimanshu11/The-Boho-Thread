'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CalendarDays, Check, X, Clock, Save, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import Sidebar from '@/components/layout/Sidebar';
import { attendanceApi, studentsApi } from '@/lib/crm-api';
import { Student, Attendance } from '@/types';
import { CLASSES, formatDate } from '@/lib/utils';

type AttendanceStatus = 'present' | 'absent' | 'late';

export default function AttendancePage() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedClass, setSelectedClass] = useState('10');
  const [attendance, setAttendance] = useState<Record<string, AttendanceStatus>>({});

  const queryClient = useQueryClient();

  const { data: studentsRes, isLoading: studentsLoading } = useQuery({
    queryKey: ['students-class', selectedClass],
    queryFn: () => studentsApi.getAll({ class: selectedClass, limit: 100 } as any),
  });

  const { data: existingAttendance } = useQuery({
    queryKey: ['attendance', selectedDate, selectedClass],
    queryFn: () => attendanceApi.getByDate(selectedDate, selectedClass),
    onSuccess: (res: any) => {
      const map: Record<string, AttendanceStatus> = {};
      (res?.data ?? []).forEach((a: Attendance) => {
        map[a.studentId] = a.status;
      });
      setAttendance(map);
    },
  } as any);

  const saveMutation = useMutation({
    mutationFn: () => {
      const students = studentsRes?.data?.data ?? [];
      const records = students.map((s: Student) => ({
        studentId: s._id,
        schoolId: s.schoolId,
        date: selectedDate,
        status: attendance[s._id] ?? 'absent',
      }));
      return attendanceApi.markBulk(records);
    },
    onSuccess: () => {
      toast.success('Attendance saved!');
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
    },
    onError: () => toast.error('Failed to save attendance'),
  });

  const setStatus = (studentId: string, status: AttendanceStatus) => {
    setAttendance((prev) => ({ ...prev, [studentId]: status }));
  };

  const markAll = (status: AttendanceStatus) => {
    const students = studentsRes?.data?.data ?? [];
    const all: Record<string, AttendanceStatus> = {};
    students.forEach((s: Student) => { all[s._id] = status; });
    setAttendance(all);
  };

  const students: Student[] = studentsRes?.data?.data ?? [];
  const presentCount = Object.values(attendance).filter(s => s === 'present').length;
  const absentCount = Object.values(attendance).filter(s => s === 'absent').length;
  const lateCount = Object.values(attendance).filter(s => s === 'late').length;

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-950">
      <Sidebar role="school_admin" />

      <main className="flex-1 overflow-y-auto">
        <div className="p-6 lg:p-8 max-w-5xl mx-auto">
          <div className="page-header">
            <div>
              <h1 className="page-title">Attendance</h1>
              <p className="text-slate-500 text-sm">{formatDate(selectedDate)}</p>
            </div>
            <button
              onClick={() => saveMutation.mutate()}
              disabled={saveMutation.isPending || students.length === 0}
              className="btn-primary flex items-center gap-2"
            >
              {saveMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save Attendance
            </button>
          </div>

          {/* Filters */}
          <div className="card p-4 mb-6 flex flex-wrap gap-4">
            <div>
              <label className="label">Date</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                max={new Date().toISOString().split('T')[0]}
                className="input-field"
              />
            </div>
            <div>
              <label className="label">Class</label>
              <select value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)} className="input-field">
                {CLASSES.filter(c => c !== 'College').map((cls) => (
                  <option key={cls} value={cls}>Class {cls}</option>
                ))}
              </select>
            </div>
            <div className="flex items-end gap-2">
              <button onClick={() => markAll('present')} className="btn-secondary text-sm text-green-600 border-green-200 hover:bg-green-50">
                Mark All Present
              </button>
              <button onClick={() => markAll('absent')} className="btn-secondary text-sm text-red-600 border-red-200 hover:bg-red-50">
                Mark All Absent
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            {[
              { label: 'Present', count: presentCount, color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/20' },
              { label: 'Absent', count: absentCount, color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-900/20' },
              { label: 'Late', count: lateCount, color: 'text-yellow-600', bg: 'bg-yellow-50 dark:bg-yellow-900/20' },
            ].map((s) => (
              <div key={s.label} className={`card p-4 text-center ${s.bg}`}>
                <div className={`font-bold text-2xl ${s.color}`}>{s.count}</div>
                <div className="text-sm text-slate-500">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Student List */}
          <div className="card overflow-hidden">
            {studentsLoading ? (
              <div className="p-8 text-center text-slate-400">Loading students...</div>
            ) : students.length === 0 ? (
              <div className="p-8 text-center text-slate-400">No students in Class {selectedClass}</div>
            ) : (
              <table className="w-full">
                <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="table-header">Roll No.</th>
                    <th className="table-header">Student Name</th>
                    <th className="table-header">Section</th>
                    <th className="table-header text-center">Present</th>
                    <th className="table-header text-center">Absent</th>
                    <th className="table-header text-center">Late</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {students.map((student) => {
                    const status = attendance[student._id];
                    return (
                      <tr key={student._id} className={`hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${
                        status === 'present' ? 'border-l-4 border-l-green-500' :
                        status === 'absent' ? 'border-l-4 border-l-red-500' :
                        status === 'late' ? 'border-l-4 border-l-yellow-500' : ''
                      }`}>
                        <td className="table-cell font-mono">{student.rollNumber}</td>
                        <td className="table-cell font-medium text-slate-900 dark:text-white">{student.name}</td>
                        <td className="table-cell">
                          <span className="badge badge-info">{student.section}</span>
                        </td>
                        {(['present', 'absent', 'late'] as AttendanceStatus[]).map((s) => (
                          <td key={s} className="table-cell text-center">
                            <button
                              onClick={() => setStatus(student._id, s)}
                              className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto transition-all ${
                                status === s
                                  ? s === 'present' ? 'bg-green-500 text-white'
                                  : s === 'absent' ? 'bg-red-500 text-white'
                                  : 'bg-yellow-500 text-white'
                                  : 'bg-slate-100 dark:bg-slate-700 text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600'
                              }`}
                            >
                              {s === 'present' ? <Check className="w-4 h-4" /> :
                               s === 'absent' ? <X className="w-4 h-4" /> :
                               <Clock className="w-4 h-4" />}
                            </button>
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
