import React from 'react';
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
    <div className="support-bar">
      <span className="support-bar-icon">{config.icon}</span>
      <span className="support-bar-text">{config.cta}</span>
      <a
        href="https://ko-fi.com/jcrawford"
        target="_blank"
        rel="noopener noreferrer"
        className="support-bar-link"
      >
        Support →
      </a>
    </div>
  );
};

export default SupportBar;
