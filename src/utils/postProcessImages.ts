/**
 * postProcessImages.ts
 * 
 * Post-processes HTML string to convert <img> tags pointing to /images/content/
 * into responsive <picture> elements with WebP + JPG srcset.
 * 
 * This handles markdown images (which bypass OptimizedImage component) by
 * rewriting the HTML before it's injected via dangerouslySetInnerHTML.
 */

const SIZES = [480, 768, 1200, 1920];
const SIZES_ATTR = '(max-width: 768px) 100vw, (max-width: 1200px) 65vw, 1200px';

function generateSrcSet(src: string, extension: string): string {
  const dotIndex = src.lastIndexOf('.');
  if (dotIndex === -1) return '';
  const base = src.substring(0, dotIndex);
  return SIZES.map(s => `${base}_${s}w.${extension} ${s}w`).join(', ');
}

/**
 * Converts an <img> tag to a <picture> element with responsive sources.
 * Only processes images with src starting with /images/content/
 */
function imgToPicture(imgTag: string): string {
  // Extract src
  const srcMatch = imgTag.match(/src=["']([^"']+)["']/);
  if (!srcMatch) return imgTag;
  const src = srcMatch[1];
  
  // Only process content images
  if (!src.startsWith('/images/content/')) return imgTag;
  
  // Extract alt
  const altMatch = imgTag.match(/alt=["']([^"']*)["']/);
  const alt = altMatch ? altMatch[1] : '';
  
  // Extract title
  const titleMatch = imgTag.match(/title=["']([^"']*)["']/);
  const title = titleMatch ? titleMatch[1] : '';
  
  // Extract other attributes (class, etc) but skip src, alt, title
  const classMatch = imgTag.match(/class=["']([^"']*)["']/);
  const className = classMatch ? classMatch[1] : '';
  
  const dotIndex = src.lastIndexOf('.');
  if (dotIndex === -1) return imgTag;
  const base = src.substring(0, dotIndex);
  
  const webpSrcSet = generateSrcSet(src, 'webp');
  const jpgSrcSet = generateSrcSet(src, 'jpg');
  const imgFallback = `${base}_480w.jpg`;
  
  const titleAttr = title ? ` title="${title}"` : '';
  const classAttr = className ? ` class="${className}"` : '';
  
  return `<picture>${webpSrcSet ? `<source type="image/webp" srcset="${webpSrcSet}" sizes="${SIZES_ATTR}"/>` : ''}<source type="image/jpeg" srcset="${jpgSrcSet}" sizes="${SIZES_ATTR}"/><img src="${imgFallback}" alt="${alt}"${titleAttr}${classAttr} loading="lazy" decoding="async"/></picture>`;
}

/**
 * Post-processes HTML to convert content images to responsive <picture> elements.
 */
export function postProcessImages(html: string): string {
  // Match all <img> tags that have src starting with /images/content/
  return html.replace(/<img[^>]+>/g, (match) => {
    const srcMatch = match.match(/src=["']([^"']+)["']/);
    if (srcMatch && srcMatch[1].startsWith('/images/content/')) {
      return imgToPicture(match);
    }
    return match;
  });
}