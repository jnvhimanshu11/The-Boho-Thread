import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { authAPI } from '../services/api'
import { GraduationCap, Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'

/**
 * Single login interface — no role selection needed.
 *
 * How it works:
 *  1. User types their Login ID (schoolCode+username  /  TCH…  /  STU…) + password
 *  2. We try all three API endpoints in sequence until one succeeds
 *  3. The backend response includes `role` → we navigate accordingly
 *
 * Login ID formats:
 *   School Admin  →  schoolCode  (e.g. SCH001)  — still needs username field
 *   Teacher       →  TCH001-SCH001
 *   Student       →  STU0001-SCH001
 *
 * Because School Admin needs TWO fields (schoolCode + username) while
 * Teacher/Student only need one (uniqueId), we show a single "Login ID"
 * field and auto-detect format:
 *   - starts with TCH  → teacher login
 *   - starts with STU  → student login
 *   - otherwise        → school admin (treat entire value as schoolCode,
 *                         show a second "Username" field)
 */

function detectRole(loginId) {
  const id = (loginId || '').trim().toUpperCase()
  if (id.startsWith('TCH')) return 'teacher'
  if (id.startsWith('STU')) return 'student'
  return 'school'
}

export default function LoginPage() {
  const [loginId,  setLoginId]  = useState('')
  const [username, setUsername] = useState('')   // only for school admin
  const [password, setPassword] = useState('')
  const [showPwd,  setShowPwd]  = useState(false)
  const [loading,  setLoading]  = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const { login }  = useAuth()
  const navigate   = useNavigate()
  const detectedRole = detectRole(loginId)
  const isSchool     = detectedRole === 'school'

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg('')
    try {
      let res
      if (detectedRole === 'teacher') {
        res = await authAPI.teacherLogin({ uniqueId: loginId.trim(), password })
      } else if (detectedRole === 'student') {
        res = await authAPI.studentLogin({ uniqueId: loginId.trim(), password })
      } else {
        // school admin — loginId field is used as schoolCode
        res = await authAPI.schoolLogin({ schoolCode: loginId.trim(), username: username.trim(), password })
      }

      const data = res.data
      login(data, data.token)
      toast.success(`Welcome, ${data.fullName}!`)

      const role = (data.role || detectedRole).toLowerCase()
      if (role.includes('school'))  navigate('/school')
      else if (role.includes('teacher')) navigate('/teacher')
      else navigate('/student')
    } catch (err) {
      setErrorMsg(err.response?.data?.error || 'Invalid credentials. Please try again.')
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
        {/* Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-900/50 mb-4">
            <GraduationCap className="w-9 h-9 text-white" />
          </div>
          <h1 className="font-display text-3xl font-bold text-white tracking-tight">SchoolWala</h1>
          <p className="text-indigo-300 text-sm mt-1">Complete School Management System</p>
        </div>

        {/* Card */}
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-7">
          <h2 className="font-display text-xl font-bold text-slate-800 mb-1">Sign In</h2>
          <p className="text-slate-500 text-sm mb-6">Enter your credentials to continue</p>

          {/* Error */}
          {errorMsg && (
            <div className="flex items-start gap-2.5 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 mb-5 text-sm">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Login ID */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
                Login ID
              </label>
              <input
                className="input"
                placeholder="e.g. SCH001 / TCH001-SCH001 / STU0001-SCH001"
                value={loginId}
                onChange={e => { setLoginId(e.target.value); setErrorMsg('') }}
                required
                autoFocus
              />
              {/* Role hint badge */}
              {loginId.trim() && (
                <div className="mt-1.5 flex items-center gap-1.5">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                    detectedRole === 'teacher' ? 'bg-sky-100 text-sky-600'
                    : detectedRole === 'student' ? 'bg-emerald-100 text-emerald-600'
                    : 'bg-orange-100 text-orange-600'
                  }`}>
                    {detectedRole === 'teacher' ? '👨‍🏫 Teacher'
                      : detectedRole === 'student' ? '🎓 Student'
                      : '🏫 School Admin'}
                  </span>
                  
                </div>
              )}
            </div>

            {/* Username — only for school admin */}
            {isSchool && (
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
                  Username
                </label>
                <input
                  className="input"
                  placeholder="Admin username"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  required
                />
              </div>
            )}

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPwd ? 'text' : 'password'}
                  className="input pr-10"
                  placeholder="Enter your password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                />
                <button type="button" onClick={() => setShowPwd(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-all duration-200 active:scale-95 disabled:opacity-60 shadow-lg shadow-indigo-900/30 mt-2"
            >
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Signing in...</> : 'Sign In'}
            </button>
          </form>
        </div>

        <p className="text-center text-white/30 text-xs mt-6">SchoolWala ERP v1.0 · Secured with JWT</p>
      </div>
    </div>
  )
}