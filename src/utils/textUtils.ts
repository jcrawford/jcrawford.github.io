/**
 * Truncate text to specified length with ellipsis
 * Ensures truncation happens at word boundaries
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) {
    return text;
  }

  const truncated = text.slice(0, maxLength);
  const lastSpaceIndex = truncated.lastIndexOf(' ');

  if (lastSpaceIndex > 0) {
    return truncated.slice(0, lastSpaceIndex) + '...';
  }

  return truncated + '...';
}

/**
 * Truncate excerpt to 200 characters (per spec clarification)
 */
export function truncateExcerpt(excerpt: string): string {
  return truncateText(excerpt, 200);
}

/**
 * Strip HTML tags from text
 */
export function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
}

/**
 * Get reading time estimate (words per minute: 200)
 */
export function getReadingTime(text: string): number {
  const words = stripHtml(text).split(/\s+/).length;
  const minutes = Math.ceil(words / 200);
  return minutes;
}

