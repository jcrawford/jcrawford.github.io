/**
 * Resume Skills Component
 * 
 * Displays all skills with animated progress bars.
 * Skills are staggered with incremental delays for a cascading effect.
 */

import React from 'react';
import SkillBar from './SkillBar';
import type { Skill } from '../../types/resume';

interface ResumeSkillsProps {
  skills: Skill[];
}

const ResumeSkills: React.FC<ResumeSkillsProps> = ({ skills }) => {
  // Don't render if no skills
  if (!skills || skills.length === 0) {
    return null;
  }

  // Sort skills alphabetically by name
  const sortedSkills = [...skills].sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="resume-skills">
      <h2 className="resume-section-title">Skills & Expertise</h2>
      <div className="skills-grid">
        {sortedSkills.map((skill, index) => (
          <SkillBar 
            key={skill.name} 
            skill={skill}
            animationDelay={index * 100} // Stagger animations by 100ms
          />
        ))}
      </div>
    </div>
  );
};

export default ResumeSkills;

