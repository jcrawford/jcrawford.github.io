import React from 'react';
import { Link, graphql, PageProps } from 'gatsby';
import Layout from '../components/Layout';
import SEO from '../components/SEO';
import OptimizedImage from '../components/OptimizedImage';
import '../styles/gallery.css';

interface GalleryAlbumCard {
  slug: string;
  title: string;
  date: string;
  description: string;
  coverImage: string;
  photoCount: number;
  videoCount: number;
  category?: string;
}

interface CategoryMeta {
  slug: string;
  title: string;
  description: string;
  coverImage: string;
  parent: string | null;
}

interface GalleryIndexData {
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

interface GalleryIndexContext {
  categories: CategoryMeta[];
}

function renderAlbumCard(album: GalleryAlbumCard, basePath: string) {
  const formattedDate = new Date(album.date + 'T00:00:00').toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <Link
      key={album.slug}
      to={`${basePath}/${album.slug}`}
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
          {album.photoCount} {album.photoCount === 1 ? 'photo' : 'photos'}{album.videoCount > 0 ? `, ${album.videoCount} ${album.videoCount === 1 ? 'video' : 'videos'}` : ''}
        </span>
      </div>
    </Link>
  );
}

function renderCategoryCard(
  category: CategoryMeta,
  albumCount: number,
  photoCount: number,
  videoCount: number,
  hasChildren: boolean
) {
  let countLabel: string;
  const photoLabel = `${photoCount} ${photoCount === 1 ? 'photo' : 'photos'}`;
  const videoLabel = videoCount > 0 ? `, ${videoCount} ${videoCount === 1 ? 'video' : 'videos'}` : '';
  if (hasChildren) {
    countLabel = `${albumCount} ${albumCount === 1 ? 'collection' : 'collections'} · ${photoLabel}${videoLabel}`;
  } else {
    countLabel = `${albumCount} ${albumCount === 1 ? 'album' : 'albums'} · ${photoLabel}${videoLabel}`;
  }

  return (
    <Link
      key={category.slug}
      to={`/gallery/${category.slug}`}
      className="hm-gallery-category-card"
    >
      <div className="hm-gallery-album-card-image">
        <OptimizedImage
          src={category.coverImage}
          alt={category.title}
          loading="lazy"
          sizes="(max-width: 480px) 100vw, (max-width: 768px) 50vw, 320px"
        />
      </div>
      <div className="hm-gallery-album-card-content">
        <h2 className="hm-gallery-album-card-title">{category.title}</h2>
        <p className="hm-gallery-album-card-description">{category.description}</p>
        <span className="hm-gallery-album-card-count">
          {countLabel} — View →
        </span>
      </div>
    </Link>
  );
}

