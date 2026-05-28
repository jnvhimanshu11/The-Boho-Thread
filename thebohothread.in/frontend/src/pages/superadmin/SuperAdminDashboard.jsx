import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import {
  ShieldCheck, Plus, X, Loader2, LogOut, School,
  Eye, EyeOff, CheckCircle2, AlertCircle, Trash2, RefreshCw
} from 'lucide-react'
import toast from 'react-hot-toast'

const api = axios.create({ baseURL: 'https://the-boho-thread.onrender.com/api' })

const EMPTY = {
  schoolName:    '',
  schoolCode:    '',
  adminUsername: '',
  adminEmail:    '',
  adminPhone:    '',
  address:       '',
  password:      '',
}

export default function SuperAdminDashboard() {
  const navigate = useNavigate()
  const [schools,    setSchools]    = useState([])
  const [loading,    setLoading]    = useState(true)
  const [showForm,   setShowForm]   = useState(false)
  const [form,       setForm]       = useState(EMPTY)
  const [saving,     setSaving]     = useState(false)
  const [showPwd,    setShowPwd]    = useState(false)
  const [errorMsg,   setErrorMsg]   = useState('')

  // Reset password modal
  const [resetTarget, setResetTarget]   = useState(null) // { schoolCode, schoolName }
  const [resetPwd,    setResetPwd]      = useState('')
  const [showRstPwd,  setShowRstPwd]    = useState(false)
  const [resetting,   setResetting]     = useState(false)

  // Guard — redirect if not authenticated
  useEffect(() => {
    if (!sessionStorage.getItem('sa_auth')) navigate('/superadmin', { replace: true })
  }, [navigate])

  const load = async () => {
    setLoading(true)
    try {
      const res = await api.get('/superadmin/schools')
      setSchools(res.data)
    } catch {
      toast.error('Failed to load schools')
    } finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])

  const handleCreate = async (e) => {
    e.preventDefault()
    setSaving(true)
    setErrorMsg('')
    try {
      await api.post('/superadmin/schools', form)
      toast.success(`School "${form.schoolName}" created! Code: ${form.schoolCode}`)
      setShowForm(false)
      setForm(EMPTY)
      load()
    } catch (err) {
      setErrorMsg(err.response?.data?.error || 'Failed to create school')
    } finally { setSaving(false) }
  }

  const handleDelete = async (schoolCode, name) => {
    if (!window.confirm(`Delete school "${name}"? This cannot be undone.`)) return
    try {
      await api.delete(`/superadmin/schools/${schoolCode}`)
      toast.success(`"${name}" deleted`)
      load()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Delete failed')
    }
  }

  const handleResetPassword = async (e) => {
    e.preventDefault()
    if (resetPwd.length < 6) { toast.error('Min 6 characters'); return }
    setResetting(true)
    try {
      await api.post(`/superadmin/schools/${resetTarget.schoolCode}/reset-password`, { newPassword: resetPwd })
      toast.success(`Password reset for ${resetTarget.schoolName}`)
      setResetTarget(null)
    } catch (err) {
      toast.error(err.response?.data?.error || 'Reset failed')
    } finally { setResetting(false) }
  }

  const logout = () => {
    sessionStorage.removeItem('sa_auth')
    navigate('/superadmin')
  }

  const field = (key, value) => setForm(f => ({ ...f, [key]: value }))

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top bar */}
      <header className="bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center">
            <ShieldCheck className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="font-display font-bold text-slate-800 text-sm">SchoolWala</div>
            <div className="text-xs text-indigo-500 font-semibold uppercase tracking-widest">Super Admin</div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={load} className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-700 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors">
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>
          <button onClick={logout}
            className="flex items-center gap-1.5 text-xs font-semibold text-rose-600 hover:text-rose-700 px-3 py-1.5 rounded-lg hover:bg-rose-50 transition-colors">
            <LogOut className="w-3.5 h-3.5" /> Sign Out
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          {[
            { label: 'Total Schools',  value: schools.length },
            { label: 'Active Schools', value: schools.filter(s => s.active !== false).length },
            { label: 'Inactive',       value: schools.filter(s => s.active === false).length },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-2xl border border-slate-100 p-4">
              <div className="text-xs text-slate-500 font-semibold uppercase tracking-wide mb-1">{s.label}</div>
              <div className="text-2xl font-display font-bold text-slate-800">{s.value}</div>
            </div>
          ))}
        </div>

        {/* Schools list header */}
        <div className="flex items-center justify-between mb-4">
          <h1 className="font-display text-xl font-bold text-slate-800">Schools</h1>
          <button onClick={() => { setShowForm(true); setErrorMsg('') }}
            className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" /> Add School
          </button>
        </div>

        {/* Schools table */}
        {loading ? (
          <div className="card animate-pulse h-40" />
        ) : schools.length === 0 ? (
          <div className="card text-center py-14 text-slate-400">
            <School className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p>No schools yet. Create your first school!</p>
          </div>
        ) : (
          <div className="card overflow-x-auto p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  {['School Code', 'Name', 'Admin Username', 'Email', 'Phone', 'Status', 'Actions'].map(h => (
                    <th key={h} className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {schools.map(s => (
                  <tr key={s.schoolCode} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3">
                      <span className="font-mono text-xs bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-md font-semibold">{s.schoolCode}</span>
                    </td>
                    <td className="px-5 py-3 font-medium text-slate-800">{s.schoolName}</td>
                    <td className="px-5 py-3 text-slate-600">{s.adminUsername || '—'}</td>
                    <td className="px-5 py-3 text-slate-600">{s.adminEmail || '—'}</td>
                    <td className="px-5 py-3 text-slate-600">{s.adminPhone || '—'}</td>
                    <td className="px-5 py-3">
                      <span className={`badge ${s.active !== false ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-600'}`}>
                        {s.active !== false ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <button onClick={() => { setResetTarget({ schoolCode: s.schoolCode, schoolName: s.schoolName }); setResetPwd(''); setShowRstPwd(false) }}
                          className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-amber-50 text-amber-700 hover:bg-amber-100 transition-colors">
                          <RefreshCw className="w-3 h-3" /> Reset Pwd
                        </button>
                        <button onClick={() => handleDelete(s.schoolCode, s.schoolName)}
                          className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors">
                          <Trash2 className="w-3 h-3" /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {/* ── Create School Modal ── */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-indigo-100 rounded-xl flex items-center justify-center">
                  <School className="w-4 h-4 text-indigo-600" />
                </div>
                <h2 className="font-display text-lg font-bold text-slate-800">Create New School</h2>
              </div>
              <button onClick={() => setShowForm(false)}><X className="w-5 h-5 text-slate-400" /></button>
            </div>

            <form onSubmit={handleCreate} className="p-6 space-y-4">
              {errorMsg && (
                <div className="flex items-start gap-2.5 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
                  <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">School Name <span className="text-rose-500">*</span></label>
                  <input className="input" placeholder="e.g. Sunrise Public School" value={form.schoolName}
                    onChange={e => field('schoolName', e.target.value)} required />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">School Code <span className="text-rose-500">*</span></label>
                  <input className="input" placeholder="e.g. SCH001" value={form.schoolCode}
                    onChange={e => field('schoolCode', e.target.value.toUpperCase())} required />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Admin Username <span className="text-rose-500">*</span></label>
                  <input className="input" placeholder="e.g. principal" value={form.adminUsername}
                    onChange={e => field('adminUsername', e.target.value)} required />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Admin Email</label>
                  <input className="input" type="email" placeholder="admin@school.com" value={form.adminEmail}
                    onChange={e => field('adminEmail', e.target.value)} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Admin Phone</label>
                  <input className="input" placeholder="+91-9876543210" value={form.adminPhone}
                    onChange={e => field('adminPhone', e.target.value)} />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Address</label>
                  <input className="input" placeholder="School address" value={form.address}
                    onChange={e => field('address', e.target.value)} />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Initial Password <span className="text-rose-500">*</span></label>
                  <div className="relative">
                    <input type={showPwd ? 'text' : 'password'} className="input pr-10" placeholder="Min 6 characters"
                      value={form.password} onChange={e => field('password', e.target.value)} required />
                    <button type="button" onClick={() => setShowPwd(v => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                      {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Info box */}
              <div className="flex items-start gap-2 bg-indigo-50 border border-indigo-100 rounded-xl px-3 py-2.5 text-xs text-indigo-700">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                <span>School admin will use <strong>{form.schoolCode || 'SCHOOL_CODE'}</strong> + <strong>{form.adminUsername || 'username'}</strong> to log in.</span>
              </div>

              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setShowForm(false)} className="btn-secondary flex-1">Cancel</button>
                <button type="submit" disabled={saving} className="btn-primary flex-1 flex items-center justify-center gap-2">
                  {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating...</> : 'Create School'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Reset Password Modal ── */}
      {resetTarget && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm">
            <div className="flex items-center justify-between p-6 border-b">
              <div>
                <h2 className="font-display text-base font-bold text-slate-800">Reset Admin Password</h2>
                <p className="text-xs text-slate-500 mt-0.5">{resetTarget.schoolName}</p>
              </div>
              <button onClick={() => setResetTarget(null)}><X className="w-5 h-5 text-slate-400" /></button>
            </div>
            <form onSubmit={handleResetPassword} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">New Password</label>
                <div className="relative">
                  <input type={showRstPwd ? 'text' : 'password'} className="input pr-10" placeholder="Min 6 characters"
                    value={resetPwd} onChange={e => setResetPwd(e.target.value)} required />
                  <button type="button" onClick={() => setShowRstPwd(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    {showRstPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setResetTarget(null)} className="btn-secondary flex-1">Cancel</button>
                <button type="submit" disabled={resetting}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold text-white bg-amber-500 hover:bg-amber-600 transition-all active:scale-95 disabled:opacity-60">
                  {resetting ? <><Loader2 className="w-4 h-4 animate-spin" /> Resetting...</> : 'Reset Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}