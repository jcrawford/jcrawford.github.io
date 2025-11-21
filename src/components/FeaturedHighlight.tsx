import React from 'react';
import HighlightedPost from './HighlightedPost';

interface HighlightedArticle {
  slug: string;
  title: string;
  featuredImage: string;
  isSeries: boolean;
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
          isSeries={article.isSeries}
        />
      ))}
    </div>
  );
};

export default FeaturedHighlight;

