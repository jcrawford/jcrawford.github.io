export const normalizeTagSlug = (tag: string): string => {
  return tag
    .trim()
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
};

export const tagMatches = (tag: string, expected: string): boolean => {
  return normalizeTagSlug(tag) === normalizeTagSlug(expected);
};

export const hasTag = (tags: string[] = [], expected: string): boolean => {
  return tags.some((tag) => tagMatches(tag, expected));
};

const SPECIAL_TAG_ROUTES: Record<string, string> = {
  brewing: '/brewing',
};

export const getTagPath = (tag: string): string => {
  const slug = normalizeTagSlug(tag);
  return SPECIAL_TAG_ROUTES[slug] || `/tag/${slug}`;
};
