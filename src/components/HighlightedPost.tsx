import React from 'react';
import { Link } from 'gatsby';
import { getArticlePath } from '../utils/articlePath';
import OptimizedImage from './OptimizedImage';
import DraftBadge from './DraftBadge';

interface HighlightedPostProps {
  slug: string;
  title: string;
  featuredImage: string;
  tags: string[];
  isSeries?: boolean;
  seriesName?: string;
  isDraft?: boolean;
}

const HighlightedPost: React.FC<HighlightedPostProps> = ({
  slug,
  title,
  featuredImage,
  tags,
  isSeries,
  seriesName,
  isDraft,
}) => {
  const isReview = tags.some(t => t.toLowerCase() === 'reviews');
  const isBrewing = tags.some(t => t.toLowerCase() === 'brewing');
  const articlePath = getArticlePath(slug, isSeries, isReview, isBrewing, seriesName);
  
  return (
    <div className="hm-highlighted-post">
      <div className="hmhp-inner">
        {isDraft && (
          <div className="hmhp-draft-badge">
            <DraftBadge size="md" />
          </div>
        )}
        <div className="hmhp-thumb">
          <OptimizedImage 
            src={featuredImage} 
            alt={title}
            loading="lazy"
            sizes="(max-width: 768px) 50vw, 280px"
            className="hm-fpw-img"
          />
        </div>
        <Link className="hm-fp-link-overlay" to={articlePath} aria-label={title} />
      </div>
    </div>
  );
};

export default HighlightedPost;

