/**
 * Recommendations Slider Component
 * 
 * Displays LinkedIn recommendations in a navigable carousel/slider.
 * Uses Embla Carousel for smooth scrolling and navigation.
 */

import React, { useCallback, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { useIntersectionObserver } from '../../hooks/useIntersectionObserver';
import type { Recommendation } from '../../types/resume';
import InitialsAvatar from './InitialsAvatar';

interface RecommendationsSliderProps {
  recommendations: Recommendation[];
  sourceURL?: string;
}

const RecommendationsSlider: React.FC<RecommendationsSliderProps> = ({
  recommendations,
  sourceURL,
}) => {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: 'start',
    slidesToScroll: 1,
  });

  // Track which images failed to load
  const [imageErrors, setImageErrors] = useState<Set<number>>(new Set());
  
  // Add intersection observer for fade-in animation
  const { ref, isVisible } = useIntersectionObserver();

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  // Don't render if no recommendations
  if (!recommendations || recommendations.length === 0) {
    return null;
  }

  /**
   * Generate photo path from name if not provided
   * Converts "John Doe" to "john-doe.jpg"
   */
  const getPhotoPath = (rec: Recommendation): string => {
    if (rec.photoPath) {
      return rec.photoPath;
    }
    
    // Generate from name: "John Doe" -> "john-doe.jpg"
    const filename = rec.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    
    return `/images/resume/recommendations/${filename}.jpg`;
  };

  return (
    <div 
      ref={ref}
      className={`recommendations-slider fade-in-on-scroll ${isVisible ? 'is-visible' : ''}`}
    >
      <div className="recommendations-header">
        <h2 className="resume-section-title">Recommendations</h2>
        {sourceURL && (
          <a
            href={sourceURL}
            target="_blank"
            rel="noopener noreferrer"
            className="recommendations-source-link"
          >
            View on LinkedIn
            <svg className="external-link-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
              />
            </svg>
          </a>
        )}
      </div>

      <div className="recommendations-slider-container">
        <div className="embla" ref={emblaRef}>
          <div className="embla__container">
            {recommendations.map((recommendation, index) => (
              <div key={index} className="embla__slide">
                <div className="recommendation-card">
                  <div className="recommendation-quote">
                    <svg className="quote-icon" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M6 17h3l2-4V7H5v6h3zm8 0h3l2-4V7h-6v6h3z" />
                    </svg>
                    <p className="recommendation-text">{recommendation.quote}</p>
                  </div>
                  <div className="recommendation-author">
                    <div className="author-photo-container">
                      {!imageErrors.has(index) ? (
                        <img
                          src={getPhotoPath(recommendation)}
                          alt={recommendation.name}
                          className="author-photo"
                          onError={() => {
                            setImageErrors(prev => new Set(prev).add(index));
                          }}
                        />
                      ) : (
                        <InitialsAvatar name={recommendation.name} size={60} />
                      )}
                    </div>
                    <div className="author-info">
                      <div className="author-name">{recommendation.name}</div>
                      <div className="author-title">{recommendation.title}</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {recommendations.length > 1 && (
          <div className="embla__controls">
            <button
              className="embla__button embla__button--prev"
              onClick={scrollPrev}
              aria-label="Previous recommendation"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            <button
              className="embla__button embla__button--next"
              onClick={scrollNext}
              aria-label="Next recommendation"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecommendationsSlider;

