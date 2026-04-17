import React, { useEffect, useRef, useState } from 'react';

interface CommentsProps {
  slug: string;
  title: string;
}

/**
 * Client-only Giscus comments using the script tag approach.
 * This avoids importing @giscus/react entirely, which crashes Gatsby SSR.
 */
const Comments: React.FC<CommentsProps> = ({ slug }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [theme, setTheme] = useState<'light' | 'dark' | null>(null);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  useEffect(() => {
    // Read the site's actual theme
    const isDark = document.documentElement.classList.contains('hm-dark');
    setTheme(isDark ? 'dark' : 'light');

    // Watch for theme changes so Giscus stays in sync
    const observer = new MutationObserver(() => {
      const isNowDark = document.documentElement.classList.contains('hm-dark');
      const newTheme = isNowDark ? 'dark' : 'light';
      setTheme(newTheme);
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!theme || !containerRef.current) return;

    const existingIframe = containerRef.current.querySelector('iframe.giscus-frame');

    if (existingIframe) {
      // If the iframe already exists, update its theme via postMessage
      existingIframe.contentWindow?.postMessage(
        { giscus: { setConfig: { theme } } },
        'https://giscus.app'
      );
      return;
    }

    // First load — create the script
    const script = document.createElement('script');
    script.src = 'https://giscus.app/client.js';
    script.setAttribute('data-repo', 'jcrawford/jcrawford.github.io');
    script.setAttribute('data-repo-id', 'R_kgDODsz-Rw');
    script.setAttribute('data-category', 'General');
    script.setAttribute('data-category-id', 'DIC_kwDODsz-R84C601P');
    script.setAttribute('data-mapping', 'pathname');
    script.setAttribute('data-strict', '0');
    script.setAttribute('data-reactions-enabled', '1');
    script.setAttribute('data-emit-metadata', '0');
    script.setAttribute('data-input-position', 'top');
    script.setAttribute('data-theme', theme);
    script.setAttribute('data-lang', 'en');
    script.setAttribute('data-loading', 'lazy');
    script.setAttribute('crossorigin', 'anonymous');
    script.async = true;

    containerRef.current.appendChild(script);
  }, [theme]);

  return (
    <div className="hm-comments" aria-label="Comments section">
      <h2 className="hm-comments-heading">Comments</h2>
      <div ref={containerRef} />
    </div>
  );
};

export default Comments;