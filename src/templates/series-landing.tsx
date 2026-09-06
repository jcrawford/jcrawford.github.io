import React from 'react';
import { graphql, Link, PageProps, HeadFC } from 'gatsby';
import { useArticleMetrics } from '../hooks/useArticleMetrics';
import Layout from '../components/Layout';
import SEO from '../components/SEO';
import OptimizedImage from '../components/OptimizedImage';
import DraftBadge from '../components/DraftBadge';
import ShareButtons from '../components/ShareButtons';
import { EyeIcon } from '../utils/icons';
import { formatDate } from '../utils/dateUtils';
import '../styles/series-landing.css';

const stripSeriesName = (title: string, seriesName: string): string => {
  const patterns = [`${seriesName}: `, `${seriesName} - `, `${seriesName} – `];
  let cleanTitle = title;
  for (const pattern of patterns) {
    if (cleanTitle.startsWith(pattern)) {
      cleanTitle = cleanTitle.substring(pattern.length);
      break;
    }
  }
  return cleanTitle;
};

interface SeriesLandingArticle {
  id: string;
  fields: { readingTime: number };
  frontmatter: {
    slug: string;
    title: string;
    excerpt: string;
    featuredImage: string;
    publishedAt: string;
    draft?: boolean;
    series?: { name: string; order?: number; description?: string; featuredImage?: string };
  };
}

interface SeriesLandingData {
  allMarkdownRemark: { nodes: SeriesLandingArticle[] };
  site: { siteMetadata: { title: string; description: string; siteUrl: string } };
}

interface SeriesLandingPageContext {
  seriesName: string;
  seriesSlug: string;
  description: string;
  featuredImage: string;
  draftFilter: boolean[];
}

