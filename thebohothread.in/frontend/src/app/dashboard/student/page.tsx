'use client';

import { BookOpen, Brain, FileText, TrendingUp, Clock, Star, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import Sidebar from '@/components/layout/Sidebar';
import { useAuthStore } from '@/store/auth-store';

const QUICK_ACTIONS = [
  { href: '/tools?tool=doubt-solver', label: 'Ask AI a Doubt', icon: Brain, color: 'bg-blue-500', desc: 'Instant answers' },
  { href: '/notes', label: 'Browse Notes', icon: BookOpen, color: 'bg-green-500', desc: 'Class notes & PDFs' },
  { href: '/notes?type=questions', label: 'Practice MCQs', icon: FileText, color: 'bg-purple-500', desc: 'Test yourself' },
  { href: '/tools?tool=summarizer', label: 'Summarize Notes', icon: TrendingUp, color: 'bg-orange-500', desc: 'Quick revision' },
];

const RECENT_NOTES = [
  { title: 'Light – Reflection and Refraction', subject: 'Science', class: '10', progress: 75 },
  { title: 'Quadratic Equations', subject: 'Maths', class: '10', progress: 40 },
  { title: 'The Rise of Nationalism', subject: 'Social Science', class: '10', progress: 90 },
];

export default function StudentDashboardPage() {
  const user = useAuthStore((s) => s.user);

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-950">
      <Sidebar role="student" />

      <main className="flex-1 overflow-y-auto">
        <div className="p-6 lg:p-8 max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="page-title">
              Good {getGreeting()}, {user?.name?.split(' ')[0] || 'Student'}! 👋
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">
              {user?.class ? `Class ${user.class}` : 'Let\'s continue studying'}
            </p>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Notes Viewed', value: '24', icon: BookOpen, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20' },
              { label: 'PDFs Downloaded', value: '8', icon: FileText, color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-900/20' },
              { label: 'AI Queries', value: '15', icon: Brain, color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-900/20' },
              { label: 'Study Streak', value: '7 days', icon: Star, color: 'text-yellow-500', bg: 'bg-yellow-50 dark:bg-yellow-900/20' },
            ].map((stat) => (
              <div key={stat.label} className="stat-card">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${stat.bg}`}>
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                <div>
                  <div className="font-bold text-xl text-slate-900 dark:text-white">{stat.value}</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="mb-8">
            <h2 className="font-display font-bold text-lg text-slate-900 dark:text-white mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {QUICK_ACTIONS.map((action) => (
                <Link
                  key={action.href}
                  href={action.href}
                  className="card p-4 hover:shadow-md transition-all hover:-translate-y-0.5 flex flex-col items-center text-center gap-3"
                >
                  <div className={`w-12 h-12 ${action.color} rounded-2xl flex items-center justify-center`}>
                    <action.icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-slate-900 dark:text-white">{action.label}</p>
                    <p className="text-xs text-slate-400">{action.desc}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Continue Studying */}
            <div className="card p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Clock className="w-5 h-5 text-primary-500" /> Continue Studying
                </h2>
                <Link href="/notes" className="text-xs text-primary-600 flex items-center gap-1">
                  View all <ChevronRight className="w-3 h-3" />
                </Link>
              </div>
              <div className="space-y-4">
                {RECENT_NOTES.map((note) => (
                  <div key={note.title} className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-primary-50 dark:bg-primary-900/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <BookOpen className="w-4 h-4 text-primary-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{note.title}</p>
                      <p className="text-xs text-slate-400">{note.subject} · Class {note.class}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className="text-xs font-medium text-slate-600 dark:text-slate-400">{note.progress}%</span>
                      <div className="w-16 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div className="h-full bg-primary-500 rounded-full" style={{ width: `${note.progress}%` }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Tool Suggestions */}
            <div className="card p-5">
              <h2 className="font-display font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
                <Brain className="w-5 h-5 text-purple-500" /> AI Tools for You
              </h2>
              <div className="space-y-3">
                {[
                  { title: 'Have a doubt? Ask AI instantly', href: '/tools?tool=doubt-solver', color: 'bg-blue-500' },
                  { title: 'Summarize your chapter notes', href: '/tools?tool=summarizer', color: 'bg-purple-500' },
                  { title: 'Need help with homework?', href: '/tools?tool=homework', color: 'bg-orange-500' },
                  { title: 'Write an essay with AI', href: '/tools?tool=essay', color: 'bg-green-500' },
                ].map((tool) => (
                  <Link
                    key={tool.href}
                    href={tool.href}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors group"
                  >
                    <div className={`w-2 h-2 rounded-full ${tool.color}`} />
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300 group-hover:text-primary-600 transition-colors flex-1">
                      {tool.title}
                    </span>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-primary-600 transition-colors" />
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Morning';
  if (h < 17) return 'Afternoon';
  return 'Evening';
}
