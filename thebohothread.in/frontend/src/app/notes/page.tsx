'use client';

import { useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Search, Filter, Download, Eye, FileText, BookOpen, ChevronLeft, ChevronRight, Share2 } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { notesApi } from '@/lib/notes-api';
import { Note } from '@/types';
import { CLASSES, SUBJECTS, cn } from '@/lib/utils';

const SUBJECT_COLORS: Record<string, string> = {
  Mathematics: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  Science: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  'Social Science': 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  Chemistry: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  Physics: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  Biology: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400',
  English: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  Hindi: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400',
};

export default function NotesPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [selectedClass, setSelectedClass] = useState(searchParams.get('class') || '');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [isRevision, setIsRevision] = useState(false);
  const [page, setPage] = useState(1);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const { data, isLoading } = useQuery({
    queryKey: ['notes', search, selectedClass, selectedSubject, isRevision, page],
    queryFn: () =>
      notesApi.getAll({
        search,
        class: selectedClass,
        subject: selectedSubject,
        isRevisionNote: isRevision || undefined,
        page,
        limit: 12,
      }),
    keepPreviousData: true,
  } as any);

  const notes: Note[] = data?.data?.data ?? [];
  const total = data?.data?.total ?? 0;
  const totalPages = data?.data?.totalPages ?? 1;

  const handleShare = (note: Note) => {
    const url = `${window.location.origin}/notes/${note._id}`;
    const msg = `📚 Check out this note: *${note.title}*\n${url}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const handleDownload = (note: Note) => {
    if (!note.pdfUrl) { toast.error('PDF not available'); return; }
    window.open(note.pdfUrl, '_blank');
    toast.success('Opening PDF...');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Page Header */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          <h1 className="font-display text-3xl font-bold text-slate-900 dark:text-white mb-1">
            📚 Study Notes
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            {total > 0 ? `${total} notes available` : 'Browse class-wise notes, PDFs and revision material'}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Filters */}
        <div className="card p-4 mb-6 space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search notes by topic, chapter, subject..."
              className="input-field pl-9"
            />
          </div>

          {/* Class filter chips */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => { setSelectedClass(''); setPage(1); }}
              className={cn('px-3 py-1.5 rounded-full text-sm font-medium transition-all', !selectedClass ? 'bg-primary-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200')}
            >
              All Classes
            </button>
            {CLASSES.map((cls) => (
              <button
                key={cls}
                onClick={() => { setSelectedClass(cls); setPage(1); }}
                className={cn('px-3 py-1.5 rounded-full text-sm font-medium transition-all', selectedClass === cls ? 'bg-primary-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200')}
              >
                {cls === 'College' ? 'College' : `Class ${cls}`}
              </button>
            ))}
          </div>

          {/* Subject + options */}
          <div className="flex flex-wrap gap-3">
            <select
              value={selectedSubject}
              onChange={(e) => { setSelectedSubject(e.target.value); setPage(1); }}
              className="input-field w-auto"
            >
              <option value="">All Subjects</option>
              {SUBJECTS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>

            <label className="flex items-center gap-2 cursor-pointer px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
              <input
                type="checkbox"
                checked={isRevision}
                onChange={(e) => { setIsRevision(e.target.checked); setPage(1); }}
                className="rounded text-primary-600"
              />
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">📝 Revision Notes Only</span>
            </label>

            <div className="ml-auto flex gap-2">
              {(['grid', 'list'] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setViewMode(m)}
                  className={cn('p-2 rounded-lg transition-colors', viewMode === m ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600' : 'bg-slate-100 dark:bg-slate-800 text-slate-500')}
                >
                  {m === 'grid' ? (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 16 16"><rect x="1" y="1" width="6" height="6" rx="1"/><rect x="9" y="1" width="6" height="6" rx="1"/><rect x="1" y="9" width="6" height="6" rx="1"/><rect x="9" y="9" width="6" height="6" rx="1"/></svg>
                  ) : (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 16 16"><rect x="1" y="2" width="14" height="2" rx="1"/><rect x="1" y="7" width="14" height="2" rx="1"/><rect x="1" y="12" width="14" height="2" rx="1"/></svg>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Notes Grid / List */}
        {isLoading ? (
          <div className={cn(viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5' : 'space-y-3')}>
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className="card p-5 animate-pulse">
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4 mb-3" />
                <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/2 mb-2" />
                <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-2/3" />
              </div>
            ))}
          </div>
        ) : notes.length === 0 ? (
          <div className="card p-16 text-center">
            <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 font-medium">No notes found</p>
            <p className="text-slate-400 text-sm mt-1">Try changing your filters</p>
          </div>
        ) : (
          <div className={cn(viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5' : 'space-y-3')}>
            {notes.map((note) => (
              viewMode === 'grid' ? (
                <NoteCard key={note._id} note={note} onShare={handleShare} onDownload={handleDownload} />
              ) : (
                <NoteRow key={note._id} note={note} onShare={handleShare} onDownload={handleDownload} />
              )
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 mt-8">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="btn-secondary flex items-center gap-1 disabled:opacity-50"
            >
              <ChevronLeft className="w-4 h-4" /> Prev
            </button>
            <span className="text-sm text-slate-500">Page {page} of {totalPages}</span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="btn-secondary flex items-center gap-1 disabled:opacity-50"
            >
              Next <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function NoteCard({ note, onShare, onDownload }: { note: Note; onShare: (n: Note) => void; onDownload: (n: Note) => void }) {
  return (
    <div className="card p-5 hover:shadow-md transition-all hover:-translate-y-0.5 group flex flex-col">
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 bg-primary-50 dark:bg-primary-900/20 rounded-xl flex items-center justify-center">
          <FileText className="w-5 h-5 text-primary-600" />
        </div>
        <div className="flex gap-1.5">
          {note.isRevisionNote && (
            <span className="badge bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">📝 Revision</span>
          )}
          <span className={`badge ${SUBJECT_COLORS[note.subject] || 'bg-slate-100 text-slate-600'}`}>{note.subject}</span>
        </div>
      </div>

      <Link href={`/notes/${note._id}`} className="flex-1">
        <h3 className="font-semibold text-slate-900 dark:text-white mb-1 group-hover:text-primary-600 transition-colors line-clamp-2 leading-snug">
          {note.title}
        </h3>
        <p className="text-xs text-slate-400 mb-3">Class {note.class} · {note.chapter}</p>
      </Link>

      <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3 text-xs text-slate-400">
          <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" /> {note.viewCount.toLocaleString()}</span>
          <span className="flex items-center gap-1"><Download className="w-3.5 h-3.5" /> {note.downloadCount.toLocaleString()}</span>
        </div>
        <div className="flex gap-2">
          <button onClick={() => onShare(note)} className="p-1.5 rounded-lg text-slate-400 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors" title="Share on WhatsApp">
            <Share2 className="w-4 h-4" />
          </button>
          {note.pdfUrl && (
            <button onClick={() => onDownload(note)} className="p-1.5 rounded-lg text-slate-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors" title="Download PDF">
              <Download className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function NoteRow({ note, onShare, onDownload }: { note: Note; onShare: (n: Note) => void; onDownload: (n: Note) => void }) {
  return (
    <div className="card p-4 flex items-center gap-4 hover:shadow-sm transition-all group">
      <div className="w-10 h-10 bg-primary-50 dark:bg-primary-900/20 rounded-xl flex items-center justify-center flex-shrink-0">
        <FileText className="w-5 h-5 text-primary-600" />
      </div>
      <div className="flex-1 min-w-0">
        <Link href={`/notes/${note._id}`}>
          <h3 className="font-semibold text-slate-900 dark:text-white group-hover:text-primary-600 transition-colors truncate">{note.title}</h3>
        </Link>
        <p className="text-xs text-slate-400">Class {note.class} · {note.subject} · {note.chapter}</p>
      </div>
      <div className="hidden sm:flex items-center gap-2">
        <span className={`badge ${SUBJECT_COLORS[note.subject] || 'bg-slate-100 text-slate-600'}`}>{note.subject}</span>
        {note.isRevisionNote && <span className="badge bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">📝</span>}
      </div>
      <div className="flex gap-2 flex-shrink-0">
        <button onClick={() => onShare(note)} className="p-1.5 rounded-lg text-slate-400 hover:text-green-600 hover:bg-green-50 transition-colors">
          <Share2 className="w-4 h-4" />
        </button>
        {note.pdfUrl && (
          <button onClick={() => onDownload(note)} className="p-1.5 rounded-lg text-slate-400 hover:text-primary-600 hover:bg-primary-50 transition-colors">
            <Download className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
