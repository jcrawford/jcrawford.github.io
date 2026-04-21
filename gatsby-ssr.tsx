import React from 'react';

export const onRenderBody = ({ setHeadComponents, setHtmlAttributes }: any) => {
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
};