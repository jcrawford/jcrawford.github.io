import React from 'react';
import { Link } from 'gatsby';
import { formatDate } from '../utils/dateUtils';
import { truncateText } from '../utils/textUtils';
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
}) => {
  return (
    <article className="hm-article-card">
      <Link to={`/articles/${slug}`} className="hm-article-card-image">
        <OptimizedImage 
          src={featuredImage} 
          alt={title}
          loading="lazy"
        />
      </Link>
      
      <div className="hm-article-card-content">
        <Link 
          to={`/category/${category}`}
          className="hm-article-card-category"
        >
          {categoryName}
        </Link>
        
        <h2 className="hm-article-card-title">
          <Link to={`/articles/${slug}`}>
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

