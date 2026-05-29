import { useEffect, useState } from 'react'
import { schoolAPI } from '../../services/api.js'
import { useAuth } from '../../context/AuthContext.jsx'
import StatCard from '../../components/common/StatCard.jsx'
import { BookOpen, GraduationCap, CreditCard, TrendingUp, IndianRupee } from 'lucide-react'
import toast from 'react-hot-toast'

export default function SchoolDashboard() {
  const [stats, setStats] = useState(null)
  const { user } = useAuth()

  // Banner comes directly from login response stored in AuthContext —
  // no extra API call needed, works on hard refresh too.
  const banner = user?.bannerBase64 || ''

  useEffect(() => {
    schoolAPI.getReport()
      .then(r => setStats(r.data))
      .catch(() => toast.error('Failed to load dashboard'))
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

      {/* School Banner — shown only when super admin has set one */}
      {banner && (
        <div className="rounded-2xl overflow-hidden mb-6 border border-slate-100 shadow-sm">
          <img src={banner} alt="School Banner" className="w-full h-44 object-cover" />
        </div>
      )}

      {stats ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <StatCard title="Total Teachers"   value={stats.totalTeachers}          icon={BookOpen}      color="sky"     />
          <StatCard title="Total Students"   value={stats.totalStudents}          icon={GraduationCap} color="indigo"  />
          <StatCard title="Total Fees Billed" value={fmt(stats.totalFees)}        icon={IndianRupee}   color="purple"  />
          <StatCard title="Fees Collected"   value={fmt(stats.collectedFees)}     icon={TrendingUp}    color="emerald" />
          <StatCard title="Fees Pending"     value={fmt(stats.pendingFees)}       icon={CreditCard}    color="rose"    />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="card animate-pulse h-24 bg-slate-100" />
          ))}
        </div>
      )}

      <div className="mt-8 card">
        <h2 className="font-display text-lg font-bold text-slate-800 mb-1">Quick Actions</h2>
        <p className="text-slate-500 text-sm mb-4">Navigate using the sidebar to manage your school</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Add Teacher',     href: '/school/teachers',   color: 'bg-sky-50 text-sky-700 hover:bg-sky-100'         },
            { label: 'Add Student',     href: '/school/students',   color: 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100' },
            { label: 'Mark Attendance', href: '/school/attendance', color: 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100' },
            { label: 'Manage Fees',     href: '/school/fees',       color: 'bg-orange-50 text-orange-700 hover:bg-orange-100' },
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