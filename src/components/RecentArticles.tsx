import React, { useEffect, useMemo, useState } from 'react';
import { Link, useStaticQuery, graphql } from 'gatsby';
import { getArticlePath } from '../utils/articlePath';
import OptimizedImage from './OptimizedImage';
import { formatDate } from '../utils/dateUtils';
import { parsePopularArticles, POPULAR_ARTICLES_STORAGE_KEY } from '../utils/popularArticles';

interface RecentArticle {
  id: string;
  frontmatter: {
    slug: string;
    title: string;
    featuredImage: string;
    tags: string[];
    publishedAt: string;
    series?: {
      name: string;
    };
  };
}

interface RecentArticlesData {
  allArticles: {
    nodes: RecentArticle[];
  };
}

const FALLBACK_LIMIT = 5;

const RecentArticles: React.FC = () => {
  const data = useStaticQuery<RecentArticlesData>(graphql`
    query RecentArticlesQuery {
      allArticles: allMarkdownRemark(
        sort: { frontmatter: { publishedAt: DESC } }
        filter: { frontmatter: { slug: { ne: null }, draft: { ne: true } }, fileAbsolutePath: { regex: "//content/(posts|reviews|brewing)/" } }
      ) {
        nodes {
          id
          frontmatter {
            slug
            title
            featuredImage
            tags
            publishedAt
            series {
              name
            }
          }
        }
      }
    }
  `);

  const [popularOrder, setPopularOrder] = useState<Map<string, { score?: number | null }>>(new Map());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const applyPayload = (payload: string | null) => {
      if (!isMounted) return;
      setPopularOrder(parsePopularArticles(payload));
    };

    if (typeof window === 'undefined') {
      setIsLoading(false);
      return () => {
        isMounted = false;
      };
    }

    const cached = window.localStorage.getItem(POPULAR_ARTICLES_STORAGE_KEY);

    fetch('/data/popular-articles.json')
      .then((response) => (response.ok ? response.text() : null))
      .then((payload) => {
        if (!isMounted) return;
        if (payload) {
          window.localStorage.setItem(POPULAR_ARTICLES_STORAGE_KEY, payload);
          applyPayload(payload);
        } else if (cached) {
          applyPayload(cached);
        }
        setIsLoading(false);
      })
      .catch(() => {
        if (!isMounted) return;
        if (cached) {
          applyPayload(cached);
        }
        setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const articles = useMemo(() => {
    const allArticles = data.allArticles.nodes;

    if (popularOrder.size === 0) {
      return allArticles.slice(0, FALLBACK_LIMIT);
    }

    const articlesByPath = new Map(
      allArticles.map((article) => {
        const isReview = article.frontmatter.tags?.some((tag) => tag.toLowerCase() === 'reviews') ?? false;
        const isBrewing = article.frontmatter.tags?.some((tag) => tag.toLowerCase() === 'brewing') ?? false;
        const path = getArticlePath(article.frontmatter.slug, !!article.frontmatter.series?.name, isReview, isBrewing);
        return [path, article] as const;
      })
    );

    const rankedArticles = Array.from(popularOrder.entries())
      .map(([path, metrics]) => ({ article: articlesByPath.get(path), score: metrics.score ?? 0 }))
      .filter((entry): entry is { article: RecentArticle; score: number } => Boolean(entry.article))
      .sort((a, b) => b.score - a.score)
      .slice(0, FALLBACK_LIMIT)
      .map((entry) => entry.article);

    if (rankedArticles.length >= FALLBACK_LIMIT) {
      return rankedArticles;
    }

    const rankedIds = new Set(rankedArticles.map((article) => article.id));
    const fallbackArticles = allArticles
      .filter((article) => !rankedIds.has(article.id))
      .slice(0, FALLBACK_LIMIT - rankedArticles.length);

    return [...rankedArticles, ...fallbackArticles];
  }, [data.allArticles.nodes, popularOrder]);

  return (
    <div className="widget hm-sidebar-posts">
      <h3 className="widget-title">Popular</h3>
      {isLoading ? null : articles.map((article) => {
        const isReview = article.frontmatter.tags?.some((t) => t.toLowerCase() === 'reviews') ?? false;
        const isBrewing = article.frontmatter.tags?.some((t) => t.toLowerCase() === 'brewing') ?? false;
        const articlePath = getArticlePath(article.frontmatter.slug, !!article.frontmatter.series?.name, isReview, isBrewing);
        return (
          <article key={article.id} className="hms-post">
            <div className="hms-thumb">
              <Link to={articlePath}>
                <OptimizedImage
                  src={article.frontmatter.featuredImage}
                  alt={article.frontmatter.title}
                  className="attachment-thumbnail size-thumbnail wp-post-image"
                />
              </Link>
            </div>
            <div className="hms-details">
              <h4 className="hms-title">
                <Link to={articlePath}>{article.frontmatter.title}</Link>
              </h4>
              <span className="hms-date">
                {formatDate(article.frontmatter.publishedAt)}
              </span>
            </div>
          </article>
        );
      })}
    </div>
  );
};

export default RecentArticles;

