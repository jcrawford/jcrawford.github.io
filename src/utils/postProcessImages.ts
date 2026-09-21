/**
 * postProcessImages.ts
 * 
 * Post-processes HTML string to convert <img> tags pointing to /images/content/
 * into responsive <picture> elements with WebP + JPG srcset.
 * 
 * This handles markdown images (which bypass OptimizedImage component) by
 * rewriting the HTML before it's dangerouslySetInnerHTML.
 */

const RESPONSIVE_SIZES = [64, 80, 160, 280, 320, 400, 600, 768, 850, 1200, 1920];
const RESPONSIVE_SIZES_ATTR = '(max-width: 768px) 100vw, 850px';

function isFeaturedImage(src: string): boolean {
  const filename = src.split('/').pop()?.toLowerCase() || '';
  const base = filename.split('.')[0];
  return base === 'featured' || base === 'hero';
}

function generateResponsiveSrcSet(src: string, extension: string): string {
  const dotIndex = src.lastIndexOf('.');
  if (dotIndex === -1) return '';
  const base = src.substring(0, dotIndex);
  return RESPONSIVE_SIZES.map(s => `${base}_${s}w.${extension} ${s}w`).join(', ');
}

function imgToPicture(imgTag: string): string {
  const srcMatch = imgTag.match(/src=["']([^"']+)["']/);
  if (!srcMatch) return imgTag;
  const src = srcMatch[1];

  // Only process content images
  if (!src.startsWith('/images/content/')) return imgTag;

  const altMatch = imgTag.match(/alt=["']([^"']*)["']/);
  const alt = altMatch ? altMatch[1] : '';
  const titleMatch = imgTag.match(/title=["']([^"']*)["']/);
  const title = titleMatch ? ` title="${titleMatch[1]}"` : '';
  const classMatch = imgTag.match(/class=["']([^"']*)["']/);
  const className = classMatch ? classMatch[1] : '';
  const classAttr = className ? ` class="post-media-image${className ? ' ' + className : ''}"` : ' class="post-media-image"';

  const dotIndex = src.lastIndexOf('.');
  if (dotIndex === -1) return imgTag;
  const base = src.substring(0, dotIndex);

  // Featured/hero images get the full responsive treatment
  if (isFeaturedImage(src)) {
    const webpSrcSet = generateResponsiveSrcSet(src, 'webp');
    const jpgSrcSet = generateResponsiveSrcSet(src, 'jpg');
    const imgFallback = `${base}_850w.jpg`;
    return `<picture>${webpSrcSet ? `<source type="image/webp" srcset="${webpSrcSet}" sizes="${RESPONSIVE_SIZES_ATTR}"/>` : ''}<source type="image/jpeg" srcset="${jpgSrcSet}" sizes="${RESPONSIVE_SIZES_ATTR}"/><img src="${imgFallback}" alt="${alt}"${title}${classAttr} loading="lazy" decoding="async"/></picture>`;
  }

  // Post body / inline images get the single 760w variant
  return `<picture><source type="image/webp" srcset="${base}_760w.webp"/><img src="${base}_760w.jpg" alt="${alt}"${title}${classAttr} loading="lazy" decoding="async"/></picture>`;
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

/**
 * Post-processes HTML to add target="_blank" and rel="noopener noreferrer"
 * to affiliate links (/go/* paths). These are internal redirect paths that
 * point to external affiliate URLs, so they should open in new windows.
 */
export function postProcessAffiliateLinks(html: string): string {
  return html.replace(/<a\s+href=["']\/go\/[^"']+["']/gi, (match) => {
    if (!match.includes('target=')) {
      return match.replace('>', ' target="_blank" rel="noopener noreferrer">');
    }
    return match;
  });
}

/**
 * Post-processes HTML to add data-label attributes to table cells
 * based on their column headers. This enables responsive card-style
 * table layout on mobile where each row becomes a labeled card.
 */
export function postProcessTables(html: string): string {
  // Match each <table>...</table> block
  return html.replace(/<table[^>]*>([\s\S]*?)<\/table>/g, (tableMatch, tableContent) => {
    // Extract all header texts from <th> elements
    const headerTexts: string[] = [];
    const thRegex = /<th[^>]*>([\s\S]*?)<\/th>/g;
    let thMatch;
    while ((thMatch = thRegex.exec(tableContent)) !== null) {
      // Strip HTML tags from header content, keep text
      const text = thMatch[1].replace(/<[^>]+>/g, '').trim();
      headerTexts.push(text);
    }

    if (headerTexts.length === 0) return tableMatch;

    // Process each <tr> row, adding data-label to <td> cells based on column index
    const processedContent = tableContent.replace(/<tr[^>]*>([\s\S]*?)<\/tr>/g, (_rowMatch: string, rowContent: string) => {
      // Count cells in this row (both th and td) to track column position
      let colIndex = 0;
      const newRow = rowContent.replace(/<(td|th)[^>]*>([\s\S]*?)<\/\1>/g, (cellMatch: string, tag: string) => {
        const isTd = tag.toLowerCase() === 'td';
        const label = headerTexts[colIndex % headerTexts.length] || '';
        colIndex++;

        if (isTd && label) {
          return cellMatch.replace(/<td/, `<td data-label="${label.replace(/"/g, '&quot;')}"`);
        }
        return cellMatch;
      });
      return `<tr>${newRow}</tr>`;
    });

    return `<table>${processedContent}</table>`;
  });
}
