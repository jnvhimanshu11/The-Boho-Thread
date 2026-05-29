import { useEffect, useState } from 'react'
import { teacherAPI } from '../../services/api.js'
import { useAuth } from '../../context/AuthContext.jsx'
import StatCard from '../../components/common/StatCard.jsx'
import { GraduationCap, CalendarCheck, BookOpen } from 'lucide-react'

export default function TeacherDashboard() {
  const { user } = useAuth()
  const [students, setStudents] = useState([])
  const [profile,  setProfile]  = useState(null)

  // Read directly from AuthContext — no API call needed, works on hard refresh
  const banner = user?.bannerBase64 || ''
  const logo   = user?.logoBase64   || ''

  useEffect(() => {
    teacherAPI.getStudents().then(r => setStudents(r.data)).catch(() => {})
    teacherAPI.getProfile().then(r => setProfile(r.data)).catch(() => {})
  }, [])

  return (
    <div>
      {/* Header with logo */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-800">
            Welcome, {user?.fullName?.split(' ')[0]} 👋
          </h1>
          <p className="text-slate-500 text-sm mt-1">Teacher Portal · {user?.schoolName}</p>
        </div>
        {logo && (
          <img src={logo} alt="School Logo" className="w-14 h-14 object-contain rounded-2xl border border-slate-100 shadow-sm" />
        )}
      </div>

      {/* School Banner */}
      {banner && (
        <div className="mb-6 w-full">
          <img src={banner} alt="School Banner" className="w-full h-auto rounded-2xl block" />
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
        <StatCard title="My Students"    value={students.length}            icon={GraduationCap} color="indigo"  />
        <StatCard title="Subject"        value={profile?.subject       || '—'} icon={BookOpen}      color="sky"     />
        <StatCard title="Class Assigned" value={profile?.classAssigned || '—'} icon={CalendarCheck} color="emerald" />
      </div>

      <div className="card">
        <h2 className="font-display text-base font-bold text-slate-800 mb-4">My Profile</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          {[
            ['Teacher ID', profile?.uniqueId],
            ['Full Name',  profile?.fullName],
            ['Email',      profile?.email        || '—'],
            ['Phone',      profile?.phone        || '—'],
            ['Subject',    profile?.subject      || '—'],
            ['Class',      profile?.classAssigned || '—'],
          ].map(([k, v]) => (
            <div key={k} className="flex justify-between py-2 border-b border-slate-50">
              <span className="text-slate-500">{k}</span>
              <span className="text-slate-800 font-medium">{v}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}