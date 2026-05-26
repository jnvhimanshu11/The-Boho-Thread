import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { authAPI } from '../services/api'
import { GraduationCap, Eye, EyeOff, Loader2, ShieldAlert, CheckCircle2, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'

const ROLE_COLORS = {
  SCHOOL_ADMIN: { bg: 'bg-orange-500', light: 'bg-orange-50', text: 'text-orange-600', border: 'border-orange-400', ring: 'focus:ring-orange-400' },
  TEACHER:      { bg: 'bg-sky-500',    light: 'bg-sky-50',    text: 'text-sky-600',    border: 'border-sky-400',    ring: 'focus:ring-sky-400'    },
  STUDENT:      { bg: 'bg-emerald-500',light: 'bg-emerald-50',text: 'text-emerald-600',border: 'border-emerald-400',ring: 'focus:ring-emerald-400' },
}

const ROLE_LABELS = {
  SCHOOL_ADMIN: 'School Admin',
  TEACHER: 'Teacher',
  STUDENT: 'Student',
}

function PasswordStrength({ password }) {
  if (!password) return null
  const checks = [
    { label: 'At least 6 characters', pass: password.length >= 6 },
    { label: 'Contains a number', pass: /\d/.test(password) },
    { label: 'Contains uppercase', pass: /[A-Z]/.test(password) },
    { label: 'Contains special character', pass: /[^A-Za-z0-9]/.test(password) },
  ]
  const score = checks.filter(c => c.pass).length
  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong'][score]
  const barColor = ['', 'bg-red-400', 'bg-yellow-400', 'bg-blue-400', 'bg-green-500'][score]

  return (
    <div className="mt-2 space-y-2">
      {/* Strength bar */}
      <div className="flex gap-1">
        {[1,2,3,4].map(i => (
          <div key={i} className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${i <= score ? barColor : 'bg-slate-200'}`} />
        ))}
      </div>
      <p className={`text-xs font-semibold ${['','text-red-500','text-yellow-600','text-blue-500','text-green-600'][score]}`}>
        {strengthLabel}
      </p>
      <div className="grid grid-cols-2 gap-1">
        {checks.map(c => (
          <div key={c.label} className={`flex items-center gap-1 text-xs ${c.pass ? 'text-green-600' : 'text-slate-400'}`}>
            <CheckCircle2 className={`w-3 h-3 ${c.pass ? 'text-green-500' : 'text-slate-300'}`} />
            {c.label}
          </div>
        ))}
      </div>
    </div>
  )
}

export default function ForceChangePassword() {
  const { user, clearMustChangePassword } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [show, setShow] = useState({ current: false, new: false, confirm: false })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const colors = ROLE_COLORS[user?.role] || ROLE_COLORS.TEACHER
  const roleLabel = ROLE_LABELS[user?.role] || 'User'

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (form.newPassword.length < 6) {
      setError('New password must be at least 6 characters.')
      return
    }
    if (form.newPassword !== form.confirmPassword) {
      setError('New passwords do not match.')
      return
    }
    if (form.newPassword === form.currentPassword) {
      setError('New password must be different from the current password.')
      return
    }

    setLoading(true)
    try {
      const payload = { currentPassword: form.currentPassword, newPassword: form.newPassword }
      if (user.role === 'SCHOOL_ADMIN') {
        await authAPI.changePasswordSchool(payload)
      } else {
        await authAPI.changePasswordUser(payload)
      }

      clearMustChangePassword()
      toast.success('Password changed successfully! Welcome.')

      const dest = user.role === 'SCHOOL_ADMIN' ? '/school'
                 : user.role === 'TEACHER' ? '/teacher' : '/student'
      navigate(dest, { replace: true })
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to change password. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const toggleEye = (field) => setShow(s => ({ ...s, [field]: !s[field] }))

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex items-center justify-center p-4">
      {/* Background orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-900/50 mb-4">
            <GraduationCap className="w-9 h-9 text-white" />
          </div>
          <h1 className="font-display text-3xl font-bold text-white tracking-tight">SchoolWala</h1>
          <p className="text-indigo-300 text-sm mt-1">Complete School Management System</p>
        </div>

        {/* Security notice banner */}
        <div className="mb-5 flex items-start gap-3 bg-amber-500/20 border border-amber-400/40 rounded-xl px-4 py-3.5">
          <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-amber-300 font-semibold text-sm">Security Action Required</p>
            <p className="text-amber-200/80 text-xs mt-0.5">
              This is your first login. You must set a new personal password before continuing.
            </p>
          </div>
        </div>

        {/* Card */}
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-7">
          {/* Role badge */}
          <div className="flex items-center gap-3 mb-5">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${colors.bg} text-white`}>
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-display text-xl font-bold text-slate-800">Set New Password</h2>
              <p className={`text-xs font-semibold ${colors.text}`}>{roleLabel} · {user?.fullName}</p>
            </div>
          </div>

          {error && (
            <div className="flex items-start gap-2.5 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 mb-5 text-sm">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Current password */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
                Temporary / Current Password
              </label>
              <div className="relative">
                <input
                  type={show.current ? 'text' : 'password'}
                  className={`input pr-10 ${colors.ring}`}
                  placeholder="Enter the password given to you"
                  value={form.currentPassword}
                  onChange={e => setForm({ ...form, currentPassword: e.target.value })}
                  required
                  autoComplete="current-password"
                />
                <button type="button" onClick={() => toggleEye('current')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {show.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* New password */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
                New Password
              </label>
              <div className="relative">
                <input
                  type={show.new ? 'text' : 'password'}
                  className={`input pr-10 ${colors.ring}`}
                  placeholder="Choose a strong new password"
                  value={form.newPassword}
                  onChange={e => setForm({ ...form, newPassword: e.target.value })}
                  required
                  autoComplete="new-password"
                />
                <button type="button" onClick={() => toggleEye('new')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {show.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <PasswordStrength password={form.newPassword} />
            </div>

            {/* Confirm password */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  type={show.confirm ? 'text' : 'password'}
                  className={`input pr-10 ${colors.ring}`}
                  placeholder="Re-enter your new password"
                  value={form.confirmPassword}
                  onChange={e => setForm({ ...form, confirmPassword: e.target.value })}
                  required
                  autoComplete="new-password"
                />
                <button type="button" onClick={() => toggleEye('confirm')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {show.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {form.confirmPassword && form.newPassword !== form.confirmPassword && (
                <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
              )}
              {form.confirmPassword && form.newPassword === form.confirmPassword && form.newPassword.length >= 6 && (
                <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Passwords match
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-white transition-all duration-200 active:scale-95 disabled:opacity-60 ${colors.bg} hover:opacity-90 shadow-lg mt-2`}
            >
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Updating...</> : 'Set New Password & Continue'}
            </button>
          </form>
        </div>

        <p className="text-center text-white/30 text-xs mt-6">SchoolWala ERP v1.0 · Secured with JWT</p>
      </div>
    </div>
  )
}
