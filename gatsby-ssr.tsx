import React from 'react';

export const onRenderBody = ({ setHeadComponents, setPostBodyComponents, setHtmlAttributes }: any) => {
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