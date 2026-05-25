import { useEffect, useState } from 'react'
import { studentAPI } from '../../services/api.js'
import { CreditCard } from 'lucide-react'

const STATUS_COLORS = {
  PAID: 'bg-emerald-100 text-emerald-700',
  PENDING: 'bg-yellow-100 text-yellow-700',
  PARTIAL: 'bg-blue-100 text-blue-600',
  OVERDUE: 'bg-rose-100 text-rose-600',
}

export default function StudentFees() {
  const [fees, setFees] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    studentAPI.getFees().then(r => setFees(r.data)).finally(() => setLoading(false))
  }, [])

  const fmt = n => `₹${Number(n||0).toLocaleString('en-IN')}`
  const totalPaid = fees.reduce((s, f) => s + (f.paidAmount || 0), 0)
  const totalPending = fees.reduce((s, f) => s + (f.pendingAmount || 0), 0)

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-slate-800">My Fees</h1>
        <p className="text-slate-500 text-sm">View your fee records and payment status</p>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="card text-center">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Total Billed</p>
          <p className="font-display text-xl font-bold text-slate-800">{fmt(fees.reduce((s,f)=>s+(f.totalAmount||0),0))}</p>
        </div>
        <div className="card text-center bg-emerald-50">
          <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wide mb-1">Paid</p>
          <p className="font-display text-xl font-bold text-emerald-700">{fmt(totalPaid)}</p>
        </div>
        <div className="card text-center bg-rose-50">
          <p className="text-xs font-semibold text-rose-500 uppercase tracking-wide mb-1">Pending</p>
          <p className="font-display text-xl font-bold text-rose-600">{fmt(totalPending)}</p>
        </div>
      </div>

      {loading ? <div className="card animate-pulse h-40" /> :
       fees.length === 0 ? (
        <div className="card text-center py-12 text-slate-400">
          <CreditCard className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p>No fee records found</p>
        </div>
      ) : (
        <div className="card overflow-x-auto p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                {['Fee Type', 'Total', 'Paid', 'Pending', 'Due Date', 'Status'].map(h => (
                  <th key={h} className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {fees.map(f => (
                <tr key={f.id} className="border-b border-slate-50 hover:bg-slate-50">
                  <td className="px-5 py-3 font-medium text-slate-800">{f.feeType}</td>
                  <td className="px-5 py-3">{fmt(f.totalAmount)}</td>
                  <td className="px-5 py-3 text-emerald-600 font-medium">{fmt(f.paidAmount)}</td>
                  <td className="px-5 py-3 text-rose-600 font-medium">{fmt(f.pendingAmount)}</td>
                  <td className="px-5 py-3 text-slate-500">{f.dueDate || '—'}</td>
                  <td className="px-5 py-3">
                    <span className={`badge ${STATUS_COLORS[f.status] || 'bg-slate-100 text-slate-600'}`}>{f.status}</span>
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
