import React from 'react';
import { Link } from 'gatsby';
import OptimizedImage from './OptimizedImage';

interface GalleryEmbedProps {
  title: string;
  slug: string;
  path?: string;
  coverImage: string;
  description?: string;
  photoCount?: number;
  videoCount?: number;
  date?: string;
}

const GalleryEmbed: React.FC<GalleryEmbedProps> = ({
  title,
  slug,
  path,
  coverImage,
  description,
  photoCount,
  videoCount,
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
    <Link to={path || `/gallery/${slug}`} className="hm-gallery-embed">
      <div className="hm-gallery-embed-image">
        <OptimizedImage
          src={coverImage}
          alt={title}
          loading="lazy"
          sizes="(max-width: 600px) 100vw, 280px"
        />
      </div>
      <div className="hm-gallery-embed-content">
        <h3 className="hm-gallery-embed-title">📷 {title}</h3>
        {formattedDate && (
          <p className="hm-gallery-embed-date">{formattedDate}</p>
        )}
        {description && (
          <p className="hm-gallery-embed-description">{description}</p>
        )}
        {(photoCount !== undefined || videoCount !== undefined) && (
          <span className="hm-gallery-embed-count">
            {photoCount !== undefined && photoCount > 0 && (
              <>
                {photoCount} {photoCount === 1 ? 'photo' : 'photos'}
              </>
            )}
            {photoCount !== undefined && photoCount > 0 && videoCount !== undefined && videoCount > 0 && (
              <>
                {' — '}
              </>
            )}
            {videoCount !== undefined && videoCount > 0 && (
              <>
                {videoCount} {videoCount === 1 ? 'video' : 'videos'}
              </>
            )}
            {' — View full gallery →'}
          </span>
        )}
      </div>
    </Link>
  );
};

export default GalleryEmbed;