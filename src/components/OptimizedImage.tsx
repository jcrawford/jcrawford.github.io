import React from 'react';
import { useStaticQuery, graphql } from 'gatsby';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  loading?: 'lazy' | 'eager';
  sizes?: string;
  fetchpriority?: 'high' | 'low' | 'auto';
}

const DEFAULT_SIZES_ATTR = '(max-width: 768px) 100vw, (max-width: 1200px) 65vw, 1200px';

const OPTIMIZED_PATHS = ['/images/content/', '/images/galleries/'];

function hasVariants(src: string): boolean {
  return OPTIMIZED_PATHS.some((p) => src.startsWith(p));
}

function generateSrcSet(src: string, extension: string, widths: number[]): string | null {
  const dotIndex = src.lastIndexOf('.');
  if (dotIndex === -1) return null;

  const base = src.substring(0, dotIndex);
  const variants: string[] = [];

  for (const size of widths) {
    variants.push(`${base}_${size}w.${extension} ${size}w`);
  }

  return variants.length > 0 ? variants.join(', ') : null;
}

const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  className,
  loading = 'lazy',
  sizes,
  fetchpriority,
}) => {
  if (!src) return null;
  const dotIndex = src.lastIndexOf('.');
  const base = dotIndex !== -1 ? src.substring(0, dotIndex) : src;
  const sizesAttr = sizes || DEFAULT_SIZES_ATTR;

  const data = useStaticQuery(graphql`
    query ImageVariantManifest {
      allImageVariantsJson {
        nodes {
          src
          widths
        }
      }
    }
  `);

  const entries = data?.allImageVariantsJson?.nodes || [];
  const manifestEntry = entries.find(
    (entry: { src: string; widths: number[] }) => entry.src === src
  );
  const availableWidths = manifestEntry?.widths;

  if (!hasVariants(src) || !availableWidths || availableWidths.length === 0) {
    return (
      <img
        src={src}
        alt={alt}
        className={className}
        loading={loading}
        decoding="async"
        {...(fetchpriority ? { fetchpriority: fetchpriority } : {})}
      />
    );
  }

  const webpSrcSet = generateSrcSet(src, 'webp', availableWidths);
  const jpgSrcSet = generateSrcSet(src, 'jpg', availableWidths);
  const imgFallback = `${base}_${availableWidths[0]}w.jpg`;
  const cacheBust = `?v=${process.env.COMMIT_HASH || Date.now()}`;

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
        src={`${imgFallback}${cacheBust}`}
        alt={alt}
        className={className}
        loading={loading}
        decoding="async"
        {...(fetchpriority ? { fetchpriority: fetchpriority } : {})}
      />
    </picture>
  );
};

export default OptimizedImage;
