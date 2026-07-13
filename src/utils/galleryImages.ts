/**
 * Gallery image responsive utilities.
 *
 * Pre-generated variants live alongside originals as:
 *   {base}_480w.jpg, {base}_480w.webp, {base}_768w.jpg, etc.
 *
 * These helpers build srcSet arrays for react-photo-album and
 * yet-another-react-lightbox, which expect structured image objects.
 */

const WIDTHS = [480, 768, 1200, 1920];

interface ResponsiveImage {
  src: string;
  width: number;
  height: number;
}

/**
 * Given an original image src like `/images/galleries/album/photo.jpg`
 * and its intrinsic dimensions, returns an array of responsive variants
 * suitable for react-photo-album's `srcSet` prop.
 *
 * Only includes variants that are smaller than or equal to the original
 * width (no upscaling).
 */
export function buildSrcSetVariants(
  src: string,
  originalWidth: number,
  originalHeight: number
): ResponsiveImage[] {
  const dotIndex = src.lastIndexOf('.');
  if (dotIndex === -1) return [];

  const base = src.substring(0, dotIndex);
  const ext = src.substring(dotIndex + 1);

  const variants: ResponsiveImage[] = [];

  for (const width of WIDTHS) {
    if (width > originalWidth) break;

    const height = Math.round((originalHeight / originalWidth) * width);
    variants.push({
      src: `${base}_${width}w.${ext}`,
      width,
      height,
    });
  }

  // Always include the original as the largest variant
  if (variants.length === 0 || variants[variants.length - 1].width < originalWidth) {
    variants.push({
      src,
      width: originalWidth,
      height: originalHeight,
    });
  }

  return variants;
}

/**
 * Build a WebP srcSet array for even better compression on supporting browsers.
 * react-photo-album's Photo type supports `srcSet` as an array of Image objects.
 */
export function buildWebpSrcSetVariants(
  src: string,
  originalWidth: number,
  originalHeight: number
): ResponsiveImage[] {
  const dotIndex = src.lastIndexOf('.');
  if (dotIndex === -1) return [];

  const base = src.substring(0, dotIndex);

  const variants: ResponsiveImage[] = [];

  for (const width of WIDTHS) {
    if (width > originalWidth) break;

    const height = Math.round((originalHeight / originalWidth) * width);
    variants.push({
      src: `${base}_${width}w.webp`,
      width,
      height,
    });
  }

  return variants;
}

/**
 * Sizes attribute for the gallery grid.
 * On mobile the gallery takes nearly the full viewport width.
 * On desktop it's constrained by the content container.
 */
export const GALLERY_SIZES = {
  size: '100vw',
  sizes: [
    { viewport: '(max-width: 768px)', size: 'calc(100vw - 32px)' },
    { viewport: '(max-width: 1200px)', size: 'calc(100vw - 64px)' },
    { viewport: '', size: '1200px' },
  ],
};