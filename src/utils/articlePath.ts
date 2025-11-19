/**
 * Get the correct path for an article based on whether it's a series article
 * 
 * @param slug - The article slug
 * @param isSeries - Whether the article is part of a series (can check series?.name)
 * @returns The full path to the article
 */
export function getArticlePath(slug: string, isSeries?: boolean): string {
  if (isSeries) {
    return `/series/${slug}`;
  }
  return `/posts/${slug}`;
}

