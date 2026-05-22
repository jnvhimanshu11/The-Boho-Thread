'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Upload, X, ArrowLeft, Loader2, FileText, Eye } from 'lucide-react';
import toast from 'react-hot-toast';
import Sidebar from '@/components/layout/Sidebar';
import { notesApi } from '@/lib/notes-api';
import { CLASSES, SUBJECTS } from '@/lib/utils';

const schema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  subject: z.string().min(1, 'Subject required'),
  class: z.string().min(1, 'Class required'),
  chapter: z.string().min(1, 'Chapter required'),
  content: z.string().min(20, 'Content must be at least 20 characters'),
  tags: z.string().optional(),
  isRevisionNote: z.boolean().default(false),
});

type FormData = z.infer<typeof schema>;

export default function NewNotePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [preview, setPreview] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { isRevisionNote: false },
  });

  const content = watch('content', '');

  const onSubmit = async (values: FormData) => {
    setLoading(true);
    try {
      const formData = new FormData();
      Object.entries(values).forEach(([k, v]) => {
        if (v !== undefined) formData.append(k, String(v));
      });
      if (pdfFile) formData.append('pdf', pdfFile);

      const res = await notesApi.create(formData);
      if (res.success) {
        toast.success('Note uploaded successfully!');
        router.push('/dashboard/admin/notes');
      } else {
        toast.error(res.message || 'Failed to upload note');
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Upload failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-950">
      <Sidebar role="admin" />
      <main className="flex-1 overflow-y-auto">
        <div className="p-6 lg:p-8 max-w-5xl mx-auto">
          <div className="page-header">
            <div className="flex items-center gap-3">
              <button onClick={() => router.back()} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-400" />
              </button>
              <div>
                <h1 className="page-title">Upload New Notes</h1>
                <p className="text-slate-500 text-sm">Create class notes with optional PDF</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setPreview(!preview)}
              className="btn-secondary flex items-center gap-2"
            >
              <Eye className="w-4 h-4" /> {preview ? 'Edit' : 'Preview'}
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main content */}
              <div className="lg:col-span-2 space-y-5">
                <div className="card p-6 space-y-5">
                  <div>
                    <label className="label">Note Title *</label>
                    <input {...register('title')} className="input-field text-lg" placeholder="e.g., Light – Reflection and Refraction" />
                    {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
                  </div>

                  <div>
                    <label className="label">Content (Markdown supported) *</label>
                    {preview ? (
                      <div className="min-h-[400px] p-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 prose dark:prose-invert max-w-none text-sm overflow-auto">
                        <pre className="whitespace-pre-wrap font-sans text-slate-700 dark:text-slate-300">{content || 'Nothing to preview yet...'}</pre>
                      </div>
                    ) : (
                      <textarea
                        {...register('content')}
                        className="input-field min-h-[400px] resize-y font-mono text-sm"
                        placeholder={`# Chapter Title\n\n## Introduction\nWrite your notes here using Markdown...\n\n## Key Points\n- Point 1\n- Point 2\n\n## Formulas\n**Formula:** E = mc²\n\n## Summary\nKey takeaways...`}
                      />
                    )}
                    {errors.content && <p className="text-red-500 text-xs mt-1">{errors.content.message}</p>}
                    <p className="text-xs text-slate-400 mt-1">{content.length} characters · Markdown supported</p>
                  </div>
                </div>

                {/* PDF Upload */}
                <div className="card p-6">
                  <label className="label mb-3 block">PDF File (optional)</label>
                  <div
                    onClick={() => fileRef.current?.click()}
                    className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl p-8 text-center cursor-pointer hover:border-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/10 transition-all"
                  >
                    {pdfFile ? (
                      <div className="flex items-center justify-center gap-3">
                        <FileText className="w-8 h-8 text-red-500" />
                        <div className="text-left">
                          <p className="font-medium text-slate-900 dark:text-white">{pdfFile.name}</p>
                          <p className="text-xs text-slate-400">{(pdfFile.size / 1024 / 1024).toFixed(2)} MB</p>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); setPdfFile(null); }}
                          className="ml-2 p-1 rounded-full hover:bg-red-100 text-red-500 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <Upload className="w-10 h-10 text-slate-400 mx-auto mb-3" />
                        <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Click to upload PDF</p>
                        <p className="text-xs text-slate-400 mt-1">PDF files up to 20MB</p>
                      </>
                    )}
                  </div>
                  <input
                    ref={fileRef}
                    type="file"
                    accept=".pdf"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f && f.size > 20 * 1024 * 1024) { toast.error('PDF must be under 20MB'); return; }
                      setPdfFile(f || null);
                    }}
                    className="sr-only"
                  />
                </div>
              </div>

              {/* Sidebar metadata */}
              <div className="space-y-5">
                <div className="card p-5 space-y-4">
                  <h3 className="font-display font-bold text-slate-900 dark:text-white">Note Details</h3>

                  <div>
                    <label className="label">Class *</label>
                    <select {...register('class')} className="input-field">
                      <option value="">Select class</option>
                      {CLASSES.map((c) => <option key={c} value={c}>{c === 'College' ? 'College (UG/PG)' : `Class ${c}`}</option>)}
                    </select>
                    {errors.class && <p className="text-red-500 text-xs mt-1">{errors.class.message}</p>}
                  </div>

                  <div>
                    <label className="label">Subject *</label>
                    <select {...register('subject')} className="input-field">
                      <option value="">Select subject</option>
                      {SUBJECTS.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                    {errors.subject && <p className="text-red-500 text-xs mt-1">{errors.subject.message}</p>}
                  </div>

                  <div>
                    <label className="label">Chapter *</label>
                    <input {...register('chapter')} className="input-field" placeholder="e.g., Light, Trigonometry..." />
                    {errors.chapter && <p className="text-red-500 text-xs mt-1">{errors.chapter.message}</p>}
                  </div>

                  <div>
                    <label className="label">Tags (comma separated)</label>
                    <input {...register('tags')} className="input-field" placeholder="light, optics, physics, class10" />
                  </div>

                  <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                    <input {...register('isRevisionNote')} type="checkbox" className="rounded text-primary-600 w-4 h-4" />
                    <div>
                      <p className="text-sm font-medium text-slate-900 dark:text-white">📝 Revision Note</p>
                      <p className="text-xs text-slate-400">Mark as short revision note</p>
                    </div>
                  </label>
                </div>

                <div className="card p-5 space-y-3">
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary w-full py-3 flex items-center justify-center gap-2 text-base"
                  >
                    {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Uploading...</> : '🚀 Publish Note'}
                  </button>
                  <button
                    type="button"
                    onClick={() => router.back()}
                    className="btn-secondary w-full"
                  >
                    Cancel
                  </button>
                </div>

                <div className="card p-4 bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-800">
                  <p className="text-xs font-medium text-blue-800 dark:text-blue-300 mb-2">✨ Markdown Tips</p>
                  <div className="text-xs text-blue-700 dark:text-blue-400 space-y-1 font-mono">
                    <p># Heading 1</p>
                    <p>## Heading 2</p>
                    <p>**bold text**</p>
                    <p>*italic text*</p>
                    <p>- bullet point</p>
                    <p>1. numbered list</p>
                    <p>`inline code`</p>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
