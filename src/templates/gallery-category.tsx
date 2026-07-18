import React from 'react';
import { Link, graphql, PageProps } from 'gatsby';
import Layout from '../components/Layout';
import SEO from '../components/SEO';
import OptimizedImage from '../components/OptimizedImage';
import '../styles/gallery.css';

interface GalleryCategoryData {
  allMarkdownRemark: {
    nodes: Array<{
      frontmatter: {
        slug: string;
        title: string;
        date: string;
        description: string;
        coverImage: string;
        category?: string;
        photos: Array<{ src: string; alt: string }>;
        videos: any;
      };
    }>;
  };
}

interface ChildCategoryMeta {
  slug: string;
  title: string;
  description: string;
  coverImage: string;
  parent: string | null;
}

interface GalleryCategoryContext {
  categorySlug: string;
  categoryTitle: string;
  categoryDescription: string;
  categoryCoverImage: string;
  isTopLevel: boolean;
  childCategories?: ChildCategoryMeta[];
  parentSlug?: string;
  parentTitle?: string;
}

function renderAlbumCard(
  album: {
    slug: string;
    title: string;
    date: string;
    description: string;
    coverImage: string;
    photoCount: number;
    videoCount: number;
  },
  parentPath: string
) {
  const formattedDate = new Date(album.date + 'T00:00:00').toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <Link
      key={album.slug}
      to={`${parentPath}/${album.slug}`}
      className="hm-gallery-album-card"
    >
      <div className="hm-gallery-album-card-image">
        <OptimizedImage
          src={album.coverImage}
          alt={album.title}
          loading="lazy"
          sizes="(max-width: 480px) 100vw, (max-width: 768px) 50vw, 320px"
        />
      </div>
      <div className="hm-gallery-album-card-content">
        <h2 className="hm-gallery-album-card-title">{album.title}</h2>
        <p className="hm-gallery-album-card-date">{formattedDate}</p>
        {album.description && (
          <p className="hm-gallery-album-card-description">{album.description}</p>
        )}
        <span className="hm-gallery-album-card-count">
          {album.photoCount} {album.photoCount === 1 ? 'photo' : 'photos'}{album.videoCount > 0 ? `, ${album.videoCount} ${album.videoCount === 1 ? 'video' : 'videos'}` : ''} — View album →
        </span>
      </div>
    </Link>
  );
}

