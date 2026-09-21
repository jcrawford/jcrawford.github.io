/**
 * Skill Bar Component
 * 
 * Displays an individual skill with an animated progress bar.
 * Animation is triggered when the element enters the viewport using Intersection Observer.
 * Animation duration: 800-1000ms (as specified in requirements)
 */

import React, { useEffect, useRef, useState } from 'react';
import type { Skill } from '../../types/resume';

interface SkillBarProps {
  skill: Skill;
  animationDelay?: number; // Delay before animation starts (ms)
}

const SkillBar: React.FC<SkillBarProps> = ({ skill, animationDelay = 0 }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check for prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    if (prefersReducedMotion) {
      // If user prefers reduced motion, show skill bar immediately without animation
      setIsVisible(true);
      setHasAnimated(true);
      return;
    }

    const currentBarRef = barRef.current;
    if (!currentBarRef) return;

    // Set up Intersection Observer to trigger animation on scroll
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasAnimated) {
            // Add a small delay before starting animation
            setTimeout(() => {
              setIsVisible(true);
              setHasAnimated(true);
            }, animationDelay);
          }
        });
      },
      {
        threshold: 0.2, // Trigger when 20% of the element is visible
        rootMargin: '0px 0px -50px 0px', // Start animation slightly before element is fully in view
      }
    );

    observer.observe(currentBarRef);

    return () => {
      if (currentBarRef) {
        observer.unobserve(currentBarRef);
      }
    };
  }, [animationDelay, hasAnimated]);

  // Ensure proficiency is between 0 and 100
  const clampedProficiency = Math.max(0, Math.min(100, skill.proficiency));

  return (
    <div className="skill-bar-wrapper" ref={barRef}>
      <div className="skill-bar-header">
        <span className="skill-name">{skill.name}</span>
        <span className="skill-percentage">{clampedProficiency}%</span>
      </div>
      <div className="skill-bar-track">
        <div
          className={`skill-bar-fill ${isVisible ? 'skill-bar-animated' : ''}`}
          style={{
            width: isVisible ? `${clampedProficiency}%` : '0%',
          }}
        >
          <div className="skill-bar-shine" />
        </div>
      </div>
    </div>
  );
};

export default SkillBar;


