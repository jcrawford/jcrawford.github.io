import React, { useState } from 'react';
import OptimizedImage from './OptimizedImage';

interface SpinnerImage {
  src: string;
  alt: string;
  caption?: string;
}

interface ImageSpinnerProps {
  images: SpinnerImage[];
}

function isVideo(src: string): boolean {
  return /\.(mp4|mov|webm|ogg)$/i.test(src);
}

function isYouTube(src: string): boolean {
  return src.startsWith('youtube:') || src.startsWith('https://www.youtube.com/') || src.startsWith('https://youtu.be/');
}

function getYouTubeId(src: string): string {
  if (src.startsWith('youtube:')) return src.replace('youtube:', '');
  const match = src.match(/(?:youtube\.com\/embed\/|youtu\.be\/|v=)([\w-]{11})/);
  return match ? match[1] : '';
}

const ImageSpinner: React.FC<ImageSpinnerProps> = ({ images }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const goToPrevious = () => {
    setCurrentSlide((prev) =>
      prev === 0 ? images.length - 1 : prev - 1
    );
  };

  const goToNext = () => {
    setCurrentSlide((prev) => (prev + 1) % images.length);
  };

  if (!images || images.length === 0) {
    return null;
  }

  const currentImage = images[currentSlide];

  return (
    <div className="hm-swiper hm-slider">
      <div className="hm-swiper-wrapper">
        <div className="hm-swiper-slide">
          <div className="hm-slide-holder">
            <div className="hm-slide-image" key={currentSlide}>
              {isYouTube(currentImage.src) ? (
                <iframe
                  width="560"
                  height="315"
                  src={`https://www.youtube.com/embed/${getYouTubeId(currentImage.src)}`}
                  title={currentImage.alt}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  style={{ width: '100%', height: '100%', borderRadius: '4px', border: 'none', display: 'block' }}
                />
              ) : isVideo(currentImage.src) ? (
                <video
                  src={currentImage.src}
                  controls
                  muted
                  playsInline
                  preload="metadata"
                  aria-label={currentImage.alt}
                  style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '4px' }}
                />
              ) : (
                <OptimizedImage
                  src={currentImage.src}
                  alt={currentImage.alt}
                  loading="eager"
                />
              )}
            </div>
            {currentImage.caption && (
              <div className="hm-fp-overlay">
                <p className="hm-slide-caption">{currentImage.caption}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {images.length > 1 && (
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
            {images.map((_, index) => (
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

export default ImageSpinner;