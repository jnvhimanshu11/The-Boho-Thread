'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Download, Share2, ArrowLeft, BookOpen, Eye, Tag, FileText, Brain, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import ReactMarkdown from 'react-markdown';
import { notesApi } from '@/lib/notes-api';
import { formatDate } from '@/lib/utils';

export default function NoteDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const { data: res, isLoading, isError } = useQuery({
    queryKey: ['note', id],
    queryFn: () => notesApi.getById(id),
  });

  useEffect(() => {
    if (id) notesApi.incrementView(id).catch(() => {});
  }, [id]);

  const note = res?.data;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-8">
        <div className="max-w-4xl mx-auto animate-pulse space-y-4">
          <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-2/3" />
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/3" />
          <div className="card p-6 space-y-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-4 bg-slate-200 dark:bg-slate-700 rounded" style={{ width: `${70 + Math.random() * 30}%` }} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (isError || !note) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Note Not Found</h2>
          <p className="text-slate-500 mb-4">This note may have been removed or doesn't exist.</p>
          <Link href="/notes" className="btn-primary">Back to Notes</Link>
        </div>
      </div>
    );
  }

  const handleShare = () => {
    const url = window.location.href;
    const msg = `📚 Check out this note: *${note.title}*\n\n${url}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const handleDownload = () => {
    if (!note.pdfUrl) { toast.error('PDF not available'); return; }
    window.open(note.pdfUrl, '_blank');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Top Nav */}
      <div className="sticky top-0 z-30 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <button onClick={() => router.back()} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <div className="flex gap-2">
            <button onClick={handleShare} className="btn-secondary text-sm flex items-center gap-2 py-2">
              <Share2 className="w-4 h-4 text-green-600" /> WhatsApp
            </button>
            {note.pdfUrl && (
              <button onClick={handleDownload} className="btn-primary text-sm flex items-center gap-2 py-2">
                <Download className="w-4 h-4" /> Download PDF
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-slate-400 mb-6">
          <Link href="/notes" className="hover:text-primary-600 transition-colors">Notes</Link>
          <ChevronRight className="w-3 h-3" />
          <span>Class {note.class}</span>
          <ChevronRight className="w-3 h-3" />
          <span>{note.subject}</span>
          <ChevronRight className="w-3 h-3" />
          <span className="text-slate-600 dark:text-slate-300">{note.chapter}</span>
        </div>

        {/* Note Header */}
        <div className="mb-6">
          {note.isRevisionNote && (
            <span className="badge bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 mb-3">
              📝 Revision Notes
            </span>
          )}
          <h1 className="font-display text-3xl font-bold text-slate-900 dark:text-white mb-3 leading-tight">
            {note.title}
          </h1>
          <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1.5"><BookOpen className="w-4 h-4" /> Class {note.class} · {note.subject}</span>
            <span className="flex items-center gap-1.5"><Eye className="w-4 h-4" /> {note.viewCount.toLocaleString()} views</span>
            <span className="flex items-center gap-1.5"><Download className="w-4 h-4" /> {note.downloadCount.toLocaleString()} downloads</span>
            <span>Updated {formatDate(note.updatedAt)}</span>
          </div>
          {note.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {note.tags.map((tag) => (
                <span key={tag} className="flex items-center gap-1 badge bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                  <Tag className="w-3 h-3" /> {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main content */}
          <div className="lg:col-span-2">
            <div className="card p-6 md:p-8">
              <div className="prose dark:prose-invert max-w-none prose-headings:font-display prose-h2:text-xl prose-h3:text-lg prose-p:text-slate-700 dark:prose-p:text-slate-300 prose-li:text-slate-700 dark:prose-li:text-slate-300">
                <ReactMarkdown>{note.content}</ReactMarkdown>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Download Card */}
            {note.pdfUrl && (
              <div className="card p-5 bg-gradient-to-br from-primary-50 to-blue-50 dark:from-primary-900/20 dark:to-blue-900/20 border-primary-100 dark:border-primary-800">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center">
                    <FileText className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white text-sm">PDF Available</p>
                    <p className="text-xs text-slate-500">Download for offline use</p>
                  </div>
                </div>
                <button onClick={handleDownload} className="btn-primary w-full text-sm flex items-center justify-center gap-2">
                  <Download className="w-4 h-4" /> Download PDF
                </button>
              </div>
            )}

            {/* AI Doubt Solver CTA */}
            <div className="card p-5">
              <div className="flex items-center gap-2 mb-3">
                <Brain className="w-5 h-5 text-purple-600" />
                <p className="font-semibold text-slate-900 dark:text-white text-sm">Have a Doubt?</p>
              </div>
              <p className="text-xs text-slate-400 mb-3">Ask our AI about anything in this chapter</p>
              <Link
                href={`/tools?tool=doubt-solver&context=${encodeURIComponent(`Chapter: ${note.chapter}, Subject: ${note.subject}, Class: ${note.class}`)}`}
                className="btn-secondary w-full text-sm flex items-center justify-center gap-2"
              >
                <Brain className="w-4 h-4" /> Ask AI Doubt Solver
              </Link>
            </div>

            {/* Share */}
            <div className="card p-5">
              <p className="font-semibold text-slate-900 dark:text-white text-sm mb-3">Share This Note</p>
              <button onClick={handleShare} className="w-full flex items-center gap-2 justify-center py-2.5 rounded-xl bg-green-500 hover:bg-green-600 text-white font-medium text-sm transition-colors">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M11.998 0C5.373 0 0 5.373 0 12c0 2.118.553 4.103 1.518 5.826L0 24l6.334-1.518A11.954 11.954 0 0011.998 24C18.623 24 24 18.627 24 12S18.623 0 11.998 0z" fillRule="nonzero"/></svg>
                Share on WhatsApp
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
