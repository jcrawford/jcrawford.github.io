import React from 'react';
import { graphql, Link, PageProps, HeadFC } from 'gatsby';
import Layout from '../components/Layout';
import Sidebar from '../components/Sidebar';
import { formatDate } from '../utils/dateUtils';
import OptimizedImage from '../components/OptimizedImage';
import SEO from '../components/SEO';

interface ArticleData {
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
    };
  };
  categoriesJson: {
    name: string;
    slug: string;
  };
  authorsJson: {
    name: string;
    slug: string;
    bio: string;
    avatar: string;
  };
  previousArticle: {
    nodes: Array<{
      frontmatter: {
        slug: string;
        title: string;
      };
    }>;
  };
  nextArticle: {
    nodes: Array<{
      frontmatter: {
        slug: string;
        title: string;
      };
    }>;
  };
}

const ArticleTemplate: React.FC<PageProps<ArticleData>> = ({ data }) => {
  const article = data.markdownRemark.frontmatter;
  const articleHtml = data.markdownRemark.html;
  const category = data.categoriesJson;
  const author = data.authorsJson;
  const previousArticle = data.previousArticle.nodes[0] || null;
  const nextArticle = data.nextArticle.nodes[0] || null;

  return (
    <Layout>
      <div className="hm-container">
        <div className="hm-content-sidebar-wrap">
          <main className="hm-primary-content">
            <article className="hm-article">
          <header className="hm-article-header">
            <Link 
              to={`/category/${category.slug}`}
              className="hm-article-category"
            >
              {category.name}
            </Link>
            
            <h1 className="hm-article-title">{article.title}</h1>
            
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

            {(previousArticle || nextArticle) && (
              <nav className="hm-post-navigation">
                {previousArticle && (
                  <div className="hm-nav-previous">
                    <span className="hm-nav-label">Previous Article</span>
                    <Link to={`/articles/${previousArticle.frontmatter.slug}`} className="hm-nav-title">
                      {previousArticle.frontmatter.title}
                    </Link>
                  </div>
                )}
                {nextArticle && (
                  <div className="hm-nav-next">
                    <span className="hm-nav-label">Next Article</span>
                    <Link to={`/articles/${nextArticle.frontmatter.slug}`} className="hm-nav-title">
                      {nextArticle.frontmatter.title}
                    </Link>
                  </div>
                )}
              </nav>
            )}
          </main>

          <Sidebar />
        </div>
      </div>
    </Layout>
  );
};

export const query = graphql`
  query ArticleQuery($slug: String!, $category: String!, $author: String!, $publishedAt: Date!) {
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
      }
    }
    categoriesJson(slug: { eq: $category }) {
      name
      slug
    }
    authorsJson(slug: { eq: $author }) {
      name
      slug
      bio
      avatar
    }
    previousArticle: allMarkdownRemark(
      filter: { frontmatter: { publishedAt: { lt: $publishedAt } } }
      sort: { frontmatter: { publishedAt: DESC } }
      limit: 1
    ) {
      nodes {
        frontmatter {
          slug
          title
        }
      }
    }
    nextArticle: allMarkdownRemark(
      filter: { frontmatter: { publishedAt: { gt: $publishedAt } } }
      sort: { frontmatter: { publishedAt: ASC } }
      limit: 1
    ) {
      nodes {
        frontmatter {
          slug
          title
        }
      }
    }
  }
`;

export const Head: HeadFC<ArticleData> = ({ data }) => (
  <SEO 
    title={data.markdownRemark.frontmatter.title}
    description={data.markdownRemark.frontmatter.excerpt}
    image={data.markdownRemark.frontmatter.featuredImage}
    article={true}
    pathname={`/articles/${data.markdownRemark.frontmatter.slug}`}
  />
);

export default ArticleTemplate;

