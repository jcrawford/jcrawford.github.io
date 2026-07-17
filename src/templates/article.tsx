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
      imageSpinner?: SpinnerImage[];
      imageSpinners?: NamedSpinner[];
      galleryEmbeds?: GalleryEmbedData[];
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
  viewCount: number;
  commentCount: number;
  shareCounts: { facebook: number; twitter: number; linkedin: number; copy: number };
}

const ArticleTemplate: React.FC<PageProps<ArticleData, ArticlePageContext>> = ({ data, pageContext }) => {
  const article = data.markdownRemark.frontmatter;
  const articleHtml = postProcessTables(postProcessImages(data.markdownRemark.html));
  const author = data.authorsJson;
  const isReview = pageContext.isReview as boolean;
  const viewCount = pageContext.viewCount || 0;
  const commentCount = pageContext.commentCount || 0;
  const shareCounts = pageContext.shareCounts || { facebook: 0, twitter: 0, linkedin: 0, copy: 0 };
  const shareUrl = `https://josephcrawford.com${getArticlePath(article.slug, false, isReview)}`;
  
  // Filter navigation: reviews only link to reviews, posts only link to posts
  const previousArticle = data.previousArticle.nodes.find(node => 
    isReview ? hasTag(node.frontmatter.tags || [], 'reviews') : !hasTag(node.frontmatter.tags || [], 'reviews')
  ) || null;
  const nextArticle = data.nextArticle.nodes.find(node => 
    isReview ? hasTag(node.frontmatter.tags || [], 'reviews') : !hasTag(node.frontmatter.tags || [], 'reviews')
  ) || null;
  
  // Get the first tag that's not "family" or "featured" for display
  const primaryTag = article.tags?.find(tag => !tagMatches(tag, 'family') && !tagMatches(tag, 'featured')) || article.tags?.[0];

  // Process content with inline spinners and gallery embeds
  // Splits HTML on <!-- spinner:id --> and <!-- gallery:slug --> markers
  // and interleaves React components
  const renderContentWithSpinners = (): React.ReactNode[] => {
    const spinners = article.imageSpinners;
    const galleryEmbeds = article.galleryEmbeds;
    const hasSpinners = spinners && spinners.length > 0;
    const hasGalleries = galleryEmbeds && galleryEmbeds.length > 0;

    if (!hasSpinners && !hasGalleries) {
      return [<div key="content" className="hm-article-content" dangerouslySetInnerHTML={{ __html: articleHtml }} />];
    }

    // Build lookups
    const spinnerMap = new Map<string, { images: SpinnerImage[] | null }>();
    if (hasSpinners) {
      for (const spinner of spinners!) {
        spinnerMap.set(spinner.id, spinner);
      }
    }

    const galleryMap = new Map<string, GalleryEmbedData>();
    if (hasGalleries) {
      for (const gallery of galleryEmbeds!) {
        galleryMap.set(gallery.slug, gallery);
      }
    }

    // Find all markers in HTML order (both spinner and gallery)
    const markerRegex = /<!--\s*(spinner:[\w-]+|gallery:[\w-]+)\s*-->/g;
    const parts: React.ReactNode[] = [];
    let keyIndex = 0;
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = markerRegex.exec(articleHtml)) !== null) {
      const before = articleHtml.substring(lastIndex, match.index);
      const markerType = match[1]; // e.g. "spinner:refuge" or "gallery:savannah-wildlife-refuge-2026-album"

      if (before.trim()) {
        parts.push(<div key={`part-${keyIndex++}`} className="hm-article-content" dangerouslySetInnerHTML={{ __html: before }} />);
      }

      if (markerType.startsWith('spinner:')) {
        const spinnerId = markerType.replace('spinner:', '');
        const spinnerData = spinnerMap.get(spinnerId);
        if (spinnerData?.images && spinnerData.images.length > 0) {
          parts.push(<ImageSpinner key={`spinner-${spinnerId}`} images={spinnerData.images} />);
        }
      } else if (markerType.startsWith('gallery:')) {
        const gallerySlug = markerType.replace('gallery:', '');
        const galleryData = galleryMap.get(gallerySlug);
        if (galleryData) {
          parts.push(<GalleryEmbed key={`gallery-${gallerySlug}`} {...galleryData} />);
        }
      }

      lastIndex = match.index + match[0].length;
    }

    // Append any remaining HTML after the last marker
    const remaining = articleHtml.substring(lastIndex);
    if (remaining.trim()) {
      parts.push(<div key={`part-${keyIndex++}`} className="hm-article-content" dangerouslySetInnerHTML={{ __html: remaining }} />);
    }

    return parts;
  };

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
              <span className="hm-article-author-name">{author.name}</span>
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

          {!(article.imageSpinner && article.imageSpinner.length > 0) && (
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

          {renderContentWithSpinners()}

          {article.tags?.length > 0 && (
            <div className="hm-article-tags">
              <span className="hm-article-tags-label">Tags:</span>
              {article.tags?.map((tag) => (
                <Link key={tag} to={`/tag/${normalizeTagSlug(tag)}`} className="hm-article-tag">
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
    markdownRemark(frontmatter: { slug: { eq: $slug } }, fileAbsolutePath: { regex: "/content/(posts|reviews)/" }) {
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