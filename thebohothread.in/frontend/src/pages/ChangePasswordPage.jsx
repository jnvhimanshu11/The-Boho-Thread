import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { authAPI } from '../services/api'
import { KeyRound, Eye, EyeOff, Loader2, ShieldCheck, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'

export default function ChangePasswordPage() {
  const { user, clearMustChangePassword } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [show, setShow] = useState({ current: false, new: false, confirm: false })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  if (!user) {
    navigate('/')
    return null
  }

  const roleColor = {
    SCHOOL_ADMIN: 'orange',
    TEACHER:      'sky',
    STUDENT:      'emerald',
  }[user.role] || 'indigo'

  const colorCls = {
    orange:  { bg: 'bg-orange-500',  ring: 'focus:ring-orange-400',  text: 'text-orange-600',  badge: 'bg-orange-100 text-orange-700' },
    sky:     { bg: 'bg-sky-500',     ring: 'focus:ring-sky-400',     text: 'text-sky-600',     badge: 'bg-sky-100 text-sky-700'     },
    emerald: { bg: 'bg-emerald-500', ring: 'focus:ring-emerald-400', text: 'text-emerald-600', badge: 'bg-emerald-100 text-emerald-700' },
    indigo:  { bg: 'bg-indigo-500',  ring: 'focus:ring-indigo-400',  text: 'text-indigo-600',  badge: 'bg-indigo-100 text-indigo-700' },
  }[roleColor]

  const validate = () => {
    if (!form.currentPassword) return 'Current password is required'
    if (form.newPassword.length < 6) return 'New password must be at least 6 characters'
    if (form.newPassword === form.currentPassword) return 'New password must be different from current password'
    if (form.newPassword !== form.confirmPassword) return 'Passwords do not match'
    return ''
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const err = validate()
    if (err) { setError(err); return }

    setLoading(true)
    setError('')
    try {
      await authAPI.changePassword({
        uniqueId:        user.role !== 'SCHOOL_ADMIN' ? user.uniqueId : null,
        schoolCode:      user.role === 'SCHOOL_ADMIN' ? user.schoolCode : null,
        role:            user.role,
        currentPassword: form.currentPassword,
        newPassword:     form.newPassword,
      })
      clearMustChangePassword()
      toast.success('Password changed successfully!')
      const dest = user.role === 'SCHOOL_ADMIN' ? '/school'
                 : user.role === 'TEACHER'       ? '/teacher'
                 : '/student'
      navigate(dest)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to change password')
    } finally {
      setLoading(false)
    }
  }

  const PasswordField = ({ label, field, placeholder }) => (
    <div>
      <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">{label}</label>
      <div className="relative">
        <input
          type={show[field] ? 'text' : 'password'}
          className={`input pr-10 ${colorCls.ring}`}
          placeholder={placeholder}
          value={form[field]}
          onChange={e => setForm({ ...form, [field]: e.target.value })}
          required
        />
        <button
          type="button"
          onClick={() => setShow(s => ({ ...s, [field]: !s[field] }))}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
        >
          {show[field] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex items-center justify-center p-4">
      {/* Background orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Icon */}
        <div className="text-center mb-8">
          <div className={`inline-flex items-center justify-center w-16 h-16 ${colorCls.bg} rounded-2xl shadow-lg mb-4`}>
            <KeyRound className="w-8 h-8 text-white" />
          </div>
          <h1 className="font-display text-3xl font-bold text-white tracking-tight">Set New Password</h1>
          <p className="text-indigo-300 text-sm mt-1">Security check before you continue</p>
        </div>

        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-7">
          {/* Notice banner */}
          <div className={`flex items-start gap-3 rounded-xl px-4 py-3 mb-6 ${colorCls.badge}`}>
            <ShieldCheck className="w-5 h-5 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-semibold">Password change required</p>
              <p className="text-xs mt-0.5 opacity-80">
                For your security, you must set a new password before accessing your account.
              </p>
            </div>
          </div>

          {/* User pill */}
          <div className="flex items-center gap-2 mb-5 p-3 bg-slate-50 rounded-xl border border-slate-100">
            <div className={`w-8 h-8 rounded-lg ${colorCls.bg} flex items-center justify-center shrink-0`}>
              <span className="text-white text-xs font-bold">
                {(user.fullName || user.schoolName || '?')[0].toUpperCase()}
              </span>
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800">{user.fullName || user.schoolName}</p>
              <p className={`text-xs ${colorCls.text} font-medium`}>{user.role.replace('_', ' ')}</p>
            </div>
          </div>

          {error && (
            <div className="flex items-start gap-2.5 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 mb-5 text-sm">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <PasswordField label="Current Password"  field="current" placeholder="Enter your current password" />
            <PasswordField label="New Password"      field="new"     placeholder="At least 6 characters" />
            <PasswordField label="Confirm Password"  field="confirm" placeholder="Re-enter new password" />

            {/* Strength hint */}
            {form.newPassword.length > 0 && (
              <div className="space-y-1">
                <div className="flex gap-1">
                  {[1, 2, 3, 4].map(i => (
                    <div
                      key={i}
                      className={`h-1 flex-1 rounded-full transition-colors ${
                        form.newPassword.length >= i * 3
                          ? i <= 1 ? 'bg-red-400' : i <= 2 ? 'bg-yellow-400' : i <= 3 ? 'bg-blue-400' : 'bg-green-500'
                          : 'bg-slate-200'
                      }`}
                    />
                  ))}
                </div>
                <p className="text-xs text-slate-400">
                  {form.newPassword.length < 6  ? 'Too short' :
                   form.newPassword.length < 9  ? 'Fair — add more characters' :
                   form.newPassword.length < 12 ? 'Good' : 'Strong'}
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-white transition-all duration-200 active:scale-95 disabled:opacity-60 ${colorCls.bg} hover:opacity-90 shadow-lg mt-2`}
            >
              {loading
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Updating...</>
                : 'Change Password & Continue'}
            </button>
          </form>
        </div>

        <p className="text-center text-white/30 text-xs mt-6">SchoolWala ERP · Your session is secure</p>
      </div>
    </div>
  )
}