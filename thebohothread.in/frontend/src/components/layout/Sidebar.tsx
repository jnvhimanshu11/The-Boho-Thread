'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { BookOpen, LayoutDashboard, Users, IndianRupee, CalendarDays, BarChart3, Settings, LogOut, Brain, FileText, HelpCircle, Shield, X, Menu } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/auth-store';
import toast from 'react-hot-toast';

interface NavItem {
  href: string;
  label: string;
  icon: any;
}

const STUDENT_NAV: NavItem[] = [
  { href: '/dashboard/student', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/notes', label: 'My Notes', icon: BookOpen },
  { href: '/tools', label: 'AI Tools', icon: Brain },
  { href: '/notes?type=questions', label: 'Practice Questions', icon: HelpCircle },
  { href: '/notes?type=pdf', label: 'PDF Downloads', icon: FileText },
];

const ADMIN_NAV: NavItem[] = [
  { href: '/dashboard/admin', label: 'Overview', icon: LayoutDashboard },
  { href: '/dashboard/admin/notes', label: 'Manage Notes', icon: BookOpen },
  { href: '/dashboard/admin/users', label: 'Users', icon: Users },
  { href: '/dashboard/admin/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/dashboard/admin/settings', label: 'Settings', icon: Settings },
];

const CRM_NAV: NavItem[] = [
  { href: '/dashboard/crm', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/crm/students', label: 'Students', icon: Users },
  { href: '/dashboard/crm/fees', label: 'Fee Management', icon: IndianRupee },
  { href: '/dashboard/crm/attendance', label: 'Attendance', icon: CalendarDays },
  { href: '/dashboard/crm/reports', label: 'Reports', icon: BarChart3 },
  { href: '/dashboard/crm/settings', label: 'Settings', icon: Settings },
];

interface SidebarProps {
  role: 'student' | 'admin' | 'school_admin';
}

export default function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, clearAuth } = useAuthStore();

  const navItems = role === 'student' ? STUDENT_NAV : role === 'admin' ? ADMIN_NAV : CRM_NAV;
  const roleLabel = role === 'student' ? 'Student' : role === 'admin' ? 'Admin' : 'School CRM';

  const handleLogout = () => {
    clearAuth();
    toast.success('Logged out successfully');
    router.push('/');
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-4 py-5 border-b border-slate-200 dark:border-slate-700">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="font-display font-bold text-slate-900 dark:text-white">StudyHub</div>
            <div className="text-xs text-slate-400">{roleLabel}</div>
          </div>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto scrollbar-thin">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn('sidebar-link', pathname === item.href && 'active')}
            onClick={() => setMobileOpen(false)}
          >
            <item.icon className="w-4 h-4" />
            {item.label}
          </Link>
        ))}
      </nav>

      {/* User & Logout */}
      <div className="px-3 py-4 border-t border-slate-200 dark:border-slate-700">
        {user && (
          <div className="flex items-center gap-3 px-3 py-2 mb-2">
            <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center text-primary-700 dark:text-primary-400 font-bold text-sm">
              {user.name[0].toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{user.name}</p>
              <p className="text-xs text-slate-400 truncate">{user.email}</p>
            </div>
          </div>
        )}
        <button onClick={handleLogout} className="sidebar-link w-full text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 hover:text-red-600">
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile toggle */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 w-10 h-10 bg-white dark:bg-slate-900 rounded-xl shadow-md flex items-center justify-center border border-slate-200 dark:border-slate-700"
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black/50" onClick={() => setMobileOpen(false)} />
      )}

      {/* Mobile sidebar */}
      <aside className={cn(
        'lg:hidden fixed left-0 top-0 z-40 h-full w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-700 transition-transform',
        mobileOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        <SidebarContent />
      </aside>

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-64 h-screen sticky top-0 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-700">
        <SidebarContent />
      </aside>
    </>
  );
}
