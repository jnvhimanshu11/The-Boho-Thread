import { useEffect, useState } from 'react'
import { teacherAPI } from '../../services/api.js'
import { sendStudentCredentials } from '../../services/emailService.js'
import { Plus, X, Loader2, GraduationCap, ShieldAlert } from 'lucide-react'
import toast from 'react-hot-toast'

const EMPTY = { fullName: '', email: '', phone: '', grade: '', section: '', parentName: '', parentPhone: '', password: '' }

export default function TeacherStudents() {
  const [students, setStudents] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)

  const load = () => teacherAPI.getStudents().then(r => setStudents(r.data)).finally(() => setLoading(false))
  useEffect(() => { load() }, [])

  const submit = async (e) => {
    e.preventDefault(); setSaving(true)
    try {
      const res = await teacherAPI.createStudent(form)
      toast.success(`Student created! ID: ${res.data.uniqueId}`)

      // ✅ Snapshot form values BEFORE resetting state
      const { fullName, email, password, grade } = form
      const uniqueId = res.data.uniqueId

      setShowForm(false); setForm(EMPTY); load()

      // Send login credentials via EmailJS
      if (email) {
        const emailResult = await sendStudentCredentials({
          fullName,
          email,
          uniqueId,
          password,
          grade,
        })
        if (emailResult.success) {
          toast.success("Login credentials sent to student's email ✉️")
        } else {
          toast.error('Account created, but email delivery failed. Share credentials manually.')
          console.error('[EmailJS] Student email error:', emailResult.error)
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed')
    } finally { setSaving(false) }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-800">My Students</h1>
          <p className="text-slate-500 text-sm">{students.length} student(s) in school</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Student
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="font-display text-lg font-bold">Create Student Account</h2>
              <button onClick={() => setShowForm(false)}><X className="w-5 h-5 text-slate-400" /></button>
            </div>
            <form onSubmit={submit} className="p-6 space-y-4">
              {[
                { key: 'fullName',    label: 'Full Name',    placeholder: 'Student name',       required: true },
                { key: 'email',       label: 'Email',        placeholder: 'student@email.com',  type: 'email' },
                { key: 'phone',       label: 'Phone',        placeholder: '+91-9876543210' },
                { key: 'grade',       label: 'Grade/Class',  placeholder: 'Class 10',           required: true },
                { key: 'section',     label: 'Section',      placeholder: 'A' },
                { key: 'parentName',  label: 'Parent Name',  placeholder: 'Parent name' },
                { key: 'parentPhone', label: 'Parent Phone', placeholder: '+91-9876543210' },
                { key: 'password',    label: 'Password',     placeholder: 'Min 6 characters',   type: 'password', required: true },
              ].map(f => (
                <div key={f.key}>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">{f.label}</label>
                  <input type={f.type || 'text'} className="input" placeholder={f.placeholder}
                    value={form[f.key]} onChange={e => setForm({ ...form, [f.key]: e.target.value })} required={f.required} />
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
                  {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating...</> : 'Create Student'}
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
          <p>No students yet. Create one!</p>
        </div>
      ) : (
        <div className="card overflow-x-auto p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                {['ID', 'Name', 'Grade', 'Section', 'Parent', 'Status'].map(h => (
                  <th key={h} className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {students.map(s => (
                <tr key={s.id} className="border-b border-slate-50 hover:bg-slate-50">
                  <td className="px-5 py-3"><span className="font-mono text-xs bg-slate-100 px-2 py-0.5 rounded">{s.uniqueId}</span></td>
                  <td className="px-5 py-3 font-medium text-slate-800">{s.fullName}</td>
                  <td className="px-5 py-3 text-slate-600">{s.grade || '—'}</td>
                  <td className="px-5 py-3 text-slate-600">{s.section || '—'}</td>
                  <td className="px-5 py-3 text-slate-600">{s.parentName || '—'}</td>
                  <td className="px-5 py-3">
                    <span className={`badge ${s.active ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-600'}`}>
                      {s.active ? 'Active' : 'Inactive'}
                    </span>
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