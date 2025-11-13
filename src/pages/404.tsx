import React from 'react';
import { Link, HeadFC, PageProps, graphql } from 'gatsby';
import Layout from '../components/Layout';
import ArticleCard from '../components/ArticleCard';
import SEO from '../components/SEO';

interface Article {
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
  };
}

interface Category {
  slug: string;
  name: string;
}

interface Author {
  slug: string;
  name: string;
}

interface NotFoundPageData {
  allMarkdownRemark: {
    nodes: Article[];
  };
  allCategoriesJson: {
    nodes: Category[];
  };
  allAuthorsJson: {
    nodes: Author[];
  };
}

const NotFoundPage: React.FC<PageProps<NotFoundPageData>> = ({ data }) => {
  const articles = data.allMarkdownRemark.nodes;
  const categories = data.allCategoriesJson.nodes;
  const authors = data.allAuthorsJson.nodes;

  const getCategoryName = (slug: string) => {
    const category = categories.find((cat) => cat.slug === slug);
    return category?.name || slug;
  };

  const getAuthorName = (slug: string) => {
    const author = authors.find((auth) => auth.slug === slug);
    return author?.name || slug;
  };

  return (
    <Layout>
      <div className="hm-container">
        <div className="hm-404-page">
          <div className="hm-404-header">
            <h1 className="hm-404-title">404</h1>
            <h2 className="hm-404-subtitle">Oh No...</h2>
            <p className="hm-404-message">
              The page you requested does not exist, maybe some of these recent articles may be of interest?
            </p>

            {/* Non-functional search box */}
            <div className="hm-404-search">
              <form onSubmit={(e) => e.preventDefault()} className="hm-search-form">
                <input
                  type="search"
                  placeholder="Search articles..."
                  className="hm-search-input"
                  disabled
                  title="Search functionality coming soon"
                />
                <button 
                  type="submit" 
                  className="hm-search-button"
                  disabled
                  title="Search functionality coming soon"
                >
                  <svg 
                    width="20" 
                    height="20" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2"
                  >
                    <circle cx="11" cy="11" r="8" />
                    <path d="m21 21-4.35-4.35" />
                  </svg>
                </button>
              </form>
            </div>
          </div>

          {/* Recent Articles */}
          {articles.length > 0 && (
            <div className="hm-404-articles">
              <h3 className="hm-404-articles-title">Recent Articles</h3>
              <div className="hm-article-grid">
                {articles.map((article) => (
                  <ArticleCard
                    key={article.id}
                    slug={article.frontmatter.slug}
                    title={article.frontmatter.title}
                    excerpt={article.frontmatter.excerpt}
                    featuredImage={article.frontmatter.featuredImage}
                    category={article.frontmatter.category}
                    categoryName={getCategoryName(article.frontmatter.category)}
                    publishedAt={article.frontmatter.publishedAt}
                    author={article.frontmatter.author}
                    authorName={getAuthorName(article.frontmatter.author)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Back to Home Button */}
          <div className="hm-404-actions">
            <Link to="/" className="hm-cta-btn">
              Go to Homepage
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default NotFoundPage;

export const query = graphql`
  query NotFoundPageQuery {
    allMarkdownRemark(
      sort: { frontmatter: { publishedAt: DESC } }
      limit: 6
      filter: { frontmatter: { slug: { ne: null } } }
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
        }
      }
    }
    allCategoriesJson {
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

export const Head: HeadFC = () => (
  <SEO 
    title="404: Page Not Found"
    description="The page you're looking for doesn't exist."
  />
);
