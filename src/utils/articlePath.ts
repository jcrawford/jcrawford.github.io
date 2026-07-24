/**
 * Get the correct path for an article based on its type
 * 
 * @param slug - The article slug
 * @param isSeries - Whether the article is part of a series (can check series?.name)
 * @param isReview - Whether the article is a review (check if tags includes 'reviews')
 * @param isBrewing - Whether the article is a brewing recipe
 * @returns The full path to the article
 */
export function getArticlePath(slug: string, isSeries?: boolean, isReview?: boolean, isBrewing?: boolean): string {
  if (isSeries) {
    return `/series/${slug}`;
  }
  if (isReview) {
    return `/reviews/${slug}`;
  }
  if (isBrewing) {
    return `/brewing/${slug}`;
  }
  return `/posts/${slug}`;
}

