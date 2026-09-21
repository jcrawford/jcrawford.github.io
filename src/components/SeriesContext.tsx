/**
 * Series Context Component
 * Displays contextual information about the current article's position in a series
 */

import React from 'react';
import '../styles/series-context.css';

export interface SeriesContextProps {
  /** Series name */
  seriesName: string;
  
  /** Current article's position (order) in the series */
  currentOrder?: number;
  
  /** Total number of articles in the series */
  totalArticles: number;
}

/**
 * SeriesContext displays the article's position within a series
 * Example: "This is part 2 of a 3-part series on Building Better Websites."
 */
export const SeriesContext: React.FC<SeriesContextProps> = ({
  seriesName,
  currentOrder,
  totalArticles,
}) => {
  // Don't render if we don't have enough information
  if (!seriesName || totalArticles === 0) {
    console.warn('SeriesContext: Missing data', { seriesName, currentOrder, totalArticles });
    return null;
  }

  // If we have an explicit order, use it; otherwise don't show specific position
  const positionText = currentOrder
    ? `This is part ${currentOrder} of a ${totalArticles}-part series on ${seriesName}.`
    : `This is part of a ${totalArticles}-part series on ${seriesName}.`;

  return (
    <div className="series-context">
      {positionText}
    </div>
  );
};

export default SeriesContext;

