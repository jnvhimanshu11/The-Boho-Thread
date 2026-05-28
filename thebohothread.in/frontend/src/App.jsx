import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './context/AuthContext.jsx'
import LoginPage from './pages/LoginPage.jsx'
import ChangePasswordPage from './pages/ChangePasswordPage.jsx'
import SchoolLayout from './pages/school/SchoolLayout.jsx'
import TeacherLayout from './pages/teacher/TeacherLayout.jsx'
import StudentLayout from './pages/student/StudentLayout.jsx'
import SuperAdminLogin from './pages/superadmin/SuperAdminLogin.jsx'
import SuperAdminDashboard from './pages/superadmin/SuperAdminDashboard.jsx'

function ProtectedRoute({ children, role }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-400">Loading...</div>
  if (!user) return <Navigate to="/" replace />
  if (role && user.role !== role) return <Navigate to="/" replace />
  if (user.mustChangePassword) return <Navigate to="/change-password" replace />
  return children
}

/** Guard for super admin pages — uses sessionStorage flag, not JWT */
function SuperAdminRoute({ children }) {
  const auth = sessionStorage.getItem('sa_auth')
  return auth ? children : <Navigate to="/superadmin" replace />
}

function AppRoutes() {
  const { user, loading } = useAuth()
  if (loading) return null

  return (
    <Routes>
      {/* ── Regular login ── */}
      <Route path="/" element={
        !user ? <LoginPage /> :
        user.mustChangePassword ? <Navigate to="/change-password" replace /> :
        <Navigate to={
          user.role === 'SCHOOL_ADMIN' ? '/school' :
          user.role === 'TEACHER'      ? '/teacher' : '/student'
        } replace />
      } />

      <Route path="/change-password" element={
        user ? <ChangePasswordPage /> : <Navigate to="/" replace />
      } />

      <Route path="/school/*"   element={<ProtectedRoute role="SCHOOL_ADMIN"><SchoolLayout /></ProtectedRoute>} />
      <Route path="/teacher/*"  element={<ProtectedRoute role="TEACHER"><TeacherLayout /></ProtectedRoute>} />
      <Route path="/student/*"  element={<ProtectedRoute role="STUDENT"><StudentLayout /></ProtectedRoute>} />

      {/* ── Super Admin — completely isolated, no AuthContext involvement ── */}
      <Route path="/superadmin"           element={<SuperAdminLogin />} />
      <Route path="/superadmin/dashboard" element={<SuperAdminRoute><SuperAdminDashboard /></SuperAdminRoute>} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster position="top-right" toastOptions={{
          style: { borderRadius: '12px', fontFamily: 'DM Sans, sans-serif', fontSize: '14px' },
          success: { iconTheme: { primary: '#10b981', secondary: '#fff' } },
          error:   { iconTheme: { primary: '#f43f5e', secondary: '#fff' } },
        }} />
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}