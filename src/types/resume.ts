/**
 * TypeScript Type Definitions for Resume Page
 * 
 * These types define the structure of resume data stored in JSON files
 * and used throughout the resume page components.
 */

/**
 * Social media link with platform name and URL
 */
export interface SocialLink {
  platform: string;
  url: string;
  icon?: string;
}

/**
 * Professional profile information
 * Data source: /src/data/resume/profile.json
 */
export interface Profile {
  name: string;
  title: string;
  photo: string;
  email: string;
  phone: string;
  location: string;
  socialLinks: SocialLink[];
  bio: string;
}

/**
 * Professional skill with proficiency level
 * Data source: /src/data/resume/skills.json
 */
export interface Skill {
  name: string;
  proficiency: number; // 0-100 percentage
}

/**
 * Work experience entry
 * Data source: /src/data/resume/experience.json
 */
export interface WorkExperience {
  company: string;
  title: string;
  startDate: string; // ISO 8601 or "YYYY-MM"
  endDate: string | 'Present'; // ISO 8601, "YYYY-MM", or "Present"
  description: string;
}

/**
 * Course certification
 * Data source: /src/data/resume/courses.json
 */
export interface Education {
  title: string;
  date: string; // ISO 8601 or "YYYY-MM"
  link?: string; // Optional URL to the course
  certificationLink?: string; // Optional URL to the certification credential
}

/**
 * Raw recommendation data fetched from LinkedIn
 * Internal type used during scraping process
 */
export interface LinkedInRecommendation {
  recommenderName: string;
  recommenderTitle: string;
  recommenderCompany: string;
  recommendationText: string;
  recommenderPhotoUrl: string;
  date?: string;
  relationship?: string;
}

/**
 * Transformed recommendation for display
 * Used in the recommendations slider component
 */
export interface Recommendation {
  quote: string;
  name: string;
  title: string;
  photoPath?: string; // Local path to optimized image
}

/**
 * Cached recommendations with metadata
 * Data source: /src/data/resume/recommendations.json (auto-generated)
 */
export interface RecommendationCache {
  fetchTimestamp: string; // ISO 8601
  sourceURL: string;
  recommendations: Recommendation[];
}

/**
 * Complete resume data aggregated from all JSON files
 * Used by the main resume page component
 */
export interface ResumeData {
  profile: Profile;
  skills: Skill[];
  experience: WorkExperience[];
  education: Education[];
  recommendations: RecommendationCache | null;
}

