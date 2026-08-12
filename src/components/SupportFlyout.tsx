import React, { useState, useEffect } from 'react';
import { useLocation } from '@reach/router';
import '../styles/support-flyout.css';

interface SupportConfig {
  heading: string;
  cta: string;
  icon: string;
  description: string;
}

const supportConfigs: Record<string, SupportConfig> = {
  brewing: {
    heading: 'Enjoying the brews?',
    cta: 'Sponsor the next batch',
    icon: '🍯',
    description: 'Your support helps cover ingredients, equipment, and the occasional exploded bottle.',
  },
  reviews: {
    heading: 'Found this review helpful?',
    cta: 'Support honest research',
    icon: '🔍',
    description: 'I buy these products myself so you don\'t have to. Your support keeps the reviews unbiased.',
  },
  tech: {
    heading: 'Learned something new?',
    cta: 'Buy me a coffee',
    icon: '☕',
    description: 'Writing technical deep-dives takes time. Your support helps keep the content coming.',
  },
  default: {
    heading: 'Enjoying the content?',
    cta: 'Support my work',
    icon: '✨',
    description: 'Your support helps me continue creating free, in-depth content on this site.',
  },
};

const SupportFlyout: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const pathname = location.pathname || '';

  const getContext = (): keyof typeof supportConfigs => {
    if (pathname.includes('/brewing/')) return 'brewing';
    if (pathname.includes('/reviews/')) return 'reviews';
    if (pathname.includes('/posts/') || pathname.includes('/tag/')) return 'tech';
    return 'default';
  };

  const context = getContext();
  const config = supportConfigs[context] || supportConfigs.default;

  return (
    <>
      <button
        className={`support-flyout-tab ${isOpen ? 'support-flyout-tab--open' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Support this site"
      >
        <span className="support-flyout-tab-icon">{config.icon}</span>
      </button>

      <div className={`support-flyout-window ${isOpen ? 'support-flyout-window--open' : ''}`}>
        <div className="support-flyout-content">
          <button
            className="support-flyout-close"
            onClick={() => setIsOpen(false)}
          >
            ✕
          </button>
          
          <div className="support-flyout-icon">{config.icon}</div>
          <h3 className="support-flyout-heading">{config.heading}</h3>
          <p className="support-flyout-description">{config.description}</p>
          
          <a
            href="https://ko-fi.com/jcrawford"
            target="_blank"
            rel="noopener noreferrer"
            className="support-flyout-button"
            onClick={() => setIsOpen(false)}
          >
            {config.cta} →
          </a>
        </div>
      </div>
    </>
  );
};

export default SupportFlyout;
