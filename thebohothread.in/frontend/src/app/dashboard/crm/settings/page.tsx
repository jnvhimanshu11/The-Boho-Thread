'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { School, Bell, CreditCard, Save, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import Sidebar from '@/components/layout/Sidebar';

export default function CRMSettingsPage() {
  const [activeTab, setActiveTab] = useState<'school' | 'fees' | 'notifications'>('school');
  const [saving, setSaving] = useState(false);

  const { register, handleSubmit } = useForm({
    defaultValues: {
      schoolName: 'Delhi Public School',
      address: '123 School Road, New Delhi',
      phone: '9876543210',
      email: 'admin@dps.edu.in',
      academicYear: '2024-25',
      currency: 'INR',
      lateFeePenalty: 100,
      graceDays: 5,
      smsAlerts: true,
      whatsappAlerts: true,
      emailAlerts: false,
    },
  });

  const onSubmit = async (data: any) => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 1000)); // simulate API
    toast.success('Settings saved successfully!');
    setSaving(false);
  };

  const TABS = [
    { id: 'school', label: 'School Info', icon: School },
    { id: 'fees', label: 'Fee Settings', icon: CreditCard },
    { id: 'notifications', label: 'Notifications', icon: Bell },
  ] as const;

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-950">
      <Sidebar role="school_admin" />
      <main className="flex-1 overflow-y-auto">
        <div className="p-6 lg:p-8 max-w-3xl mx-auto">
          <div className="mb-6">
            <h1 className="page-title">Settings</h1>
            <p className="text-slate-500 text-sm">Manage your school CRM preferences</p>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl mb-6">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit(onSubmit)}>
            {activeTab === 'school' && (
              <div className="card p-6 space-y-5">
                <h2 className="font-display font-bold text-slate-900 dark:text-white">School Information</h2>
                <div>
                  <label className="label">School Name</label>
                  <input {...register('schoolName')} className="input-field" />
                </div>
                <div>
                  <label className="label">Address</label>
                  <textarea {...register('address')} className="input-field min-h-[80px] resize-none" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">Phone</label>
                    <input {...register('phone')} className="input-field" />
                  </div>
                  <div>
                    <label className="label">Email</label>
                    <input {...register('email')} type="email" className="input-field" />
                  </div>
                </div>
                <div>
                  <label className="label">Academic Year</label>
                  <select {...register('academicYear')} className="input-field w-48">
                    <option value="2024-25">2024–25</option>
                    <option value="2025-26">2025–26</option>
                    <option value="2026-27">2026–27</option>
                  </select>
                </div>
              </div>
            )}

            {activeTab === 'fees' && (
              <div className="card p-6 space-y-5">
                <h2 className="font-display font-bold text-slate-900 dark:text-white">Fee Configuration</h2>
                <div>
                  <label className="label">Currency</label>
                  <select {...register('currency')} className="input-field w-48">
                    <option value="INR">Indian Rupee (₹)</option>
                    <option value="USD">US Dollar ($)</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">Late Fee Penalty (₹ per day)</label>
                    <input {...register('lateFeePenalty', { valueAsNumber: true })} type="number" className="input-field" />
                  </div>
                  <div>
                    <label className="label">Grace Period (days)</label>
                    <input {...register('graceDays', { valueAsNumber: true })} type="number" className="input-field" />
                  </div>
                </div>
                <div className="rounded-xl bg-blue-50 dark:bg-blue-900/20 p-4">
                  <p className="text-sm text-blue-700 dark:text-blue-400 font-medium mb-1">Razorpay Integration</p>
                  <p className="text-xs text-blue-600 dark:text-blue-500">Configure your Razorpay API keys in the <code className="bg-blue-100 dark:bg-blue-900 px-1 rounded">.env</code> file on the backend server.</p>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="card p-6 space-y-5">
                <h2 className="font-display font-bold text-slate-900 dark:text-white">Notification Preferences</h2>
                <p className="text-sm text-slate-500">Choose how to alert parents about fee dues and attendance.</p>
                {[
                  { field: 'smsAlerts', label: 'SMS Alerts', desc: 'Send SMS to parent phone for fee dues' },
                  { field: 'whatsappAlerts', label: 'WhatsApp Alerts', desc: 'Send WhatsApp messages to parents' },
                  { field: 'emailAlerts', label: 'Email Alerts', desc: 'Send email notifications to registered email' },
                ].map((n) => (
                  <label key={n.field} className="flex items-start gap-4 p-4 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                    <input {...register(n.field as any)} type="checkbox" className="mt-0.5 rounded text-primary-600 w-4 h-4" />
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">{n.label}</p>
                      <p className="text-sm text-slate-500 mt-0.5">{n.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            )}

            <div className="mt-6 flex justify-end">
              <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2 px-8">
                {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : <><Save className="w-4 h-4" /> Save Settings</>}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
