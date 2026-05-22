import Link from 'next/link';
import { BookOpen, Brain, School, Search, ChevronRight, Star, Zap, Shield, Users, FileText, TrendingUp } from 'lucide-react';
import SearchBar from '@/components/shared/SearchBar';
import ClassSelector from '@/components/notes/ClassSelector';
import FeatureCard from '@/components/shared/FeatureCard';
import AIToolsPreview from '@/components/ai/AIToolsPreview';
import PopularNotes from '@/components/notes/PopularNotes';
import StatsBar from '@/components/shared/StatsBar';

export default function HomePage() {
  return (
    <main className="min-h-screen">
      {/* ── Navbar ── */}
      <nav className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <span className="font-display font-bold text-xl text-slate-900 dark:text-white">
                StudyHub
              </span>
            </Link>

            <div className="hidden md:flex items-center gap-6">
              <Link href="/notes" className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-primary-600 transition-colors">Notes</Link>
              <Link href="/tools" className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-primary-600 transition-colors">AI Tools</Link>
              <Link href="/dashboard/crm" className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-primary-600 transition-colors">School CRM</Link>
            </div>

            <div className="flex items-center gap-3">
              <Link href="/auth/login" className="btn-secondary text-sm">Login</Link>
              <Link href="/auth/register" className="btn-primary text-sm">Get Started</Link>
            </div>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="hero-gradient text-white py-20 px-4 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-72 h-72 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-blue-300 rounded-full blur-3xl" />
        </div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/20 px-4 py-1.5 rounded-full text-sm font-medium mb-6 backdrop-blur-sm">
            <Zap className="w-4 h-4 text-yellow-300" />
            AI-Powered Study Platform for Indian Students
          </div>

          <h1 className="text-4xl md:text-6xl font-display font-bold mb-6 leading-tight">
            Study Smarter,<br />
            <span className="text-yellow-300">Not Harder</span>
          </h1>

          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Class notes, AI doubt solver, PYQs, and a complete School CRM — everything a student and school needs.
          </p>

          <SearchBar className="max-w-2xl mx-auto mb-8" />

          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/notes" className="bg-white text-primary-700 hover:bg-blue-50 font-semibold px-6 py-3 rounded-xl flex items-center gap-2 transition-all hover:scale-105">
              <BookOpen className="w-5 h-5" /> Browse Notes
            </Link>
            <Link href="/tools" className="glass-card text-white hover:bg-white/20 font-semibold px-6 py-3 rounded-xl flex items-center gap-2 transition-all hover:scale-105">
              <Brain className="w-5 h-5" /> Try AI Tools
            </Link>
          </div>
        </div>
      </section>

      {/* ── Stats Bar ── */}
      <StatsBar />

      {/* ── Class Selector ── */}
      <section className="py-16 px-4 bg-white dark:bg-slate-900">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-display font-bold text-slate-900 dark:text-white mb-3">
              Select Your Class
            </h2>
            <p className="text-slate-500 dark:text-slate-400">Find notes, questions, and study material for your class</p>
          </div>
          <ClassSelector />
        </div>
      </section>

      {/* ── Popular Notes ── */}
      <section className="py-16 px-4 bg-slate-50 dark:bg-slate-950">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-3xl font-display font-bold text-slate-900 dark:text-white mb-1">
                📚 Popular Notes
              </h2>
              <p className="text-slate-500 dark:text-slate-400">Most downloaded this week</p>
            </div>
            <Link href="/notes" className="flex items-center gap-1 text-primary-600 hover:text-primary-700 font-medium text-sm">
              View all <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <PopularNotes />
        </div>
      </section>

      {/* ── AI Tools ── */}
      <section className="py-16 px-4 bg-white dark:bg-slate-900">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400 px-4 py-1.5 rounded-full text-sm font-medium mb-4">
              <Brain className="w-4 h-4" /> Powered by AI
            </div>
            <h2 className="text-3xl font-display font-bold text-slate-900 dark:text-white mb-3">
              🤖 AI Study Tools
            </h2>
            <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
              Get instant answers, summarize notes, write essays, and solve homework — all with AI
            </p>
          </div>
          <AIToolsPreview />
        </div>
      </section>

      {/* ── School CRM Banner ── */}
      <section className="py-16 px-4 bg-gradient-to-br from-slate-900 to-primary-900">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-10">
          <div className="flex-1 text-white">
            <div className="flex items-center gap-2 text-primary-300 mb-4">
              <School className="w-5 h-5" /> School Management
            </div>
            <h2 className="text-3xl font-display font-bold mb-4">
              Complete School CRM for Modern Schools
            </h2>
            <p className="text-slate-300 mb-6">
              Manage students, track fees, mark attendance, and generate reports — all in one powerful dashboard.
            </p>
            <ul className="space-y-2 mb-8">
              {['Student management & profiles', 'Online fee collection via Razorpay', 'Attendance tracking', 'Reports & analytics', 'Pending fee alerts via WhatsApp'].map((item) => (
                <li key={item} className="flex items-center gap-2 text-slate-300 text-sm">
                  <Shield className="w-4 h-4 text-green-400 flex-shrink-0" /> {item}
                </li>
              ))}
            </ul>
            <Link href="/auth/register?role=school_admin" className="bg-white text-slate-900 font-semibold px-6 py-3 rounded-xl inline-flex items-center gap-2 hover:bg-slate-100 transition-all hover:scale-105">
              <Users className="w-5 h-5" /> Start Free Trial
            </Link>
          </div>

          <div className="flex-1 grid grid-cols-2 gap-4">
            {[
              { label: 'Total Students', value: '1,240', icon: Users, color: 'text-blue-400' },
              { label: 'Fees Collected', value: '₹4.2L', icon: TrendingUp, color: 'text-green-400' },
              { label: 'Pending Fees', value: '₹68K', icon: FileText, color: 'text-yellow-400' },
              { label: 'Attendance Today', value: '94%', icon: Star, color: 'text-purple-400' },
            ].map((stat) => (
              <div key={stat.label} className="glass-card rounded-xl p-4">
                <stat.icon className={`w-6 h-6 ${stat.color} mb-2`} />
                <div className="text-2xl font-bold text-white">{stat.value}</div>
                <div className="text-xs text-slate-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-slate-900 text-slate-400 py-12 px-4">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <span className="font-display font-bold text-white">StudyHub</span>
            </div>
            <p className="text-sm">Your complete study partner for Class 6–12 and beyond.</p>
          </div>

          {[
            { title: 'Study', links: ['Class Notes', 'PYQs', 'MCQs', 'PDF Downloads'] },
            { title: 'AI Tools', links: ['Doubt Solver', 'Summarizer', 'Homework Help', 'Essay Writer'] },
            { title: 'School', links: ['CRM Dashboard', 'Fee Management', 'Attendance', 'Reports'] },
          ].map((col) => (
            <div key={col.title}>
              <h3 className="font-semibold text-white mb-3">{col.title}</h3>
              <ul className="space-y-2">
                {col.links.map((link) => (
                  <li key={link}>
                    <a href="#" className="text-sm hover:text-white transition-colors">{link}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="max-w-7xl mx-auto mt-10 pt-6 border-t border-slate-800 text-sm text-center">
          © 2024 StudyHub. Made with ❤️ for Indian students.
        </div>
      </footer>
    </main>
  );
}
