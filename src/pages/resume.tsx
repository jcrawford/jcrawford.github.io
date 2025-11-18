/**
 * Resume Page
 * 
 * Main page component for the professional resume at /resume
 * Displays profile, skills, work experience, education, and LinkedIn recommendations
 */

import React from 'react';
import { HeadFC } from 'gatsby';
import Layout from '../components/Layout';
import ResumeProfile from '../components/resume/ResumeProfile';
import ResumeSkills from '../components/resume/ResumeSkills';
import ResumeExperience from '../components/resume/ResumeExperience';
import ResumeCourses from '../components/resume/ResumeCourses';
import RecommendationsSlider from '../components/resume/RecommendationsSlider';

// Import resume data directly (temporary until GraphQL is set up properly)
import profileData from '../data/resume/profile.json';
import skillsData from '../data/resume/skills.json';
import experienceData from '../data/resume/experience.json';
import educationData from '../data/resume/courses.json';
import recommendationsData from '../data/resume/recommendations.json';

/**
 * Resume Page Component
 */
const ResumePage: React.FC = () => {
  return (
    <Layout>
      <div className="resume-page">
        <div className="resume-container">
          <h1 className="resume-page-title">Resume</h1>
          
          {/* Profile Section - Phase 3 (US1) ✅ COMPLETE */}
          <div className="resume-section profile-section">
            <ResumeProfile profile={profileData} />
          </div>
          
          {/* Skills Section - Phase 4 (US2) ✅ COMPLETE */}
          <div className="resume-section skills-section">
            <ResumeSkills skills={skillsData} />
          </div>
          
          {/* Work Experience Section - Phase 7 (US4) ✅ COMPLETE */}
          <div className="resume-section experience-section">
            <ResumeExperience experiences={experienceData} />
          </div>
          
              {/* Courses Section - Phase 8 (US5) ✅ COMPLETE */}
              <div className="resume-section education-section">
                <ResumeCourses education={educationData} />
              </div>
          
          {/* Recommendations Section */}
          <div className="resume-section recommendations-section">
            <RecommendationsSlider
              recommendations={recommendationsData.recommendations}
              sourceURL={recommendationsData.sourceURL}
            />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ResumePage;

/**
 * Page metadata for SEO
 */
export const Head: HeadFC = () => {
  return (
    <>
      <title>Resume | Joseph Crawford</title>
      <meta name="description" content="Professional resume with skills, experience, and recommendations." />
      <meta property="og:title" content="Resume | Joseph Crawford" />
      <meta property="og:description" content="Professional resume with skills, experience, and recommendations." />
      <meta property="og:type" content="profile" />
      <meta name="twitter:card" content="summary" />
    </>
  );
};
