import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { authAPI } from '../services/api'
import { School, BookOpen, GraduationCap, Eye, EyeOff, Loader2, AlertCircle, ChevronDown } from 'lucide-react'
import toast from 'react-hot-toast'

const LOGIN_TYPES = [
  { key: 'school',  label: 'School Admin',  icon: School,         color: 'school',  desc: 'Admin & Management' },
  { key: 'teacher', label: 'Teacher',        icon: BookOpen,       color: 'teacher', desc: 'Staff Portal'        },
  { key: 'student', label: 'Student',        icon: GraduationCap,  color: 'student', desc: 'Student Portal'      },
]

const colorMap = {
  school:  { bg: 'bg-orange-500',  light: 'bg-orange-50',  text: 'text-orange-600',  border: 'border-orange-400',  ring: 'focus:ring-orange-400',  dropBorder: 'border-orange-400'  },
  teacher: { bg: 'bg-sky-500',     light: 'bg-sky-50',     text: 'text-sky-600',     border: 'border-sky-400',     ring: 'focus:ring-sky-400',     dropBorder: 'border-sky-400'     },
  student: { bg: 'bg-emerald-500', light: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-400', ring: 'focus:ring-emerald-400', dropBorder: 'border-emerald-400' },
}

export default function LoginPage() {
  const [activeType, setActiveType] = useState('school')
  const [form, setForm]             = useState({ schoolCode: '', username: '', uniqueId: '', password: '' })
  const [showPwd, setShowPwd]       = useState(false)
  const [loading, setLoading]       = useState(false)
  const [errorMsg, setErrorMsg]     = useState('')
  const [dropOpen, setDropOpen]     = useState(false)
  const { login } = useAuth()
  const navigate  = useNavigate()
  const colors    = colorMap[activeType]
  const activeInfo = LOGIN_TYPES.find(t => t.key === activeType)

  const switchRole = (key) => {
    setActiveType(key)
    setForm({ schoolCode: '', username: '', uniqueId: '', password: '' })
    setErrorMsg('')
    setDropOpen(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg('')
    try {
      let res
      if (activeType === 'school') {
        res = await authAPI.schoolLogin({ schoolCode: form.schoolCode, username: form.username, password: form.password })
      } else if (activeType === 'teacher') {
        res = await authAPI.teacherLogin({ uniqueId: form.uniqueId, password: form.password })
      } else {
        res = await authAPI.studentLogin({ uniqueId: form.uniqueId, password: form.password })
      }
      const data = res.data
      login(data, data.token)
      toast.success(`Welcome, ${data.fullName}!`)
      if (data.mustChangePassword) {
        navigate('/change-password')
      } else {
        navigate(activeType === 'school' ? '/school' : activeType === 'teacher' ? '/teacher' : '/student')
      }
    } catch (err) {
      const msg = err.response?.data?.error || 'Login failed. Please check your credentials.'
      setErrorMsg(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex items-center justify-center p-4">
      {/* Background orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo / Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-900/50 mb-4">
            <GraduationCap className="w-9 h-9 text-white" />
          </div>
          <h1 className="font-display text-3xl font-bold text-white tracking-tight">SchoolWala</h1>
          <p className="text-indigo-300 text-sm mt-1">Complete School Management System</p>
        </div>

        {/* Role Dropdown */}
        <div className="mb-6 relative">
          <label className="block text-xs font-semibold text-white/50 mb-2 uppercase tracking-wider">Login As</label>
          <button
            type="button"
            onClick={() => setDropOpen(!dropOpen)}
            className={`w-full flex items-center justify-between gap-3 px-4 py-3.5 rounded-xl bg-white/10 border-2 ${colors.dropBorder} text-white font-semibold transition-all duration-200 hover:bg-white/15`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${colors.bg} text-white`}>
                <activeInfo.icon className="w-4 h-4" />
              </div>
              <div className="text-left">
                <div className="text-sm font-bold text-white">{activeInfo.label}</div>
                <div className="text-xs text-white/50">{activeInfo.desc}</div>
              </div>
            </div>
            <ChevronDown className={`w-4 h-4 text-white/60 transition-transform duration-200 ${dropOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Dropdown menu */}
          {dropOpen && (
            <div className="absolute z-20 top-full mt-2 left-0 right-0 bg-slate-800 border border-white/10 rounded-xl shadow-2xl overflow-hidden">
              {LOGIN_TYPES.map(({ key, label, icon: Icon, color, desc }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => switchRole(key)}
                  className={`w-full flex items-center gap-3 px-4 py-3.5 transition-all duration-150 hover:bg-white/10 ${activeType === key ? 'bg-white/5' : ''}`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${colorMap[color].bg} text-white shrink-0`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <div className={`text-sm font-bold ${activeType === key ? colorMap[color].text : 'text-white'}`}>{label}</div>
                    <div className="text-xs text-white/40">{desc}</div>
                  </div>
                  {activeType === key && (
                    <div className={`ml-auto w-2 h-2 rounded-full ${colorMap[color].bg}`} />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Login Card */}
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-7">
          <h2 className="font-display text-xl font-bold text-slate-800 mb-1">
            {activeInfo.label} Login
          </h2>
          <p className="text-slate-500 text-sm mb-6">{activeInfo.desc}</p>

          {/* Inline Error Banner */}
          {errorMsg && (
            <div className="flex items-start gap-2.5 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 mb-5 text-sm">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {activeType === 'school' && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">School Code</label>
                  <input
                    className={`input ${colors.ring}`}
                    placeholder="e.g. SCH001"
                    value={form.schoolCode}
                    onChange={e => setForm({ ...form, schoolCode: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Username</label>
                  <input
                    className={`input ${colors.ring}`}
                    placeholder="Admin username"
                    value={form.username}
                    onChange={e => setForm({ ...form, username: e.target.value })}
                    required
                  />
                </div>
              </>
            )}

            {(activeType === 'teacher' || activeType === 'student') && (
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
                  {activeType === 'teacher' ? 'Teacher ID' : 'Student ID'}
                </label>
                <input
                  className={`input ${colors.ring}`}
                  placeholder={activeType === 'teacher' ? 'e.g. TCH001-SCH001' : 'e.g. STU0001-SCH001'}
                  value={form.uniqueId}
                  onChange={e => setForm({ ...form, uniqueId: e.target.value })}
                  required
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Password</label>
              <div className="relative">
                <input
                  type={showPwd ? 'text' : 'password'}
                  className={`input pr-10 ${colors.ring}`}
                  placeholder="Enter password"
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  required
                />
                <button type="button" onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-white transition-all duration-200 active:scale-95 disabled:opacity-60 ${colors.bg} hover:opacity-90 shadow-lg mt-2`}
            >
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Signing in...</> : 'Sign In'}
            </button>
          </form>
        </div>

        <p className="text-center text-white/30 text-xs mt-6">SchoolWala ERP v1.0 · Secured with JWT</p>
      </div>

      {/* Close dropdown when clicking outside */}
      {dropOpen && (
        <div className="fixed inset-0 z-10" onClick={() => setDropOpen(false)} />
      )}
    </div>
  )
}