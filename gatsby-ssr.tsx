import React from 'react';

export const onRenderBody = ({ setHeadComponents, setHtmlAttributes, setPostBodyComponents }: any) => {
  setHtmlAttributes({ className: 'hm-dark' });

  setHeadComponents([
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
  ]);

  // Send GA4 page_view event reliably on initial page load.
  // The gtag plugin sets send_page_view=false and relies on onRouteUpdate,
  // which may fire before the async gtag script has loaded.
  // This script polls for gtag availability and sends the event once ready.
  setPostBodyComponents([
    <script
      key="ga4-pageview"
      dangerouslySetInnerHTML={{
        __html: `
          (function() {
            function sendPageView() {
              if (typeof window.gtag === 'function') {
                window.gtag('event', 'page_view', {
                  page_path: window.location.pathname + window.location.search + window.location.hash,
                  send_to: 'G-9LLY1071M3'
                });
              } else {
                setTimeout(sendPageView, 100);
              }
            }
            setTimeout(sendPageView, 300);
          })();
        `,
      }}
    />,
  ]);
};