import React from 'react';
import '../styles/support-component.css';

interface SupportComponentProps {
  context?: 'brewing' | 'reviews' | 'tech' | 'default';
  variant?: 'full' | 'compact';
}

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

const SupportComponent: React.FC<SupportComponentProps> = ({ context = 'default', variant = 'full' }) => {
  const config = supportConfigs[context] || supportConfigs.default;

  if (variant === 'compact') {
    return (
      <div className="support-component support-component-compact">
        <div className="support-component-icon">{config.icon}</div>
        <div className="support-component-content">
          <p className="support-component-cta">{config.cta}</p>
          <a
            href="https://ko-fi.com/jcrawford"
            target="_blank"
            rel="noopener noreferrer"
            className="support-component-button-compact"
          >
            Support →
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="support-component">
      <div className="support-component-inner">
        <div className="support-component-icon">{config.icon}</div>
        <div className="support-component-content">
          <h3 className="support-component-heading">{config.heading}</h3>
          <p className="support-component-description">{config.description}</p>
          <a
            href="https://ko-fi.com/jcrawford"
            target="_blank"
            rel="noopener noreferrer"
            className="support-component-button"
          >
            {config.cta} →
          </a>
        </div>
      </div>
    </div>
  );
};

export default SupportComponent;
