'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useMutation } from '@tanstack/react-query';
import { studentsApi } from '@/lib/crm-api';
import { Student } from '@/types';
import { CLASSES } from '@/lib/utils';

const schema = z.object({
  name: z.string().min(2, 'Name required'),
  rollNumber: z.string().min(1, 'Roll number required'),
  class: z.string().min(1, 'Class required'),
  section: z.string().min(1, 'Section required'),
  parentName: z.string().min(2, 'Parent name required'),
  parentPhone: z.string().min(10, 'Valid phone number required'),
  address: z.string().optional(),
  dob: z.string().min(1, 'Date of birth required'),
  gender: z.enum(['male', 'female', 'other']),
});

type FormData = z.infer<typeof schema>;

interface Props {
  student: Student | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function StudentFormModal({ student, onClose, onSuccess }: Props) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: student ? {
      name: student.name,
      rollNumber: student.rollNumber,
      class: student.class,
      section: student.section,
      parentName: student.parentName,
      parentPhone: student.parentPhone,
      address: student.address,
      dob: student.dob,
      gender: student.gender,
    } : undefined,
  });

  const mutation = useMutation({
    mutationFn: (data: FormData) =>
      student
        ? studentsApi.update(student._id, data as any)
        : studentsApi.create(data as any),
    onSuccess: () => {
      toast.success(student ? 'Student updated!' : 'Student added!');
      onSuccess();
    },
    onError: () => toast.error('Something went wrong'),
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="card w-full max-w-xl max-h-[90vh] overflow-y-auto animate-slide-up">
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
          <h2 className="font-display font-bold text-xl text-slate-900 dark:text-white">
            {student ? 'Edit Student' : 'Add New Student'}
          </h2>
          <button onClick={onClose} className="p-2 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Full Name</label>
              <input {...register('name')} className="input-field" placeholder="Rahul Kumar" />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
            </div>
            <div>
              <label className="label">Roll Number</label>
              <input {...register('rollNumber')} className="input-field" placeholder="001" />
              {errors.rollNumber && <p className="text-red-500 text-xs mt-1">{errors.rollNumber.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="label">Class</label>
              <select {...register('class')} className="input-field">
                <option value="">Select</option>
                {CLASSES.filter(c => c !== 'College').map((cls) => (
                  <option key={cls} value={cls}>{cls}</option>
                ))}
              </select>
              {errors.class && <p className="text-red-500 text-xs mt-1">{errors.class.message}</p>}
            </div>
            <div>
              <label className="label">Section</label>
              <select {...register('section')} className="input-field">
                <option value="">Select</option>
                {['A', 'B', 'C', 'D', 'E'].map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              {errors.section && <p className="text-red-500 text-xs mt-1">{errors.section.message}</p>}
            </div>
            <div>
              <label className="label">Gender</label>
              <select {...register('gender')} className="input-field">
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div>
            <label className="label">Date of Birth</label>
            <input {...register('dob')} type="date" className="input-field" />
            {errors.dob && <p className="text-red-500 text-xs mt-1">{errors.dob.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Parent/Guardian Name</label>
              <input {...register('parentName')} className="input-field" placeholder="Suresh Kumar" />
              {errors.parentName && <p className="text-red-500 text-xs mt-1">{errors.parentName.message}</p>}
            </div>
            <div>
              <label className="label">Parent Phone</label>
              <input {...register('parentPhone')} className="input-field" placeholder="9876543210" />
              {errors.parentPhone && <p className="text-red-500 text-xs mt-1">{errors.parentPhone.message}</p>}
            </div>
          </div>

          <div>
            <label className="label">Address (optional)</label>
            <textarea {...register('address')} className="input-field min-h-[80px] resize-none" placeholder="Full address..." />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={mutation.isPending} className="btn-primary flex-1 flex items-center justify-center gap-2">
              {mutation.isPending ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : student ? 'Update Student' : 'Add Student'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
