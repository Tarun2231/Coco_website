import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, differenceInYears, differenceInMonths, differenceInDays } from 'date-fns';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date | null | undefined, formatStr = 'dd MMM yyyy') {
  if (!date) return 'N/A';
  try {
    return format(new Date(date), formatStr);
  } catch (err) {
    return 'N/A';
  }
}

export function formatCurrency(amount: number, currency = '₹') {
  return `${currency}${amount.toLocaleString('en-IN')}`;
}

export function calculateAge(dob: string | Date | null | undefined): string {
  if (!dob) return '1 Year';
  const birth = new Date(dob);
  const now = new Date();
  const years = differenceInYears(now, birth);
  if (years >= 1) {
    return `${years} Year${years > 1 ? 's' : ''}`;
  }
  const months = differenceInMonths(now, birth);
  if (months >= 1) {
    return `${months} Month${months > 1 ? 's' : ''}`;
  }
  const days = differenceInDays(now, birth);
  return `${days} Days`;
}

export function getCountdownString(targetDate: string | Date | null | undefined): { text: string; isOverdue: boolean } {
  if (!targetDate) return { text: '', isOverdue: false };
  const target = new Date(targetDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);

  const diffDays = Math.ceil((target.getTime() - today.getTime()) / (1000 * 3600 * 24));
  if (diffDays === 0) return { text: 'Today', isOverdue: false };
  if (diffDays > 0) return { text: `In ${diffDays} day${diffDays > 1 ? 's' : ''}`, isOverdue: false };
  return { text: `${Math.abs(diffDays)} days overdue`, isOverdue: true };
}
