import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { LogOut, Menu, X, GraduationCap } from 'lucide-react'

export default function Sidebar({ navItems, roleColor, roleLabel }) {
  const [open, setOpen] = useState(false)
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const loc = useLocation()

  const handleLogout = () => { logout(); navigate('/') }

  const SideContent = () => (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-5 border-b border-white/10">
        <div className="flex items-center gap-3 mb-4">
          {user?.logoBase64 ? (
            <img src={user.logoBase64} alt="School Logo" className="w-10 h-10 rounded-xl object-cover shadow" />
          ) : (
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
          )}
          <div className="min-w-0">
            <p className="font-display text-sm font-bold text-white truncate">SchoolWala</p>
            <p className="text-[10px] text-white/50 truncate">{user?.schoolName}</p>
          </div>
        </div>
        <div className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${roleColor}`}>
          {roleLabel}
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map(({ path, label, icon: Icon }) => (
          <div
            key={path}
            onClick={() => { navigate(path); setOpen(false) }}
            className={`sidebar-link ${loc.pathname === path ? 'active' : ''}`}
          >
            <Icon className="w-4 h-4 shrink-0" />
            <span>{label}</span>
          </div>
        ))}
      </nav>

      {/* User + Logout */}
      <div className="p-4 border-t border-white/10">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-sm">
            {user?.fullName?.[0] || '?'}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-white text-sm font-semibold truncate">{user?.fullName}</p>
            <p className="text-white/40 text-xs truncate">{user?.uniqueId}</p>
          </div>
        </div>
        <button onClick={handleLogout}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-red-300 hover:bg-red-900/30 text-sm font-medium transition-colors">
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop */}
      <aside className="hidden lg:flex w-60 bg-slate-900 shrink-0 flex-col h-screen sticky top-0">
        <SideContent />
      </aside>

      {/* Mobile toggle */}
      <button onClick={() => setOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 w-10 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center shadow-lg">
        <Menu className="w-5 h-5" />
      </button>

      {/* Mobile drawer */}
      {open && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/60" onClick={() => setOpen(false)} />
          <aside className="relative w-64 bg-slate-900 h-full shadow-2xl">
            <button onClick={() => setOpen(false)} className="absolute top-3 right-3 text-white/60 hover:text-white">
              <X className="w-5 h-5" />
            </button>
            <SideContent />
          </aside>
        </div>
      )}
    </>
  )
}
