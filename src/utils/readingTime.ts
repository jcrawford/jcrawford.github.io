/**
 * Estimate reading time from markdown text.
 * Standard adult reading speed is roughly 200-250 words per minute.
 * We use 225 WPM as a middle-ground default.
 */
export function calculateReadingTime(text: string, wordsPerMinute = 225): number {
  if (!text) return 0;
  // Strip common markdown and HTML syntax so we only count readable words
  const cleaned = text
    .replace(/```[\s\S]*?```/g, '') // code blocks
    .replace(/`[^`]+`/g, '') // inline code
    .replace(/!?\[[^\]]*\]\([^)]*\)/g, '') // links/images
    .replace(/<[^>]+>/g, '') // HTML tags
    .replace(/[#*_~|`>-]/g, '') // markdown formatting chars
    .replace(/\s+/g, ' ')
    .trim();

  const wordCount = cleaned.split(/\s+/).filter((word) => word.length > 0).length;
  return Math.max(1, Math.round(wordCount / wordsPerMinute));
}
