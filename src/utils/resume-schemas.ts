/**
 * Zod Validation Schemas for Resume Data
 * 
 * These schemas provide runtime validation for all resume JSON files
 * during the Gatsby build process. They ensure data integrity and
 * provide clear error messages when validation fails.
 */

import { z } from 'zod';

/**
 * Social media link schema
 */
export const SocialLinkSchema = z.object({
  platform: z.string().min(1, 'Platform name is required'),
  url: z.string().url('Invalid URL format for social link'),
  icon: z.string().optional(),
});

/**
 * Profile data schema
 * Validates: /src/data/resume/profile.json
 */
export const ProfileSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  title: z.string().min(1, 'Professional title is required'),
  photo: z.string().min(1, 'Photo path is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(1, 'Phone number is required'),
  location: z.string().min(1, 'Location is required'),
  socialLinks: z.array(SocialLinkSchema),
  bio: z.string().min(10, 'Bio must be at least 10 characters'),
});

/**
 * Skill schema with 0-100 proficiency constraint
 * Validates: /src/data/resume/skills.json
 */
export const SkillSchema = z.object({
  name: z.string().min(1, 'Skill name is required'),
  proficiency: z.number()
    .min(0, 'Proficiency must be at least 0')
    .max(100, 'Proficiency must be at most 100')
    .int('Proficiency must be an integer'),
});

/**
 * Skills array schema
 */
export const SkillsSchema = z.array(SkillSchema).min(1, 'At least one skill is required');

/**
 * Work experience schema
 * Validates: /src/data/resume/experience.json
 */
export const ExperienceSchema = z.object({
  company: z.string().min(1, 'Company name is required'),
  title: z.string().min(1, 'Job title is required'),
  startDate: z.string().regex(
    /^\d{4}-\d{2}(-\d{2})?$/,
    'Start date must be in YYYY-MM or YYYY-MM-DD format'
  ),
  endDate: z.union([
    z.string().regex(
      /^\d{4}-\d{2}(-\d{2})?$/,
      'End date must be in YYYY-MM or YYYY-MM-DD format'
    ),
    z.literal('Present'),
  ]),
  description: z.string().min(1, 'Job description is required'),
});

/**
 * Experience array schema
 */
export const ExperienceArraySchema = z.array(ExperienceSchema);

/**
 * Education schema
 * Validates: /src/data/resume/education.json
 */
export const EducationSchema = z.object({
  institution: z.string().min(1, 'Institution name is required'),
  degree: z.string().min(1, 'Degree or certificate name is required'),
  startDate: z.string().regex(
    /^\d{4}-\d{2}(-\d{2})?$/,
    'Start date must be in YYYY-MM or YYYY-MM-DD format'
  ),
  endDate: z.string().regex(
    /^\d{4}-\d{2}(-\d{2})?$/,
    'End date must be in YYYY-MM or YYYY-MM-DD format'
  ),
});

/**
 * Education array schema
 */
export const EducationArraySchema = z.array(EducationSchema);

/**
 * Recommendation schema (transformed for display)
 * Validates: /src/data/resume/recommendations.json
 */
export const RecommendationSchema = z.object({
  quote: z.string().min(10, 'Recommendation quote must be at least 10 characters'),
  name: z.string().min(1, 'Recommender name is required'),
  title: z.string().min(1, 'Recommender title is required'),
  company: z.string().min(1, 'Recommender company is required'),
  photoPath: z.string().optional(),
});

/**
 * Recommendation cache schema with metadata
 * Validates the entire recommendations.json file structure
 */
export const RecommendationCacheSchema = z.object({
  fetchTimestamp: z.string().datetime('Invalid ISO 8601 datetime for fetchTimestamp'),
  sourceURL: z.string().url('Invalid source URL'),
  recommendations: z.array(RecommendationSchema),
});

/**
 * Validation helper functions
 * These functions parse and validate data, throwing descriptive errors on failure
 */

export function validateProfile(data: unknown) {
  return ProfileSchema.parse(data);
}

export function validateSkills(data: unknown) {
  return SkillsSchema.parse(data);
}

export function validateExperience(data: unknown) {
  return ExperienceArraySchema.parse(data);
}

export function validateEducation(data: unknown) {
  return EducationArraySchema.parse(data);
}

export function validateRecommendations(data: unknown) {
  return RecommendationCacheSchema.parse(data);
}

/**
 * Safe validation helpers that return results instead of throwing
 * Useful for optional data that may not exist yet
 */

export function safeValidateProfile(data: unknown) {
  return ProfileSchema.safeParse(data);
}

export function safeValidateSkills(data: unknown) {
  return SkillsSchema.safeParse(data);
}

export function safeValidateExperience(data: unknown) {
  return ExperienceArraySchema.safeParse(data);
}

export function safeValidateEducation(data: unknown) {
  return EducationArraySchema.safeParse(data);
}

export function safeValidateRecommendations(data: unknown) {
  return RecommendationCacheSchema.safeParse(data);
}

