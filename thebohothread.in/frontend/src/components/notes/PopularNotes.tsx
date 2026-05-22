'use client';

import Link from 'next/link';
import { Download, Eye, FileText, BookOpen } from 'lucide-react';

// Static placeholder; real data fetched via React Query in notes page
const SAMPLE_NOTES = [
  { _id: '1', title: 'Light – Reflection and Refraction', subject: 'Science', class: '10', chapter: 'Light', downloadCount: 4200, viewCount: 12000, pdfUrl: '#' },
  { _id: '2', title: 'Quadratic Equations – Full Notes', subject: 'Mathematics', class: '10', chapter: 'Quadratic Equations', downloadCount: 3800, viewCount: 9500, pdfUrl: '#' },
  { _id: '3', title: 'The Rise of Nationalism in Europe', subject: 'Social Science', class: '10', chapter: 'Nationalism', downloadCount: 3100, viewCount: 7800, pdfUrl: '#' },
  { _id: '4', title: 'Carbon and Its Compounds', subject: 'Science', class: '10', chapter: 'Carbon', downloadCount: 2900, viewCount: 8200, pdfUrl: '#' },
  { _id: '5', title: 'Trigonometry Formulas Sheet', subject: 'Mathematics', class: '10', chapter: 'Trigonometry', downloadCount: 5600, viewCount: 15000, pdfUrl: '#' },
  { _id: '6', title: 'Electrochemistry – Short Notes', subject: 'Chemistry', class: '12', chapter: 'Electrochemistry', downloadCount: 2200, viewCount: 6000, pdfUrl: '#' },
];

const SUBJECT_COLORS: Record<string, string> = {
  Science: 'bg-green-100 text-green-700',
  Mathematics: 'bg-blue-100 text-blue-700',
  'Social Science': 'bg-orange-100 text-orange-700',
  Chemistry: 'bg-purple-100 text-purple-700',
  Physics: 'bg-red-100 text-red-700',
  Biology: 'bg-teal-100 text-teal-700',
  English: 'bg-yellow-100 text-yellow-700',
};

export default function PopularNotes() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {SAMPLE_NOTES.map((note) => (
        <Link
          key={note._id}
          href={`/notes/${note._id}`}
          className="card p-5 hover:shadow-md transition-all hover:-translate-y-0.5 group"
        >
          <div className="flex items-start justify-between mb-3">
            <div className="w-10 h-10 bg-primary-50 dark:bg-primary-900/20 rounded-xl flex items-center justify-center">
              <FileText className="w-5 h-5 text-primary-600" />
            </div>
            <span className={`badge ${SUBJECT_COLORS[note.subject] || 'bg-slate-100 text-slate-700'}`}>
              {note.subject}
            </span>
          </div>

          <h3 className="font-semibold text-slate-900 dark:text-white mb-1 group-hover:text-primary-600 transition-colors line-clamp-2">
            {note.title}
          </h3>

          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
            Class {note.class} · {note.chapter}
          </p>

          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1">
              <Eye className="w-3.5 h-3.5" />
              {(note.viewCount / 1000).toFixed(1)}K views
            </span>
            <span className="flex items-center gap-1">
              <Download className="w-3.5 h-3.5" />
              {(note.downloadCount / 1000).toFixed(1)}K downloads
            </span>
          </div>
        </Link>
      ))}
    </div>
  );
}
