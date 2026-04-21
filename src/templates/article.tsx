import React from 'react';
import { graphql, Link, PageProps, HeadFC } from 'gatsby';
import Layout from '../components/Layout';
import Sidebar from '../components/Sidebar';
import { formatDate } from '../utils/dateUtils';
import OptimizedImage from '../components/OptimizedImage';
import SEO from '../components/SEO';
import ReviewBox from '../components/ReviewBox';
import Comments from '../components/Comments';
import { getArticlePath } from '../utils/articlePath';
import { hasTag, normalizeTagSlug, tagMatches } from '../utils/tagUtils';

interface ArticleData {
  markdownRemark: {
    id: string;
    html: string;
    frontmatter: {
      slug: string;
      title: string;
      excerpt: string;
      featuredImage: string;
      featuredImageLink?: string;
      tags: string[];
      author: string;
      publishedAt: string;
      updatedAt: string;
      review?: {
        rating: number;
        pros: string[];
        cons: string[];
        price?: string;
        brand?: string;
        productUrl?: string;
        affiliateLink?: string;
      };
    };
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
        tags: string[];
        series?: {
          name: string;
        };
      };
    }>;
  };
  nextArticle: {
    nodes: Array<{
      frontmatter: {
        slug: string;
        title: string;
        tags: string[];
        series?: {
          name: string;
        };
      };
    }>;
  };
}

const ArticleTemplate: React.FC<PageProps<ArticleData>> = ({ data, pageContext }) => {
  const article = data.markdownRemark.frontmatter;
  const articleHtml = data.markdownRemark.html;
  const author = data.authorsJson;
  const isReview = pageContext.isReview as boolean;
  
  // Filter navigation: reviews only link to reviews, posts only link to posts
  const previousArticle = data.previousArticle.nodes.find(node => 
    isReview ? hasTag(node.frontmatter.tags || [], 'reviews') : !hasTag(node.frontmatter.tags || [], 'reviews')
  ) || null;
  const nextArticle = data.nextArticle.nodes.find(node => 
    isReview ? hasTag(node.frontmatter.tags || [], 'reviews') : !hasTag(node.frontmatter.tags || [], 'reviews')
  ) || null;
  
  // Get the first tag that's not "family" or "featured" for display
  const primaryTag = article.tags?.find(tag => !tagMatches(tag, 'family') && !tagMatches(tag, 'featured')) || article.tags?.[0];

  return (
    <Layout>
      <div className="hm-container">
        <div className="hm-content-sidebar-wrap">
          <main className="hm-primary-content">
            <article className="hm-article">
          <header className="hm-article-header">
            {primaryTag && (
              <Link 
                to={`/tag/${normalizeTagSlug(primaryTag)}`}
                className="hm-article-category"
              >
                {primaryTag}
              </Link>
            )}
            
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
            {article.featuredImageLink ? (
              <a href={article.featuredImageLink} target="_blank" rel="noopener noreferrer">
                <OptimizedImage 
                  src={article.featuredImage} 
                  alt={article.title}
                  loading="eager"
                />
              </a>
            ) : (
              <OptimizedImage 
                src={article.featuredImage} 
                alt={article.title}
                loading="eager"
              />
            )}
          </div>

          {article.review && (
            <ReviewBox
              rating={article.review.rating}
              pros={article.review.pros}
              cons={article.review.cons}
              price={article.review.price}
              brand={article.review.brand}
              productUrl={article.review.productUrl}
              affiliateLink={article.review.affiliateLink}
            />
          )}

          <div 
            className="hm-article-content"
            dangerouslySetInnerHTML={{ __html: articleHtml }}
          />

          {article.tags.length > 0 && (
            <div className="hm-article-tags">
              <span className="hm-article-tags-label">Tags:</span>
              {article.tags.map((tag) => (
                <Link key={tag} to={`/tag/${normalizeTagSlug(tag)}`} className="hm-article-tag">
                  {tag}
                </Link>
              ))}
            </div>
          )}

          <Comments slug={article.slug} title={article.title} />
            </article>

            {(previousArticle || nextArticle) && (
              <nav className="hm-post-navigation">
                {previousArticle && (
                  <div className="hm-nav-previous">
                                        <span className="hm-nav-label">{isReview ? 'Previous Review' : 'Previous Article'}</span>
                    <Link to={getArticlePath(previousArticle.frontmatter.slug, !!previousArticle.frontmatter.series?.name, hasTag(previousArticle.frontmatter.tags || [], 'reviews'))} className="hm-nav-title">
                      {previousArticle.frontmatter.title}
                    </Link>
                  </div>
                )}
                {nextArticle && (
                  <div className="hm-nav-next">
                                        <span className="hm-nav-label">{isReview ? 'Next Review' : 'Next Article'}</span>
                    <Link to={getArticlePath(nextArticle.frontmatter.slug, !!nextArticle.frontmatter.series?.name, hasTag(nextArticle.frontmatter.tags || [], 'reviews'))} className="hm-nav-title">
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
  query ArticleQuery(
    $slug: String!
    $author: String!
    $publishedAt: Date!
  ) {
    markdownRemark(frontmatter: { slug: { eq: $slug } }) {
      id
      html
      frontmatter {
        slug
        title
        excerpt
        featuredImage
        featuredImageLink
        tags
        author
        publishedAt
        updatedAt
        review {
          rating
          pros
          cons
          price
          brand
          productUrl
          affiliateLink
        }
      }
    }
    authorsJson(slug: { eq: $author }) {
      name
      slug
      bio
      avatar
    }
    previousArticle: allMarkdownRemark(
      filter: { frontmatter: { publishedAt: { lt: $publishedAt }, draft: { ne: true } } }
      sort: { frontmatter: { publishedAt: DESC } }
      limit: 10
    ) {
      nodes {
        frontmatter {
          slug
          title
          tags
          series {
            name
          }
        }
      }
    }
    nextArticle: allMarkdownRemark(
      filter: { frontmatter: { publishedAt: { gt: $publishedAt }, draft: { ne: true } } }
      sort: { frontmatter: { publishedAt: ASC } }
      limit: 10
    ) {
      nodes {
        frontmatter {
          slug
          title
          tags
          series {
            name
          }
        }
      }
    }
  }
`;

export const Head: HeadFC<ArticleData> = ({ data }) => {
  const isReview = hasTag(data.markdownRemark.frontmatter.tags || [], 'reviews');
  return (
    <SEO 
      title={data.markdownRemark.frontmatter.title}
      description={data.markdownRemark.frontmatter.excerpt}
      image={data.markdownRemark.frontmatter.featuredImage}
      article={true}
      pathname={getArticlePath(data.markdownRemark.frontmatter.slug, !!data.markdownRemark.frontmatter.series?.name, isReview)}
    />
  );
};

export default ArticleTemplate;

