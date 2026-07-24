import React from 'react';
import { graphql, Link, PageProps, HeadFC } from 'gatsby';
import Layout from '../components/Layout';
import Sidebar from '../components/Sidebar';
import { formatDate } from '../utils/dateUtils';
import OptimizedImage from '../components/OptimizedImage';
import SEO from '../components/SEO';
import ReviewBox from '../components/ReviewBox';
import Comments from '../components/Comments';
import ImageSpinner from '../components/ImageSpinner';
import GalleryEmbed from '../components/GalleryEmbed';
import ShareButtons from '../components/ShareButtons';
import { getArticlePath } from '../utils/articlePath';
import { hasTag, normalizeTagSlug, tagMatches } from '../utils/tagUtils';
import { postProcessImages, postProcessTables } from '../utils/postProcessImages';
import '../styles/review.css';
import '../styles/tag-cloud.css';
import '../styles/brewing-recipe.css';

import FermentationProgress from '../components/FermentationProgress';

interface SpinnerImage {
  src: string;
  alt: string;
  caption?: string;
}

interface NamedSpinner {
  id: string;
  images: SpinnerImage[] | null;
}

interface GalleryEmbedData {
  slug: string;
  title: string;
  path?: string;
  coverImage: string;
  description: string;
  photoCount: number;
  videoCount?: number;
  date: string;
}

interface ArticleData {
  site: {
    siteMetadata: {
      title: string;
      description: string;
      siteUrl: string;
    };
  };
  markdownRemark: {
    id: string;
    html: string;
    frontmatter: {
      slug: string;
      title: string;
      excerpt: string;
      featuredImage: string;
      featuredImageLink?: string;
      tags: string[] | null;
      author: string;
      publishedAt: string;
      updatedAt: string;
      type?: string;
      imageSpinner?: SpinnerImage[];
      imageSpinners?: NamedSpinner[];
      galleryEmbeds?: GalleryEmbedData[];
      series?: {
        name: string;
      };
      review?: {
        rating: number;
        pros: string[];
        cons: string[];
        price?: string;
        brand?: string;
        productUrl?: string;
        affiliateLink?: string;
      };
      brewData?: {
        originalGravity?: number;
        finalGravity?: number;
        startDate?: string;
        primaryEndDate?: string;
        secondaryStartDate?: string;
        secondaryEndDate?: string;
        bottlingDate?: string;
        drinkingReadyDate?: string;
        bulkConditioningTime?: string;
        bottleConditioningTime?: string;
        abv?: number;
        batchSize?: string;
        yeast?: string;
        fermentationTime?: string;
        secondaryTime?: string;
      };
      ingredients?: string[];
      steps?: Array<{
        title: string;
        description: string;
        image?: string;
        video?: string;
      }>;
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
        tags: string[] | null;
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
        tags: string[] | null;
        series?: {
          name: string;
        };
      };
    }>;
  };
}

interface ArticlePageContext {
  isReview: boolean;
  isBrewing?: boolean;
  viewCount: number;
  commentCount: number;
  shareCounts: { facebook: number; twitter: number; linkedin: number; copy: number };
}

