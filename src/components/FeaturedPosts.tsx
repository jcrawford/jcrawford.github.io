import React from 'react';
import FeaturedSlider, { FeaturedArticle } from './FeaturedSlider';
import FeaturedHighlight, { HighlightedArticle } from './FeaturedHighlight';

interface FeaturedPostsProps {
  sliderArticles: FeaturedArticle[];
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
