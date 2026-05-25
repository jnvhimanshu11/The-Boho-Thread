import { Routes, Route, Navigate } from 'react-router-dom'
import Sidebar from '../../components/layout/Sidebar.jsx'
import { LayoutDashboard, GraduationCap, CalendarCheck, User } from 'lucide-react'
import TeacherDashboard from './TeacherDashboard.jsx'
import TeacherStudents from './TeacherStudents.jsx'
import TeacherAttendance from './TeacherAttendance.jsx'
import TeacherProfile from './TeacherProfile.jsx'

const NAV = [
  { path: '/teacher', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/teacher/students', label: 'My Students', icon: GraduationCap },
  { path: '/teacher/attendance', label: 'Attendance', icon: CalendarCheck },
  { path: '/teacher/profile', label: 'My Profile', icon: User },
]

export default function TeacherLayout() {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar navItems={NAV} roleColor="bg-sky-500/20 text-sky-300" roleLabel="Teacher" />
      <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
        <Routes>
          <Route index element={<TeacherDashboard />} />
          <Route path="students" element={<TeacherStudents />} />
          <Route path="attendance" element={<TeacherAttendance />} />
          <Route path="profile" element={<TeacherProfile />} />
          <Route path="*" element={<Navigate to="/teacher" replace />} />
        </Routes>
      </main>
    </div>
  )
}
