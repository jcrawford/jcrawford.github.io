import React from 'react';
import HighlightedPost from './HighlightedPost';

export interface HighlightedArticle {
  slug: string;
  title: string;
  excerpt?: string;
  featuredImage: string;
  tags: string[];
  type?: string;
  publishedAt?: string;
  readingTime?: number;
  isSeries?: boolean;
  seriesName?: string;
  isDraft?: boolean;
}

interface FeaturedHighlightProps {
  articles: HighlightedArticle[];
}

const FeaturedHighlight: React.FC<FeaturedHighlightProps> = ({ articles }) => {
  return (
    <div className="hm-highlighted-posts">
      {articles.map((article) => (
        <HighlightedPost
          key={article.slug}
          title={article.title}
          slug={article.slug}
          featuredImage={article.featuredImage}
          tags={article.tags}
          isSeries={article.isSeries}
          seriesName={article.seriesName}
          isDraft={article.isDraft}
        />
      ))}
    </div>
  );
};

export default FeaturedHighlight;
