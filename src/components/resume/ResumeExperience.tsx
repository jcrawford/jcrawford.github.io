/**
 * Resume Experience Component
 * 
 * Displays work experience timeline with company, title, dates, and descriptions.
 * Groups consecutive roles at the same company (LinkedIn-style).
 */

import React from 'react';
import { useIntersectionObserver } from '../../hooks/useIntersectionObserver';
import type { WorkExperience } from '../../types/resume';

interface ResumeExperienceProps {
  experiences: WorkExperience[];
}

interface ExperienceGroup {
  company: string;
  roles: WorkExperience[];
  totalDuration: string;
}

const ResumeExperience: React.FC<ResumeExperienceProps> = ({ experiences }) => {
  // Don't render if no experiences
  if (!experiences || experiences.length === 0) {
    return null;
  }

  // Sort by start date (most recent first)
  const sortedExperiences = [...experiences].sort((a, b) => {
    const dateA = new Date(a.startDate.match(/^\d{4}-\d{2}$/) ? a.startDate + '-01' : a.startDate);
    const dateB = new Date(b.startDate.match(/^\d{4}-\d{2}$/) ? b.startDate + '-01' : b.startDate);
    return dateB.getTime() - dateA.getTime();
  });

  // Group consecutive roles by company
  const groupedExperiences: (ExperienceGroup | WorkExperience)[] = [];
  let currentGroup: ExperienceGroup | null = null;

  sortedExperiences.forEach((exp) => {
    if (currentGroup && currentGroup.company === exp.company) {
      // Add to existing group
      currentGroup.roles.push(exp);
    } else {
      // Start new group or add standalone
      if (currentGroup) {
        groupedExperiences.push(currentGroup);
      }
      currentGroup = {
        company: exp.company,
        roles: [exp],
        totalDuration: '',
      };
    }
  });

  // Add last group
  if (currentGroup) {
    groupedExperiences.push(currentGroup);
  }

  // Convert single-role groups to standalone experiences
  const finalGroups = groupedExperiences.map((item) => {
    if ('roles' in item && item.roles.length === 1) {
      return item.roles[0];
    }
    return item;
  });

  const formatDate = (dateString: string | null) => {
    if (!dateString || dateString === 'Present') return 'Present';
    // Handle YYYY-MM format by adding day
    const dateStr = dateString.match(/^\d{4}-\d{2}$/) ? dateString + '-01' : dateString;
    const date = new Date(dateStr);
    // Check if date is valid
    if (isNaN(date.getTime())) return 'Present';
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  const calculateDuration = (startDate: string, endDate: string | null) => {
    // Handle YYYY-MM format by adding day
    const startStr = startDate.match(/^\d{4}-\d{2}$/) ? startDate + '-01' : startDate;
    const start = new Date(startStr);
    
    const end = (!endDate || endDate === 'Present') 
      ? new Date() 
      : new Date(endDate.match(/^\d{4}-\d{2}$/) ? endDate + '-01' : endDate);
    
    // Ensure dates are valid before calculating
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return 'Invalid Date';
    }

    const months = (end.getFullYear() - start.getFullYear()) * 12 + 
                   (end.getMonth() - start.getMonth());
    
    if (months < 0) return 'Invalid Duration';
    
    if (months < 12) {
      return `${months} ${months === 1 ? 'month' : 'months'}`;
    }
    
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;
    
    if (remainingMonths === 0) {
      return `${years} ${years === 1 ? 'year' : 'years'}`;
    }
    
    return `${years} ${years === 1 ? 'year' : 'years'}, ${remainingMonths} ${remainingMonths === 1 ? 'month' : 'months'}`;
  };

  // Calculate total duration across multiple roles
  const calculateGroupDuration = (roles: WorkExperience[]) => {
    // Get earliest start and latest end
    const sortedRoles = [...roles].sort((a, b) => {
      const dateA = new Date(a.startDate.match(/^\d{4}-\d{2}$/) ? a.startDate + '-01' : a.startDate);
      const dateB = new Date(b.startDate.match(/^\d{4}-\d{2}$/) ? b.startDate + '-01' : b.startDate);
      return dateA.getTime() - dateB.getTime(); // Oldest first
    });

    const earliestStart = sortedRoles[0].startDate;
    const latestEnd = sortedRoles[sortedRoles.length - 1].endDate;

    return calculateDuration(earliestStart, latestEnd);
  };

  // Render a single role with fade-in animation
  const SingleRole: React.FC<{ experience: WorkExperience; index: number; delay: number }> = ({ experience, index, delay }) => {
    const { ref, isVisible } = useIntersectionObserver();
    
    return (
      <div 
        ref={ref}
        className={`experience-item fade-in-on-scroll ${isVisible ? 'is-visible' : ''}`}
        data-delay={delay}
      >
        <div className="experience-marker" />
        <div className="experience-content">
          <h3 className="experience-company">{experience.company}</h3>
          <div className="experience-header">
            <div className="experience-title">{experience.title}</div>
            <div className="experience-dates">
              {formatDate(experience.startDate)} - {formatDate(experience.endDate)}
              <span className="experience-duration">
                {calculateDuration(experience.startDate, experience.endDate)}
              </span>
            </div>
          </div>
          {experience.description && (
            <p className="experience-description">{experience.description}</p>
          )}
        </div>
      </div>
    );
  };

  // Render a group of roles at the same company with fade-in animation
  const GroupedRoles: React.FC<{ group: ExperienceGroup; index: number; delay: number }> = ({ group, index, delay }) => {
    const { ref, isVisible } = useIntersectionObserver();
    
    return (
      <div 
        key={`group-${index}`} 
        ref={ref}
        className={`experience-item experience-group fade-in-on-scroll ${isVisible ? 'is-visible' : ''}`}
        data-delay={delay}
      >
        <div className="experience-marker" />
        <div className="experience-content">
          <div className="experience-group-header">
            <h3 className="experience-company">{group.company}</h3>
            <div className="experience-group-duration">
              Full-time · {calculateGroupDuration(group.roles)}
            </div>
          </div>
          <div className="experience-roles">
            {group.roles.map((role, roleIndex) => (
              <div key={`role-${roleIndex}`} className="experience-role">
                <div className="experience-role-marker" />
                <div className="experience-role-content">
                  <div className="experience-header">
                    <div className="experience-title">{role.title}</div>
                    <div className="experience-dates">
                      {formatDate(role.startDate)} - {formatDate(role.endDate)}
                      <span className="experience-duration">
                        {calculateDuration(role.startDate, role.endDate)}
                      </span>
                    </div>
                  </div>
                  {role.description && (
                    <p className="experience-description">{role.description}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="resume-experience">
      <h2 className="resume-section-title">Work Experience</h2>
      <div className="experience-timeline">
        {finalGroups.map((item, index) => {
          const delay = Math.min(index, 5); // Cap delay at 5 to avoid too much stagger
          
          if ('roles' in item) {
            // It's a group
            return <GroupedRoles key={`group-${index}`} group={item} index={index} delay={delay} />;
          } else {
            // It's a single experience
            return <SingleRole key={`single-${index}`} experience={item} index={index} delay={delay} />;
          }
        })}
      </div>
    </div>
  );
};

export default ResumeExperience;

