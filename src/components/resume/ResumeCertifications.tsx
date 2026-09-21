/**
 * Resume Certifications Component
 * 
 * Displays certifications with titles, dates, and links.
 */

import React from 'react';
import { useIntersectionObserver } from '../../hooks/useIntersectionObserver';
import type { Education } from '../../types/resume';

interface ResumeCertificationsProps {
  certifications: Education[];
}

const ResumeCertifications: React.FC<ResumeCertificationsProps> = ({ certifications }) => {
  // Don't render if no certifications
  if (!certifications || certifications.length === 0) {
    return null;
  }

  // Sort by date (most recent first)
  const sortedCertifications = [...certifications].sort((a, b) => {
    const parseDate = (dateString: string) => {
      const match = dateString.match(/^(\d{4})-(\d{2})$/);
      if (match) {
        const year = parseInt(match[1], 10);
        const month = parseInt(match[2], 10) - 1;
        return new Date(year, month, 1);
      }
      return new Date(dateString);
    };
    
    const dateA = parseDate(a.date);
    const dateB = parseDate(b.date);
    return dateB.getTime() - dateA.getTime();
  });

  const formatDate = (dateString: string) => {
    // Handle YYYY-MM format
    const match = dateString.match(/^(\d{4})-(\d{2})$/);
    if (match) {
      const year = parseInt(match[1], 10);
      const month = parseInt(match[2], 10) - 1; // JavaScript months are 0-indexed
      const date = new Date(year, month, 1);
      return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    }
    
    // Handle full date format
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  // Component for individual certification item with fade-in animation
  const CertificationItem: React.FC<{ cert: Education; delay: number }> = ({ cert, delay }) => {
    const { ref, isVisible } = useIntersectionObserver();
    
    return (
      <div 
        ref={ref}
        className={`education-item fade-in-on-scroll ${isVisible ? 'is-visible' : ''}`}
        data-delay={delay}
      >
        <div className="education-marker" />
        <div className="education-content">
          <h3 className="education-degree">
            {cert.link ? (
              <a 
                href={cert.link} 
                target="_blank" 
                rel="noopener noreferrer"
                className="certification-link"
              >
                {cert.title}
                <svg 
                  className="external-link-icon" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                >
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                  <polyline points="15 3 21 3 21 9"></polyline>
                  <line x1="10" y1="14" x2="21" y2="3"></line>
                </svg>
              </a>
            ) : (
              <span>{cert.title}</span>
            )}
          </h3>
          <div className="education-meta">
            <div className="education-dates">
              {formatDate(cert.date)}
            </div>
            {cert.certificationLink && (
              <a 
                href={cert.certificationLink} 
                target="_blank" 
                rel="noopener noreferrer"
                className="certification-credential-link"
              >
                View Credential
                <svg 
                  className="external-link-icon" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                >
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                  <polyline points="15 3 21 3 21 9"></polyline>
                  <line x1="10" y1="14" x2="21" y2="3"></line>
                </svg>
              </a>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="resume-certifications">
      <h2 className="resume-section-title">Certifications</h2>
      <div className="certifications-timeline">
        {sortedCertifications.map((cert, index) => {
          const delay = Math.min(index, 5); // Cap delay at 5 to avoid too much stagger
          return <CertificationItem key={index} cert={cert} delay={delay} />;
        })}
      </div>
    </div>
  );
};

export default ResumeCertifications;

