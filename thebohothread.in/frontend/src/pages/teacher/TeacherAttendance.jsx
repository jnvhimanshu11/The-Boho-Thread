import { useEffect, useState } from 'react'
import { teacherAPI } from '../../services/api.js'
import { Check, CalendarCheck } from 'lucide-react'
import toast from 'react-hot-toast'

const STATUS_OPTIONS = ['PRESENT', 'ABSENT', 'LATE', 'HALF_DAY']
const STATUS_COLORS = {
  PRESENT: 'bg-emerald-100 text-emerald-700 border-emerald-300',
  ABSENT: 'bg-rose-100 text-rose-600 border-rose-300',
  LATE: 'bg-yellow-100 text-yellow-700 border-yellow-300',
  HALF_DAY: 'bg-blue-100 text-blue-600 border-blue-300',
}

export default function TeacherAttendance() {
  const [students, setStudents] = useState([])
  const [attendance, setAttendance] = useState({})
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    teacherAPI.getStudents().then(r => {
      const active = r.data.filter(s => s.active)
      setStudents(active)
      const init = {}
      active.forEach(s => init[s.uniqueId] = 'PRESENT')
      setAttendance(init)
    })
  }, [])

  const submit = async () => {
    setSaving(true)
    try {
      await Promise.all(students.map(s =>
        teacherAPI.markAttendance({ studentUniqueId: s.uniqueId, date, status: attendance[s.uniqueId] || 'PRESENT' })
      ))
      toast.success('Attendance marked successfully!')
    } catch { toast.error('Failed to save attendance') }
    finally { setSaving(false) }
  }

  const present = Object.values(attendance).filter(v => v === 'PRESENT').length
  const absent = Object.values(attendance).filter(v => v === 'ABSENT').length

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-800">Attendance</h1>
          <p className="text-slate-500 text-sm">Mark attendance for your students</p>
        </div>
        <div className="flex items-center gap-3">
          <input type="date" className="input w-auto" value={date} onChange={e => setDate(e.target.value)} />
          <button onClick={submit} disabled={saving || !students.length} className="btn-primary flex items-center gap-2">
            <Check className="w-4 h-4" /> {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Present', val: present, color: 'text-emerald-600 bg-emerald-50' },
          { label: 'Absent', val: absent, color: 'text-rose-600 bg-rose-50' },
          { label: 'Total', val: students.length, color: 'text-indigo-600 bg-indigo-50' },
        ].map(s => (
          <div key={s.label} className={`card ${s.color} text-center py-4`}>
            <p className="font-display text-2xl font-bold">{s.val}</p>
            <p className="text-xs font-semibold mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {students.length === 0 ? (
        <div className="card text-center py-12 text-slate-400">
          <CalendarCheck className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p>No active students found</p>
        </div>
      ) : (
        <div className="card overflow-x-auto p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                {['Student', 'Grade', 'Section', 'Mark Attendance'].map(h => (
                  <th key={h} className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {students.map(s => (
                <tr key={s.uniqueId} className="border-b border-slate-50 hover:bg-slate-50">
                  <td className="px-5 py-3">
                    <p className="font-medium text-slate-800">{s.fullName}</p>
                    <p className="text-xs text-slate-400">{s.uniqueId}</p>
                  </td>
                  <td className="px-5 py-3 text-slate-600">{s.grade || '—'}</td>
                  <td className="px-5 py-3 text-slate-600">{s.section || '—'}</td>
                  <td className="px-5 py-3">
                    <div className="flex gap-1.5 flex-wrap">
                      {STATUS_OPTIONS.map(st => (
                        <button key={st} onClick={() => setAttendance({ ...attendance, [s.uniqueId]: st })}
                          className={`text-xs px-2.5 py-1 rounded-lg font-semibold transition-all border ${
                            attendance[s.uniqueId] === st
                              ? STATUS_COLORS[st]
                              : 'bg-slate-50 text-slate-400 border-slate-200 hover:bg-slate-100'
                          }`}>
                          {st.replace('_', ' ')}
                        </button>
                      ))}
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
