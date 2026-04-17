/**
 * SSR stub for @giscus/react.
 *
 * During Gatsby's build-html and develop-html stages, this module replaces
 * the real @giscus/react package via Webpack resolve.alias. This prevents
 * Lit custom element code from executing in Node (where browser globals
 * like `window` and `customElements` don't exist).
 *
 * The real @giscus/react is loaded client-only via dynamic import() in
 * Comments.tsx, so this stub is never rendered in the browser.
 */
import React from 'react';

const GiscusStub: React.FC<any> = () => null;

export default GiscusStub;