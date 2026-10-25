export function initials(name: string | null | undefined, fallback = '?'): string {
  const value = (name ?? '').trim();
  if (!value) return fallback;
  return value
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('');
}

export function timeAgo(iso: string): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return '';

  const seconds = Math.floor((Date.now() - then) / 1000);
  if (seconds < 60) return 'just now';

  const units: Array<[number, string]> = [
    [60, 'minute'],
    [3600, 'hour'],
    [86400, 'day'],
    [604800, 'week'],
    [2592000, 'month'],
    [31536000, 'year'],
  ];

  let value = seconds;
  let unit = 'second';
  for (let index = units.length - 1; index >= 0; index--) {
    const [threshold, label] = units[index];
    if (seconds >= threshold) {
      value = Math.floor(seconds / threshold);
      unit = label;
      break;
    }
  }

  return `${value} ${unit}${value > 1 ? 's' : ''} ago`;
}

export function formatCount(value: number): string {
  return new Intl.NumberFormat('en-US').format(value);
}
