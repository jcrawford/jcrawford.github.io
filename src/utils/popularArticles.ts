export interface PopularArticleMetrics {
  path: string;
  views: number;
  comments: number;
  score: number;
}

export interface PopularArticleEntry {
  id: string;
  score?: number | null;
  comments?: number | null;
  views?: number | null;
}

export const POPULAR_ARTICLES_STORAGE_KEY = 'hm-popular-articles';
const COMMENT_WEIGHT = 25;

interface StoredPopularArticles {
  generatedAt: string;
  windowDays: number | string;
  entries: PopularArticleEntry[];
}

export function scorePopularArticle(views: number, comments: number): number {
  return views + comments * COMMENT_WEIGHT;
}

export function parsePopularArticles(payload: string | null): Map<string, PopularArticleEntry> {
  if (!payload) return new Map();

  try {
    const parsed = JSON.parse(payload) as StoredPopularArticles;
    if (!Array.isArray(parsed.entries)) {
      return new Map();
    }

    return new Map(
      parsed.entries
        .filter((entry) => typeof entry?.id === 'string' && entry.id.length > 0)
        .map((entry) => [entry.id, entry])
    );
  } catch {
    return new Map();
  }
}

export function buildPopularArticlesPayload(metrics: PopularArticleMetrics[]): string {
  const entries = metrics.map((metric) => ({
    id: metric.path,
    views: metric.views,
    comments: metric.comments,
    score: metric.score,
  }));

  return JSON.stringify({
    generatedAt: new Date().toISOString(),
    windowDays: 'lifetime',
    entries,
  });
}

export function getPopularArticlesWindowDays(): number | string {
  return 'lifetime';
}
