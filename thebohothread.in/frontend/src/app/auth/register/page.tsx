'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { BookOpen, Loader2, GraduationCap, School } from 'lucide-react';
import toast from 'react-hot-toast';
import { authApi } from '@/lib/auth-api';
import { useAuthStore } from '@/store/auth-store';
import { CLASSES } from '@/lib/utils';

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['student', 'school_admin']),
  class: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export default function RegisterPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const params = useSearchParams();
  const setAuth = useAuthStore((s) => s.setAuth);

  const defaultRole = (params.get('role') as 'student' | 'school_admin') || 'student';

  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { role: defaultRole },
  });

  const selectedRole = watch('role');

  const onSubmit = async (values: FormData) => {
    setLoading(true);
    try {
      const res = await authApi.register(values);
      if (res.success && res.data) {
        setAuth(res.data.user, res.data.token);
        toast.success(`Welcome to StudyHub, ${res.data.user.name}!`);
        if (values.role === 'school_admin') router.push('/dashboard/crm');
        else router.push('/dashboard/student');
      } else {
        toast.error(res.message || 'Registration failed');
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 px-4 py-12">
      <div className="w-full max-w-md animate-slide-up">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-9 h-9 bg-primary-600 rounded-xl flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <span className="font-display font-bold text-xl text-slate-900 dark:text-white">StudyHub</span>
          </Link>
          <h1 className="font-display text-3xl font-bold text-slate-900 dark:text-white">Create Account</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2">Join 50,000+ students on StudyHub</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="card p-8 space-y-5">
          {/* Role selector */}
          <div>
            <label className="label">I am a...</label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { value: 'student', label: 'Student', icon: GraduationCap, desc: 'Access notes & AI tools' },
                { value: 'school_admin', label: 'School Admin', icon: School, desc: 'Manage your school' },
              ].map((opt) => (
                <label key={opt.value} className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 cursor-pointer transition-all ${selectedRole === opt.value ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' : 'border-slate-200 dark:border-slate-700 hover:border-primary-300'}`}>
                  <input {...register('role')} type="radio" value={opt.value} className="sr-only" />
                  <opt.icon className={`w-6 h-6 ${selectedRole === opt.value ? 'text-primary-600' : 'text-slate-400'}`} />
                  <span className={`font-medium text-sm ${selectedRole === opt.value ? 'text-primary-700 dark:text-primary-400' : 'text-slate-600 dark:text-slate-400'}`}>{opt.label}</span>
                  <span className="text-xs text-slate-400 text-center">{opt.desc}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="label">Full Name</label>
            <input {...register('name')} type="text" className="input-field" placeholder="Rahul Kumar" />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
          </div>

          <div>
            <label className="label">Email</label>
            <input {...register('email')} type="email" className="input-field" placeholder="rahul@example.com" />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
          </div>

          {selectedRole === 'student' && (
            <div>
              <label className="label">Class</label>
              <select {...register('class')} className="input-field">
                <option value="">Select your class</option>
                {CLASSES.map((cls) => (
                  <option key={cls} value={cls}>{cls === 'College' ? 'College (UG/PG)' : `Class ${cls}`}</option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="label">Password</label>
            <input {...register('password')} type="password" className="input-field" placeholder="••••••••" />
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full py-3 flex items-center justify-center gap-2 text-base">
            {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating Account...</> : 'Create Account'}
          </button>

          <p className="text-center text-sm text-slate-500 dark:text-slate-400">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-primary-600 hover:underline font-medium">Sign In</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
