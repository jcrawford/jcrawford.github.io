import React from 'react';
import { graphql, Link, PageProps, HeadFC } from 'gatsby';
import Layout from '../components/Layout';
import SEO from '../components/SEO';
import DraftBadge from '../components/DraftBadge';
import { formatDate } from '../utils/dateUtils';
import { slugifySeriesName } from '../utils/articlePath';
import '../styles/brewing-index.css';

interface SeriesCard {
  id: string;
  fields: {
    readingTime: number;
  };
  frontmatter: {
    slug: string;
    title: string;
    excerpt: string;
    featuredImage: string;
    publishedAt: string;
    draft?: boolean;
    series?: {
      name: string;
      order?: number;
      description?: string;
      featuredImage?: string;
    };
  };
}

interface SeriesIndexData {
  allMarkdownRemark: {
    nodes: SeriesCard[];
  };
}

const SeriesIndexTemplate: React.FC<PageProps<SeriesIndexData>> = ({ data }) => {
  const allSeriesArticles = data.allMarkdownRemark.nodes;

  // Group articles by series name
  const seriesMap = new Map<string, SeriesCard[]>();
  allSeriesArticles.forEach((article) => {
    const seriesName = article.frontmatter.series?.name;
    if (!seriesName) return;
    if (!seriesMap.has(seriesName)) {
      seriesMap.set(seriesName, []);
    }
    seriesMap.get(seriesName)!.push(article);
  });

  // Build a display card for each series (first article, ordered by series.order)
  const seriesCards = Array.from(seriesMap.entries()).map(([name, articles]) => {
    const sorted = [...articles].sort((a, b) => {
      const orderA = a.frontmatter.series?.order ?? Infinity;
      const orderB = b.frontmatter.series?.order ?? Infinity;
      return orderA - orderB;
    });
    const firstArticle = sorted[0];
    const seriesSlug = slugifySeriesName(name);
    const totalReadingTime = sorted.reduce((sum, a) => sum + (a.fields?.readingTime || 0), 0);
    return {
      ...firstArticle,
      frontmatter: {
        ...firstArticle.frontmatter,
        slug: seriesSlug,
        title: name,
        excerpt: firstArticle.frontmatter.series?.description || `A series covering ${name.toLowerCase()}.`,
        featuredImage: firstArticle.frontmatter.series?.featuredImage || firstArticle.frontmatter.featuredImage || '/images/content/brewing/intro-to-making-mead/series-cover.png',
      },
      fields: {
        readingTime: totalReadingTime,
      },
    };
  });

  return (
    <Layout>
      <div className="brewing-index">
        <header className="brewing-index-header">
          <h1>Series</h1>
          <p>Collections of related articles, organized from start to finish.</p>
        </header>

        {seriesCards.length > 0 ? (
          <section className="brewing-section">
            <div className="brewing-recipe-grid">
              {seriesCards.map((series) => (
                <Link
                  key={series.id}
                  to={`/series/${series.frontmatter.slug}`}
                  className="brewing-recipe-card"
                >
                  {series.frontmatter.featuredImage && (
                    <div className="brewing-recipe-card-image">
                      <img
                        src={series.frontmatter.featuredImage}
                        alt={series.frontmatter.title}
                        loading="lazy"
                        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                      />
                    </div>
                  )}
                  <div className="brewing-recipe-card-body">
                    <h2>{series.frontmatter.title}</h2>
                    {series.frontmatter.draft && <DraftBadge size="md" />}
                    <p>{series.frontmatter.excerpt}</p>
                    <div className="brewing-recipe-card-meta">
                      <span>{formatDate(series.frontmatter.publishedAt)}</span>
                      <span>•</span>
                      <span className="hm-article-card-reading-time">
                        {series.fields?.readingTime || 0} min
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        ) : (
          <div className="brewing-empty">
            <p>No series yet. Check back soon!</p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default SeriesIndexTemplate;

export const Head: HeadFC = () => (
  <SEO
    title="Series"
    description="Collections of related articles organized from start to finish."
    siteMetadata={{
      title: 'Joseph Crawford',
      description: 'A blog relating to technical topics such as programming, web development, and software engineering.',
      siteUrl: 'https://josephcrawford.com'
    }}
  />
);

export const query = graphql`
  query SeriesIndexQuery(
    $draftFilter: [Boolean]
  ) {
    allMarkdownRemark(
      filter: {
        frontmatter: { slug: { ne: null }, series: { name: { ne: null } }, draft: { in: $draftFilter } }
      }
      sort: { frontmatter: { publishedAt: DESC } }
    ) {
      nodes {
        id
        fields {
          readingTime
        }
        frontmatter {
          slug
          title
          excerpt
          featuredImage
          publishedAt
          draft
          series {
            name
            order
            description
            featuredImage
          }
        }
      }
    }
  }
`;
