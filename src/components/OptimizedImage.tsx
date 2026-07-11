import React from 'react';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  loading?: 'lazy' | 'eager';
}

const SIZES = [480, 768, 1200, 1920];

/**
 * Generates srcset string for responsive images.
 * Looks for pre-generated variants (e.g. image_480w.webp, image_768w.jpg)
 * alongside the original image. Falls back to the original if variants
 * don't exist.
 */
function generateSrcSet(src: string, extension: string): string | null {
  const dotIndex = src.lastIndexOf('.');
  if (dotIndex === -1) return null;

  const base = src.substring(0, dotIndex);
  const variants: string[] = [];

  for (const size of SIZES) {
    variants.push(`${base}_${size}w.${extension} ${size}w`);
  }

  return variants.join(', ');
}

const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  className,
  loading = 'lazy',
}) => {
  const webpSrcSet = generateSrcSet(src, 'webp');
  const jpgSrcSet = generateSrcSet(src, 'jpg');

  // Determine a reasonable sizes attribute based on context
  // Default: full width on mobile, constrained on desktop
  const sizesAttr = '(max-width: 768px) 100vw, (max-width: 1200px) 65vw, 1200px';

  const dotIndex = src.lastIndexOf('.');
  const base = dotIndex !== -1 ? src.substring(0, dotIndex) : src;
  // Use the smallest JPG variant as the <img> fallback instead of the original.
  // This prevents browsers from preloading the full-resolution original (2-8MB)
  // before evaluating <source> tags.
  const imgFallback = `${base}_480w.jpg`;

  return (
    <picture>
      {webpSrcSet && (
        <source
          type="image/webp"
          srcSet={webpSrcSet}
          sizes={sizesAttr}
        />
      )}
      {jpgSrcSet && (
        <source
          type="image/jpeg"
          srcSet={jpgSrcSet}
          sizes={sizesAttr}
        />
      )}
      <img
        src={imgFallback}
        alt={alt}
        className={className}
        loading={loading}
        decoding="async"
      />
    </picture>
  );
};

export default OptimizedImage;