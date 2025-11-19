import React from 'react';
import { graphql, Link, PageProps, HeadFC } from 'gatsby';
import Layout from '../components/Layout';
import ArticleCard from '../components/ArticleCard';
import SEO from '../components/SEO';

interface TagPageData {
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
        category: string;
        author: string;
        publishedAt: string;
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
  limit: number;
  skip: number;
  numPages: number;
  currentPage: number;
}

const TagTemplate: React.FC<PageProps<TagPageData, TagPageContext>> = ({ 
  data, 
  pageContext 
}) => {
  const tag = data.tagsJson;
  const articles = data.allMarkdownRemark.nodes;
  const totalCount = data.allMarkdownRemark.totalCount;
  const tags = data.allTagsJson.nodes;
  const authors = data.allAuthorsJson.nodes;
  const { numPages, currentPage } = pageContext;

  const getTagName = (slug: string) => {
    const t = tags.find((t) => t.slug === slug);
    return t?.name || slug;
  };

  const getAuthorName = (slug: string) => {
    const author = authors.find((a) => a.slug === slug);
    return author?.name || slug;
  };

  return (
    <Layout>
      <div className="hm-container">
        <header className="hm-category-header">
          <h1 className="hm-category-title">{tag.name}</h1>
          <p className="hm-category-description">{tag.description}</p>
          <p className="hm-category-count">
            {totalCount} {totalCount === 1 ? 'article' : 'articles'}
          </p>
        </header>

        {articles.length > 0 ? (
          <>
            <div className="hm-article-grid">
              {articles.map((article) => (
                <ArticleCard
                  key={article.id}
                  slug={article.frontmatter.slug}
                  title={article.frontmatter.title}
                  excerpt={article.frontmatter.excerpt}
                  featuredImage={article.frontmatter.featuredImage}
                  category={article.frontmatter.category}
                  categoryName={getTagName(article.frontmatter.category)}
                  publishedAt={article.frontmatter.publishedAt}
                  author={article.frontmatter.author}
                  authorName={getAuthorName(article.frontmatter.author)}
                  isSeries={!!article.frontmatter.series?.name}
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
  query TagQuery($slug: String!, $limit: Int!, $skip: Int!) {
    tagsJson(slug: { eq: $slug }) {
      name
      slug
      description
    }
    allMarkdownRemark(
      filter: { frontmatter: { category: { eq: $slug } } }
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
          category
          author
          publishedAt
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
  />
);

export default TagTemplate;

