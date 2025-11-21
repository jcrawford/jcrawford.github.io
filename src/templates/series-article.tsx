import React from 'react';
import { graphql, Link, PageProps, HeadFC } from 'gatsby';
import Layout from '../components/Layout';
import Sidebar from '../components/Sidebar';
import SeriesPrevNext from '../components/SeriesPrevNext';
import SeriesContext from '../components/SeriesContext';
import { formatDate } from '../utils/dateUtils';
import OptimizedImage from '../components/OptimizedImage';
import SEO from '../components/SEO';
import type { SeriesMetadata, SeriesArticle } from '../types';

interface SeriesArticleData {
  markdownRemark: {
    id: string;
    html: string;
    frontmatter: {
      slug: string;
      title: string;
      excerpt: string;
      featuredImage: string;
      category: string;
      tags: string[];
      author: string;
      publishedAt: string;
      updatedAt: string;
      series: {
        name: string;
        order?: number;
        references?: Array<{
          url: string;
          title?: string;
        }>;
        attachments?: Array<{
          filename: string;
          title?: string;
        }>;
      };
    };
  };
  tagsJson: {
    name: string;
    slug: string;
  };
  authorsJson: {
    name: string;
    slug: string;
    bio: string;
    avatar: string;
  };
  seriesArticles: {
    nodes: Array<{
      frontmatter: {
        slug: string;
        title: string;
        publishedAt: string;
        series?: {
          order?: number;
        };
      };
    }>;
  };
}

