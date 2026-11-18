import type { SyntheticEvent } from 'react';

/**
 * Cover art can briefly 404 while a deploy is mid-flight, and browsers cache
 * the failure for the rest of the session — leaving a permanent broken image
 * even after the file exists. On error, retry once with a cache-busting query
 * so a fresh request bypasses the cached 404. If that also fails, flag the
 * element so CSS can show a neutral placeholder instead of a broken icon.
 */
export const onCoverError = (event: SyntheticEvent<HTMLImageElement>): void => {
  const img = event.currentTarget;
  if (img.dataset.coverRetried === '1') {
    img.classList.add('is-cover-missing');
    return;
  }
  img.dataset.coverRetried = '1';
  const base = img.src.split('?')[0];
  img.src = `${base}?v=${Date.now()}`;
};
