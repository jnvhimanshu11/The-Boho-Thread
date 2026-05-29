import { useEffect, useState } from 'react'
import { schoolAPI } from '../../services/api.js'
import { useAuth } from '../../context/AuthContext.jsx'
import StatCard from '../../components/common/StatCard.jsx'
import { BookOpen, GraduationCap, CreditCard, TrendingUp, IndianRupee } from 'lucide-react'
import toast from 'react-hot-toast'

export default function SchoolDashboard() {
  const [stats, setStats]   = useState({ totalTeachers: 0, totalStudents: 0, totalFees: 0, collectedFees: 0, pendingFees: 0 })
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  const banner = user?.bannerBase64 || ''

  useEffect(() => {
    schoolAPI.getReport()
      .then(r => setStats(r.data))
      .catch(() => toast.error('Failed to load dashboard stats'))
      .finally(() => setLoading(false))
  }, [])

  const fmt = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`

  return (
    <div>
      <div className="mb-4">
        <h1 className="font-display text-2xl font-bold text-slate-800">
          Welcome back, {user?.fullName?.split(' ')[0]} 👋
        </h1>
        <p className="text-slate-500 text-sm mt-1">{user?.schoolName} · School Dashboard</p>
      </div>

      {/* School Banner */}
      {banner && (
        <div className="mb-6 w-full">
          <img src={banner} alt="School Banner" className="w-full h-auto rounded-2xl block" />
        </div>
      )}

      {/* Stat Cards — always rendered, show 0 while loading, real values after API responds */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <StatCard title="Total Teachers"    value={loading ? '—' : stats.totalTeachers}      icon={BookOpen}      color="sky"     />
        <StatCard title="Total Students"    value={loading ? '—' : stats.totalStudents}      icon={GraduationCap} color="indigo"  />
        <StatCard title="Total Fees Billed" value={loading ? '—' : fmt(stats.totalFees)}     icon={IndianRupee}   color="purple"  />
        <StatCard title="Fees Collected"    value={loading ? '—' : fmt(stats.collectedFees)} icon={TrendingUp}    color="emerald" />
        <StatCard title="Fees Pending"      value={loading ? '—' : fmt(stats.pendingFees)}   icon={CreditCard}    color="rose"    />
      </div>

      <div className="mt-8 card">
        <h2 className="font-display text-lg font-bold text-slate-800 mb-1">Quick Actions</h2>
        <p className="text-slate-500 text-sm mb-4">Navigate using the sidebar to manage your school</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Add Teacher',     href: '/school/teachers',   color: 'bg-sky-50 text-sky-700 hover:bg-sky-100'            },
            { label: 'Add Student',     href: '/school/students',   color: 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'   },
            { label: 'Mark Attendance', href: '/school/attendance', color: 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100' },
            { label: 'Manage Fees',     href: '/school/fees',       color: 'bg-orange-50 text-orange-700 hover:bg-orange-100'   },
          ].map(a => (
            <a key={a.label} href={a.href}
              className={`flex items-center justify-center py-3 px-4 rounded-xl font-semibold text-sm transition-colors ${a.color}`}>
              {a.label}
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}