'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { IndianRupee, Search, Filter, CheckCircle, Clock, AlertCircle, CreditCard, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import Sidebar from '@/components/layout/Sidebar';
import { feePaymentsApi } from '@/lib/crm-api';
import { FeePayment } from '@/types';
import { formatCurrency, formatDate, FEE_STATUS_COLORS } from '@/lib/utils';

declare global {
  interface Window { Razorpay: any; }
}

export default function FeesPage() {
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [payingId, setPayingId] = useState<string | null>(null);

  const { data: summaryRes } = useQuery({
    queryKey: ['fee-summary'],
    queryFn: feePaymentsApi.getSummary,
  });

  const { data: paymentsRes, isLoading } = useQuery({
    queryKey: ['fee-payments', statusFilter, search],
    queryFn: () => feePaymentsApi.getAll({ status: statusFilter }),
  });

  const summary = summaryRes?.data;
  const payments = paymentsRes?.data?.data ?? [];

  const handleOnlinePayment = async (payment: FeePayment) => {
    setPayingId(payment._id);
    try {
      const orderRes = await feePaymentsApi.createOrder({
        studentId: payment.studentId,
        amount: payment.totalAmount - payment.amountPaid,
        feeStructureId: payment.feeStructureId,
      });

      if (!orderRes.success || !orderRes.data) throw new Error('Order creation failed');

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY,
        amount: orderRes.data.amount,
        currency: orderRes.data.currency,
        name: 'StudyHub School CRM',
        description: 'Fee Payment',
        order_id: orderRes.data.orderId,
        handler: async (response: any) => {
          await feePaymentsApi.verifyPayment({
            orderId: orderRes.data!.orderId,
            paymentId: response.razorpay_payment_id,
            signature: response.razorpay_signature,
            studentId: payment.studentId,
            feeStructureId: payment.feeStructureId,
          });
          toast.success('Payment successful!');
        },
        theme: { color: '#4f46e5' },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      toast.error('Payment initiation failed');
    } finally {
      setPayingId(null);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-950">
      <Sidebar role="school_admin" />

      <main className="flex-1 overflow-y-auto">
        <div className="p-6 lg:p-8 max-w-6xl mx-auto">
          <div className="page-header">
            <div>
              <h1 className="page-title">Fee Management</h1>
              <p className="text-slate-500 text-sm">Track and collect student fees</p>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            {[
              { label: 'Total Collected', value: formatCurrency(summary?.totalCollected ?? 420000), icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/20' },
              { label: 'Total Pending', value: formatCurrency(summary?.totalPending ?? 68000), icon: Clock, color: 'text-orange-600', bg: 'bg-orange-50 dark:bg-orange-900/20' },
              { label: 'Overdue', value: formatCurrency(summary?.totalOverdue ?? 24000), icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-900/20' },
            ].map((card) => (
              <div key={card.label} className="stat-card">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${card.bg}`}>
                  <card.icon className={`w-5 h-5 ${card.color}`} />
                </div>
                <div>
                  <div className="font-bold text-xl text-slate-900 dark:text-white">{card.value}</div>
                  <div className="text-sm text-slate-500">{card.label}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Filters */}
          <div className="card p-4 mb-6 flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search student..." className="input-field pl-9" />
            </div>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="input-field w-44">
              <option value="">All Status</option>
              <option value="paid">Paid</option>
              <option value="partial">Partial</option>
              <option value="pending">Pending</option>
              <option value="overdue">Overdue</option>
            </select>
          </div>

          {/* Payments Table */}
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="table-header">Student</th>
                    <th className="table-header">Month</th>
                    <th className="table-header">Total</th>
                    <th className="table-header">Paid</th>
                    <th className="table-header">Balance</th>
                    <th className="table-header">Status</th>
                    <th className="table-header">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {isLoading ? (
                    Array.from({ length: 6 }).map((_, i) => (
                      <tr key={i}>
                        {Array.from({ length: 7 }).map((_, j) => (
                          <td key={j} className="table-cell">
                            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
                          </td>
                        ))}
                      </tr>
                    ))
                  ) : payments.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="table-cell text-center py-12 text-slate-400">
                        No fee records found.
                      </td>
                    </tr>
                  ) : (
                    payments.map((p: FeePayment) => {
                      const balance = p.totalAmount - p.amountPaid;
                      return (
                        <tr key={p._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                          <td className="table-cell font-medium text-slate-900 dark:text-white">
                            {(p.student as any)?.name ?? 'N/A'}
                          </td>
                          <td className="table-cell text-slate-500">{p.month}</td>
                          <td className="table-cell font-semibold">{formatCurrency(p.totalAmount)}</td>
                          <td className="table-cell text-green-600">{formatCurrency(p.amountPaid)}</td>
                          <td className="table-cell text-red-600 font-medium">{formatCurrency(balance)}</td>
                          <td className="table-cell">
                            <span className={`badge ${FEE_STATUS_COLORS[p.status]}`}>{p.status}</span>
                          </td>
                          <td className="table-cell">
                            {p.status !== 'paid' && (
                              <button
                                onClick={() => handleOnlinePayment(p)}
                                disabled={payingId === p._id}
                                className="btn-primary text-xs px-3 py-1.5 flex items-center gap-1.5"
                              >
                                {payingId === p._id ? (
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                ) : (
                                  <CreditCard className="w-3 h-3" />
                                )}
                                Pay {formatCurrency(balance)}
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      {/* Razorpay Script */}
      <script src="https://checkout.razorpay.com/v1/checkout.js" async />
    </div>
  );
}
