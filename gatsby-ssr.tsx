import React from 'react';
import { MusicPlayerProvider } from './src/components/MusicPlayerProvider';

export const onRenderBody = ({ setHeadComponents, setPostBodyComponents, setHtmlAttributes }: any) => {
  setHtmlAttributes({ lang: 'en', className: 'hm-dark' });

  setHeadComponents([
    // Google Search Console verification — replace YOUR_VERIFICATION_CODE with actual code from Search Console
    // <meta name="google-site-verification" content="YOUR_VERIFICATION_CODE" /> — added once verified
    <link
      key="llms-txt"
      rel="llms-txt"
      type="text/plain"
      href="/llms.txt"
    />,
    <link
      key="llms-full-txt"
      rel="llms-full-txt"
      type="text/plain"
      href="/llms-full.txt"
    />,
    <link
      key="agent-skills"
      rel="agent-skills"
      type="application/json"
      href="/agent-skills.json"
    />,
    <script
      key="firefox-reader-shim"
      dangerouslySetInnerHTML={{
        __html: `
          try {
            if (!window.__firefox__) {
              window.__firefox__ = {};
            }
            if (!window.__firefox__.reader) {
              window.__firefox__.reader = {
                getMessage: function() { return null; },
                postMessage: function() {},
                removeMessage: function() {}
              };
            }
          } catch (e) {}
        `,
      }}
    />,
    // Google AdSense — Auto Ads (site-wide loader). ca-pub-4309658652951015
    <script
      key="adsense-loader"
      async
      src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4309658652951015"
      crossOrigin="anonymous"
    />,
  ]);

  setPostBodyComponents([
    <script
      key="show-drafts"
      dangerouslySetInnerHTML={{
        __html: `window.__SHOW_DRAFTS__ = ${process.env.GATSBY_SHOW_DRAFTS === 'true'};`,
      }}
    />,
  ]);
};
/**
 * SSR counterpart of gatsby-browser's wrapRootElement. Renders the same provider
 * tree so hydration matches; the provider is SSR-safe (no window access at module
 * scope, audio element renders with preload="none").
 */
export const wrapRootElement = ({ element }: any) => (
  <MusicPlayerProvider>{element}</MusicPlayerProvider>
);
