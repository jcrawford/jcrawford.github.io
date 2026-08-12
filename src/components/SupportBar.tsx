import React, { useState, useEffect } from 'react';
import { useLocation } from '@reach/router';
import '../styles/support-bar.css';

interface SupportConfig {
  cta: string;
  icon: string;
}

const supportConfigs: Record<string, SupportConfig> = {
  brewing: {
    cta: 'Sponsor the next batch',
    icon: '🍯',
  },
  reviews: {
    cta: 'Support honest research',
    icon: '🔍',
  },
  tech: {
    cta: 'Buy me a coffee',
    icon: '☕',
  },
  default: {
    cta: 'Support my work',
    icon: '✨',
  },
};

const SupportBar: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const location = useLocation();
  const pathname = location.pathname || '';

  useEffect(() => {
    // Check if user has dismissed the bar in the last 24 hours
    const dismissedUntil = localStorage.getItem('support-bar-dismissed');
    if (!dismissedUntil || Date.now() > parseInt(dismissedUntil)) {
      setIsVisible(true);
    }
  }, []);

  const handleDismiss = () => {
    const expiry = Date.now() + 24 * 60 * 60 * 1000; // 24 hours from now
    localStorage.setItem('support-bar-dismissed', expiry.toString());
    setIsVisible(false);
  };

  const getContext = (): keyof typeof supportConfigs => {
    if (pathname.includes('/brewing/')) return 'brewing';
    if (pathname.includes('/reviews/')) return 'reviews';
    if (pathname.includes('/posts/') || pathname.includes('/tag/')) return 'tech';
    return 'default';
  };

  if (!isVisible) return null;

  const context = getContext();
  const config = supportConfigs[context] || supportConfigs.default;

  return (
    <div className="support-bar">
      <div className="support-bar-left">
        <span className="support-bar-icon">{config.icon}</span>
        <span className="support-bar-text">{config.cta}</span>
      </div>
      
      <div className="support-bar-right">
        <a
          href="https://ko-fi.com/jcrawford"
          target="_blank"
          rel="noopener noreferrer"
          className="support-bar-link"
        >
          Support →
        </a>
        <button 
          className="support-bar-close" 
          onClick={handleDismiss} 
          aria-label="Dismiss"
        >
          ✕
        </button>
      </div>
    </div>
  );
};

export default SupportBar;
