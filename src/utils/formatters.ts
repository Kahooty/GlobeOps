import { format, formatDistanceToNowStrict } from 'date-fns';

export function formatTime(date: Date): string {
  return format(date, 'HH:mm:ss');
}

export function formatTimeShort(date: Date): string {
  return format(date, 'HH:mm');
}

export function formatDate(date: Date): string {
  return format(date, 'dd MMM yyyy');
}

export function formatDateFull(date: Date): string {
  return format(date, 'dd MMM yyyy HH:mm:ss');
}

export function formatRelative(date: Date): string {
  return formatDistanceToNowStrict(date, { addSuffix: true });
}

export function formatNumber(n: number, decimals = 0): string {
  return n.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export function formatChange(change: number): string {
  const sign = change >= 0 ? '+' : '';
  return `${sign}${change.toFixed(2)}%`;
}

export function formatMagnitude(mag: number): string {
  return `M${mag.toFixed(1)}`;
}

export function truncate(text: string, maxLen: number): string {
  if (text.length <= maxLen) return text;
  return text.slice(0, maxLen - 1) + '\u2026';
}
