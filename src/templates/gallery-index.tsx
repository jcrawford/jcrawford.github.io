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
        photos: Array<{ src: string; alt: string }>;
      };
    }>;
  };
}

const GalleryIndex: React.FC<PageProps<GalleryIndexData>> = ({ data }) => {
  const albums: GalleryAlbumCard[] = data.allMarkdownRemark.nodes.map((node) => ({
    slug: node.frontmatter.slug,
    title: node.frontmatter.title,
    date: node.frontmatter.date,
    description: node.frontmatter.description,
    coverImage: node.frontmatter.coverImage,
    photoCount: node.frontmatter.photos.length,
  }));

  // Sort albums by date, newest first
  albums.sort((a, b) => b.date.localeCompare(a.date));

  return (
    <Layout>
      <div className="hm-container hm-gallery-index">
        <header className="hm-gallery-index-header">
          <h1 className="hm-gallery-index-title">Photo Gallery</h1>
          <p className="hm-gallery-index-subtitle">
            Photos for family and friends — moments worth sharing.
          </p>
        </header>

        {albums.length === 0 ? (
          <div className="hm-empty-state">
            <p>No albums yet. Check back soon!</p>
          </div>
        ) : (
          <div className="hm-gallery-albums-grid">
            {albums.map((album) => {
              const formattedDate = new Date(album.date + 'T00:00:00').toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              });

              return (
                <Link
                  key={album.slug}
                  to={`/gallery/${album.slug}`}
                  className="hm-gallery-album-card"
                >
                  <div className="hm-gallery-album-card-image">
                    <OptimizedImage
                      src={album.coverImage}
                      alt={album.title}
                      loading="lazy"
                    />
                  </div>
                  <div className="hm-gallery-album-card-content">
                    <h2 className="hm-gallery-album-card-title">{album.title}</h2>
                    <p className="hm-gallery-album-card-date">{formattedDate}</p>
                    {album.description && (
                      <p className="hm-gallery-album-card-description">{album.description}</p>
                    )}
                    <span className="hm-gallery-album-card-count">
                      {album.photoCount} {album.photoCount === 1 ? 'photo' : 'photos'}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default GalleryIndex;

import { HeadFC } from 'gatsby';

export const Head: HeadFC = () => <SEO title="Gallery" />;

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
          photos {
            src
            alt
          }
        }
      }
    }
  }
`;