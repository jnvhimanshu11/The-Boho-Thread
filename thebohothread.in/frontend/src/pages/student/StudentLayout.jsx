import { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Sidebar from '../../components/layout/Sidebar.jsx'
import { LayoutDashboard, CalendarCheck, CreditCard, User } from 'lucide-react'
import StudentDashboard from './StudentDashboard.jsx'
import StudentAttendance from './StudentAttendance.jsx'
import StudentFees from './StudentFees.jsx'
import StudentProfile from './StudentProfile.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { studentAPI } from '../../services/api.js'

const NAV = [
  { path: '/student', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/student/attendance', label: 'My Attendance', icon: CalendarCheck },
  { path: '/student/fees', label: 'My Fees', icon: CreditCard },
  { path: '/student/profile', label: 'My Profile', icon: User },
]

export default function StudentLayout() {
  const { updateLogo } = useAuth()

  useEffect(() => {
    // Fetch fresh logo on mount and sync to AuthContext so Sidebar shows latest
    studentAPI.getLogo()
      .then(r => { if (r.data?.logoBase64) updateLogo(r.data.logoBase64) })
      .catch(() => {}) // silently ignore — logo is non-critical
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar navItems={NAV} roleColor="bg-emerald-500/20 text-emerald-300" roleLabel="Student" />
      <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
        <Routes>
          <Route index element={<StudentDashboard />} />
          <Route path="attendance" element={<StudentAttendance />} />
          <Route path="fees" element={<StudentFees />} />
          <Route path="profile" element={<StudentProfile />} />
          <Route path="*" element={<Navigate to="/student" replace />} />
        </Routes>
      </main>
    </div>
  )
}