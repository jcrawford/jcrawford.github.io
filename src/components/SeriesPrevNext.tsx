/**
 * Series Previous/Next Navigation Component
 * Displays navigation buttons for previous and next articles in a series
 */

import React from 'react';
import { Link } from 'gatsby';
import '../styles/series-navigation.css';

export interface SeriesPrevNextProps {
  /** Previous article slug (if exists) */
  prevSlug?: string;
  
  /** Previous article title (if exists) */
  prevTitle?: string;
  
  /** Next article slug (if exists) */
  nextSlug?: string;
  
  /** Next article title (if exists) */
  nextTitle?: string;
  
  /** Position of navigation (top or bottom) */
  position?: 'top' | 'bottom';
  
  /** Series name (to strip from titles) */
  seriesName?: string;
}

/**
 * SeriesPrevNext displays Previous/Next navigation buttons for series articles
 */
export const SeriesPrevNext: React.FC<SeriesPrevNextProps> = ({
  prevSlug,
  prevTitle,
  nextSlug,
  nextTitle,
  position = 'bottom',
  seriesName,
}) => {
  // Don't render if neither prev nor next exists
  if (!prevSlug && !nextSlug) {
    return null;
  }

  // Helper function to strip series name from title
  const stripSeriesName = (title: string | undefined): string => {
    if (!title || !seriesName) return title || '';
    
    // Remove "SeriesName: " or "SeriesName - " prefix
    const patterns = [
      `${seriesName}: `,
      `${seriesName} - `,
      `${seriesName} – `,
      `${seriesName}: `,
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

  const displayPrevTitle = stripSeriesName(prevTitle);
  const displayNextTitle = stripSeriesName(nextTitle);

  return (
    <nav 
      className={`series-navigation series-navigation--${position}`}
      aria-label="Series Navigation"
    >
      {/* Previous Button */}
      {prevSlug && displayPrevTitle ? (
        <Link
          to={`/articles/${prevSlug}`}
          className="series-navigation__button series-navigation__prev"
        >
          <span className="series-navigation__arrow" aria-hidden="true">
            ←
          </span>
          <span className="series-navigation__content">
            <span className="series-navigation__label">Previous</span>
            <span className="series-navigation__title">{displayPrevTitle}</span>
          </span>
        </Link>
      ) : (
        <span className="series-navigation__spacer" aria-hidden="true" />
      )}

      {/* Next Button */}
      {nextSlug && displayNextTitle ? (
        <Link
          to={`/articles/${nextSlug}`}
          className="series-navigation__button series-navigation__next"
        >
          <span className="series-navigation__content">
            <span className="series-navigation__label">Next</span>
            <span className="series-navigation__title">{displayNextTitle}</span>
          </span>
          <span className="series-navigation__arrow" aria-hidden="true">
            →
          </span>
        </Link>
      ) : (
        <span className="series-navigation__spacer" aria-hidden="true" />
      )}
    </nav>
  );
};

export default SeriesPrevNext;