const SeriesLandingTemplate: React.FC<PageProps<SeriesLandingData, SeriesLandingPageContext>> = ({
  data,
  pageContext,
}) => {
  const articles = data.allMarkdownRemark.nodes;
  const sortedArticles = [...articles].sort((a, b) => {
    const orderA = a.frontmatter.series?.order ?? Infinity;
    const orderB = b.frontmatter.series?.order ?? Infinity;
    return orderA - orderB;
  });
  const totalReadingTime = sortedArticles.reduce((sum, a) => sum + (a.fields?.readingTime || 0), 0);
  const { seriesName, seriesSlug, description, featuredImage } = pageContext;
  const shareUrl = `https://josephcrawford.com/series/${seriesSlug}/`;
  const metricsPath = `/series/${seriesSlug}/`;
  const { metrics, loading } = useArticleMetrics(metricsPath);

  if (loading) {
    return (
      <Layout>
        <div className="series-landing">
          <div className="hm-article-loading" aria-busy="true" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="series-landing">
        {/* Hero header */}
        <header className="series-landing-hero">
          <div className="series-landing-hero-bg">
            <OptimizedImage src={featuredImage} alt={seriesName} loading="eager" sizes="(max-width: 768px) 100vw, 900px" />
            <div className="series-landing-hero-gradient" />
          </div>
          <div className="series-landing-hero-content">
            <nav className="series-landing-breadcrumb"><Link to="/series">All Series</Link></nav>
            <h1 className="series-landing-title">{seriesName}</h1>
            {description && <p className="series-landing-description">{description}</p>}
            <div className="series-landing-stats">
              <div className="series-landing-stat">
                <span className="series-landing-stat-value">{sortedArticles.length}</span>
                <span className="series-landing-stat-label">Articles</span>
              </div>
              <div className="series-landing-stat-divider" />
              <div className="series-landing-stat">
                <span className="series-landing-stat-value">{totalReadingTime}</span>
                <span className="series-landing-stat-label">Min Total</span>
              </div>
              <div className="series-landing-stat-divider" />
              <div className="series-landing-stat">
                <span className="series-landing-stat-value series-landing-stat-views">
                  <EyeIcon size={18} />
                  {(metrics.views || 0).toLocaleString()}
                </span>
                <span className="series-landing-stat-label">Views</span>
              </div>
            </div>
          </div>
        </header>

        {/* Share buttons */}
        <div className="series-landing-share">
          <ShareButtons
            title={seriesName}
            url={shareUrl}
            shareCounts={metrics.shares}
          />
        </div>

        {/* Intro description + divider */}
        <div className="series-landing-intro">
          <p>{description}</p>
        </div>

        {/* Article cards */}
        <div className="series-landing-articles">
          {sortedArticles.map((article, index) => {
            const order = article.frontmatter.series?.order ?? index + 1;
            const articlePath = `/series/${seriesSlug}/${article.frontmatter.slug}`;
            const displayTitle = stripSeriesName(article.frontmatter.title, seriesName);
            const indexLabel = `ARTICLE ${order.toString().padStart(2, '0')}`;

            return (
              <article key={article.id} className="series-landing-card">
                {/* Article index row — centered label with flanking decorative lines */}
                <div className="article-index">
                  <span className="article-index-line" />
                  <span className="article-index-label">{indexLabel}</span>
                  <span className="article-index-line" />
                </div>

                {/* Hero image */}
                <Link to={articlePath} className="series-landing-card-image">
                  <OptimizedImage
                    src={article.frontmatter.featuredImage}
                    alt={displayTitle}
                    loading="lazy"
                    sizes="(max-width: 768px) 100vw, 820px"
                  />
                </Link>

                {/* Article content */}
                <div className="series-landing-card-content">
                  <h2 className="series-landing-card-title">
                    <Link to={articlePath}>{displayTitle}</Link>
                  </h2>
                  {article.frontmatter.draft && <DraftBadge size="sm" />}
                  <p className="series-landing-card-excerpt">{article.frontmatter.excerpt}</p>
                  <div className="series-landing-card-meta">
                    <span>{formatDate(article.frontmatter.publishedAt)}</span>
                    <span className="series-landing-card-dot">·</span>
                    <span>{article.fields?.readingTime || 0} min read</span>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </Layout>
  );
};

export default SeriesLandingTemplate;

export const Head: HeadFC<SeriesLandingData, SeriesLandingPageContext> = ({ pageContext, data }) => {
  const { seriesName, seriesSlug, description, featuredImage } = pageContext;
  const siteUrl = data?.site?.siteMetadata?.siteUrl || 'https://josephcrawford.com';
  const landingUrl = `${siteUrl}/series/${seriesSlug}/`;
  const imageUrl = featuredImage?.startsWith('http')
    ? featuredImage
    : `${siteUrl}${featuredImage}`;

  const collectionSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": seriesName,
    "description": description,
    "url": landingUrl,
    "image": imageUrl,
    "isPartOf": {
      "@type": "WebSite",
      "name": "Joseph Crawford",
      "url": siteUrl,
    },
    "breadcrumb": {
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Home",
          "item": siteUrl,
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "Series",
          "item": `${siteUrl}/series/`,
        },
        {
          "@type": "ListItem",
          "position": 3,
          "name": seriesName,
          "item": landingUrl,
        },
      ],
    },
  };

  return (
    <SEO
      title={seriesName}
      description={description}
      image={featuredImage}
      pathname={`/series/${seriesSlug}/`}
      article={true}
      siteMetadata={{
        title: 'Joseph Crawford',
        description: 'A blog relating to technical topics such as programming, web development, and software engineering.',
        siteUrl: 'https://josephcrawford.com',
      }}
    >
      <script type="application/ld+json">{JSON.stringify(collectionSchema)}</script>
    </SEO>
  );
};

export const query = graphql`
  query SeriesLandingQuery($seriesName: String!, $draftFilter: [Boolean]) {
    allMarkdownRemark(
      filter: { frontmatter: { slug: { ne: null }, series: { name: { eq: $seriesName } }, draft: { in: $draftFilter } } }
      sort: { frontmatter: { publishedAt: ASC } }
    ) {
      nodes {
        id
        fields { readingTime }
        frontmatter {
          slug
          title
          excerpt
          featuredImage
          publishedAt
          draft
          series { name order description featuredImage }
        }
      }
    }
    site { siteMetadata { title description siteUrl } }
  }
`;