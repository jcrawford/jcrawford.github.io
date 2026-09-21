import { useEffect, useState } from 'react';

export interface ShareCounts {
  facebook: number;
  linkedin: number;
  copy: number;
}

export interface ArticleMetrics {
  views: number;
  comments: number;
  shares: ShareCounts;
}

const DEFAULT_METRICS: ArticleMetrics = {
  views: 0,
  comments: 0,
  shares: { facebook: 0, linkedin: 0, copy: 0 },
};

interface PopularArticleEntry {
  id: string;
  views?: number;
  comments?: number;
  shares?: { facebook?: number; linkedin?: number; copy?: number };
}

interface StoredPopularArticles {
  entries: PopularArticleEntry[];
}

/**
 * Fetches article metrics (views, comments, shares) client-side from
 * /data/popular-articles.json. Blocks rendering until data is loaded
 * to prevent flash of stale/default values.
 *
 * @param articlePath - The canonical path of the article (e.g. "/brewing/cherry-mead")
 * @returns { metrics, loading } - loading is true until fetch completes
 */
export function useArticleMetrics(articlePath: string): {
  metrics: ArticleMetrics;
  loading: boolean;
} {
  const [metrics, setMetrics] = useState<ArticleMetrics>(DEFAULT_METRICS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    // SSR — no fetch, but mark as not loading so render doesn't hang
    if (typeof window === 'undefined') {
      setLoading(false);
      return () => {
        isMounted = false;
      };
    }

    fetch('/data/popular-articles.json')
      .then((response) => (response.ok ? response.json() : null))
      .then((data: StoredPopularArticles | null) => {
        if (!isMounted) return;

        if (data?.entries && Array.isArray(data.entries)) {
          // Normalize path — JSON keys have no trailing slash
          const normalizedPath = articlePath.replace(/\/$/, '');
          const entry = data.entries.find(
            (e) => e.id === normalizedPath || e.id === articlePath
          );

          if (entry) {
            setMetrics({
              views: entry.views || 0,
              comments: entry.comments || 0,
              shares: {
                facebook: entry.shares?.facebook || 0,
                linkedin: entry.shares?.linkedin || 0,
                copy: entry.shares?.copy || 0,
              },
            });
          }
        }
        setLoading(false);
      })
      .catch(() => {
        if (!isMounted) return;
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [articlePath]);

  return { metrics, loading };
}