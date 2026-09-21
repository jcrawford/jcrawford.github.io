import type { Article, SearchIndexEntry } from '../types';

/**
 * Generate search index from articles
 * Used for client-side search functionality
 */
export function generateSearchIndex(articles: Article[]): SearchIndexEntry[] {
  return articles.map((article) => ({
    id: article.id,
    slug: article.slug,
    title: article.title,
    excerpt: article.excerpt,
    content: stripHtmlTags(article.content),
    category: article.category,
    tags: article.tags,
  }));
}

/**
 * Strip HTML tags from content for search indexing
 */
function stripHtmlTags(html: string): string {
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Search articles by keyword
 * Case-insensitive, searches title, excerpt, content, and tags
 */
export function searchArticles(
  searchIndex: SearchIndexEntry[],
  query: string
): SearchIndexEntry[] {
  if (!query.trim()) {
    return [];
  }

  const keywords = query.toLowerCase().split(' ').filter(Boolean);

  return searchIndex.filter((entry) => {
    const searchableText = `
      ${entry.title}
      ${entry.excerpt}
      ${entry.content}
      ${entry.tags.join(' ')}
      ${entry.category}
    `.toLowerCase();

    return keywords.every((keyword) => searchableText.includes(keyword));
  });
}

