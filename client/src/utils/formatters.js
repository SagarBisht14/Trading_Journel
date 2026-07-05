import { format, parseISO } from 'date-fns';

export function currency(value = 0, code = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: code,
    maximumFractionDigits: 2
  }).format(Number(value || 0));
}

export function compactCurrency(value = 0, code = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: code,
    notation: 'compact',
    maximumFractionDigits: 1
  }).format(Number(value || 0));
}

export function number(value = 0, digits = 2) {
  return new Intl.NumberFormat('en-US', { maximumFractionDigits: digits }).format(Number(value || 0));
}

export function percent(value = 0) {
  return `${number(value, 1)}%`;
}

export function dateLabel(date, pattern = 'MMM d, yyyy') {
  if (!date) return '-';
  const parsed = typeof date === 'string' ? parseISO(date) : new Date(date);
  if (Number.isNaN(parsed.getTime())) return '-';
  return format(parsed, pattern);
}

export function pnlClass(value) {
  const pnl = Number(value || 0);
  if (pnl > 0) return 'text-bull';
  if (pnl < 0) return 'text-bear';
  return 'text-slate-300';
}

export function minutesLabel(minutes = 0) {
  const mins = Number(minutes || 0);
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  const rest = mins % 60;
  return rest ? `${hours}h ${rest}m` : `${hours}h`;
}
