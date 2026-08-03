import React from "react";
import { Link } from "gatsby";
import OptimizedImage from "./OptimizedImage";

export interface AlbumCardProps {
  slug: string;
  title: string;
  date: string;
  description: string;
  coverImage: string;
  photoCount: number;
  videoCount: number;
  basePath: string;
  showViewLink?: boolean;
}

const AlbumCard: React.FC<AlbumCardProps> = ({
  slug,
  title,
  date,
  description,
  coverImage,
  photoCount,
  videoCount,
  basePath,
  showViewLink = false,
}) => {
  const formattedDate = new Date(date + "T00:00:00").toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const countLabel = `${photoCount} ${photoCount === 1 ? "photo" : "photos"}${videoCount > 0 ? `, ${videoCount} ${videoCount === 1 ? "video" : "videos"}` : ""}`;

  return (
    <Link
      key={slug}
      to={`${basePath}/${slug}`}
      className="hm-gallery-album-card"
    >
      <div className="hm-gallery-album-card-image">
        <OptimizedImage
          src={coverImage}
          alt={title}
          loading="lazy"
          sizes="(max-width: 480px) 100vw, (max-width: 768px) 50vw, 320px"
        />
      </div>
      <div className="hm-gallery-album-card-content">
        <h2 className="hm-gallery-album-card-title">{title}</h2>
        <p className="hm-gallery-album-card-date">{formattedDate}</p>
        {description && (
          <p className="hm-gallery-album-card-description">{description}</p>
        )}
        <span className="hm-gallery-album-card-count">
          {countLabel}{showViewLink ? " — View album →" : ""}
        </span>
      </div>
    </Link>
  );
};

export default AlbumCard;