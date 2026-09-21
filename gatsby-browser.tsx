import type { GatsbyBrowser } from 'gatsby';

const isFirefoxReaderError = (error: any) => {
  if (!error) return false;
  const msg = error.message || '';
  const stack = error.stack || '';
  return msg.includes('__firefox__.reader') || stack.includes('__firefox__.reader');
};

export const onClientEntry: GatsbyBrowser['onClientEntry'] = () => {
  // Firefox Reader Mode injects scripts that can throw if their API isn't
  // fully initialized. Ignore those errors so they don't break the site.
  window.addEventListener('error', (event) => {
    if (isFirefoxReaderError(event.error)) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  }, true);

  window.addEventListener('unhandledrejection', (event) => {
    if (isFirefoxReaderError(event.reason)) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  }, true);
};
