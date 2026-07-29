import React from 'react';
import { Link } from 'gatsby';
import { getArticlePath } from '../utils/articlePath';
import OptimizedImage from './OptimizedImage';

interface HighlightedPostProps {
  slug: string;
  title: string;
  featuredImage: string;
  tags: string[];
  isSeries?: boolean;
}

const HighlightedPost: React.FC<HighlightedPostProps> = ({
  slug,
  title,
  featuredImage,
  tags,
  isSeries,
}) => {
  const isReview = tags.some(t => t.toLowerCase() === 'reviews');
  const isBrewing = tags.some(t => t.toLowerCase() === 'brewing');
  const articlePath = getArticlePath(slug, isSeries, isReview, isBrewing);
  
  return (
    <div className="hm-highlighted-post">
      <div className="hmhp-inner">
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

