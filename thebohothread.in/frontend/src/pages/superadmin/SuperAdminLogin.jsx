import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Loader2, AlertCircle, ShieldCheck } from 'lucide-react'
import { initializeApp } from 'firebase/app'
import { getAuth, sendPasswordResetEmail } from 'firebase/auth'
import toast from 'react-hot-toast'

// ── Firebase config (replace with your real project values) ──────
const firebaseConfig = {
  apiKey: "AIzaSyAwJ3bqLCG9icVBbm6nGlUi-0dBW8w_WWg",
  authDomain: "schoolwala-db444.firebaseapp.com",
  projectId: "schoolwala-db444",
  storageBucket: "schoolwala-db444.firebasestorage.app",
  messagingSenderId: "765544534706",
  appId: "1:765544534706:web:fbf9e6e93b0b7c7292efab",
  measurementId: "G-VJC7E06PZR"
};

const firebaseApp = initializeApp(firebaseConfig, 'superadmin')
const firebaseAuth = getAuth(firebaseApp)
// ─────────────────────────────────────────────────────────────────

// ── Hard-coded super admin credentials ───────────────────────────
const SA_EMAIL    = 'jnvhimanshu11@gmail.com'
const SA_PASSWORD = '706517@jnV'
// ─────────────────────────────────────────────────────────────────

export default function SuperAdminLogin() {
  const [email,     setEmail]     = useState('')
  const [password,  setPassword]  = useState('')
  const [showPwd,   setShowPwd]   = useState(false)
  const [loading,   setLoading]   = useState(false)
  const [errorMsg,  setErrorMsg]  = useState('')
  const [resetMode, setResetMode] = useState(false)
  const [resetSent, setResetSent] = useState(false)
  const [resetting, setResetting] = useState(false)
  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()
    setErrorMsg('')
    setLoading(true)
    await new Promise(r => setTimeout(r, 400)) // slight delay to feel secure
    if (email.trim() === SA_EMAIL && password === SA_PASSWORD) {
      sessionStorage.setItem('sa_auth', 'true')
      toast.success('Welcome, Super Admin!')
      navigate('/superadmin/dashboard')
    } else {
      setErrorMsg('Invalid email or password.')
    }
    setLoading(false)
  }

  const handleResetPassword = async (e) => {
    e.preventDefault()
    setResetting(true)
    try {
      await sendPasswordResetEmail(firebaseAuth, SA_EMAIL)
      setResetSent(true)
      toast.success('Reset link sent to ' + SA_EMAIL)
    } catch (err) {
      toast.error(err.message || 'Failed to send reset email.')
    } finally {
      setResetting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-indigo-700/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-purple-700/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-sm">
        {/* Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-indigo-600 rounded-2xl shadow-lg mb-4">
            <ShieldCheck className="w-7 h-7 text-white" />
          </div>
          <h1 className="font-display text-2xl font-bold text-white">Super Admin</h1>
          <p className="text-indigo-300/70 text-xs mt-1 uppercase tracking-widest">SchoolWala Control Panel</p>
        </div>

        <div className="bg-white/95 backdrop-blur rounded-2xl shadow-2xl p-7">
          {!resetMode ? (
            <>
              <h2 className="font-display text-lg font-bold text-slate-800 mb-0.5">Sign in</h2>
              <p className="text-slate-500 text-sm mb-5">Restricted access — authorised personnel only</p>

              {errorMsg && (
                <div className="flex items-start gap-2.5 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 mb-4 text-sm">
                  <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Email</label>
                  <input
                    type="email"
                    className="input"
                    placeholder="admin@example.com"
                    value={email}
                    onChange={e => { setEmail(e.target.value); setErrorMsg('') }}
                    required
                    autoFocus
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Password</label>
                  <div className="relative">
                    <input
                      type={showPwd ? 'text' : 'password'}
                      className="input pr-10"
                      placeholder="Enter password"
                      value={password}
                      onChange={e => { setPassword(e.target.value); setErrorMsg('') }}
                      required
                    />
                    <button type="button" onClick={() => setShowPwd(v => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                      {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button type="submit" disabled={loading}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-all active:scale-95 disabled:opacity-60 shadow-lg mt-1">
                  {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Signing in...</> : 'Sign In'}
                </button>
              </form>

              <button onClick={() => setResetMode(true)}
                className="w-full mt-4 text-xs text-indigo-500 hover:text-indigo-700 text-center transition-colors">
                Forgot password? Send reset link
              </button>
            </>
          ) : (
            <>
              <h2 className="font-display text-lg font-bold text-slate-800 mb-0.5">Reset Password</h2>
              <p className="text-slate-500 text-sm mb-5">
                A reset link will be sent to <span className="font-medium text-slate-700">{SA_EMAIL}</span> via Firebase.
              </p>

              {resetSent ? (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl px-4 py-3 text-sm text-center">
                  ✅ Reset email sent! Check your inbox.
                </div>
              ) : (
                <form onSubmit={handleResetPassword}>
                  <button type="submit" disabled={resetting}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-white bg-emerald-600 hover:bg-emerald-700 transition-all active:scale-95 disabled:opacity-60 shadow-lg">
                    {resetting ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending...</> : 'Send Reset Link'}
                  </button>
                </form>
              )}

              <button onClick={() => { setResetMode(false); setResetSent(false) }}
                className="w-full mt-4 text-xs text-slate-400 hover:text-slate-600 text-center transition-colors">
                ← Back to login
              </button>
            </>
          )}
        </div>

        <p className="text-center text-white/20 text-xs mt-6">SchoolWala ERP · Super Admin Panel</p>
      </div>
    </div>
  )
}