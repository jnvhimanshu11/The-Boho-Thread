import { useEffect, useState } from 'react'
import { schoolAPI } from '../../services/api.js'
import { authAPI } from '../../services/api.js'
import { Plus, X, Loader2, UserCheck, UserX, GraduationCap, KeyRound, Eye, EyeOff, ShieldAlert } from 'lucide-react'
import toast from 'react-hot-toast'

const EMPTY = { fullName: '', email: '', phone: '', grade: '', section: '', parentName: '', parentPhone: '', password: '' }

export default function StudentsList() {
  const [students, setStudents]       = useState([])
  const [showForm, setShowForm]       = useState(false)
  const [form, setForm]               = useState(EMPTY)
  const [saving, setSaving]           = useState(false)
  const [loading, setLoading]         = useState(true)

  // Reset password modal
  const [resetTarget, setResetTarget] = useState(null) // { uniqueId, fullName }
  const [resetPwd, setResetPwd]       = useState('')
  const [showResetPwd, setShowResetPwd] = useState(false)
  const [resetting, setResetting]     = useState(false)

  const load = () => schoolAPI.getStudents().then(r => setStudents(r.data)).finally(() => setLoading(false))
  useEffect(() => { load() }, [])

  const submit = async (e) => {
    e.preventDefault(); setSaving(true)
    try {
      const res = await schoolAPI.createStudent(form)
      toast.success(`Student created! ID: ${res.data.uniqueId}`)
      setShowForm(false); setForm(EMPTY); load()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create student')
    } finally { setSaving(false) }
  }

  const toggle = async (id) => { await schoolAPI.toggleUser(id); toast.success('Status updated'); load() }

  const openReset = (student) => {
    setResetTarget({ uniqueId: student.uniqueId, fullName: student.fullName })
    setResetPwd('')
    setShowResetPwd(false)
  }

  const submitReset = async (e) => {
    e.preventDefault()
    if (resetPwd.length < 6) { toast.error('Password must be at least 6 characters'); return }
    setResetting(true)
    try {
      await authAPI.resetPassword(resetTarget.uniqueId, resetPwd)
      toast.success(`Password reset for ${resetTarget.fullName}. They must change it on next login.`)
      setResetTarget(null)
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to reset password')
    } finally { setResetting(false) }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-800">Students</h1>
          <p className="text-slate-500 text-sm">{students.length} student(s) enrolled</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Student
        </button>
      </div>

      {/* ── Create Student Modal ── */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="font-display text-lg font-bold">Create Student Account</h2>
              <button onClick={() => setShowForm(false)}><X className="w-5 h-5 text-slate-400" /></button>
            </div>
            <form onSubmit={submit} className="p-6 space-y-4">
              {[
                { key: 'fullName',    label: 'Full Name',     placeholder: 'Ananya Sharma',      required: true },
                { key: 'email',       label: 'Email',         placeholder: 'student@email.com',  type: 'email' },
                { key: 'phone',       label: 'Phone',         placeholder: '+91-9876543210' },
                { key: 'grade',       label: 'Grade/Class',   placeholder: 'Class 10',           required: true },
                { key: 'section',     label: 'Section',       placeholder: 'A' },
                { key: 'parentName',  label: 'Parent Name',   placeholder: 'Mr. Rajesh Sharma' },
                { key: 'parentPhone', label: 'Parent Phone',  placeholder: '+91-9876543210' },
                { key: 'password',    label: 'Initial Password', placeholder: 'Min 6 characters', type: 'password', required: true },
              ].map(f => (
                <div key={f.key}>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">{f.label}</label>
                  <input type={f.type || 'text'} className="input" placeholder={f.placeholder}
                    value={form[f.key]} onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                    required={f.required} />
                </div>
              ))}
              {/* Password notice */}
              <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2.5 text-xs text-amber-700">
                <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                <span>Student will be asked to change this password on first login.</span>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="btn-secondary flex-1">Cancel</button>
                <button type="submit" disabled={saving} className="btn-primary flex-1 flex items-center justify-center gap-2">
                  {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating...</> : 'Create Account'}
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
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-emerald-100 rounded-xl flex items-center justify-center">
                  <KeyRound className="w-4 h-4 text-emerald-600" />
                </div>
                <div>
                  <h2 className="font-display text-base font-bold text-slate-800">Reset Password</h2>
                  <p className="text-xs text-slate-500">{resetTarget.fullName}</p>
                </div>
              </div>
              <button onClick={() => setResetTarget(null)}><X className="w-5 h-5 text-slate-400" /></button>
            </div>
            <form onSubmit={submitReset} className="p-6 space-y-4">
              <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2.5 text-xs text-amber-700">
                <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                <span>The student will be forced to change this password on their next login.</span>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">New Password</label>
                <div className="relative">
                  <input
                    type={showResetPwd ? 'text' : 'password'}
                    className="input pr-10"
                    placeholder="Min 6 characters"
                    value={resetPwd}
                    onChange={e => setResetPwd(e.target.value)}
                    required
                  />
                  <button type="button" onClick={() => setShowResetPwd(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    {showResetPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setResetTarget(null)} className="btn-secondary flex-1">Cancel</button>
                <button type="submit" disabled={resetting} className="btn-primary flex-1 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700">
                  {resetting ? <><Loader2 className="w-4 h-4 animate-spin" /> Resetting...</> : 'Reset Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? <div className="card animate-pulse h-40" /> :
       students.length === 0 ? (
        <div className="card text-center py-12 text-slate-400">
          <GraduationCap className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p>No students yet. Enroll your first student!</p>
        </div>
      ) : (
        <div className="card overflow-x-auto p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                {['Student ID', 'Name', 'Grade', 'Section', 'Parent', 'Phone', 'Status', 'Actions'].map(h => (
                  <th key={h} className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {students.map(s => (
                <tr key={s.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-xs bg-slate-100 px-2 py-0.5 rounded-md">{s.uniqueId}</span>
                      {s.mustChangePassword && (
                        <span title="Password change pending" className="inline-flex items-center gap-1 text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-md font-medium">
                          <KeyRound className="w-2.5 h-2.5" /> Pending
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-3 font-medium text-slate-800">{s.fullName}</td>
                  <td className="px-5 py-3 text-slate-600">{s.grade || '—'}</td>
                  <td className="px-5 py-3 text-slate-600">{s.section || '—'}</td>
                  <td className="px-5 py-3 text-slate-600">{s.parentName || '—'}</td>
                  <td className="px-5 py-3 text-slate-600">{s.parentPhone || s.phone || '—'}</td>
                  <td className="px-5 py-3">
                    <span className={`badge ${s.active ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-600'}`}>
                      {s.active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => toggle(s.uniqueId)}
                        className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${
                          s.active ? 'bg-rose-50 text-rose-600 hover:bg-rose-100' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                        }`}>
                        {s.active ? <><UserX className="w-3 h-3" />Deactivate</> : <><UserCheck className="w-3 h-3" />Activate</>}
                      </button>
                      <button onClick={() => openReset(s)}
                        title="Reset password"
                        className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors">
                        <KeyRound className="w-3 h-3" /> Reset Pwd
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}