import { useEffect, useState } from 'react'
import { teacherAPI } from '../../services/api.js'
import { User, GraduationCap } from 'lucide-react'

export default function TeacherProfile() {
  const [profile, setProfile] = useState(null)
  const [logo, setLogo] = useState(null)

  useEffect(() => {
    teacherAPI.getProfile().then(r => setProfile(r.data))
    teacherAPI.getLogo().then(r => { if (r.data.logoBase64) setLogo(r.data.logoBase64) })
  }, [])

  if (!profile) return <div className="card animate-pulse h-64" />

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-slate-800">My Profile</h1>
        <p className="text-slate-500 text-sm">Your teacher account details</p>
      </div>

      <div className="max-w-lg">
        <div className="card mb-5">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-2xl bg-sky-100 flex items-center justify-center">
              <User className="w-8 h-8 text-sky-600" />
            </div>
            <div>
              <h2 className="font-display text-xl font-bold text-slate-800">{profile.fullName}</h2>
              <span className="badge bg-sky-100 text-sky-700">{profile.role?.replace('_', ' ')}</span>
            </div>
            {logo && <img src={logo} alt="School Logo" className="w-12 h-12 object-contain rounded-xl ml-auto" />}
          </div>

          <div className="space-y-2 text-sm">
            {[
              ['Teacher ID', profile.uniqueId],
              ['Email', profile.email || '—'],
              ['Phone', profile.phone || '—'],
              ['Subject', profile.subject || '—'],
              ['Class Assigned', profile.classAssigned || '—'],
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

        <div className="card bg-sky-50 border border-sky-100">
          <div className="flex items-start gap-3">
            <GraduationCap className="w-5 h-5 text-sky-600 mt-0.5" />
            <div>
              <p className="font-semibold text-sky-800 text-sm">Teacher Permissions</p>
              <ul className="text-sky-700 text-xs mt-1 space-y-0.5">
                <li>✓ Create student accounts</li>
                <li>✓ Mark attendance</li>
                <li>✓ View student list</li>
                <li>✗ Manage fees (School admin only)</li>
                <li>✗ View financial reports</li>
                <li>✗ Create teacher accounts</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
