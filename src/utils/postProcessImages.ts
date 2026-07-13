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