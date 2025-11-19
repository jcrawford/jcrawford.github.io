import React from 'react';
import { Link } from 'gatsby';
import { formatDate } from '../utils/dateUtils';
import { truncateText } from '../utils/textUtils';
import { getArticlePath } from '../utils/articlePath';
import OptimizedImage from './OptimizedImage';

interface ArticleCardProps {
  slug: string;
  title: string;
  excerpt: string;
  featuredImage: string;
  category: string;
  categoryName: string;
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
  category,
  categoryName,
  publishedAt,
  author,
  authorName,
  isSeries,
}) => {
  const articlePath = getArticlePath(slug, isSeries);
  
  return (
    <article className="hm-article-card">
      <Link to={articlePath} className="hm-article-card-image">
        <OptimizedImage 
          src={featuredImage} 
          alt={title}
          loading="lazy"
        />
      </Link>
      
      <div className="hm-article-card-content">
        <Link 
          to={`/tag/${category}`}
          className="hm-article-card-category"
        >
          {categoryName}
        </Link>
        
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

