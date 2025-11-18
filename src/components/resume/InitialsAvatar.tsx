/**
 * Initials Avatar Component
 * 
 * Displays a circular avatar with the person's initials when no photo is available.
 * Provides a clean, personalized fallback for missing profile images.
 */

import React from 'react';

interface InitialsAvatarProps {
  name: string;
  size?: number;
}

const InitialsAvatar: React.FC<InitialsAvatarProps> = ({ name, size = 60 }) => {
  /**
   * Extract initials from a full name
   * Examples:
   * - "John Doe" -> "JD"
   * - "Mary Jane Smith" -> "MS" (first and last)
   * - "Prince" -> "PR" (first two letters)
   */
  const getInitials = (fullName: string): string => {
    const parts = fullName.trim().split(/\s+/);
    if (parts.length >= 2) {
      // Use first letter of first name and first letter of last name
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    // Single name: use first two letters
    return fullName.substring(0, 2).toUpperCase();
  };

  return (
    <div 
      className="initials-avatar" 
      style={{ width: size, height: size }}
      aria-label={`Avatar for ${name}`}
    >
      {getInitials(name)}
    </div>
  );
};

export default InitialsAvatar;

