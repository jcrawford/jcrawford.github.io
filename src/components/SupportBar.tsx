import React, { useState, useEffect } from 'react';
import { useLocation } from '@reach/router';
import '../styles/support-bar.css';

interface SupportConfig {
  phrases: string[];
  icon: string;
}

const supportConfigs: Record<string, SupportConfig> = {
  brewing: {
    icon: '🍯',
    phrases: [
      'Sponsor the next batch',
      'Help me buy some honey',
      'Keep the fermenters running',
      'Support the brewing journey',
      'Fuel the next experiment',
      'Buy me a brewing ingredient',
      'Support the craft of mead',
      'Keep the bubbles going',
      'Support homebrewing research',
      'Fuel the next brew day',
    ],
  },
  reviews: {
    icon: '🔍',
    phrases: [
      'Support honest reviews',
      'Help me test more gear',
      'Support unbiased research',
      'Fuel honest consumer guides',
      'Keep the reviews coming',
      'Support independent testing',
      'Fuel more product deep-dives',
      'Help me find the best gear',
      'Support honest consumer advocacy',
      'Fuel the quest for quality',
    ],
  },
  tech: {
    icon: '☕',
    phrases: [
      'Buy me a coffee',
      'Support the codebase',
      'Fuel the late-night coding',
      'Support technical writing',
      'Buy me a caffeine fix',
      'Fuel more deep-dives',
      'Support the dev journey',
      'Keep the tutorials flowing',
      'Support open-source learning',
      'Fuel the next project',
    ],
  },
  default: {
    icon: '✨',
    phrases: [
      'Support my work',
      'Buy me a coffee',
      'Fuel the content creation',
      'Support the blog',
      'Keep the site running',
      'Support independent writing',
      'Fuel my curiosity',
      'Buy me a treat',
      'Support the creative process',
      'Keep the updates coming',
    ],
  },
};

const SupportBar: React.FC = () => {
  const location = useLocation();
  const pathname = location.pathname || '';
  const [isVisible, setIsVisible] = useState(false);
  const [shouldFadeIn, setShouldFadeIn] = useState(false);

  // Determine context synchronously based on URL
  const getContext = (): keyof typeof supportConfigs => {
    if (pathname.includes('/brewing/') || pathname.includes('/series/')) return 'brewing';
    if (pathname.includes('/reviews/')) return 'reviews';
    if (pathname.includes('/posts/') || pathname.includes('/tag/')) return 'tech';
    return 'default';
  };

  const context = getContext();
  const config = supportConfigs[context];
  const phrase = config.phrases[Math.floor(Math.random() * config.phrases.length)];

  useEffect(() => {
    const dismissedUntil = localStorage.getItem('support-bar-dismissed');
    if (!dismissedUntil || Date.now() > parseInt(dismissedUntil)) {
      setIsVisible(true);
    }
  }, []);

  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        setShouldFadeIn(true);
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [isVisible]);

  const handleDismiss = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShouldFadeIn(false);
    const expiry = Date.now() + 24 * 60 * 60 * 1000;
    localStorage.setItem('support-bar-dismissed', expiry.toString());
    setTimeout(() => setIsVisible(false), 300);
  };

  if (!isVisible) return null;

  return (
    <a
      href="https://ko-fi.com/jcrawford"
      target="_blank"
      rel="noopener noreferrer"
      className={`support-bar ${shouldFadeIn ? 'support-bar--visible' : ''}`}
      style={{ textDecoration: 'none' }}
    >
      <div className="support-bar-left">
        <span className="support-bar-icon">{config.icon}</span>
        <span className="support-bar-text">{phrase}</span>
      </div>
      
      <div className="support-bar-right">
        <span className="support-bar-link">Support →</span>
        <button 
          className="support-bar-close" 
          onClick={handleDismiss} 
          aria-label="Dismiss"
        >
          ✕
        </button>
      </div>
    </a>
  );
};

export default SupportBar;
