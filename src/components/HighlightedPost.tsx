import React from 'react';
import { Link } from 'gatsby';
import { getArticlePath } from '../utils/articlePath';
import OptimizedImage from './OptimizedImage';

interface HighlightedPostProps {
  slug: string;
  title: string;
  featuredImage: string;
  isSeries?: boolean;
}

const HighlightedPost: React.FC<HighlightedPostProps> = ({
  slug,
  title,
  featuredImage,
  isSeries,
}) => {
  const articlePath = getArticlePath(slug, isSeries);
  
  return (
    <div className="hm-highlighted-post">
      <div className="hmhp-inner">
        <div className="hmhp-thumb">
          <OptimizedImage 
            src={featuredImage} 
            alt={title}
            loading="eager"
            className="hm-fpw-img"
          />
        </div>
        <div className="hm-fp-overlay">
          <Link className="hm-fp-link-overlay" to={articlePath} aria-label={title} />
        </div>
        <div className="hmhp-content">
          <div className="hmhp-details-container">
            <h3 className="hmhp-title">{title}</h3>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HighlightedPost;

