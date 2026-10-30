import type { GatsbyBrowser } from 'gatsby';
import './src/styles/global.css';

/**
 * Errors thrown by browser-extension-injected scripts, not by this site.
 *
 * These are unguarded scripts that other software (Firefox Reader Mode, crypto
 * wallet extensions such as MetaMask) injects into the page. When their host
 * API is absent they throw on a bare property access — e.g.
 * `window.ethereum.selectedAddress = ...` when `window.ethereum` is undefined.
 *
 * They are not ours to fix and Gatsby's dev-mode overlay surfaces them as
 * "unhandled runtime error found in your files", which is misleading: no file
 * in this repo references these globals. Suppressing them keeps the overlay
 * for real errors while hiding third-party noise.
 */
const EXTENSION_ERROR_PATTERNS = [
  '__firefox__.reader',
  'window.ethereum',
  'ethereum.selectedAddress',
];

const isExtensionError = (error: any) => {
  if (!error) return false;
  const msg = error.message || '';
  const stack = error.stack || '';
  return EXTENSION_ERROR_PATTERNS.some(
    (needle) => msg.includes(needle) || stack.includes(needle)
  );
};

// Wire the filters before Gatsby's own runtime does anything else, so an
// extension script that throws on entry is caught at the earliest window.
export const onClientEntry: GatsbyBrowser['onClientEntry'] = () => {
  const savedTheme = localStorage.getItem('theme');
  const theme = savedTheme === 'light' ? 'light' : 'dark';

  if (theme === 'dark') {
    document.documentElement.classList.add('hm-dark');
  } else {
    document.documentElement.classList.remove('hm-dark');
  }

  window.addEventListener(
    'error',
    (event) => {
      if (isExtensionError(event.error)) {
        event.preventDefault();
        event.stopImmediatePropagation();
      }
    },
    true
  );

  window.addEventListener(
    'unhandledrejection',
    (event) => {
      if (isExtensionError(event.reason)) {
        event.preventDefault();
        event.stopImmediatePropagation();
      }
    },
    true
  );
};