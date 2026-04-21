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
