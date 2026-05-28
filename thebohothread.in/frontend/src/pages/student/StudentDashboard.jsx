import { useEffect, useState } from 'react'
import { studentAPI } from '../../services/api.js'
import { useAuth } from '../../context/AuthContext.jsx'
import StatCard from '../../components/common/StatCard.jsx'
import { CalendarCheck, CreditCard, GraduationCap, TrendingUp } from 'lucide-react'

export default function StudentDashboard() {
  const { user } = useAuth()
  const [attendance, setAttendance] = useState([])
  const [fees, setFees] = useState([])
  const [logo, setLogo] = useState(null)
  const [banner, setBanner] = useState(null)

  const today = new Date()
  const fromDate = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0]
  const toDate = today.toISOString().split('T')[0]

  useEffect(() => {
    studentAPI.getAttendance(fromDate, toDate).then(r => setAttendance(r.data))
    studentAPI.getFees().then(r => setFees(r.data))
    studentAPI.getSchoolInfo().then(r => {
      if (r.data?.logoBase64)   setLogo(r.data.logoBase64)
      if (r.data?.bannerBase64) setBanner(r.data.bannerBase64)
    }).catch(() => {
      studentAPI.getLogo().then(r => { if (r.data.logoBase64) setLogo(r.data.logoBase64) })
    })
  }, [])

  const presentDays = attendance.filter(a => a.status === 'PRESENT').length
  const totalDays = attendance.length
  const percentage = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0
  const pendingFees = fees.filter(f => f.status !== 'PAID').reduce((s, f) => s + (f.pendingAmount || 0), 0)
  const fmt = n => `₹${Number(n||0).toLocaleString('en-IN')}`

  return (
    <div>
      {/* Header with logo */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-800">
            Hello, {user?.fullName?.split(' ')[0]} 👋
          </h1>
          <p className="text-slate-500 text-sm mt-1">Student Portal · {user?.schoolName}</p>
        </div>
        {logo && (
          <img src={logo} alt="School Logo" className="w-14 h-14 object-contain rounded-2xl border border-slate-100 shadow-sm" />
        )}
      </div>

      {/* School Banner — shown below welcome heading */}
      {banner && (
        <div className="rounded-2xl overflow-hidden mb-6 border border-slate-100 shadow-sm">
          <img src={banner} alt="School Banner" className="w-full h-44 object-cover" />
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <StatCard title="Present (This Month)" value={presentDays} icon={CalendarCheck} color="emerald" />
        <StatCard title="Attendance %" value={`${percentage}%`} icon={TrendingUp} color={percentage >= 75 ? 'emerald' : 'rose'} />
        <StatCard title="Total Days" value={totalDays} icon={GraduationCap} color="indigo" />
        <StatCard title="Pending Fees" value={fmt(pendingFees)} icon={CreditCard} color={pendingFees > 0 ? 'rose' : 'emerald'} />
      </div>

      {/* Attendance progress */}
      <div className="card mb-5">
        <h2 className="font-display text-base font-bold text-slate-800 mb-3">Attendance This Month</h2>
        <div className="flex items-center gap-4">
          <div className="flex-1 bg-slate-100 rounded-full h-3 overflow-hidden">
            <div className={`h-full rounded-full transition-all duration-700 ${percentage >= 75 ? 'bg-emerald-500' : 'bg-rose-500'}`}
              style={{ width: `${percentage}%` }} />
          </div>
          <span className={`font-display text-lg font-bold ${percentage >= 75 ? 'text-emerald-600' : 'text-rose-600'}`}>{percentage}%</span>
        </div>
        {percentage < 75 && (
          <p className="text-xs text-rose-500 font-medium mt-2">⚠ Attendance below 75%. Please attend regularly.</p>
        )}
      </div>

      {/* Recent fees */}
      {fees.filter(f => f.status !== 'PAID').length > 0 && (
        <div className="card bg-rose-50 border border-rose-100">
          <h2 className="font-display text-base font-bold text-rose-800 mb-3">Pending Fees</h2>
          <div className="space-y-2">
            {fees.filter(f => f.status !== 'PAID').slice(0,3).map(f => (
              <div key={f.id} className="flex justify-between text-sm">
                <span className="text-rose-700">{f.feeType}</span>
                <span className="font-semibold text-rose-800">{fmt(f.pendingAmount)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}