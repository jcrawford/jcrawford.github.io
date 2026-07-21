import React from 'react';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  loading?: 'lazy' | 'eager';
  sizes?: string;
}

const SIZES = [480, 768, 1200, 1920];
const DEFAULT_SIZES_ATTR = '(max-width: 768px) 100vw, (max-width: 1200px) 65vw, 1200px';

// Directories where pre-generated responsive variants exist
const OPTIMIZED_PATHS = ['/images/content/', '/images/galleries/'];

function hasVariants(src: string): boolean {
  return OPTIMIZED_PATHS.some((p) => src.startsWith(p));
}

/**
 * Generates srcset string for responsive images.
 * Looks for pre-generated variants (e.g. image_480w.webp, image_768w.jpg)
 * alongside the original image.
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
  sizes,
}) => {
  if (!src) return null;
  const dotIndex = src.lastIndexOf('.');
  const base = dotIndex !== -1 ? src.substring(0, dotIndex) : src;
  const sizesAttr = sizes || DEFAULT_SIZES_ATTR;

  // If variants exist for this path, use <picture> with responsive srcset
  // and use the smallest JPG variant as the <img> fallback.
  // If variants don't exist, use a plain <img> with the original src.
  if (hasVariants(src)) {
    const webpSrcSet = generateSrcSet(src, 'webp');
    const jpgSrcSet = generateSrcSet(src, 'jpg');
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
  }

  // No variants — use plain <img> with original src
  return (
    <img
      src={src}
      alt={alt}
      className={className}
      loading={loading}
      decoding="async"
    />
  );
};

export default OptimizedImage;