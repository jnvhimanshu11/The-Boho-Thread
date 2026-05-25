import { useEffect, useState } from 'react'
import { studentAPI } from '../../services/api.js'
import { CalendarCheck } from 'lucide-react'

const STATUS_COLORS = {
  PRESENT: 'bg-emerald-100 text-emerald-700',
  ABSENT: 'bg-rose-100 text-rose-600',
  LATE: 'bg-yellow-100 text-yellow-700',
  HALF_DAY: 'bg-blue-100 text-blue-600',
}

export default function StudentAttendance() {
  const today = new Date()
  const [from, setFrom] = useState(new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0])
  const [to, setTo] = useState(today.toISOString().split('T')[0])
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)

  const load = () => {
    setLoading(true)
    studentAPI.getAttendance(from, to).then(r => setRecords(r.data)).finally(() => setLoading(false))
  }
  useEffect(() => { load() }, [])

  const present = records.filter(r => r.status === 'PRESENT').length
  const absent = records.filter(r => r.status === 'ABSENT').length
  const pct = records.length > 0 ? Math.round((present / records.length) * 100) : 0

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-800">My Attendance</h1>
          <p className="text-slate-500 text-sm">Track your attendance records</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <input type="date" className="input w-auto" value={from} onChange={e => setFrom(e.target.value)} />
          <span className="text-slate-400 text-sm">to</span>
          <input type="date" className="input w-auto" value={to} onChange={e => setTo(e.target.value)} />
          <button onClick={load} className="btn-primary">Filter</button>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Present', val: present, color: 'bg-emerald-50 text-emerald-700' },
          { label: 'Absent', val: absent, color: 'bg-rose-50 text-rose-600' },
          { label: 'Total', val: records.length, color: 'bg-slate-50 text-slate-700' },
          { label: 'Percentage', val: `${pct}%`, color: pct >= 75 ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-600' },
        ].map(s => (
          <div key={s.label} className={`card ${s.color} text-center py-3`}>
            <p className="font-display text-xl font-bold">{s.val}</p>
            <p className="text-xs font-semibold mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {loading ? <div className="card animate-pulse h-40" /> :
       records.length === 0 ? (
        <div className="card text-center py-12 text-slate-400">
          <CalendarCheck className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p>No attendance records found for selected period</p>
        </div>
      ) : (
        <div className="card overflow-x-auto p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                {['Date', 'Status', 'Remarks'].map(h => (
                  <th key={h} className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {records.sort((a, b) => new Date(b.date) - new Date(a.date)).map(r => (
                <tr key={r.id} className="border-b border-slate-50 hover:bg-slate-50">
                  <td className="px-5 py-3 font-medium text-slate-800">{r.date}</td>
                  <td className="px-5 py-3">
                    <span className={`badge ${STATUS_COLORS[r.status]}`}>{r.status?.replace('_', ' ')}</span>
                  </td>
                  <td className="px-5 py-3 text-slate-500">{r.remarks || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
