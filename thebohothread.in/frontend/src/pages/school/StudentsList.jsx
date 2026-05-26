import { useEffect, useState } from 'react'
import { schoolAPI } from '../../services/api.js'
import { Plus, X, Loader2, UserCheck, UserX, GraduationCap, KeyRound } from 'lucide-react'
import toast from 'react-hot-toast'

const EMPTY = { fullName: '', email: '', phone: '', grade: '', section: '', parentName: '', parentPhone: '', password: '' }

export default function StudentsList() {
  const [students, setStudents] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)

  // Reset password state
  const [resetTarget, setResetTarget] = useState(null)
  const [resetPwd, setResetPwd] = useState('')
  const [resetConfirm, setResetConfirm] = useState('')
  const [resetLoading, setResetLoading] = useState(false)
  const [showResetPwd, setShowResetPwd] = useState(false)

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

  const handleResetPassword = async () => {
    if (!resetPwd || resetPwd.length < 6) {
      toast.error('Password must be at least 6 characters'); return
    }
    if (resetPwd !== resetConfirm) {
      toast.error('Passwords do not match'); return
    }
    setResetLoading(true)
    try {
      await schoolAPI.resetUserPassword(resetTarget.uniqueId, resetPwd)
      toast.success(`Password reset for ${resetTarget.fullName}. They must change it on next login.`)
      setResetTarget(null)
      setResetPwd('')
      setResetConfirm('')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to reset password')
    } finally { setResetLoading(false) }
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

      {/* ══════ CREATE STUDENT MODAL ══════ */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="font-display text-lg font-bold">Create Student Account</h2>
              <button onClick={() => setShowForm(false)}><X className="w-5 h-5 text-slate-400" /></button>
            </div>
            <form onSubmit={submit} className="p-6 space-y-4">
              {[
                { key: 'fullName', label: 'Full Name', placeholder: 'Ananya Sharma', required: true },
                { key: 'email', label: 'Email', placeholder: 'student@email.com', type: 'email' },
                { key: 'phone', label: 'Phone', placeholder: '+91-9876543210' },
                { key: 'grade', label: 'Grade/Class', placeholder: 'Class 10', required: true },
                { key: 'section', label: 'Section', placeholder: 'A' },
                { key: 'parentName', label: 'Parent Name', placeholder: 'Mr. Rajesh Sharma' },
                { key: 'parentPhone', label: 'Parent Phone', placeholder: '+91-9876543210' },
                { key: 'password', label: 'Temporary Password', placeholder: 'Min 6 characters (student must change on first login)', type: 'password', required: true },
              ].map(f => (
                <div key={f.key}>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">{f.label}</label>
                  <input type={f.type || 'text'} className="input" placeholder={f.placeholder}
                    value={form[f.key]} onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                    required={f.required} />
                </div>
              ))}
              <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-xs text-amber-700">
                <span className="font-semibold">Note:</span> The student will be required to change this temporary password on their first login.
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
                  <td className="px-5 py-3"><span className="font-mono text-xs bg-slate-100 px-2 py-0.5 rounded-md">{s.uniqueId}</span></td>
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
                    <div className="flex items-center gap-1.5">
                      {/* Toggle Active */}
                      <button onClick={() => toggle(s.uniqueId)}
                        className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${
                          s.active ? 'bg-rose-50 text-rose-600 hover:bg-rose-100' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                        }`}>
                        {s.active ? <><UserX className="w-3 h-3" />Deactivate</> : <><UserCheck className="w-3 h-3" />Activate</>}
                      </button>
                      {/* Reset Password */}
                      <button onClick={() => { setResetTarget(s); setResetPwd(''); setResetConfirm(''); setShowResetPwd(false) }}
                        className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-purple-50 text-purple-600 hover:bg-purple-100 transition-colors">
                        <KeyRound className="w-3 h-3" />
                        Reset Pwd
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ══════════ RESET PASSWORD MODAL ══════════ */}
      {resetTarget && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-purple-100 flex items-center justify-center">
                  <KeyRound className="w-4 h-4 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800">Reset Password</h3>
                  <p className="text-xs text-slate-400 mt-0.5">{resetTarget.fullName} · {resetTarget.uniqueId}</p>
                </div>
              </div>
              <button onClick={() => setResetTarget(null)} className="p-1.5 rounded-lg hover:bg-slate-100">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-xs text-amber-700">
                <span className="font-semibold">Note:</span> The student will be required to change this password on their next login.
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">New Password</label>
                <div className="relative">
                  <input
                    type={showResetPwd ? 'text' : 'password'}
                    className="input pr-10"
                    placeholder="Minimum 6 characters"
                    value={resetPwd}
                    onChange={e => setResetPwd(e.target.value)}
                  />
                  <button type="button" onClick={() => setShowResetPwd(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    {showResetPwd
                      ? <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                      : <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                    }
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Confirm New Password</label>
                <input
                  type="password"
                  className={`input ${resetConfirm && resetPwd !== resetConfirm ? 'ring-2 ring-rose-400 border-rose-400' : ''}`}
                  placeholder="Re-enter new password"
                  value={resetConfirm}
                  onChange={e => setResetConfirm(e.target.value)}
                />
                {resetConfirm && resetPwd !== resetConfirm && (
                  <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
                )}
                {resetConfirm && resetPwd === resetConfirm && resetPwd.length >= 6 && (
                  <p className="text-xs text-green-600 mt-1">✓ Passwords match</p>
                )}
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setResetTarget(null)}
                  className="btn-secondary flex-1">Cancel</button>
                <button
                  type="button"
                  onClick={handleResetPassword}
                  disabled={resetLoading || !resetPwd || resetPwd !== resetConfirm || resetPwd.length < 6}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  {resetLoading ? <><Loader2 className="w-4 h-4 animate-spin" />Resetting...</> : <><KeyRound className="w-4 h-4" />Reset Password</>}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
