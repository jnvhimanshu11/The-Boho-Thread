import { useEffect, useState } from 'react'
import { schoolAPI } from '../../services/api.js'
import { useAuth } from '../../context/AuthContext.jsx'
import StatCard from '../../components/common/StatCard.jsx'
import { Users, GraduationCap, BookOpen, CreditCard, TrendingUp, IndianRupee } from 'lucide-react'
import toast from 'react-hot-toast'

export default function SchoolDashboard() {
  const [stats, setStats]   = useState(null)
  const [banner, setBanner] = useState('')
  const [debugInfo, setDebugInfo] = useState(null)
  const { user } = useAuth()

  useEffect(() => {
    schoolAPI.getReport()
      .then(r => setStats(r.data))
      .catch(() => toast.error('Failed to load dashboard'))

    schoolAPI.getSchoolInfo()
      .then(r => {
        const data = r.data
        const b = data?.bannerBase64

        // Debug info shown on screen
        setDebugInfo({
          allKeys: Object.keys(data || {}),
          bannerExists: !!b,
          bannerLength: b ? b.length : 0,
          bannerStart: b ? b.substring(0, 60) : 'EMPTY',
          hasBannerField: 'bannerBase64' in (data || {}),
          rawValue: b === undefined ? 'UNDEFINED' : b === null ? 'NULL' : b === '' ? 'EMPTY STRING' : 'HAS DATA'
        })

        console.log('=== SCHOOL INFO DEBUG ===')
        console.log('Full response keys:', Object.keys(data || {}))
        console.log('bannerBase64 value type:', typeof b)
        console.log('bannerBase64 length:', b ? b.length : 0)
        console.log('bannerBase64 starts with:', b ? b.substring(0, 80) : 'NOTHING')
        console.log('Full data:', data)

        if (b && b.trim() !== '') setBanner(b)
      })
      .catch(err => {
        console.error('getSchoolInfo failed:', err)
        setDebugInfo({ error: err.message })
      })
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

      {/* DEBUG PANEL — remove after fix confirmed */}
      {debugInfo && (
        <div className="mb-4 p-4 bg-yellow-50 border-2 border-yellow-300 rounded-xl text-xs font-mono space-y-1">
          <p className="font-bold text-yellow-800 text-sm">🔍 BANNER DEBUG INFO</p>
          {debugInfo.error ? (
            <p className="text-red-600">API ERROR: {debugInfo.error}</p>
          ) : (
            <>
              <p>API Keys returned: <span className="text-blue-700">{debugInfo.allKeys?.join(', ')}</span></p>
              <p>bannerBase64 field present: <span className={debugInfo.hasBannerField ? 'text-green-700' : 'text-red-700'}>{String(debugInfo.hasBannerField)}</span></p>
              <p>bannerBase64 status: <span className={debugInfo.bannerExists ? 'text-green-700 font-bold' : 'text-red-700 font-bold'}>{debugInfo.rawValue}</span></p>
              <p>bannerBase64 length: <span className="text-blue-700">{debugInfo.bannerLength} chars</span></p>
              {debugInfo.bannerExists && <p>bannerBase64 starts: <span className="text-green-700">{debugInfo.bannerStart}...</span></p>}
            </>
          )}
          <p className="text-yellow-600 mt-1">Also check browser Console (F12) for full details</p>
        </div>
      )}

      {/* School Banner */}
      {banner && (
        <div className="rounded-2xl overflow-hidden mb-6 border border-slate-100 shadow-sm">
          <img src={banner} alt="School Banner" className="w-full h-44 object-cover" />
        </div>
      )}

      {stats ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <StatCard title="Total Teachers" value={stats.totalTeachers} icon={BookOpen} color="sky" />
          <StatCard title="Total Students" value={stats.totalStudents} icon={GraduationCap} color="indigo" />
          <StatCard title="Total Fees Billed" value={fmt(stats.totalFees)} icon={IndianRupee} color="purple" />
          <StatCard title="Fees Collected" value={fmt(stats.collectedFees)} icon={TrendingUp} color="emerald" />
          <StatCard title="Fees Pending" value={fmt(stats.pendingFees)} icon={CreditCard} color="rose" />
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
            { label: 'Add Teacher', href: '/school/teachers', color: 'bg-sky-50 text-sky-700 hover:bg-sky-100' },
            { label: 'Add Student', href: '/school/students', color: 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100' },
            { label: 'Mark Attendance', href: '/school/attendance', color: 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100' },
            { label: 'Manage Fees', href: '/school/fees', color: 'bg-orange-50 text-orange-700 hover:bg-orange-100' },
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