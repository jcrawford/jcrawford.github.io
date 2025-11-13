/**
 * Series Widget Component
 * Displays article series navigation with table of contents, references, and attachments
 */

import React from 'react';
import { Link } from 'gatsby';
import type { SeriesMetadata, SeriesArticle } from '../types';
import '../styles/series-widget.css';

export interface SeriesWidgetProps {
  /** Series metadata for current article */
  series: SeriesMetadata;
  
  /** Current article slug */
  currentSlug: string;
  
  /** All articles in this series (for Table of Contents) */
  seriesArticles: SeriesArticle[];
}

/**
 * SeriesWidget displays series navigation, table of contents, references, and attachments
 */
export const SeriesWidget: React.FC<SeriesWidgetProps> = ({
  series,
  currentSlug,
  seriesArticles,
}) => {
  // Sort articles by order (if present) or publishedAt date
  const sortedArticles = [...seriesArticles].sort((a, b) => {
    // If both have order, use that
    if (a.order !== undefined && b.order !== undefined) {
      return a.order - b.order;
    }
    
    // If only one has order, it comes first
    if (a.order !== undefined) return -1;
    if (b.order !== undefined) return 1;
    
    // Otherwise, sort by published date
    return new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime();
  });

  // Helper function to strip series name from title
  const stripSeriesName = (title: string): string => {
    const patterns = [
      `${series.name}: `,
      `${series.name} - `,
      `${series.name} – `,
      `${series.name}: `,
    ];
    
    let cleanTitle = title;
    for (const pattern of patterns) {
      if (cleanTitle.startsWith(pattern)) {
        cleanTitle = cleanTitle.substring(pattern.length);
        break;
      }
    }
    
    return cleanTitle;
  };

  return (
    <aside className="series-widget" aria-label="Series Navigation">
      {/* Header */}
      <header className="series-widget__header">
        <h2 className="series-widget__title">Part of a Series</h2>
        <p className="series-widget__series-name">{series.name}</p>
      </header>

      {/* Table of Contents */}
      {sortedArticles.length > 0 && (
        <nav className="series-widget__toc" aria-label="Series Table of Contents">
          <h3 className="series-widget__toc-title">Table of Contents</h3>
          <ol className="series-widget__toc-list">
            {sortedArticles.map((article, index) => {
              const isCurrentArticle = article.slug === currentSlug;
              const displayTitle = stripSeriesName(article.title);
              
              return (
                <li key={article.slug} className="series-widget__toc-item">
                  <span className="series-widget__toc-number">{index + 1}.</span>
                  {isCurrentArticle ? (
                    <span 
                      className="series-widget__toc-item--current"
                      aria-current="page"
                    >
                      {displayTitle}
                    </span>
                  ) : (
                    <Link
                      to={`/articles/${article.slug}`}
                      className="series-widget__toc-link"
                    >
                      {displayTitle}
                    </Link>
                  )}
                </li>
              );
            })}
          </ol>
        </nav>
      )}

      {/* References */}
      {series.references && series.references.length > 0 && (
        <section 
          className="series-widget__references" 
          aria-label="Series References"
        >
          <h3 className="series-widget__references-title">References</h3>
          <ol className="series-widget__references-list">
            {series.references.map((reference, index) => (
              <li key={index} className="series-widget__reference-item">
                <span className="series-widget__reference-number">{index + 1}.</span>
                <a
                  href={reference.url}
                  className="series-widget__reference-link"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {reference.title || reference.url}
                </a>
              </li>
            ))}
          </ol>
        </section>
      )}

      {/* Attachments */}
      {series.attachments && series.attachments.length > 0 && (
        <section 
          className="series-widget__attachments" 
          aria-label="Series Attachments"
        >
          <h3 className="series-widget__attachments-title">Attachments</h3>
          <ol className="series-widget__attachments-list">
            {series.attachments.map((attachment, index) => (
              <li key={index} className="series-widget__attachment-item">
                <span className="series-widget__attachment-number">{index + 1}.</span>
                <a
                  href={attachment.filename}
                  className="series-widget__attachment-link"
                  download
                >
                  {attachment.title || attachment.filename.split('/').pop() || attachment.filename}
                </a>
              </li>
            ))}
          </ol>
        </section>
      )}
    </aside>
  );
};

export default SeriesWidget;

