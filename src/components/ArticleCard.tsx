import React from 'react';
import { Link } from 'gatsby';
import { formatDate } from '../utils/dateUtils';
import { truncateText } from '../utils/textUtils';
import { getArticlePath } from '../utils/articlePath';
import { hasTag, normalizeTagSlug, tagMatches } from '../utils/tagUtils';
import OptimizedImage from './OptimizedImage';

interface ArticleCardProps {
  slug: string;
  title: string;
  excerpt: string;
  featuredImage: string;
  tags: string[];
  publishedAt: string;
  author: string;
  authorName: string;
  isSeries?: boolean;
}

const ArticleCard: React.FC<ArticleCardProps> = ({
  slug,
  title,
  excerpt,
  featuredImage,
  tags,
  publishedAt,
  author,
  authorName,
  isSeries,
}) => {
  const isReview = hasTag(tags, 'reviews');
  const articlePath = getArticlePath(slug, isSeries, isReview);
  
  // Get the first tag that's not "family" or "featured" for display
  const primaryTag = tags.find(tag => !tagMatches(tag, 'family') && !tagMatches(tag, 'featured')) || tags[0];
  
  return (
    <article className="hm-article-card">
      <Link to={articlePath} className="hm-article-card-image">
        <span className="hm-article-card-image-bg" aria-hidden="true">
          <OptimizedImage 
            src={featuredImage} 
            alt=""
            loading="lazy"
          />
        </span>
        <span className="hm-article-card-image-main">
          <OptimizedImage 
            src={featuredImage} 
            alt={title}
            loading="lazy"
          />
        </span>
      </Link>
      
      <div className="hm-article-card-content">
        {primaryTag && (
          <Link 
            to={`/tag/${normalizeTagSlug(primaryTag)}`}
            className="hm-article-card-category"
          >
            {primaryTag}
          </Link>
        )}
        
        <h2 className="hm-article-card-title">
          <Link to={articlePath}>
            {title}
          </Link>
        </h2>
        
        <p className="hm-article-card-excerpt">
          {truncateText(excerpt, 150)}
        </p>
        
        <div className="hm-article-card-meta">
          <span>
            <Link to={`/author/${author}`}>
              {authorName}
            </Link>
          </span>
          <span>•</span>
          <span>
            <time dateTime={publishedAt}>
              {formatDate(publishedAt)}
            </time>
          </span>
        </div>
      </div>
    </article>
  );
};

export default ArticleCard;

