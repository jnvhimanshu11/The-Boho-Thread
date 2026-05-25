import { useEffect, useState } from 'react'
import { schoolAPI } from '../../services/api.js'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'
import { BarChart3 } from 'lucide-react'

const COLORS = ['#4f46e5', '#10b981', '#f97316', '#0ea5e9', '#8b5cf6']

export default function ReportsPage() {
  const [report, setReport] = useState(null)
  const [fees, setFees] = useState([])
  const [attendance, setAttendance] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([schoolAPI.getReport(), schoolAPI.getAllFees()])
      .then(([r, f]) => { setReport(r.data); setFees(f.data) })
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="card animate-pulse h-64" />

  const feeByType = fees.reduce((acc, f) => {
    acc[f.feeType] = (acc[f.feeType] || 0) + f.totalAmount
    return acc
  }, {})

  const feeChartData = Object.entries(feeByType).map(([name, value]) => ({ name, value }))

  const barData = [
    { name: 'Collected', amount: report?.collectedFees || 0 },
    { name: 'Pending', amount: report?.pendingFees || 0 },
  ]

  const feeStatusData = [
    { name: 'Paid', value: fees.filter(f => f.status === 'PAID').length },
    { name: 'Pending', value: fees.filter(f => f.status === 'PENDING').length },
    { name: 'Partial', value: fees.filter(f => f.status === 'PARTIAL').length },
    { name: 'Overdue', value: fees.filter(f => f.status === 'OVERDUE').length },
  ].filter(d => d.value > 0)

  const fmt = n => `₹${Number(n||0).toLocaleString('en-IN')}`

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-slate-800">Reports & Analytics</h1>
        <p className="text-slate-500 text-sm">School performance overview</p>
      </div>

      {/* KPI Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Teachers', value: report?.totalTeachers || 0, color: 'bg-sky-50 border-sky-100' },
          { label: 'Students', value: report?.totalStudents || 0, color: 'bg-indigo-50 border-indigo-100' },
          { label: 'Collected', value: fmt(report?.collectedFees), color: 'bg-emerald-50 border-emerald-100' },
          { label: 'Pending', value: fmt(report?.pendingFees), color: 'bg-rose-50 border-rose-100' },
        ].map(k => (
          <div key={k.label} className={`card border ${k.color} text-center`}>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">{k.label}</p>
            <p className="font-display text-2xl font-bold text-slate-800">{k.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart - Fee Collection */}
        <div className="card">
          <h2 className="font-display text-base font-bold text-slate-800 mb-4">Fee Collection Summary</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `₹${(v/1000).toFixed(0)}K`} />
              <Tooltip formatter={v => fmt(v)} />
              <Bar dataKey="amount" radius={[6,6,0,0]}>
                {barData.map((_, i) => <Cell key={i} fill={i === 0 ? '#10b981' : '#f43f5e'} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart - Fee Status */}
        <div className="card">
          <h2 className="font-display text-base font-bold text-slate-800 mb-4">Fee Status Distribution</h2>
          {feeStatusData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={feeStatusData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} ${(percent*100).toFixed(0)}%`}>
                  {feeStatusData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[220px] text-slate-300">
              <BarChart3 className="w-12 h-12" />
            </div>
          )}
        </div>

        {/* Fee by Type */}
        {feeChartData.length > 0 && (
          <div className="card lg:col-span-2">
            <h2 className="font-display text-base font-bold text-slate-800 mb-4">Revenue by Fee Type</h2>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={feeChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `₹${(v/1000).toFixed(0)}K`} />
                <Tooltip formatter={v => fmt(v)} />
                <Bar dataKey="value" radius={[6,6,0,0]} fill="#4f46e5" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  )
}
