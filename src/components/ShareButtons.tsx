import React, { useState, useCallback } from 'react';

interface ShareCounts {
  facebook?: number;
  linkedin?: number;
  copy?: number;
}

interface ShareButtonsProps {
  title: string;
  url: string;
  variant?: 'top' | 'bottom';
  shareCounts?: ShareCounts;
}

// Declare gtag for TypeScript
declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}

const ShareButtons: React.FC<ShareButtonsProps> = ({ title, url, variant = 'bottom', shareCounts = {} }) => {
  const [copied, setCopied] = useState(false);

  const trackShare = useCallback((method: string) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'share', {
        method,
        content_url: url,
        content_title: title,
      });
    }
  }, [url, title]);

  const openShareWindow = useCallback((shareUrl: string, method: string) => {
    window.open(shareUrl, 'share-popup', 'width=600,height=400,scrollbars=no,toolbar=no,location=no');
    trackShare(method);
  }, [trackShare]);

  const handleCopyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      trackShare('copy');
    } catch (err) {
      const textarea = document.createElement('textarea');
      textarea.value = url;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      trackShare('copy');
    }
  }, [url, trackShare]);

  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const shareLinks = [
    {
      name: 'Facebook',
      method: 'facebook',
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&t=${encodedTitle}`,
      color: '#1877F2',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      ),
    },
    {
      name: 'LinkedIn',
      method: 'linkedin',
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      color: '#0A66C2',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z" />
        </svg>
      ),
    },
  ];

  const getCount = (method: string) => {
    const key = method as keyof ShareCounts;
    return shareCounts[key] || 0;
  };

  const formatCount = (n: number) => {
    if (n >= 1000) return (n / 1000).toFixed(1).replace('.0', '') + 'k';
    return String(n);
  };

  return (
    <div className={`hm-share-buttons hm-share-${variant}`}>
      {variant === 'bottom' && <span className="hm-share-label">Share this post</span>}
      <div className="hm-share-buttons-list">
        {shareLinks.map((link) => {
          const count = getCount(link.method);
          return (
            <button
              key={link.name}
              className="hm-share-btn"
              style={{ '--share-color': link.color } as React.CSSProperties}
              onClick={(e) => {
                e.preventDefault();
                openShareWindow(link.href, link.method);
              }}
              aria-label={`Share on ${link.name}`}
              title={`Share on ${link.name}`}
            >
              <span className="hm-share-btn-icon">{link.icon}</span>
              <span className="hm-share-btn-name">{link.name}</span>
              {count > 0 && <span className="hm-share-btn-count">{formatCount(count)}</span>}
            </button>
          );
        })}
        <button
          className={`hm-share-btn hm-share-copy ${copied ? 'hm-share-copied' : ''}`}
          onClick={handleCopyLink}
          aria-label={copied ? 'Link copied' : 'Copy link'}
          title={copied ? 'Copied!' : 'Copy link'}
        >
          <span className="hm-share-btn-icon">
            {copied ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
              </svg>
            )}
          </span>
          <span className="hm-share-btn-name">{copied ? 'Copied!' : 'Copy Link'}</span>
          {getCount('copy') > 0 && <span className="hm-share-btn-count">{formatCount(getCount('copy'))}</span>}
        </button>
      </div>
    </div>
  );
};

export default ShareButtons;