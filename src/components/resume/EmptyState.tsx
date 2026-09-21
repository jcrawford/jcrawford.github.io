/**
 * Empty State Component
 * 
 * Displays a friendly message when a resume section has no data.
 * Per spec: empty sections should be hidden entirely (no visual indication).
 * This component is for future use if needed.
 */

import React from 'react';

interface EmptyStateProps {
  message?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({ message = 'No data available' }) => {
  return (
    <div className="resume-empty-state">
      <p>{message}</p>
    </div>
  );
};

export default EmptyState;


