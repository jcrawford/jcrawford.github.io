/**
 * SSR stub for embla-carousel-react.
 *
 * During Gatsby's build-html and develop-html stages, this module replaces
 * the real embla-carousel-react package via Webpack resolve.alias.
 * embla-carousel accesses browser globals (self, window, ownerWindow)
 * at module evaluation time, which crashes Gatsby's SSR rendering in Node.
 *
 * The real embla-carousel-react is loaded client-only by the
 * RecommendationsSlider component, so this stub is never rendered
 * in the browser.
 */
import React from 'react';

// Return a tuple [ref, api] matching the real useEmblaCarousel API
const useEmblaCarouselStub = () => [React.createRef(), null] as const;

export default useEmblaCarouselStub;