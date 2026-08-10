import React from 'react';
import { graphql, Link, PageProps, HeadFC } from 'gatsby';
import Layout from '../components/Layout';
import ArticleCard from '../components/ArticleCard';
import DraftBadge from '../components/DraftBadge';
import SEO from '../components/SEO';
import { formatDate } from '../utils/dateUtils';

interface TagPageData {
  site: {
    siteMetadata: {
      title: string;
      description: string;
      siteUrl: string;
    };
  };
  tagsJson: {
    name: string;
    slug: string;
    description: string;
  };
  allMarkdownRemark: {
    nodes: Array<{
      id: string;
      html: string;
      frontmatter: {
        slug: string;
        title: string;
        excerpt: string;
        featuredImage: string;
        tags: string[];
        author: string;
        publishedAt: string;
        rating?: number;
        draft?: boolean;
        review?: {
          rating?: number;
        };
        series?: {
          name: string;
        };
      };
    }>;
    totalCount: number;
  };
  allTagsJson: {
    nodes: Array<{
      slug: string;
      name: string;
    }>;
  };
  allAuthorsJson: {
    nodes: Array<{
      slug: string;
      name: string;
    }>;
  };
}

interface TagPageContext {
  slug: string;
  articleSlugs: string[];
  seriesCards: Array<{
    name: string;
    slug: string;
    description: string;
    featuredImage: string;
    publishedAt: string;
    draft?: boolean;
  }>;
  limit: number;
  skip: number;
  numPages: number;
  currentPage: number;
  totalCount: number;
}

interface SeriesCard {
  name: string;
  slug: string;
  description: string;
  featuredImage: string;
  publishedAt: string;
  draft?: boolean;
}

const TagTemplate: React.FC<PageProps<TagPageData, TagPageContext>> = ({ 
  data, 
  pageContext 
}) => {
  const tag = data.tagsJson;
  const articles = data.allMarkdownRemark.nodes;
  const authors = data.allAuthorsJson.nodes;
  const { numPages, currentPage, seriesCards } = pageContext;

  const getAuthorName = (slug: string) => {
    const author = authors.find((a) => a.slug === slug);
    return author?.name || slug;
  };

  const SeriesCardComponent: React.FC<{ card: SeriesCard; tagSlug: string }> = ({ card, tagSlug }) => (
    <Link
      key={card.slug}
      to={tagSlug === 'brewing' ? `/brewing` : `/series/${card.slug}`}
      className="hm-article-card"
    >
      {card.featuredImage && (
        <div className="hm-article-card-image">
          <img
            src={card.featuredImage}
            alt={card.name}
            loading="lazy"
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
        </div>
      )}
      <div className="hm-article-card-content">
        <h2 className="hm-article-card-title">{card.name}</h2>
        {card.draft && <DraftBadge size="md" />}
        <p className="hm-article-card-excerpt">{card.description}</p>
        <div className="hm-article-card-meta">
          <span>{formatDate(card.publishedAt)}</span>
        </div>
      </div>
    </Link>
  );

  return (
    <Layout>
      <div className="hm-container">
        <header className="hm-category-header">
          <h1 className="hm-category-title">{tag.name}</h1>
          <p className="hm-category-description">{tag.description}</p>
        </header>

        {(articles.length > 0 || seriesCards.length > 0) ? (
          <>
            <div className="hm-article-grid">
              {seriesCards.map((card) => (
                <SeriesCardComponent
                  key={card.slug}
                  card={card}
                  tagSlug={tag.slug}
                />
              ))}
              {articles.map((article) => (
                <ArticleCard
                  key={article.id}
                  slug={article.frontmatter.slug}
                  title={article.frontmatter.title}
                  excerpt={article.frontmatter.excerpt}
                  featuredImage={article.frontmatter.featuredImage}
                  tags={article.frontmatter.tags || []}
                  publishedAt={article.frontmatter.publishedAt}
                  author={article.frontmatter.author}
                  authorName={getAuthorName(article.frontmatter.author)}
                  isSeries={!!article.frontmatter.series?.name}
                  rating={article.frontmatter.rating ?? article.frontmatter.review?.rating}
                  isDraft={!!article.frontmatter.draft}
                />
              ))}
            </div>

            {numPages > 1 && (
              <nav className="hm-pagination" aria-label="Pagination">
                <div className="hm-pagination-inner">
                  {currentPage > 1 && (
                    <Link
                      to={currentPage === 2 
                        ? `/tag/${tag.slug}` 
                        : `/tag/${tag.slug}/${currentPage - 1}`
                      }
                      className="hm-pagination-prev"
                      rel="prev"
                    >
                      ← Previous
                    </Link>
                  )}

                  <div className="hm-pagination-numbers">
                    {Array.from({ length: numPages }, (_, i) => i + 1).map((page) => {
                      const isCurrent = page === currentPage;
                      const path = page === 1 
                        ? `/tag/${tag.slug}` 
                        : `/tag/${tag.slug}/${page}`;
                      
                      return isCurrent ? (
                        <span key={page} className="hm-pagination-number active" aria-current="page">
                          {page}
                        </span>
                      ) : (
                        <Link
                          key={page}
                          to={path}
                          className="hm-pagination-number"
                        >
                          {page}
                        </Link>
                      );
                    })}
                  </div>

                  {currentPage < numPages && (
                    <Link
                      to={`/tag/${tag.slug}/${currentPage + 1}`}
                      className="hm-pagination-next"
                      rel="next"
                    >
                      Next →
                    </Link>
                  )}
                </div>
              </nav>
            )}
          </>
        ) : (
          <div className="hm-empty-state">
            <p>No articles found with this tag yet.</p>
            <Link to="/" className="hm-cta-btn">
              Browse All Articles
            </Link>
          </div>
        )}
      </div>
    </Layout>
  );
};

export const query = graphql`
  query TagQuery($slug: String!, $articleSlugs: [String!]!, $limit: Int!, $skip: Int!) {
    site {
      siteMetadata {
        title
        description
        siteUrl
      }
    }
    tagsJson(slug: { eq: $slug }) {
      name
      slug
      description
    }
    allMarkdownRemark(
      filter: { frontmatter: { slug: { in: $articleSlugs } } }
      sort: { frontmatter: { publishedAt: DESC } }
      limit: $limit
      skip: $skip
    ) {
      nodes {
        id
        html
        frontmatter {
          slug
          title
          excerpt
          featuredImage
          tags
          author
          publishedAt
          rating
          draft
          review {
            rating
          }
          series {
            name
          }
        }
      }
      totalCount
    }
    allTagsJson {
      nodes {
        slug
        name
      }
    }
    allAuthorsJson {
      nodes {
        slug
        name
      }
    }
  }
`;

export const Head: HeadFC<TagPageData> = ({ data }) => (
  <SEO 
    title={data.tagsJson.name}
    description={data.tagsJson.description}
    pathname={`/tag/${data.tagsJson.slug}`}
    siteMetadata={data.site.siteMetadata}
  />
);

export default TagTemplate;

