import React from 'react';

interface EmptyFeaturedStateProps {
  message?: string;
}

/**
 * Displays a message when no featured posts are configured.
 * Prompts content editors to mark posts with featured: true in frontmatter.
 * 
 * @param message - Custom message to display (default: "No featured posts configured")
 * @returns Empty state component with editor guidance
 */
const EmptyFeaturedState: React.FC<EmptyFeaturedStateProps> = ({ 
  message = "No featured posts configured" 
}) => {
  return (
    <div className="empty-featured-state">
      <div className="empty-featured-content">
        <p className="empty-featured-message">{message}</p>
        <p className="empty-featured-hint">
          Mark posts with <code>featured: true</code> in frontmatter to display them here.
        </p>
      </div>
    </div>
  );
};

export default EmptyFeaturedState;