const SeriesArticleTemplate: React.FC<PageProps<SeriesArticleData>> = ({ data }) => {
  const article = data.markdownRemark.frontmatter;
  const articleHtml = data.markdownRemark.html;
  const category = data.tagsJson;
  const author = data.authorsJson;

  // Prepare series metadata
  const seriesMetadata: SeriesMetadata = {
    name: article.series.name,
    order: article.series.order,
    references: article.series.references,
    attachments: article.series.attachments,
  };

  // Prepare series articles for table of contents
  const seriesArticles: SeriesArticle[] = data.seriesArticles.nodes.map((node) => ({
    slug: node.frontmatter.slug,
    title: node.frontmatter.title,
    publishedAt: node.frontmatter.publishedAt,
    order: node.frontmatter.series?.order,
  }));

  // Sort articles by order and find prev/next based on position
  const sortedArticles = [...seriesArticles].sort((a, b) => 
    (a.order || 0) - (b.order || 0)
  );

  // Find current article index
  const currentIndex = sortedArticles.findIndex((a) => a.slug === article.slug);

  // Get prev/next based on position
  const prevArticleData = currentIndex > 0 
    ? sortedArticles[currentIndex - 1]
    : null;

  const nextArticleData = currentIndex < sortedArticles.length - 1
    ? sortedArticles[currentIndex + 1]
    : null;

  // Strip series name from article title
  const getDisplayTitle = (title: string): string => {
    const seriesName = article.series.name;
    const patterns = [
      `${seriesName}: `,
      `${seriesName} - `,
      `${seriesName} – `,
      `${seriesName}: `,
    ];
    
    let cleanTitle = title;
    for (const pattern of patterns) {
      if (cleanTitle.startsWith(pattern)) {
        cleanTitle = cleanTitle.substring(pattern.length);
        break;
      }
    }
    
    return cleanTitle;
  };

  const displayTitle = getDisplayTitle(article.title);

  return (
    <Layout>
      <div className="hm-container">
        <div className="hm-content-sidebar-wrap">
          <main className="hm-primary-content">
            {/* Series Navigation - Top */}
            {(prevArticleData || nextArticleData) && (
              <SeriesPrevNext
                prevSlug={prevArticleData?.slug}
                prevTitle={prevArticleData?.title}
                nextSlug={nextArticleData?.slug}
                nextTitle={nextArticleData?.title}
                seriesName={article.series.name}
                position="top"
              />
            )}

            <article className="hm-article">
              <header className="hm-article-header">
                <Link 
                  to={`/tag/${category.slug}`}
                  className="hm-article-category"
                >
                  {category.name}
                </Link>
                
                <h1 className="hm-article-title">{displayTitle}</h1>
                
                <div className="hm-article-meta">
                  <span className="hm-article-meta-by">by</span>
                  <Link to={`/author/${author.slug}`} className="hm-article-author-name">
                    {author.name}
                  </Link>
                  <span className="hm-article-meta-separator">•</span>
                  <time className="hm-article-date" dateTime={article.publishedAt}>
                    {formatDate(article.publishedAt)}
                  </time>
                  <span className="hm-article-meta-separator">•</span>
                  <span className="hm-article-comments">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                    </svg>
                    0
                  </span>
                </div>
              </header>

              <div className="hm-article-featured-image">
                <OptimizedImage 
                  src={article.featuredImage} 
                  alt={article.title}
                  loading="eager"
                />
              </div>

              {/* Series Context - Auto-generated */}
              <SeriesContext
                seriesName={article.series.name}
                currentOrder={article.series.order}
                totalArticles={seriesArticles.length}
              />

              <div 
                className="hm-article-content"
                dangerouslySetInnerHTML={{ __html: articleHtml }}
              />

              {article.tags.length > 0 && (
                <div className="hm-article-tags">
                  <span className="hm-article-tags-label">Tags:</span>
                  {article.tags.map((tag) => (
                    <span key={tag} className="hm-article-tag">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </article>

            {/* Series Navigation - Bottom */}
            {(prevArticleData || nextArticleData) && (
              <SeriesPrevNext
                prevSlug={prevArticleData?.slug}
                prevTitle={prevArticleData?.title}
                nextSlug={nextArticleData?.slug}
                nextTitle={nextArticleData?.title}
                seriesName={article.series.name}
                position="bottom"
              />
            )}
          </main>

          {/* Sidebar - Only Series Widget */}
          <Sidebar 
            currentSlug={article.slug}
            series={seriesMetadata}
            seriesArticles={seriesArticles}
          />
        </div>
      </div>
    </Layout>
  );
};

export const query = graphql`
  query SeriesArticleQuery(
    $slug: String!
    $category: String!
    $author: String!
    $seriesName: String!
  ) {
    markdownRemark(frontmatter: { slug: { eq: $slug } }) {
      id
      html
      frontmatter {
        slug
        title
        excerpt
        featuredImage
        category
        tags
        author
        publishedAt
        updatedAt
        series {
          name
          order
          references {
            url
            title
          }
          attachments {
            filename
            title
          }
        }
      }
    }
    tagsJson(slug: { eq: $category }) {
      name
      slug
    }
    authorsJson(slug: { eq: $author }) {
      name
      slug
      bio
      avatar
    }
    seriesArticles: allMarkdownRemark(
      filter: { frontmatter: { series: { name: { eq: $seriesName } } } }
      sort: [
        { frontmatter: { series: { order: ASC } } }
        { frontmatter: { publishedAt: ASC } }
      ]
    ) {
      nodes {
        frontmatter {
          slug
          title
          publishedAt
          series {
            order
          }
        }
      }
    }
  }
`;

export const Head: HeadFC<SeriesArticleData> = ({ data }) => {
  const frontmatter = data.markdownRemark.frontmatter;
  
  // Strip series name from title for SEO
  const getDisplayTitle = (title: string): string => {
    const seriesName = frontmatter.series.name;
    const patterns = [
      `${seriesName}: `,
      `${seriesName} - `,
      `${seriesName} – `,
      `${seriesName}: `,
    ];
    
    let cleanTitle = title;
    for (const pattern of patterns) {
      if (cleanTitle.startsWith(pattern)) {
        cleanTitle = cleanTitle.substring(pattern.length);
        break;
      }
    }
    
    return cleanTitle;
  };

  const displayTitle = getDisplayTitle(frontmatter.title);
  
  return (
    <SEO 
      title={displayTitle}
      description={frontmatter.excerpt}
      image={frontmatter.featuredImage}
      article={true}
      pathname={`/series/${frontmatter.slug}`}
    />
  );
};

export default SeriesArticleTemplate;