const GalleryIndex: React.FC<PageProps<GalleryIndexData, GalleryIndexContext>> = ({ data, pageContext }) => {
  const allAlbums: GalleryAlbumCard[] = data.allMarkdownRemark.nodes.map((node) => ({
    slug: node.frontmatter.slug,
    title: node.frontmatter.title,
    date: node.frontmatter.date,
    description: node.frontmatter.description,
    coverImage: node.frontmatter.coverImage,
    photoCount: node.frontmatter.photos.length,
    videoCount: node.frontmatter.videos ? node.frontmatter.videos.length : 0,
    category: node.frontmatter.category,
  }));

  const allCategories: CategoryMeta[] = pageContext.categories || [];

  // Build category lookups
  const categoryMap = new Map<string, CategoryMeta>();
  const topLevelCategories: CategoryMeta[] = [];
  const childCategoryMap = new Map<string, CategoryMeta[]>(); // parent slug -> children

  for (const cat of allCategories) {
    categoryMap.set(cat.slug, cat);
    if (cat.parent === null) {
      topLevelCategories.push(cat);
    } else {
      const existing = childCategoryMap.get(cat.parent) || [];
      existing.push(cat);
      childCategoryMap.set(cat.parent, existing);
    }
  }

  // Group albums by their leaf category
  const albumsByCategory = new Map<string, GalleryAlbumCard[]>();
  const standaloneAlbums: GalleryAlbumCard[] = [];

  for (const album of allAlbums) {
    if (album.category) {
      const existing = albumsByCategory.get(album.category) || [];
      existing.push(album);
      albumsByCategory.set(album.category, existing);
    } else {
      standaloneAlbums.push(album);
    }
  }

  // Sort each category's albums by date, newest first
  for (const [slug, albums] of albumsByCategory) {
    albums.sort((a, b) => b.date.localeCompare(a.date));
  }

  standaloneAlbums.sort((a, b) => b.date.localeCompare(a.date));

  // Count albums and photos under a top-level category
  // (walks through child categories to sum up)
  function countAlbumsForTopLevel(topSlug: string): { albumCount: number; photoCount: number; videoCount: number; hasChildren: boolean } {
    const children = childCategoryMap.get(topSlug) || [];
    let albumCount = 0;
    let photoCount = 0;
    let videoCount = 0;

    for (const child of children) {
      const albums = albumsByCategory.get(child.slug) || [];
      albumCount += albums.length;
      photoCount += albums.reduce((sum, a) => sum + a.photoCount, 0);
      videoCount += albums.reduce((sum, a) => sum + a.videoCount, 0);
    }

    // Also count albums directly under this top-level category (flat case)
    const directAlbums = albumsByCategory.get(topSlug) || [];
    albumCount += directAlbums.length;
    photoCount += directAlbums.reduce((sum, a) => sum + a.photoCount, 0);
    videoCount += directAlbums.reduce((sum, a) => sum + a.videoCount, 0);

    return { albumCount, photoCount, videoCount, hasChildren: children.length > 0 };
  }

  // Only show top-level categories that have albums (directly or via children)
  const activeTopCategories = topLevelCategories.filter((cat) => {
    const { albumCount } = countAlbumsForTopLevel(cat.slug);
    return albumCount > 0;
  });

  const hasCategories = activeTopCategories.length > 0;
  const hasStandalones = standaloneAlbums.length > 0;
  const hasContent = hasCategories || hasStandalones;

  return (
    <Layout>
      <div className="hm-container hm-gallery-index">
        <header className="hm-gallery-index-header">
          <h1 className="hm-gallery-index-title">Galleries</h1>
          <p className="hm-gallery-index-subtitle">
            Photos for family and friends — moments worth sharing.
          </p>
        </header>

        {!hasContent ? (
          <div className="hm-empty-state">
            <p>No albums yet. Check back soon!</p>
          </div>
        ) : (
          <>
            {hasCategories && (
              <section className="hm-gallery-categories-section">
                <div className="hm-gallery-albums-grid">
                  {activeTopCategories.map((category) => {
                    const { albumCount, photoCount, videoCount, hasChildren } = countAlbumsForTopLevel(category.slug);
                    return renderCategoryCard(category, albumCount, photoCount, videoCount, hasChildren);
                  })}
                </div>
              </section>
            )}

            {hasStandalones && (
              <section className="hm-gallery-standalone-section">
                <h2 className="hm-gallery-section-title">
                  {hasCategories ? 'More Albums' : 'Albums'}
                </h2>
                <div className="hm-gallery-albums-grid">
                  {standaloneAlbums.map((album) => renderAlbumCard(album, '/gallery'))}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </Layout>
  );
};

export default GalleryIndex;

import { HeadFC } from 'gatsby';

export const Head: HeadFC = () => <SEO title="Galleries" />;

export const query = graphql`
  query GalleryIndexQuery {
    allMarkdownRemark(
      filter: {
        fileAbsolutePath: { regex: "/content/galleries/" }
        frontmatter: { slug: { ne: null }, draft: { ne: true } }
      }
      sort: { frontmatter: { date: DESC } }
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