const ArticleTemplate: React.FC<PageProps<ArticleData, ArticlePageContext>> = ({ data, pageContext }) => {
  if (!data || !data.markdownRemark) {
    return (
      <Layout>
        <div className="hm-container">
          <main className="hm-primary-content">
            <article className="hm-article">
              <h1 className="hm-article-title">Post Not Found</h1>
              <p>The requested article could not be found.</p>
            </article>
          </main>
          <Sidebar />
        </div>
      </Layout>
    );
  }

  const article = data.markdownRemark.frontmatter;
  const author = data.authorsJson;
  const isReview = pageContext.isReview;
  const isBrewing = pageContext.isBrewing ?? false;
  const { viewCount, commentCount, shareCounts } = pageContext;
  
  const shareUrl = typeof window !== 'undefined' ? window.location.href : `https://josephcrawford.com${getArticlePath(article.slug, !!article.series?.name, isReview)}`;
  
  const processedContent = postProcessTables(
    postProcessImages(data.markdownRemark.html || ''),
    article.slug
  );
  
  const previousArticle = data.previousArticle?.nodes?.[0] || null;
  const nextArticle = data.nextArticle?.nodes?.[0] || null;

  const schema = isReview && article.review ? {
    "@context": "https://schema.org",
    "@type": "Review",
    "itemReviewed": {
      "@type": "Product",
      "name": article.title,
      "brand": {
        "@type": "Brand",
        "name": article.review.brand || "Unknown"
      },
      "offers": article.review.price ? {
        "@type": "Offer",
        "price": article.review.price,
        "priceCurrency": "USD"
      } : undefined
    },
    "reviewRating": {
      "@type": "Rating",
      "ratingValue": article.review.rating.toString(),
      "bestRating": "5",
      "worstRating": "1"
    },
    "author": {
      "@type": "Person",
      "name": author?.name || "Joseph Crawford"
    },
    "reviewBody": article.excerpt,
    "datePublished": article.publishedAt
  } : {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": article.title,
    "description": article.excerpt,
    "image": article.featuredImage ? `https://josephcrawford.com${article.featuredImage}` : undefined,
    "author": {
      "@type": "Person",
      "name": author?.name || "Joseph Crawford"
    },
    "publisher": {
      "@type": "Organization",
      "name": "Joseph Crawford",
      "logo": {
        "@type": "ImageObject",
        "url": "https://josephcrawford.com/icon-512x512.png"
      }
    },
    "datePublished": article.publishedAt,
    "dateModified": article.updatedAt || article.publishedAt,
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `https://josephcrawford.com${getArticlePath(article.slug, !!article.series?.name, isReview, isBrewing)}`
    }
  };

  return (
    <Layout>
      <script type="application/ld+json">
        {JSON.stringify(schema)}
      </script>
      <div className="hm-container">
        <div className="hm-content-sidebar-wrap">
          <main className="hm-primary-content">
            <article className="hm-article">
            <header className="hm-article-header">
              {isReview ? (
                <span className="hm-article-category">Review</span>
              ) : isBrewing ? (
                <Link to="/tag/brewing/" className="hm-article-category">Brewing</Link>
              ) : (
                article.tags && article.tags.length > 0 && (
                  <div className="hm-article-categories">
                    {article.tags.filter(tag => tag !== 'reviews').slice(0, 3).map((tag, index) => (
                      <Link
                        key={index}
                        to={`/tag/${normalizeTagSlug(tag)}/`}
                        className="hm-article-category"
                      >
                        {tag}
                      </Link>
                    ))}
                  </div>
                )
              )}
              <h1 className="hm-article-title">{article.title}</h1>
              <div className="hm-article-meta">
                <span className="hm-article-meta-by">By</span>
                <span className="hm-article-author-name">{author?.name || 'Joseph Crawford'}</span>
                <span className="hm-article-meta-separator">•</span>
                <time className="hm-article-date" dateTime={article.publishedAt}>
                  {formatDate(article.publishedAt)}
                </time>
                <span className="hm-article-meta-separator">•</span>
                <span className="hm-article-views">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                  {viewCount.toLocaleString()}
                </span>
                <span className="hm-article-meta-separator">•</span>
                <span className="hm-article-comments">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                  </svg>
                  {commentCount}
                </span>
              </div>

              <ShareButtons
                title={article.title}
                url={shareUrl}
                variant="top"
                shareCounts={shareCounts}
              />
            </header>

            {article.series && (
              <div className="hm-series-banner">
                <span className="hm-series-label">Series</span>
                <span className="hm-series-name">{article.series.name}</span>
              </div>
            )}

          {article.featuredImage && (
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
          )}

          {article.imageSpinner && article.imageSpinner.length > 0 && (
            <ImageSpinner images={article.imageSpinner} />
          )}

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

          {isBrewing && article.brewData && (
            <>
              <FermentationProgress brewData={article.brewData} />
              
              {article.ingredients && article.ingredients.length > 0 && (
                <section className="recipe-ingredients">
                  <h2>Ingredients</h2>
                  <ul>
                    {article.ingredients.map((ingredient, index) => (
                      <li key={index}>{ingredient}</li>
                    ))}
                  </ul>
                </section>
              )}
              
              {article.steps && article.steps.length > 0 && (
                <section className="recipe-steps">
                  <h2>Instructions</h2>
                  {article.steps.map((step, index) => (
                    <div key={index} className="recipe-step watermark-step">
                      <div className="watermark-number">{index + 1}</div>
                      <div className="recipe-step-content">
                        <h3>{step.title}</h3>
                        <p>{step.description}</p>
                        {step.image && (
                          <div className="recipe-step-image">
                            <OptimizedImage src={step.image} alt={step.title} />
                          </div>
                        )}
                        {step.video && (
                          <div className="recipe-step-video">
                            <video controls preload="metadata">
                              <source src={step.video} type="video/mp4" />
                            </video>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </section>
              )}
            </>
          )}

          <div 
            className="hm-article-content"
            dangerouslySetInnerHTML={{ __html: processedContent }}
          />

          {article.galleryEmbeds && article.galleryEmbeds.length > 0 && (
            <div className="hm-article-gallery-embeds">
              {article.galleryEmbeds.map((embed) => (
                <GalleryEmbed key={embed.slug} embed={embed} />
              ))}
            </div>
          )}

          <div className="hm-article-footer">
            {article.tags && article.tags.length > 0 && (
              <div className="hm-article-tags">
                <span className="hm-article-tags-label">Tags:</span>
                {article.tags.map((tag, index) => (
                  <Link
                    key={index}
                    to={`/tag/${normalizeTagSlug(tag)}/`}
                    className="hm-article-tag"
                  >
                    {tag}
                  </Link>
                ))}
              </div>
            )}

            <ShareButtons
              title={article.title}
              url={shareUrl}
              shareCounts={shareCounts}
            />

            <Comments slug={article.slug} title={article.title} />
          </div>
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
    site {
      siteMetadata {
        title
        description
        siteUrl
      }
    }
    markdownRemark(frontmatter: { slug: { eq: $slug } }, fileAbsolutePath: { regex: "/content/(posts|reviews|brewing)/" }) {
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
        type
        imageSpinner {
          src
          alt
          caption
        }
        imageSpinners {
          id
          images {
            src
            alt
            caption
          }
        }
        galleryEmbeds
        review {
          rating
          pros
          cons
          price
          brand
          productUrl
          affiliateLink
        }
        brewData {
          originalGravity
          finalGravity
          startDate
          primaryEndDate
          secondaryStartDate
          secondaryEndDate
          bottlingDate
          drinkingReadyDate
          bulkConditioningTime
          bottleConditioningTime
          abv
          batchSize
          yeast
          fermentationTime
          secondaryTime
        }
        ingredients
        steps {
          title
          description
          image
          video
        }
        series {
          name
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
  const isBrewing = data.markdownRemark.frontmatter.type === 'brewing-recipe';
  return (
    <SEO 
      title={data.markdownRemark.frontmatter.title}
      description={data.markdownRemark.frontmatter.excerpt}
      image={data.markdownRemark.frontmatter.featuredImage}
      article={true}
      pathname={getArticlePath(data.markdownRemark.frontmatter.slug, !!data.markdownRemark.frontmatter.series?.name, isReview, isBrewing)}
      siteMetadata={data.site.siteMetadata}
    />
  );
};

export default ArticleTemplate;
