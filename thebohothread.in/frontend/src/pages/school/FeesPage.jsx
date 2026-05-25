import { useEffect, useState } from 'react'
import { schoolAPI } from '../../services/api.js'
import { Plus, X, Loader2, CreditCard, IndianRupee } from 'lucide-react'
import toast from 'react-hot-toast'

const FEE_TYPES = ['Tuition', 'Transport', 'Library', 'Sports', 'Lab', 'Exam', 'Hostel', 'Other']
const STATUS_COLORS = {
  PAID: 'bg-emerald-100 text-emerald-700',
  PENDING: 'bg-yellow-100 text-yellow-700',
  PARTIAL: 'bg-blue-100 text-blue-600',
  OVERDUE: 'bg-rose-100 text-rose-600',
}

export default function FeesPage() {
  const [fees, setFees] = useState([])
  const [students, setStudents] = useState([])
  const [showAdd, setShowAdd] = useState(false)
  const [showCollect, setShowCollect] = useState(null)
  const [form, setForm] = useState({ studentUniqueId: '', feeType: 'Tuition', totalAmount: '', dueDate: '' })
  const [collectForm, setCollectForm] = useState({ amount: '', paymentMode: 'Cash', transactionId: '' })
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)

  const load = () => {
    Promise.all([schoolAPI.getAllFees(), schoolAPI.getStudents()])
      .then(([f, s]) => { setFees(f.data); setStudents(s.data) })
      .finally(() => setLoading(false))
  }
  useEffect(() => { load() }, [])

  const submitFee = async (e) => {
    e.preventDefault(); setSaving(true)
    try {
      await schoolAPI.addFee(form)
      toast.success('Fee record added!')
      setShowAdd(false); setForm({ studentUniqueId: '', feeType: 'Tuition', totalAmount: '', dueDate: '' }); load()
    } catch (err) { toast.error(err.response?.data?.error || 'Failed') }
    finally { setSaving(false) }
  }

  const submitCollect = async (e) => {
    e.preventDefault(); setSaving(true)
    try {
      await schoolAPI.collectFee(showCollect.id, collectForm)
      toast.success('Payment recorded!')
      setShowCollect(null); setCollectForm({ amount: '', paymentMode: 'Cash', transactionId: '' }); load()
    } catch (err) { toast.error(err.response?.data?.error || 'Failed') }
    finally { setSaving(false) }
  }

  const totalCollected = fees.reduce((sum, f) => sum + (f.paidAmount || 0), 0)
  const totalPending = fees.reduce((sum, f) => sum + (f.pendingAmount || 0), 0)
  const fmt = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-800">Fee Management</h1>
          <p className="text-slate-500 text-sm">{fees.length} fee records</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Fee
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="card text-center">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Total Billed</p>
          <p className="font-display text-xl font-bold text-slate-800">{fmt(fees.reduce((s,f)=>s+(f.totalAmount||0),0))}</p>
        </div>
        <div className="card text-center bg-emerald-50">
          <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wide mb-1">Collected</p>
          <p className="font-display text-xl font-bold text-emerald-700">{fmt(totalCollected)}</p>
        </div>
        <div className="card text-center bg-rose-50">
          <p className="text-xs font-semibold text-rose-500 uppercase tracking-wide mb-1">Pending</p>
          <p className="font-display text-xl font-bold text-rose-600">{fmt(totalPending)}</p>
        </div>
      </div>

      {/* Add Fee Modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="font-display text-lg font-bold">Add Fee Record</h2>
              <button onClick={() => setShowAdd(false)}><X className="w-5 h-5 text-slate-400" /></button>
            </div>
            <form onSubmit={submitFee} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Student</label>
                <select className="input" value={form.studentUniqueId} onChange={e => setForm({ ...form, studentUniqueId: e.target.value })} required>
                  <option value="">Select student...</option>
                  {students.filter(s => s.active).map(s => (
                    <option key={s.uniqueId} value={s.uniqueId}>{s.fullName} ({s.uniqueId})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Fee Type</label>
                <select className="input" value={form.feeType} onChange={e => setForm({ ...form, feeType: e.target.value })}>
                  {FEE_TYPES.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Amount (₹)</label>
                <input type="number" className="input" placeholder="e.g. 15000" min="1"
                  value={form.totalAmount} onChange={e => setForm({ ...form, totalAmount: e.target.value })} required />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Due Date</label>
                <input type="date" className="input" value={form.dueDate} onChange={e => setForm({ ...form, dueDate: e.target.value })} required />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowAdd(false)} className="btn-secondary flex-1">Cancel</button>
                <button type="submit" disabled={saving} className="btn-primary flex-1 flex items-center justify-center gap-2">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null} Add Fee
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Collect Payment Modal */}
      {showCollect && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b">
              <div>
                <h2 className="font-display text-lg font-bold">Collect Payment</h2>
                <p className="text-sm text-slate-500">{showCollect.studentName} · {showCollect.feeType}</p>
              </div>
              <button onClick={() => setShowCollect(null)}><X className="w-5 h-5 text-slate-400" /></button>
            </div>
            <form onSubmit={submitCollect} className="p-6 space-y-4">
              <div className="bg-slate-50 rounded-xl p-4 grid grid-cols-2 gap-2 text-sm">
                <div><span className="text-slate-500">Total:</span> <strong>{fmt(showCollect.totalAmount)}</strong></div>
                <div><span className="text-slate-500">Paid:</span> <strong className="text-emerald-600">{fmt(showCollect.paidAmount)}</strong></div>
                <div><span className="text-slate-500">Pending:</span> <strong className="text-rose-600">{fmt(showCollect.pendingAmount)}</strong></div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Amount to Collect (₹)</label>
                <input type="number" className="input" placeholder="Enter amount" min="1" max={showCollect.pendingAmount}
                  value={collectForm.amount} onChange={e => setCollectForm({ ...collectForm, amount: e.target.value })} required />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Payment Mode</label>
                <select className="input" value={collectForm.paymentMode} onChange={e => setCollectForm({ ...collectForm, paymentMode: e.target.value })}>
                  {['Cash', 'Online', 'Cheque', 'DD', 'UPI'].map(m => <option key={m}>{m}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Transaction ID (optional)</label>
                <input type="text" className="input" placeholder="UTR / Cheque No."
                  value={collectForm.transactionId} onChange={e => setCollectForm({ ...collectForm, transactionId: e.target.value })} />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowCollect(null)} className="btn-secondary flex-1">Cancel</button>
                <button type="submit" disabled={saving} className="btn-primary flex-1 flex items-center justify-center gap-2">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <IndianRupee className="w-4 h-4" />} Collect
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Fees Table */}
      {loading ? <div className="card animate-pulse h-40" /> :
       fees.length === 0 ? (
        <div className="card text-center py-12 text-slate-400">
          <CreditCard className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p>No fee records yet.</p>
        </div>
      ) : (
        <div className="card overflow-x-auto p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                {['Student', 'Fee Type', 'Total', 'Paid', 'Pending', 'Due Date', 'Status', 'Action'].map(h => (
                  <th key={h} className="text-left px-4 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {fees.map(f => (
                <tr key={f.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-medium text-slate-800">{f.studentName}</p>
                    <p className="text-xs text-slate-400">{f.studentUniqueId}</p>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{f.feeType}</td>
                  <td className="px-4 py-3 font-medium">{fmt(f.totalAmount)}</td>
                  <td className="px-4 py-3 text-emerald-600 font-medium">{fmt(f.paidAmount)}</td>
                  <td className="px-4 py-3 text-rose-600 font-medium">{fmt(f.pendingAmount)}</td>
                  <td className="px-4 py-3 text-slate-500">{f.dueDate || '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`badge ${STATUS_COLORS[f.status] || 'bg-slate-100 text-slate-600'}`}>{f.status}</span>
                  </td>
                  <td className="px-4 py-3">
                    {f.status !== 'PAID' && (
                      <button onClick={() => setShowCollect(f)}
                        className="text-xs font-semibold px-3 py-1.5 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-lg transition-colors flex items-center gap-1">
                        <IndianRupee className="w-3 h-3" /> Collect
                      </button>
                    )}
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
