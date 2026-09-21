/**
 * Resume Data Loader
 * 
 * Utilities for loading and validating resume JSON files.
 * Used by Gatsby's GraphQL layer and build-time validation.
 */

import * as fs from 'fs';
import * as path from 'path';
import {
  validateProfile,
  validateSkills,
  validateExperience,
  validateEducation,
  validateRecommendations,
  safeValidateRecommendations,
} from './resume-schemas';
import type {
  Profile,
  Skill,
  WorkExperience,
  Education,
  RecommendationCache,
  ResumeData,
} from '../types/resume';

/**
 * Base path to resume data directory
 */
const DATA_DIR = path.resolve(__dirname, '../../data/resume');

/**
 * Load and validate profile data
 * @throws {Error} if file doesn't exist or validation fails
 */
export function loadProfile(): Profile {
  const filePath = path.join(DATA_DIR, 'profile.json');
  const rawData = fs.readFileSync(filePath, 'utf-8');
  const data = JSON.parse(rawData);
  return validateProfile(data);
}

/**
 * Load and validate skills data
 * @throws {Error} if file doesn't exist or validation fails
 */
export function loadSkills(): Skill[] {
  const filePath = path.join(DATA_DIR, 'skills.json');
  const rawData = fs.readFileSync(filePath, 'utf-8');
  const data = JSON.parse(rawData);
  return validateSkills(data);
}

/**
 * Load and validate work experience data
 * @throws {Error} if file doesn't exist or validation fails
 */
export function loadExperience(): WorkExperience[] {
  const filePath = path.join(DATA_DIR, 'experience.json');
  const rawData = fs.readFileSync(filePath, 'utf-8');
  const data = JSON.parse(rawData);
  return validateExperience(data);
}

/**
 * Load and validate education data
 * @throws {Error} if file doesn't exist or validation fails
 */
export function loadEducation(): Education[] {
  const filePath = path.join(DATA_DIR, 'education.json');
  const rawData = fs.readFileSync(filePath, 'utf-8');
  const data = JSON.parse(rawData);
  return validateEducation(data);
}

/**
 * Load and validate recommendations cache
 * Returns null if file doesn't exist (recommendations may not be fetched yet)
 * @throws {Error} if file exists but validation fails
 */
export function loadRecommendations(): RecommendationCache | null {
  const filePath = path.join(DATA_DIR, 'recommendations.json');
  
  // Return null if file doesn't exist yet (not an error)
  if (!fs.existsSync(filePath)) {
    return null;
  }
  
  const rawData = fs.readFileSync(filePath, 'utf-8');
  const data = JSON.parse(rawData);
  
  // Use safe validation and return null if invalid
  const result = safeValidateRecommendations(data);
  if (!result.success) {
    console.warn('[Resume Data Loader] Invalid recommendations cache:', result.error.message);
    return null;
  }
  
  return result.data;
}

/**
 * Load all resume data
 * Returns complete resume data object with all sections
 * @param {boolean} throwOnMissing - Whether to throw errors for missing files (default: false)
 * @returns {ResumeData} Complete resume data or partial data if throwOnMissing is false
 */
export function loadAllResumeData(throwOnMissing: boolean = false): Partial<ResumeData> {
  const resumeData: Partial<ResumeData> = {};
  
  try {
    resumeData.profile = loadProfile();
  } catch (error) {
    if (throwOnMissing) throw error;
    console.warn('[Resume Data Loader] Profile data not found or invalid');
  }
  
  try {
    resumeData.skills = loadSkills();
  } catch (error) {
    if (throwOnMissing) throw error;
    console.warn('[Resume Data Loader] Skills data not found or invalid');
  }
  
  try {
    resumeData.experience = loadExperience();
  } catch (error) {
    if (throwOnMissing) throw error;
    console.warn('[Resume Data Loader] Experience data not found or invalid');
  }
  
  try {
    resumeData.education = loadEducation();
  } catch (error) {
    if (throwOnMissing) throw error;
    console.warn('[Resume Data Loader] Education data not found or invalid');
  }
  
  try {
    resumeData.recommendations = loadRecommendations();
  } catch (error) {
    if (throwOnMissing) throw error;
    console.warn('[Resume Data Loader] Recommendations data not found or invalid');
  }
  
  return resumeData;
}

/**
 * Check if a resume data file exists
 */
export function resumeFileExists(filename: string): boolean {
  const filePath = path.join(DATA_DIR, filename);
  return fs.existsSync(filePath);
}

/**
 * Get paths to all resume data files
 */
export function getResumeDataPaths() {
  return {
    profile: path.join(DATA_DIR, 'profile.json'),
    skills: path.join(DATA_DIR, 'skills.json'),
    experience: path.join(DATA_DIR, 'experience.json'),
    education: path.join(DATA_DIR, 'education.json'),
    recommendations: path.join(DATA_DIR, 'recommendations.json'),
  };
}


