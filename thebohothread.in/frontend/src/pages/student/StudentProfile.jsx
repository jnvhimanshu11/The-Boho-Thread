import { useEffect, useState } from 'react'
import { studentAPI } from '../../services/api.js'
import { GraduationCap } from 'lucide-react'

export default function StudentProfile() {
  const [profile, setProfile] = useState(null)
  const [logo, setLogo] = useState(null)

  useEffect(() => {
    studentAPI.getProfile().then(r => setProfile(r.data))
    studentAPI.getLogo().then(r => { if (r.data.logoBase64) setLogo(r.data.logoBase64) })
  }, [])

  if (!profile) return <div className="card animate-pulse h-64" />

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-slate-800">My Profile</h1>
        <p className="text-slate-500 text-sm">Your student account details</p>
      </div>

      <div className="max-w-lg">
        <div className="card">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-2xl bg-emerald-100 flex items-center justify-center">
              <GraduationCap className="w-8 h-8 text-emerald-600" />
            </div>
            <div>
              <h2 className="font-display text-xl font-bold text-slate-800">{profile.fullName}</h2>
              <span className="badge bg-emerald-100 text-emerald-700">Student</span>
            </div>
            {logo && <img src={logo} alt="School Logo" className="w-12 h-12 object-contain rounded-xl ml-auto" />}
          </div>

          <div className="space-y-2 text-sm">
            {[
              ['Student ID', profile.uniqueId],
              ['Email', profile.email || '—'],
              ['Phone', profile.phone || '—'],
              ['Grade', profile.grade || '—'],
              ['Section', profile.section || '—'],
              ['Parent Name', profile.parentName || '—'],
              ['Parent Phone', profile.parentPhone || '—'],
              ['School Code', profile.schoolCode],
              ['Status', profile.active ? 'Active' : 'Inactive'],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between py-2 border-b border-slate-50">
                <span className="text-slate-500">{k}</span>
                <span className="text-slate-800 font-medium">{v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
