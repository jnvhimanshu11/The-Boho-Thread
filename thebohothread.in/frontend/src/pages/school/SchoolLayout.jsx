import { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Sidebar from '../../components/layout/Sidebar.jsx'
import { LayoutDashboard, Users, GraduationCap, BookOpen, CreditCard, BarChart3, Settings, CalendarCheck } from 'lucide-react'
import SchoolDashboard from './SchoolDashboard.jsx'
import TeachersList from './TeachersList.jsx'
import StudentsList from './StudentsList.jsx'
import AttendancePage from './AttendancePage.jsx'
import FeesPage from './FeesPage.jsx'
import ReportsPage from './ReportsPage.jsx'
import SettingsPage from './SettingsPage.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { schoolAPI } from '../../services/api.js'

const NAV = [
  { path: '/school',            label: 'Dashboard',      icon: LayoutDashboard },
  { path: '/school/teachers',   label: 'Teachers',       icon: BookOpen        },
  { path: '/school/students',   label: 'Students',       icon: GraduationCap   },
  { path: '/school/attendance', label: 'Attendance',     icon: CalendarCheck   },
  { path: '/school/fees',       label: 'Fee Management', icon: CreditCard      },
  { path: '/school/reports',    label: 'Reports',        icon: BarChart3       },
  { path: '/school/settings',   label: 'Settings',       icon: Settings        },
]

export default function SchoolLayout() {
  const { updateLogo, updateBanner } = useAuth()

  useEffect(() => {
    // Fetch latest school info on every mount — picks up any super admin changes
    schoolAPI.getSchoolInfo()
      .then(r => {
        const d = r.data
        if (d?.logoBase64)   updateLogo(d.logoBase64)
        if (d?.bannerBase64) updateBanner(d.bannerBase64)
        if (d?.primaryColor) document.documentElement.style.setProperty('--primary', d.primaryColor)
      })
      .catch(() => {})
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar navItems={NAV} roleLabel="School Admin" />
      <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
        <Routes>
          <Route index                    element={<SchoolDashboard />} />
          <Route path="teachers"          element={<TeachersList />}    />
          <Route path="students"          element={<StudentsList />}    />
          <Route path="attendance"        element={<AttendancePage />}  />
          <Route path="fees"              element={<FeesPage />}        />
          <Route path="reports"           element={<ReportsPage />}     />
          <Route path="settings"          element={<SettingsPage />}    />
          <Route path="*"                 element={<Navigate to="/school" replace />} />
        </Routes>
      </main>
    </div>
  )
}