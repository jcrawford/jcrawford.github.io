import React, { Suspense } from 'react';
import { graphql, Link, PageProps, HeadFC } from 'gatsby';
import Layout from '../components/Layout';
import Sidebar from '../components/Sidebar';
import OptimizedImage from '../components/OptimizedImage';
import SEO from '../components/SEO';
import ReviewBox from '../components/ReviewBox';
import Comments from '../components/Comments';
import ImageSpinner from '../components/ImageSpinner';
import GalleryEmbed from '../components/GalleryEmbed';
import ShareButtons from '../components/ShareButtons';
import ArticleMeta from '../components/ArticleMeta';
import DraftBanner from '../components/DraftBanner';
import RecipeIngredients from '../components/RecipeIngredients';
import RecipeSteps from '../components/RecipeSteps';
import { getArticlePath } from '../utils/articlePath';
import { hasTag, getTagPath } from '../utils/tagUtils';
import { postProcessImages } from '../utils/postProcessImages';
import type { SpinnerImage, NamedSpinner, GalleryEmbedData, BrewData, RecipeStep, ReviewData, ArticlePageContext } from '../types/article';
import '../styles/review.css';
import '../styles/tag-cloud.css';
import '../styles/brewing-recipe.css';

const FermentationProgress = React.lazy(() => import('../components/FermentationProgress'));

/**
 * Split article HTML into segments and inline any matching gallery embeds
 * at their `\u003c!-- gallery:slug --\u003e` markers.
 */
function renderContentWithInlineEmbeds(
  html: string,
  embedBySlug: Map<string, GalleryEmbedData>
): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  const placeholderRegex = /<div data-gallery-embed="([^"]+)"[^\u003e]*\u003e<\/div\u003e/g;
  let lastIndex = 0;
  let match;

  while ((match = placeholderRegex.exec(html)) !== null) {
    const before = html.slice(lastIndex, match.index);
    if (before) {
      nodes.push(
        <div
          key={`html-${lastIndex}`}
          className="hm-article-content"
          dangerouslySetInnerHTML={{ __html: before }}
        />
      );
    }

    const slug = match[1];
    const embed = embedBySlug.get(slug);
    if (embed) {
      nodes.push(
        <div key={`embed-${slug}`} className="hm-article-gallery-embeds">
          <GalleryEmbed {...embed} />
        </div>
      );
    }

    lastIndex = placeholderRegex.lastIndex;
  }

  const trailing = html.slice(lastIndex);
  if (trailing) {
    nodes.push(
      <div
        key={`html-end`}
        className="hm-article-content"
        dangerouslySetInnerHTML={{ __html: trailing }}
      />
    );
  }

  return nodes;
}

// SpinnerImage, NamedSpinner, GalleryEmbedData now imported from ../types/article

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
      draft?: boolean;
      type?: string;
      imageSpinner?: SpinnerImage[];
      imageSpinners?: NamedSpinner[];
      galleryEmbeds?: GalleryEmbedData[];
      series?: {
        name: string;
      };
      review?: ReviewData;
      brewData?: BrewData;
      ingredients?: string[];
      steps?: RecipeStep[];
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

// ArticlePageContext imported from ../types/article

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
  
  const processedContent = postProcessImages(data.markdownRemark.html || '');

  // Build a lookup of gallery embeds by slug and replace <!-- gallery:slug -->
  // markers in the processed HTML with placeholders so React can render embeds
  // inline inside their relevant sections instead of only at the end.
  const galleryEmbedBySlug = new Map(
    (article.galleryEmbeds || []).map((embed) => [embed.slug, embed])
  );

  const contentWithPlaceholders = processedContent.replace(
    /<!--\s*gallery:([\w-]+)\s*-->/g,
    (_match, slug) => {
      if (galleryEmbedBySlug.has(slug)) {
        return `<div data-gallery-embed="${slug}" aria-hidden="true"></div>`;
      }
      return '';
    }
  );

  const unusedEmbeds = (article.galleryEmbeds || []).filter(
    (embed) => !contentWithPlaceholders.includes(`data-gallery-embed="${embed.slug}"`)
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
    {article.draft && <DraftBanner />}
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
                <Link to="/brewing/" className="hm-article-category">Brewing</Link>
              ) : (
                article.tags && article.tags.length > 0 && (
                  <div className="hm-article-categories">
                    {article.tags.filter(tag => tag !== 'reviews').slice(0, 3).map((tag, index) => (
                      <span key={index}>
                        <Link
                          to={`${getTagPath(tag)}/`}
                          className="hm-article-category"
                        >
                          {tag}
                        </Link>
                        {index < article.tags.filter(tag => tag !== 'reviews').slice(0, 3).length - 1 && <span className="tag-separator">, </span>}
                      </span>
                    ))}
                  </div>
                )
              )}
              <h1 className="hm-article-title">{article.title}</h1>
              <ArticleMeta
                authorName={author?.name || 'Joseph Crawford'}
                publishedAt={article.publishedAt}
                viewCount={viewCount}
                commentCount={commentCount}
                byText="By"
                variant="article"
              />

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
                    loading="lazy"
                    sizes="(max-width: 768px) 100vw, 850px"
                  />
                </a>
              ) : (
                <OptimizedImage 
                  src={article.featuredImage} 
                  alt={article.title}
                  loading="lazy"
                  sizes="(max-width: 768px) 100vw, 850px"
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
              childRating={article.review.childRating}
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
              <Suspense fallback={null}>
                <FermentationProgress brewData={article.brewData} />
              </Suspense>
              
              {article.ingredients && article.ingredients.length > 0 && (
                <RecipeIngredients ingredients={article.ingredients} />
              )}
              
              {article.steps && article.steps.length > 0 && (
                <RecipeSteps steps={article.steps} variant="article" />
              )}
            </>
          )}

          {renderContentWithInlineEmbeds(contentWithPlaceholders, galleryEmbedBySlug)}

          {unusedEmbeds.length > 0 && (
            <div className="hm-article-gallery-embeds">
              {unusedEmbeds.map((embed) => (
                <GalleryEmbed key={embed.slug} {...embed} />
              ))}
            </div>
          )}

          <div className="hm-article-footer">
            <hr />

            {article.tags && article.tags.length > 0 && (
              <div className="hm-article-tags">
                <span className="hm-article-tags-label">Tags:</span>
                {article.tags.map((tag, index) => (
                  <span key={index}>
                    <Link
                      to={`${getTagPath(tag)}/`}
                      className="hm-article-tag"
                    >
                      {tag}
                    </Link>
                    {index < article.tags.length - 1 && <span className="tag-separator">,</span>}
                  </span>
                ))}
              </div>
            )}

            {article.tags && article.tags.length > 0 && <hr />}

            <ShareButtons
              title={article.title}
              url={shareUrl}
              shareCounts={shareCounts}
            />

            <hr />

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
        draft
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
          childRating
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
          secondaryTime
          bottleAgingTime
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
