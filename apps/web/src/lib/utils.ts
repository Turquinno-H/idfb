import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number | string, currency = 'TRY', locale = 'tr-TR'): string {
  const numeric = typeof value === 'string' ? Number(value) : value;
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(Number.isFinite(numeric) ? numeric : 0);
}

export function formatNumber(value: number | string, locale = 'tr-TR'): string {
  const numeric = typeof value === 'string' ? Number(value) : value;
  return new Intl.NumberFormat(locale).format(Number.isFinite(numeric) ? numeric : 0);
}

export function formatDate(value: string | Date | null | undefined, locale = 'tr-TR'): string {
  if (!value) {
    return '-';
  }
  const date = typeof value === 'string' ? new Date(value) : value;
  return new Intl.DateTimeFormat(locale, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
}
