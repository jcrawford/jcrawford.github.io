import React from 'react';
import FeaturedSlider from './FeaturedSlider';
import FeaturedHighlight from './FeaturedHighlight';

interface SliderArticle {
  slug: string;
  title: string;
  excerpt: string;
  featuredImage: string;
  category: string;
  categoryName: string;
  publishedAt: string;
  author: string;
  authorName: string;
  isSeries: boolean;
}

interface HighlightedArticle {
  slug: string;
  title: string;
  featuredImage: string;
  isSeries: boolean;
}

interface FeaturedPostsProps {
  sliderArticles: SliderArticle[];
  highlightedArticles: HighlightedArticle[];
}

const FeaturedPosts: React.FC<FeaturedPostsProps> = ({
  sliderArticles,
  highlightedArticles,
}) => {
  return (
    <div className="hm-fp1">
      <div className="hm-fp1-left">
        <FeaturedSlider articles={sliderArticles} />
      </div>
      <div className="hm-fp1-right">
        <FeaturedHighlight articles={highlightedArticles} />
      </div>
    </div>
  );
};

export default FeaturedPosts;

