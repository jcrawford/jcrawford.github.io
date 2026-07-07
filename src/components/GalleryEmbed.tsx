import React from 'react';
import { Link } from 'gatsby';
import OptimizedImage from './OptimizedImage';

interface GalleryEmbedProps {
  title: string;
  slug: string;
  coverImage: string;
  description?: string;
  photoCount?: number;
  date?: string;
}

const GalleryEmbed: React.FC<GalleryEmbedProps> = ({
  title,
  slug,
  coverImage,
  description,
  photoCount,
  date,
}) => {
  const formattedDate = date
    ? new Date(date + 'T00:00:00').toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : null;

  return (
    <Link to={`/gallery/${slug}`} className="hm-gallery-embed">
      <div className="hm-gallery-embed-image">
        <OptimizedImage src={coverImage} alt={title} loading="lazy" />
      </div>
      <div className="hm-gallery-embed-content">
        <h3 className="hm-gallery-embed-title">📷 {title}</h3>
        {formattedDate && (
          <p className="hm-gallery-embed-date">{formattedDate}</p>
        )}
        {description && (
          <p className="hm-gallery-embed-description">{description}</p>
        )}
        {photoCount !== undefined && (
          <span className="hm-gallery-embed-count">
            {photoCount} {photoCount === 1 ? 'photo' : 'photos'} — View full gallery →
          </span>
        )}
      </div>
    </Link>
  );
};

export default GalleryEmbed;