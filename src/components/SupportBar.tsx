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

  useEffect(() => {
    if (isReady) {
      const timer = setTimeout(() => {
        setShouldFadeIn(true);
        document.body.classList.add('support-bar-active');
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [isReady]);

  const handleDismiss = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShouldFadeIn(false);
    document.body.classList.remove('support-bar-active');
    const expiry = Date.now() + 24 * 60 * 60 * 1000;
    localStorage.setItem('support-bar-dismissed', expiry.toString());
    setTimeout(() => setIsVisible(false), 300);
  };

  if (!isVisible || !isReady) return null;

  const config = supportConfigs[context] || supportConfigs.default;

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
        <span className="support-bar-text">{config.cta}</span>
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
