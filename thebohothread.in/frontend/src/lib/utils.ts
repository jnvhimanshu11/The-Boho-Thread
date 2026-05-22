import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(date));
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

export const CLASSES: string[] = ['6', '7', '8', '9', '10', '11', '12', 'College'];
export const SUBJECTS: string[] = [
  'Mathematics', 'Science', 'English', 'Hindi', 'Social Science',
  'Physics', 'Chemistry', 'Biology', 'History', 'Geography',
  'Economics', 'Political Science', 'Computer Science',
];

export const FEE_STATUS_COLORS: Record<string, string> = {
  paid: 'badge-success',
  partial: 'badge-warning',
  pending: 'badge-info',
  overdue: 'badge-error',
};

export const ATTENDANCE_STATUS_COLORS: Record<string, string> = {
  present: 'text-green-600',
  absent: 'text-red-600',
  late: 'text-yellow-600',
};
