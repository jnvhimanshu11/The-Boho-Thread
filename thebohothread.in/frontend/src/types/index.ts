// ───────────────────────────── User / Auth ─────────────────────────────
export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'student' | 'admin' | 'school_admin';
  class?: string;
  section?: string;
  schoolId?: string;
  avatar?: string;
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

// ───────────────────────────── Notes ────────────────────────────────────
export interface Note {
  _id: string;
  title: string;
  subject: string;
  class: string;
  chapter: string;
  content: string;
  pdfUrl?: string;
  tags: string[];
  isRevisionNote: boolean;
  downloadCount: number;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Question {
  _id: string;
  question: string;
  answer: string;
  type: 'mcq' | 'short' | 'long';
  subject: string;
  class: string;
  chapter: string;
  year?: number;
  isPYQ: boolean;
  options?: string[];
  correctOption?: number;
}

// ───────────────────────────── CRM / School ──────────────────────────────
export interface School {
  _id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  logo?: string;
  subscriptionPlan: 'basic' | 'pro' | 'enterprise';
  subscriptionExpiry: string;
}

export interface Student {
  _id: string;
  name: string;
  rollNumber: string;
  class: string;
  section: string;
  parentName: string;
  parentPhone: string;
  address: string;
  dob: string;
  gender: 'male' | 'female' | 'other';
  schoolId: string;
  userId?: string;
  createdAt: string;
}

export interface FeeStructure {
  _id: string;
  schoolId: string;
  class: string;
  academicYear: string;
  tuitionFee: number;
  admissionFee: number;
  examFee: number;
  otherFees: { name: string; amount: number }[];
  totalAmount: number;
  dueDate: string;
}

export interface FeePayment {
  _id: string;
  studentId: string;
  student?: Student;
  schoolId: string;
  feeStructureId: string;
  amountPaid: number;
  totalAmount: number;
  status: 'paid' | 'partial' | 'pending' | 'overdue';
  paymentDate?: string;
  paymentMethod: 'online' | 'cash' | 'cheque';
  transactionId?: string;
  month: string;
  academicYear: string;
}

export interface Attendance {
  _id: string;
  studentId: string;
  schoolId: string;
  date: string;
  status: 'present' | 'absent' | 'late';
  subject?: string;
}

// ───────────────────────────── AI Tools ──────────────────────────────────
export interface AIMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface AISession {
  id: string;
  type: 'doubt_solver' | 'summarizer' | 'homework' | 'essay';
  messages: AIMessage[];
}

// ───────────────────────────── Shared ────────────────────────────────────
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export type ClassLevel = '6' | '7' | '8' | '9' | '10' | '11' | '12' | 'college';
export type Subject = 'Mathematics' | 'Science' | 'English' | 'Hindi' | 'Social Science' | 'Physics' | 'Chemistry' | 'Biology' | 'History' | 'Geography' | 'Economics' | 'Political Science' | 'Computer Science';
