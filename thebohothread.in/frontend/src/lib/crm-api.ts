import apiClient from '@/lib/api-client';
import { Student, FeeStructure, FeePayment, Attendance, ApiResponse, PaginatedResponse } from '@/types';

// ── Students ─────────────────────────────────────────────────────────────
export const studentsApi = {
  getAll: async (params?: { class?: string; section?: string; search?: string; page?: number }): Promise<ApiResponse<PaginatedResponse<Student>>> => {
    const query = new URLSearchParams(params as any);
    const { data } = await apiClient.get(`/crm/students?${query}`);
    return data;
  },

  getById: async (id: string): Promise<ApiResponse<Student>> => {
    const { data } = await apiClient.get(`/crm/students/${id}`);
    return data;
  },

  create: async (payload: Omit<Student, '_id' | 'createdAt'>): Promise<ApiResponse<Student>> => {
    const { data } = await apiClient.post('/crm/students', payload);
    return data;
  },

  update: async (id: string, payload: Partial<Student>): Promise<ApiResponse<Student>> => {
    const { data } = await apiClient.put(`/crm/students/${id}`, payload);
    return data;
  },

  delete: async (id: string): Promise<ApiResponse<null>> => {
    const { data } = await apiClient.delete(`/crm/students/${id}`);
    return data;
  },

  bulkImport: async (file: File): Promise<ApiResponse<{ imported: number; failed: number }>> => {
    const formData = new FormData();
    formData.append('file', file);
    const { data } = await apiClient.post('/crm/students/bulk-import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },

  exportExcel: async (): Promise<Blob> => {
    const { data } = await apiClient.get('/crm/students/export', { responseType: 'blob' });
    return data;
  },
};

// ── Fee Structures ────────────────────────────────────────────────────────
export const feeStructuresApi = {
  getAll: async (): Promise<ApiResponse<FeeStructure[]>> => {
    const { data } = await apiClient.get('/crm/fee-structures');
    return data;
  },

  create: async (payload: Omit<FeeStructure, '_id'>): Promise<ApiResponse<FeeStructure>> => {
    const { data } = await apiClient.post('/crm/fee-structures', payload);
    return data;
  },

  update: async (id: string, payload: Partial<FeeStructure>): Promise<ApiResponse<FeeStructure>> => {
    const { data } = await apiClient.put(`/crm/fee-structures/${id}`, payload);
    return data;
  },

  delete: async (id: string): Promise<ApiResponse<null>> => {
    const { data } = await apiClient.delete(`/crm/fee-structures/${id}`);
    return data;
  },
};

// ── Fee Payments ──────────────────────────────────────────────────────────
export const feePaymentsApi = {
  getAll: async (params?: { studentId?: string; status?: string; month?: string; page?: number }): Promise<ApiResponse<PaginatedResponse<FeePayment>>> => {
    const query = new URLSearchParams(params as any);
    const { data } = await apiClient.get(`/crm/fee-payments?${query}`);
    return data;
  },

  createOrder: async (payload: { studentId: string; amount: number; feeStructureId: string }): Promise<ApiResponse<{ orderId: string; amount: number; currency: string }>> => {
    const { data } = await apiClient.post('/crm/fee-payments/create-order', payload);
    return data;
  },

  verifyPayment: async (payload: { orderId: string; paymentId: string; signature: string; studentId: string; feeStructureId: string }): Promise<ApiResponse<FeePayment>> => {
    const { data } = await apiClient.post('/crm/fee-payments/verify', payload);
    return data;
  },

  recordCash: async (payload: Partial<FeePayment>): Promise<ApiResponse<FeePayment>> => {
    const { data } = await apiClient.post('/crm/fee-payments/cash', payload);
    return data;
  },

  getSummary: async (): Promise<ApiResponse<{ totalCollected: number; totalPending: number; totalOverdue: number; monthlyData: any[] }>> => {
    const { data } = await apiClient.get('/crm/fee-payments/summary');
    return data;
  },
};

// ── Attendance ────────────────────────────────────────────────────────────
export const attendanceApi = {
  getByDate: async (date: string, class_?: string): Promise<ApiResponse<Attendance[]>> => {
    const { data } = await apiClient.get(`/crm/attendance?date=${date}${class_ ? `&class=${class_}` : ''}`);
    return data;
  },

  markBulk: async (records: Omit<Attendance, '_id'>[]): Promise<ApiResponse<{ marked: number }>> => {
    const { data } = await apiClient.post('/crm/attendance/bulk', { records });
    return data;
  },

  getStudentReport: async (studentId: string, month: string): Promise<ApiResponse<{ present: number; absent: number; late: number; records: Attendance[] }>> => {
    const { data } = await apiClient.get(`/crm/attendance/student/${studentId}?month=${month}`);
    return data;
  },
};

// ── Dashboard Stats ────────────────────────────────────────────────────────
export const dashboardApi = {
  getStats: async (): Promise<ApiResponse<{
    totalStudents: number;
    feesCollected: number;
    feesPending: number;
    todayAttendance: number;
    recentPayments: FeePayment[];
  }>> => {
    const { data } = await apiClient.get('/crm/dashboard/stats');
    return data;
  },
};
