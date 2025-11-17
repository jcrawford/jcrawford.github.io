import React, { useState } from 'react';
import { Link } from 'gatsby';
import OptimizedImage from './OptimizedImage';

interface FeaturedArticle {
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

interface FeaturedSliderProps {
  articles: FeaturedArticle[];
}

const FeaturedSlider: React.FC<FeaturedSliderProps> = ({ articles }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const goToPrevious = () => {
    setCurrentSlide((prev) => 
      prev === 0 ? articles.length - 1 : prev - 1
    );
  };

  const goToNext = () => {
    setCurrentSlide((prev) => (prev + 1) % articles.length);
  };

  if (articles.length === 0) {
    return null;
  }

  const currentArticle = articles[currentSlide];

  return (
    <div className="hm-swiper hm-slider">
      <div className="hm-swiper-wrapper">
        <div className="hm-swiper-slide">
          <div className="hm-slide-holder">
            <div className="hm-slide-image">
              <OptimizedImage 
                src={currentArticle.featuredImage} 
                alt={currentArticle.title}
                loading="eager"
              />
            </div>
            <div className="hm-fp-overlay">
              <Link 
                className="hm-fp-link-overlay" 
                to={`/articles/${currentArticle.slug}`}
                aria-label={currentArticle.title}
              />
            </div>
            <div className="hm-slide-content">
              <div className="hm-slider-details-container hmfpwmeta">
                <h3 className="hm-slider-title">
                  <Link to={`/articles/${currentArticle.slug}`}>
                    {currentArticle.title}
                  </Link>
                </h3>
              </div>
            </div>
          </div>
        </div>
      </div>

      {articles.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className="hm-slider-nav hm-slider-prev"
            aria-label="Previous slide"
          >
            ‹
          </button>
          
          <button
            onClick={goToNext}
            className="hm-slider-nav hm-slider-next"
            aria-label="Next slide"
          >
            ›
          </button>
          
          <div className="hm-slider-pagination">
            {articles.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`hm-slider-dot ${
                  index === currentSlide ? 'active' : ''
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default FeaturedSlider;

