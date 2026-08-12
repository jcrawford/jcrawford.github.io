import React, { useState, useEffect } from 'react';
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
  const [context, setContext] = useState<keyof typeof supportConfigs>('default');
  const [isReady, setIsReady] = useState(false);
  const [shouldFadeIn, setShouldFadeIn] = useState(false);

  useEffect(() => {
    const dismissedUntil = localStorage.getItem('support-bar-dismissed');
    if (!dismissedUntil || Date.now() > parseInt(dismissedUntil)) {
      setIsVisible(true);
    }
  }, []);

  useEffect(() => {
    const handleContextChange = (event: CustomEvent<{ context: keyof typeof supportConfigs }>) => {
      if (event.detail?.context) {
        setContext(event.detail.context);
        setIsReady(true);
      }
    };

    window.addEventListener('support-context' as any, handleContextChange as any);
    return () => window.removeEventListener('support-context' as any, handleContextChange as any);
  }, []);

  // Trigger fade-in after the bar is rendered (ready)
  useEffect(() => {
    if (isReady) {
      requestAnimationFrame(() => {
        setShouldFadeIn(true);
      });
    }
  }, [isReady]);

  const handleDismiss = () => {
    setShouldFadeIn(false);
    const expiry = Date.now() + 24 * 60 * 60 * 1000;
    localStorage.setItem('support-bar-dismissed', expiry.toString());
    setTimeout(() => setIsVisible(false), 300);
  };

  if (!isVisible || !isReady) return null;

  const config = supportConfigs[context] || supportConfigs.default;

  return (
    <div className={`support-bar ${shouldFadeIn ? 'support-bar--visible' : ''}`}>
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