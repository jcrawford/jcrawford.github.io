import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import advancedFormat from 'dayjs/plugin/advancedFormat';

// Extend dayjs with plugins
dayjs.extend(relativeTime);
dayjs.extend(advancedFormat);

/**
 * Format date as human-readable string
 * Example: "January 15, 2025"
 */
export function formatDate(date: string): string {
  return dayjs(date).format('MMMM D, YYYY');
}

/**
 * Format date as short string
 * Example: "Jan 15, 2025"
 */
export function formatDateShort(date: string): string {
  return dayjs(date).format('MMM D, YYYY');
}

/**
 * Format date as ISO string for datetime attributes
 * Example: "2025-01-15"
 */
export function formatDateISO(date: string): string {
  return dayjs(date).format('YYYY-MM-DD');
}

/**
 * Get relative time from now
 * Example: "2 days ago", "3 months ago"
 */
export function formatRelativeTime(date: string): string {
  return dayjs(date).fromNow();
}

/**
 * Check if date is recent (within last 7 days)
 */
export function isRecent(date: string): boolean {
  const daysDiff = dayjs().diff(dayjs(date), 'day');
  return daysDiff <= 7;
}

/**
 * Sort articles by publish date (newest first)
 */
export function sortByDateDesc<T extends { publishedAt: string }>(items: T[]): T[] {
  return [...items].sort((a, b) => {
    return dayjs(b.publishedAt).valueOf() - dayjs(a.publishedAt).valueOf();
  });
}

