import React, { useState, useEffect } from 'react';
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
  const [isVisible, setIsVisible] = useState(false);
  const [context, setContext] = useState<keyof typeof supportConfigs>('default');
  const [phrase, setPhrase] = useState('');
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
        const newContext = event.detail.context;
        setContext(newContext);
        
        // Pick a random phrase from the new context
        const phrases = supportConfigs[newContext].phrases;
        const randomPhrase = phrases[Math.floor(Math.random() * phrases.length)];
        setPhrase(randomPhrase);
        
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
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [isReady]);

  const handleDismiss = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShouldFadeIn(false);
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
        <span className="support-bar-text">{phrase || config.phrases[0]}</span>
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
