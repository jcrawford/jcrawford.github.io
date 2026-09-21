import React from 'react';
import { Link } from 'gatsby';
import { formatDate } from '../utils/dateUtils';
import { truncateText } from '../utils/textUtils';
import { getArticlePath } from '../utils/articlePath';
import { hasTag, tagMatches, getTagPath } from '../utils/tagUtils';
import OptimizedImage from './OptimizedImage';
import StarRating from './StarRating';
import DraftBadge from './DraftBadge';
import { ClockIcon } from '../utils/icons';

interface ArticleCardProps {
  slug: string;
  title: string;
  excerpt: string | null;
  featuredImage: string;
  tags: string[] | null;
  publishedAt: string;
  readingTime: number;
  isSeries?: boolean;
  seriesName?: string;
  rating?: number;
  isDraft?: boolean;
}

const ArticleCard: React.FC<ArticleCardProps> = ({
  slug,
  title,
  excerpt,
  featuredImage,
  tags,
  publishedAt,
  readingTime,
  isSeries,
  seriesName,
  rating,
  isDraft,
}) => {
  const isReview = hasTag(tags || [], 'reviews');
  const isBrewing = hasTag(tags || [], 'brewing');
  const articlePath = getArticlePath(slug, isSeries, isReview, isBrewing, seriesName);
  
  // Get the first tag that's not "family" or "featured" for display
  const primaryTag = (tags || []).find(tag => !tagMatches(tag, 'family') && !tagMatches(tag, 'featured')) || (tags || [])[0];
  
  return (
    <article className="hm-article-card">
      <Link to={articlePath} className="hm-article-card-image" target="_blank" rel="noopener noreferrer">
        <span className="hm-article-card-image-main">
          <OptimizedImage 
            src={featuredImage} 
            alt={title}
            loading="lazy"
            sizes="(max-width: 768px) 100vw, 400px"
          />
        </span>
      </Link>
      
      <div className="hm-article-card-content">
        {primaryTag && (
          <Link 
            to={getTagPath(primaryTag)}
            className="hm-article-card-category"
            target="_blank"
            rel="noopener noreferrer"
          >
            {primaryTag}
          </Link>
        )}
        
        <h2 className="hm-article-card-title">
          <Link to={articlePath} target="_blank" rel="noopener noreferrer">
            {title}
            {isDraft && <DraftBadge />}
          </Link>
        </h2>
        
        <p className="hm-article-card-excerpt">
          {truncateText(excerpt || '', 150)}
        </p>

        {isReview && rating != null && (
          <div className="hm-article-card-rating">
            <StarRating rating={rating} size={14} showScore={false} color="#FFC107" />
          </div>
        )}
        
        <div className="hm-article-card-meta">
          <span>
            <time dateTime={publishedAt}>
              {formatDate(publishedAt)}
            </time>
          </span>
          <span>•</span>
          <span className="hm-article-card-reading-time">
            <ClockIcon size={14} />
            {readingTime} min
          </span>
        </div>
      </div>
    </article>
  );
};

export default ArticleCard;

