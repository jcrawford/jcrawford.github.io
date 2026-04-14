import React, { useEffect, useState } from 'react';
import Giscus from '@giscus/react';

interface CommentsProps {
  slug: string;
  title: string;
}

const Comments: React.FC<CommentsProps> = ({ slug, title }) => {
  const [mounted, setMounted] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  // Only render on client — Giscus needs browser APIs
  useEffect(() => {
    setMounted(true);

    // Read the site's actual theme (not just OS preference)
    const isDark = document.documentElement.classList.contains('hm-dark');
    setTheme(isDark ? 'dark' : 'light');

    // Watch for theme changes so Giscus stays in sync
    const observer = new MutationObserver(() => {
      const isNowDark = document.documentElement.classList.contains('hm-dark');
      setTheme(isNowDark ? 'dark' : 'light');
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    return () => observer.disconnect();
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div className="hm-comments" aria-label="Comments section">
      <h2 className="hm-comments-heading">Comments</h2>
      <Giscus
        id="comments"
        repo="jcrawford/jcrawford.github.io"
        repoId="R_kgDODsz-Rw"
        category="General"
        categoryId="DIC_kwDODsz-R84C601P"
        mapping="pathname"
        term={slug}
        strict="0"
        reactionsEnabled="1"
        emitMetadata="0"
        inputPosition="top"
        theme={theme === 'dark' ? 'dark' : 'light'}
        lang="en"
        loading="lazy"
      />
    </div>
  );
};

export default Comments;