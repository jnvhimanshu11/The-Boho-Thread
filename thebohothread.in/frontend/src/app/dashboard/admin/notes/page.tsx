'use client';

import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Upload, Trash2, Edit3, Search, FileText, X, Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import Sidebar from '@/components/layout/Sidebar';
import { notesApi } from '@/lib/notes-api';
import { Note } from '@/types';
import { CLASSES, SUBJECTS, formatDate } from '@/lib/utils';

const schema = z.object({
  title: z.string().min(3),
  subject: z.string().min(1),
  class: z.string().min(1),
  chapter: z.string().min(1),
  content: z.string().min(10),
  tags: z.string().optional(),
  isRevisionNote: z.boolean().optional(),
});
type FormData = z.infer<typeof schema>;

export default function AdminNotesPage() {
  const [showForm, setShowForm] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [search, setSearch] = useState('');
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-notes', search],
    queryFn: () => notesApi.getAll({ search, limit: 20 }),
  });

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const saveMutation = useMutation({
    mutationFn: (formData: FormData) => {
      const fd = new FormData();
      Object.entries(formData).forEach(([k, v]) => fd.append(k, String(v ?? '')));
      if (pdfFile) fd.append('pdf', pdfFile);
      return editingNote ? notesApi.update(editingNote._id, fd) : notesApi.create(fd);
    },
    onSuccess: () => {
      toast.success(editingNote ? 'Note updated!' : 'Note uploaded!');
      setShowForm(false); setEditingNote(null); setPdfFile(null); reset();
      queryClient.invalidateQueries({ queryKey: ['admin-notes'] });
    },
    onError: () => toast.error('Failed to save note'),
  });

  const deleteMutation = useMutation({
    mutationFn: notesApi.delete,
    onSuccess: () => { toast.success('Note deleted'); queryClient.invalidateQueries({ queryKey: ['admin-notes'] }); },
    onError: () => toast.error('Delete failed'),
  });

  const openEdit = (note: Note) => {
    setEditingNote(note);
    setValue('title', note.title); setValue('subject', note.subject);
    setValue('class', note.class); setValue('chapter', note.chapter);
    setValue('content', note.content); setValue('tags', note.tags.join(', '));
    setValue('isRevisionNote', note.isRevisionNote);
    setShowForm(true);
  };

  const notes: Note[] = data?.data?.data ?? [];

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-950">
      <Sidebar role="admin" />
      <main className="flex-1 overflow-y-auto">
        <div className="p-6 lg:p-8 max-w-6xl mx-auto">
          <div className="page-header">
            <div>
              <h1 className="page-title">Manage Notes</h1>
              <p className="text-slate-500 text-sm">{data?.data?.total ?? 0} total notes</p>
            </div>
            <button onClick={() => { setShowForm(true); setEditingNote(null); reset(); }} className="btn-primary flex items-center gap-2">
              <Plus className="w-4 h-4" /> Upload Note
            </button>
          </div>

          <div className="card p-4 mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search notes..." className="input-field pl-9" />
            </div>
          </div>

          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="table-header">Title</th>
                    <th className="table-header">Subject</th>
                    <th className="table-header">Class</th>
                    <th className="table-header">PDF</th>
                    <th className="table-header">Revision</th>
                    <th className="table-header">Uploaded</th>
                    <th className="table-header">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {isLoading
                    ? Array.from({ length: 6 }).map((_, i) => (
                        <tr key={i}>{Array.from({ length: 7 }).map((_, j) => (
                          <td key={j} className="table-cell"><div className="h-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" /></td>
                        ))}</tr>
                      ))
                    : notes.length === 0
                    ? <tr><td colSpan={7} className="table-cell text-center py-12 text-slate-400">No notes yet. Upload your first one!</td></tr>
                    : notes.map((note) => (
                      <tr key={note._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="table-cell max-w-xs"><p className="font-medium text-slate-900 dark:text-white truncate">{note.title}</p></td>
                        <td className="table-cell text-slate-500">{note.subject}</td>
                        <td className="table-cell"><span className="badge badge-info">Class {note.class}</span></td>
                        <td className="table-cell">{note.pdfUrl ? <span className="badge badge-success">✓ PDF</span> : <span className="badge bg-slate-100 text-slate-500">No PDF</span>}</td>
                        <td className="table-cell">{note.isRevisionNote ? <span className="badge bg-yellow-100 text-yellow-700">📝 Yes</span> : <span className="text-slate-400 text-xs">—</span>}</td>
                        <td className="table-cell text-slate-400 text-xs">{formatDate(note.createdAt)}</td>
                        <td className="table-cell">
                          <div className="flex gap-2">
                            <button onClick={() => openEdit(note)} className="p-1.5 rounded-lg text-slate-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"><Edit3 className="w-4 h-4" /></button>
                            <button onClick={() => { if (confirm('Delete this note?')) deleteMutation.mutate(note._id); }} className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"><Trash2 className="w-4 h-4" /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="card w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-slide-up">
            <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
              <h2 className="font-display font-bold text-xl text-slate-900 dark:text-white">{editingNote ? 'Edit Note' : 'Upload New Note'}</h2>
              <button onClick={() => { setShowForm(false); setEditingNote(null); reset(); }} className="p-2 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit((d) => saveMutation.mutate(d))} className="p-6 space-y-4">
              <div>
                <label className="label">Title</label>
                <input {...register('title')} className="input-field" placeholder="e.g. Light – Reflection and Refraction" />
                {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="label">Class</label>
                  <select {...register('class')} className="input-field">
                    <option value="">Select</option>
                    {CLASSES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Subject</label>
                  <select {...register('subject')} className="input-field">
                    <option value="">Select</option>
                    {SUBJECTS.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Chapter</label>
                  <input {...register('chapter')} className="input-field" placeholder="Chapter name" />
                </div>
              </div>
              <div>
                <label className="label">Content (Markdown)</label>
                <textarea {...register('content')} className="input-field min-h-[180px] resize-none font-mono text-sm" placeholder="## Key Concepts&#10;Write notes here..." />
                {errors.content && <p className="text-red-500 text-xs mt-1">{errors.content.message}</p>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Tags (comma separated)</label>
                  <input {...register('tags')} className="input-field" placeholder="light, optics, physics" />
                </div>
                <div className="flex items-end">
                  <label className="flex items-center gap-2 cursor-pointer p-3 rounded-xl bg-slate-50 dark:bg-slate-800 w-full">
                    <input {...register('isRevisionNote')} type="checkbox" className="rounded text-primary-600" />
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Mark as Revision Note</span>
                  </label>
                </div>
              </div>
              <div>
                <label className="label">Upload PDF (optional)</label>
                <div onClick={() => fileRef.current?.click()} className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl p-4 text-center cursor-pointer hover:border-primary-400 transition-colors">
                  {pdfFile
                    ? <div className="flex items-center justify-between"><span className="flex items-center gap-2 text-sm text-primary-600"><FileText className="w-4 h-4" />{pdfFile.name}</span><button type="button" onClick={(e) => { e.stopPropagation(); setPdfFile(null); }} className="text-red-500"><X className="w-4 h-4" /></button></div>
                    : <div className="text-slate-400"><Upload className="w-6 h-6 mx-auto mb-1" /><p className="text-sm">Click to upload PDF (max 20MB)</p></div>}
                </div>
                <input ref={fileRef} type="file" accept="application/pdf" onChange={(e) => { const f = e.target.files?.[0]; if (f && f.size > 20*1024*1024) { toast.error('Max 20MB'); return; } setPdfFile(f||null); }} className="sr-only" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => { setShowForm(false); reset(); }} className="btn-secondary flex-1">Cancel</button>
                <button type="submit" disabled={saveMutation.isPending} className="btn-primary flex-1 flex items-center justify-center gap-2">
                  {saveMutation.isPending ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : editingNote ? 'Update Note' : 'Upload Note'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
