import React from 'react';
import SeriesWidget from './SeriesWidget';
import TagCloud from './TagCloud';
import RecentArticles from './RecentArticles';
import type { SeriesMetadata, SeriesArticle } from '../types';

interface SidebarProps {
  /** Current article slug (for series widget) */
  currentSlug?: string;
  
  /** Series metadata (if article is part of a series) */
  series?: SeriesMetadata;
  
  /** All articles in the series (for table of contents) */
  seriesArticles?: SeriesArticle[];
}

const Sidebar: React.FC<SidebarProps> = ({ 
  currentSlug,
  series, 
  seriesArticles = [] 
}) => {
  // If this is a series article, ONLY show the series widget
  if (series && currentSlug) {
    return (
      <aside id="secondary" className="hm-sidebar">
        <SeriesWidget 
          series={series}
          currentSlug={currentSlug}
          seriesArticles={seriesArticles}
        />
      </aside>
    );
  }

  // Otherwise, show regular sidebar widgets
  return (
    <aside id="secondary" className="hm-sidebar">
      <RecentArticles />
      <TagCloud />
    </aside>
  );
};

export default Sidebar;
