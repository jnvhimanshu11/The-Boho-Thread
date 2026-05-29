import { useEffect, useRef } from 'react'
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import Sidebar from '../../components/layout/Sidebar.jsx'
import { LayoutDashboard, GraduationCap, CalendarCheck, User } from 'lucide-react'
import TeacherDashboard from './TeacherDashboard.jsx'
import TeacherStudents from './TeacherStudents.jsx'
import TeacherAttendance from './TeacherAttendance.jsx'
import TeacherProfile from './TeacherProfile.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { teacherAPI } from '../../services/api.js'
import toast from 'react-hot-toast'

const NAV = [
  { path: '/teacher',            label: 'Dashboard',   icon: LayoutDashboard },
  { path: '/teacher/students',   label: 'My Students', icon: GraduationCap   },
  { path: '/teacher/attendance', label: 'Attendance',  icon: CalendarCheck   },
  { path: '/teacher/profile',    label: 'My Profile',  icon: User            },
]

const POLL_INTERVAL_MS = 30_000

export default function TeacherLayout() {
  const { logout, updateLogo, updateBanner } = useAuth()
  const navigate = useNavigate()
  const timerRef = useRef(null)

  useEffect(() => {
    // Fetch latest school info — applies super admin's latest theme color, logo, banner
    teacherAPI.getSchoolInfo()
      .then(r => {
        const d = r.data
        if (d?.logoBase64)   updateLogo(d.logoBase64)
        if (d?.bannerBase64) updateBanner(d.bannerBase64)
        if (d?.primaryColor) document.documentElement.style.setProperty('--primary', d.primaryColor)
      })
      .catch(() => {})
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const checkActiveStatus = async () => {
      try {
        await teacherAPI.getProfile()
      } catch (err) {
        if (err.response?.status === 401) {
          clearInterval(timerRef.current)
          toast.error('Your account has been deactivated. Logging out...', { duration: 4000 })
          setTimeout(() => { logout(); navigate('/', { replace: true }) }, 3000)
        }
      }
    }

    timerRef.current = setInterval(checkActiveStatus, POLL_INTERVAL_MS)
    checkActiveStatus()
    return () => clearInterval(timerRef.current)
  }, [logout, navigate])

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar navItems={NAV} roleColor="bg-sky-500/20 text-sky-300" roleLabel="Teacher" />
      <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
        <Routes>
          <Route index              element={<TeacherDashboard />}  />
          <Route path="students"    element={<TeacherStudents />}   />
          <Route path="attendance"  element={<TeacherAttendance />} />
          <Route path="profile"     element={<TeacherProfile />}    />
          <Route path="*"           element={<Navigate to="/teacher" replace />} />
        </Routes>
      </main>
    </div>
  )
}