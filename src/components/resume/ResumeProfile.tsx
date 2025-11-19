/**
 * Resume Profile Component
 * 
 * Displays professional profile information including:
 * - Profile photo
 * - Name and title
 * - Contact information (email, phone, location)
 * - Social media links
 * - Professional bio
 */

import React from 'react';
import type { Profile } from '../../types/resume';

interface ResumeProfileProps {
  profile: Profile;
}

const ResumeProfile: React.FC<ResumeProfileProps> = ({ profile }) => {
  return (
    <div className="resume-profile">
      <div className="profile-header">
        <div className="profile-photo-container">
          <img 
            src={profile.photo} 
            alt={`${profile.name} - Profile Photo`}
            className="profile-photo"
          />
        </div>
        
        <div className="profile-intro">
          <h1 className="profile-name">{profile.name}</h1>
          <p className="profile-title">{profile.title}</p>
        </div>
      </div>

      <div className="profile-contact">
        <div className="contact-item">
          <svg className="contact-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          <a href={`mailto:${profile.email}`} className="contact-link">
            {profile.email}
          </a>
        </div>

        <div className="contact-item">
          <svg className="contact-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
          </svg>
          <a href={`tel:${profile.phone}`} className="contact-link">
            {profile.phone}
          </a>
        </div>

        <div className="contact-item">
          <svg className="contact-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span className="contact-text">{profile.location}</span>
        </div>
      </div>

      {profile.socialLinks && profile.socialLinks.length > 0 && (
        <div className="profile-social">
          {profile.socialLinks.map((link, index) => (
            <a
              key={index}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="social-link"
              aria-label={`Visit ${link.platform}`}
            >
              <span className="social-platform">{link.platform}</span>
              <svg className="social-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          ))}
        </div>
      )}

      <div className="profile-bio">
        <p>{profile.bio}</p>
      </div>
    </div>
  );
};

export default ResumeProfile;


