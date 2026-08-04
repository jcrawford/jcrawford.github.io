import React from 'react';

interface DraftBadgeProps {
  size?: 'sm' | 'md';
}

export default function DraftBadge({ size = 'sm' }: DraftBadgeProps) {
  return (
    <span
      className={`hm-draft-badge hm-draft-badge-${size}`}
      aria-label="Draft"
      title="This article is a draft and not published"
    >
      DRAFT
    </span>
  );
}
