import React from 'react';

interface PostMediaImageProps {
  src: string;
  alt: string;
  className?: string;
}

/**
 * Single-size image component for post media.
 * Post images are displayed in one context only, so we generate and serve
 * exactly one 760px variant (WebP with JPG fallback) instead of a full
 * responsive srcset.
 */
const PostMediaImage: React.FC<PostMediaImageProps> = ({ src, alt, className }) => {
  if (!src) return null;

  // Strip query strings and existing extension for variant base
  const base = src.split('?')[0];
  const lastDot = base.lastIndexOf('.');
  const variantBase = lastDot > 0 ? base.slice(0, lastDot) : base;

  const webpSrc = `${variantBase}_760w.webp`;
  const jpgSrc = `${variantBase}_760w.jpg`;

  return (
    <picture className={className}>
      <source srcSet={webpSrc} type="image/webp" />
      <img src={jpgSrc} alt={alt} loading="lazy" decoding="async" />
    </picture>
  );
};

export default PostMediaImage;
