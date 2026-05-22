'use client';

import Link from 'next/link';
import { MessageCircle, FileText, BookOpen, PenTool, ChevronRight } from 'lucide-react';

const AI_TOOLS = [
  {
    id: 'doubt-solver',
    title: 'AI Doubt Solver',
    description: 'Ask any question — text or image. Get instant, detailed answers from AI.',
    icon: MessageCircle,
    gradient: 'from-blue-500 to-indigo-600',
    badge: 'Most Popular',
  },
  {
    id: 'summarizer',
    title: 'Notes Summarizer',
    description: 'Paste long notes and get a crisp, revision-ready summary in seconds.',
    icon: FileText,
    gradient: 'from-purple-500 to-pink-600',
    badge: null,
  },
  {
    id: 'homework',
    title: 'Homework Helper',
    description: 'Get step-by-step solutions with explanations for any homework question.',
    icon: BookOpen,
    gradient: 'from-orange-500 to-red-500',
    badge: null,
  },
  {
    id: 'essay',
    title: 'Essay Writer',
    description: 'Write well-structured essays and assignments on any topic instantly.',
    icon: PenTool,
    gradient: 'from-green-500 to-teal-500',
    badge: 'New',
  },
];

export default function AIToolsPreview() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {AI_TOOLS.map((tool) => (
        <Link
          key={tool.id}
          href={`/tools?tool=${tool.id}`}
          className="group relative card overflow-hidden hover:shadow-lg transition-all hover:-translate-y-1"
        >
          {tool.badge && (
            <div className="absolute top-3 right-3">
              <span className="badge bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
                {tool.badge}
              </span>
            </div>
          )}

          <div className={`bg-gradient-to-br ${tool.gradient} p-5 flex items-center justify-center`}>
            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
              <tool.icon className="w-7 h-7 text-white" />
            </div>
          </div>

          <div className="p-5">
            <h3 className="font-display font-bold text-slate-900 dark:text-white mb-2 group-hover:text-primary-600 transition-colors">
              {tool.title}
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
              {tool.description}
            </p>
            <div className="flex items-center gap-1 text-primary-600 text-sm font-medium">
              Try Now <ChevronRight className="w-4 h-4" />
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
