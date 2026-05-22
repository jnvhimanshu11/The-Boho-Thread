import { BookOpen, Users, Download, Brain } from 'lucide-react';

const stats = [
  { label: 'Notes Available', value: '12,000+', icon: BookOpen, color: 'text-primary-600' },
  { label: 'Active Students', value: '50,000+', icon: Users, color: 'text-green-600' },
  { label: 'PDF Downloads', value: '2L+', icon: Download, color: 'text-orange-600' },
  { label: 'AI Queries Solved', value: '1L+', icon: Brain, color: 'text-purple-600' },
];

export default function StatsBar() {
  return (
    <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat) => (
            <div key={stat.label} className="flex items-center gap-3">
              <div className={`p-2 rounded-lg bg-slate-100 dark:bg-slate-800 ${stat.color}`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <div>
                <div className="font-display font-bold text-xl text-slate-900 dark:text-white">{stat.value}</div>
                <div className="text-xs text-slate-500 dark:text-slate-400">{stat.label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
