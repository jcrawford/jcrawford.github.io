import React, { useState, useCallback, useEffect } from 'react';
import { Link, graphql, PageProps } from 'gatsby';
import Layout from '../components/Layout';
import SEO from '../components/SEO';
import { RowsPhotoAlbum } from 'react-photo-album';
import 'react-photo-album/rows.css';
import Lightbox from 'yet-another-react-lightbox';
import 'yet-another-react-lightbox/styles.css';
import Thumbnails from 'yet-another-react-lightbox/plugins/thumbnails';
import 'yet-another-react-lightbox/plugins/thumbnails.css';
import Zoom from 'yet-another-react-lightbox/plugins/zoom';
import Captions from 'yet-another-react-lightbox/plugins/captions';
import 'yet-another-react-lightbox/plugins/captions.css';
import Counter from 'yet-another-react-lightbox/plugins/counter';
import 'yet-another-react-lightbox/plugins/counter.css';
import type { GalleryPhoto, GalleryVideo } from '../types/gallery';
import { buildSrcSetVariants, buildWebpSrcSetVariants, GALLERY_SIZES } from '../utils/galleryImages';
import '../styles/gallery.css';

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}

interface GalleryAlbumData {
  markdownRemark: {
    frontmatter: {
      title: string;
      slug: string;
      date: string;
      description: string;
      coverImage: string;
      category?: string;
      photos: GalleryPhoto[];
      videos?: GalleryVideo[];
    };
    html: string;
  };
}

interface GalleryAlbumContext {
  categorySlug: string | null;
  categoryTitle: string | null;
  parentCategorySlug: string | null;
  parentCategoryTitle: string | null;
  photoViewCounts?: Record<string, number>;
}

const GalleryAlbumTemplate: React.FC<PageProps<GalleryAlbumData, GalleryAlbumContext>> = ({ data, pageContext }) => {
  const { frontmatter, html } = data.markdownRemark;
  const { title, date, description, photos, videos } = frontmatter;
  const { categorySlug, categoryTitle, parentCategorySlug, parentCategoryTitle, photoViewCounts } = pageContext;

  const [lightboxIndex, setLightboxIndex] = useState(-1);

  const openLightbox = useCallback((index: number) => {
    setLightboxIndex(index);
  }, []);

  const closeLightbox = useCallback(() => {
    setLightboxIndex(-1);
  }, []);

  // Track photo views in GA4 when lightbox index changes
  useEffect(() => {
    if (lightboxIndex >= 0 && lightboxIndex < photos.length && typeof window !== 'undefined' && window.gtag) {
      const photo = photos[lightboxIndex];
      window.gtag('event', 'photo_view', {
        photo_url: photo.src,
        album_title: title,
      });
    }
  }, [lightboxIndex, photos, title]);

  // Format date for display
  const formattedDate = new Date(date + 'T00:00:00').toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Build responsive srcSet arrays for the photo album and lightbox
  const albumPhotos = photos.map((photo) => ({
    src: photo.src,
    width: photo.width,
    height: photo.height,
    alt: photo.alt,
    title: photo.caption || photo.alt,
    srcSet: buildSrcSetVariants(photo.src, photo.width, photo.height),
  }));

  const lightboxSlides = photos.map((photo) => ({
    src: photo.src,
    alt: photo.alt,
    width: photo.width,
    height: photo.height,
    title: photo.caption || photo.alt,
    srcSet: buildSrcSetVariants(photo.src, photo.width, photo.height),
  }));

  return (
    <Layout>
      <div className="hm-container hm-gallery-album">
        <nav className="hm-gallery-breadcrumb" aria-label="Breadcrumb">
          <Link to="/gallery">Galleries</Link>
          {parentCategorySlug && parentCategoryTitle && (
            <>
              <span className="hm-breadcrumb-separator">›</span>
              <Link to={`/gallery/${parentCategorySlug}`}>{parentCategoryTitle}</Link>
            </>
          )}
          {categorySlug && categoryTitle && (
            <>
              <span className="hm-breadcrumb-separator">›</span>
              <Link to={parentCategorySlug ? `/gallery/${parentCategorySlug}/${categorySlug}` : `/gallery/${categorySlug}`}>
                {categoryTitle}
              </Link>
            </>
          )}
          <span className="hm-breadcrumb-separator">›</span>
          <span>{title}</span>
        </nav>

        <header className="hm-gallery-album-header">
          <h1 className="hm-gallery-album-title">{title}</h1>
          <p className="hm-gallery-album-date">{formattedDate}</p>
          {description && (
            <p className="hm-gallery-album-description">{description}</p>
          )}
        </header>

        {html && html.trim() !== '<p></p>' && (
          <div
            className="hm-gallery-album-body hm-article-content"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        )}

        {videos && videos.length > 0 && (
          <div className="hm-gallery-videos">
            {videos.map((video) => (
              <div key={video.src} className="hm-gallery-video">
                <video
                  src={video.src}
                  controls
                  muted
                  playsInline
                  preload="metadata"
                  aria-label={video.alt}
                  style={{ width: '100%', borderRadius: '4px' }}
                />
                {video.caption && (
                  <p className="hm-gallery-video-caption">{video.caption}</p>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="hm-gallery-grid">
          <RowsPhotoAlbum
            photos={albumPhotos}
            targetRowHeight={280}
            rowConstraints={{ minPhotos: 2 }}
            spacing={6}
            padding={0}
            defaultContainerWidth={1200}
            sizes={GALLERY_SIZES}
            componentsProps={{
              image: { loading: 'lazy', decoding: 'async' },
            }}
            onClick={({ index }) => openLightbox(index)}
          />
        </div>

        <Lightbox
          open={lightboxIndex >= 0}
          close={closeLightbox}
          index={lightboxIndex}
          slides={lightboxSlides}
          plugins={[Thumbnails, Zoom, Captions, Counter]}
          animation={{ swipe: 300 }}
          carousel={{ finite: false }}
          styles={{
            container: { backgroundColor: 'rgba(0, 0, 0, 0.92)' },
          }}
          render={{
            slideFooter: () => {
              const currentPhoto = lightboxIndex >= 0 ? photos[lightboxIndex] : null;
              const viewCount = currentPhoto ? (photoViewCounts?.[currentPhoto.src] || 0) : 0;
              if (viewCount === 0) return null;
              return (
                <div className="hm-photo-view-badge">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                  {viewCount} {viewCount === 1 ? 'view' : 'views'}
                </div>
              );
            },
          }}
        />

        <nav className="hm-gallery-back">
          {categorySlug && categoryTitle ? (
            <Link
              to={parentCategorySlug ? `/gallery/${parentCategorySlug}/${categorySlug}` : `/gallery/${categorySlug}`}
              className="hm-cta-btn"
            >
              ← Back to {categoryTitle}
            </Link>
          ) : (
            <Link to="/gallery" className="hm-cta-btn">← Back to Galleries</Link>
          )}
        </nav>
      </div>
    </Layout>
  );
};

export default GalleryAlbumTemplate;

import { HeadFC } from 'gatsby';

export const Head: HeadFC = () => <SEO title="Galleries" />;

export const query = graphql`
  query GalleryAlbumQuery($slug: String!) {
    markdownRemark(
      frontmatter: { slug: { eq: $slug } }
      fileAbsolutePath: { regex: "/content/galleries/" }
    ) {
      frontmatter {
        title
        slug
        date
        description
        coverImage
        photos {
          src
          alt
          width
          height
          caption
        }
        videos
      }
      html
    }
  }
`;