const GalleryCategoryTemplate: React.FC<PageProps<GalleryCategoryData, GalleryCategoryContext>> = ({ data, pageContext }) => {
  const {
    categorySlug,
    categoryTitle,
    categoryDescription,
    categoryCoverImage,
    isTopLevel,
    childCategories,
    parentSlug,
    parentTitle,
  } = pageContext;

  // Build breadcrumb items
  const breadcrumb = (
    <nav className="hm-gallery-breadcrumb" aria-label="Breadcrumb">
      <Link to="/gallery">Galleries</Link>
      {parentSlug && parentTitle && (
        <>
          <span className="hm-breadcrumb-separator">›</span>
          <Link to={`/gallery/${parentSlug}`}>{parentTitle}</Link>
        </>
      )}
      <span className="hm-breadcrumb-separator">›</span>
      <span>{categoryTitle}</span>
    </nav>
  );

  // Build back link
  const backLink = parentSlug ? (
    <Link to={`/gallery/${parentSlug}`} className="hm-cta-btn">← Back to {parentTitle}</Link>
  ) : (
    <Link to="/gallery" className="hm-cta-btn">← Back to Galleries</Link>
  );

  // If this category has subcategories, show them
  if (childCategories && childCategories.length > 0) {
    return (
      <Layout>
        <div className="hm-container hm-gallery-category">
          {/* Hero Banner */}
          <div className="hm-gallery-category-hero">
            <OptimizedImage
              src={categoryCoverImage}
              alt={categoryTitle}
              loading="eager"
              sizes="100vw"
            />
            <div className="hm-gallery-category-hero-overlay">
              {breadcrumb}
              <h1 className="hm-gallery-category-title">{categoryTitle}</h1>
              <p className="hm-gallery-category-description">{categoryDescription}</p>
              <p className="hm-gallery-category-meta">
                {childCategories.length} {childCategories.length === 1 ? 'collection' : 'collections'}
              </p>
            </div>
          </div>

          {/* Subcategory Grid */}
          <div className="hm-gallery-albums-grid">
            {childCategories.map((child) => (
              <Link
                key={child.slug}
                to={`/gallery/${categorySlug}/${child.slug}`}
                className="hm-gallery-album-card"
              >
                <div className="hm-gallery-album-card-image">
                  <OptimizedImage
                    src={child.coverImage}
                    alt={child.title}
                    loading="lazy"
                    sizes="(max-width: 480px) 100vw, (max-width: 768px) 50vw, 320px"
                  />
                </div>
                <div className="hm-gallery-album-card-content">
                  <h2 className="hm-gallery-album-card-title">{child.title}</h2>
                  <p className="hm-gallery-album-card-description">{child.description}</p>
                  <span className="hm-gallery-album-card-count">
                    View collection →
                  </span>
                </div>
              </Link>
            ))}
          </div>

          <nav className="hm-gallery-back">
            {backLink}
          </nav>
        </div>
      </Layout>
    );
  }
  }

  // For leaf categories: show album cards
  const albums = data.allMarkdownRemark.nodes
    .filter((node) => node.frontmatter.category === categorySlug)
    .map((node) => ({
      slug: node.frontmatter.slug,
      title: node.frontmatter.title,
      date: node.frontmatter.date,
      description: node.frontmatter.description,
      coverImage: node.frontmatter.coverImage,
      photoCount: node.frontmatter.photos.length,
      videoCount: node.frontmatter.videos ? node.frontmatter.videos.length : 0,
    }));

  albums.sort((a, b) => b.date.localeCompare(a.date));

  const totalPhotos = albums.reduce((sum, album) => sum + album.photoCount, 0);
  const totalVideos = albums.reduce((sum, album) => sum + album.videoCount, 0);
  const parentPath = parentSlug ? `/gallery/${parentSlug}/${categorySlug}` : `/gallery/${categorySlug}`;

  return (
    <Layout>
      <div className="hm-container hm-gallery-category">
        {/* Hero Banner */}
        <div className="hm-gallery-category-hero">
          <OptimizedImage
            src={categoryCoverImage}
            alt={categoryTitle}
            loading="eager"
            sizes="100vw"
          />
          <div className="hm-gallery-category-hero-overlay">
            {breadcrumb}
            <h1 className="hm-gallery-category-title">{categoryTitle}</h1>
            <p className="hm-gallery-category-description">{categoryDescription}</p>
            <p className="hm-gallery-category-meta">
              {albums.length} {albums.length === 1 ? 'album' : 'albums'} · {totalPhotos} {totalPhotos === 1 ? 'photo' : 'photos'}{totalVideos > 0 ? `, ${totalVideos} ${totalVideos === 1 ? 'video' : 'videos'}` : ''}
            </p>
          </div>
        </div>

        {/* Album Grid */}
        {albums.length === 0 ? (
          <div className="hm-empty-state">
            <p>No albums in this collection yet. Check back soon!</p>
          </div>
        ) : (
          <div className="hm-gallery-albums-grid">
            {albums.map((album) => renderAlbumCard(album, parentPath))}
          </div>
        )}

        <nav className="hm-gallery-back">
          {backLink}
        </nav>
      </div>
    </Layout>
  );
};

export default GalleryCategoryTemplate;

import { HeadFC } from 'gatsby';

export const Head: HeadFC<GalleryCategoryData, GalleryCategoryContext> = ({ pageContext }) => (
  <SEO title={pageContext.categoryTitle} />
);

export const query = graphql`
  query GalleryCategoryQuery {
    allMarkdownRemark(
      filter: {
        fileAbsolutePath: { regex: "/content/galleries/" }
        frontmatter: { slug: { ne: null }, draft: { ne: true } }
      }
    ) {
      nodes {
        frontmatter {
          slug
          title
          date
          description
          coverImage
          category
          photos {
            src
            alt
          }
          videos
        }
      }
    }
  }
`;