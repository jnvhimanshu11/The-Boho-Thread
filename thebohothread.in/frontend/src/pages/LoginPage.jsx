import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { authAPI } from '../services/api'
import { School, BookOpen, GraduationCap, Eye, EyeOff, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

const LOGIN_TYPES = [
  { key: 'school', label: 'School Login', icon: School, color: 'school', desc: 'Admin & Management' },
  { key: 'teacher', label: 'Teacher Login', icon: BookOpen, color: 'teacher', desc: 'Staff Portal' },
  { key: 'student', label: 'Student Login', icon: GraduationCap, color: 'student', desc: 'Student Portal' },
]

const colorMap = {
  school: { bg: 'bg-orange-500', light: 'bg-orange-50', text: 'text-orange-600', border: 'border-orange-400', ring: 'focus:ring-orange-400' },
  teacher: { bg: 'bg-sky-500', light: 'bg-sky-50', text: 'text-sky-600', border: 'border-sky-400', ring: 'focus:ring-sky-400' },
  student: { bg: 'bg-emerald-500', light: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-400', ring: 'focus:ring-emerald-400' },
}

export default function LoginPage() {
  const [activeType, setActiveType] = useState('school')
  const [form, setForm] = useState({ schoolCode: '', username: '', uniqueId: '', password: '' })
  const [showPwd, setShowPwd] = useState(false)
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()
  const colors = colorMap[activeType]

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
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
      navigate(activeType === 'school' ? '/school' : activeType === 'teacher' ? '/teacher' : '/student')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Login failed. Check credentials.')
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

        {/* Login Type Selector */}
        <div className="grid grid-cols-3 gap-2 mb-6">
          {LOGIN_TYPES.map(({ key, label, icon: Icon, color, desc }) => (
            <button
              key={key}
              onClick={() => { setActiveType(key); setForm({ schoolCode: '', username: '', uniqueId: '', password: '' }) }}
              className={`flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border-2 transition-all duration-200 ${
                activeType === key
                  ? `${colorMap[color].light} ${colorMap[color].border} ${colorMap[color].text}`
                  : 'border-white/10 text-white/60 hover:border-white/30 hover:bg-white/5'
              }`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${activeType === key ? colorMap[color].bg + ' text-white' : 'bg-white/10'}`}>
                <Icon className="w-4 h-4" />
              </div>
              <span className="text-xs font-semibold leading-tight text-center">{label}</span>
            </button>
          ))}
        </div>

        {/* Login Card */}
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-7">
          <h2 className="font-display text-xl font-bold text-slate-800 mb-1">
            {LOGIN_TYPES.find(t => t.key === activeType)?.label}
          </h2>
          <p className="text-slate-500 text-sm mb-6">
            {LOGIN_TYPES.find(t => t.key === activeType)?.desc}
          </p>

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

          {/* Demo hint */}
          {activeType === 'school' && (
            <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-100">
              <p className="text-xs text-slate-500 font-medium">Demo: Code <span className="font-mono font-bold text-slate-700">SCH001</span> · User <span className="font-mono font-bold text-slate-700">admin</span> · Pass <span className="font-mono font-bold text-slate-700">admin123</span></p>
            </div>
          )}
        </div>

        <p className="text-center text-white/30 text-xs mt-6">SchoolWala ERP v1.0 · Secured with JWT</p>
      </div>
    </div>
  )
}
