import React from 'react';
import { graphql, Link, PageProps, HeadFC } from 'gatsby';
import Layout from '../components/Layout';
import SEO from '../components/SEO';
import StarRating from '../components/StarRating';
import DraftBadge from '../components/DraftBadge';
import { formatDate } from '../utils/dateUtils';
import { ClockIcon } from '../utils/icons';
import '../styles/brewing-index.css';

type BrewStatus = 'active' | 'completed' | 'articles';

interface RecipeCard {
  id: string;
  fileAbsolutePath: string;
  fields: {
    readingTime: number;
  };
  frontmatter: {
    slug: string;
    title: string;
    excerpt: string;
    featuredImage: string;
    publishedAt: string;
    rating?: number;
    review?: {
      rating?: number;
    };
    type?: string;
    brewData?: {
      abv?: number;
      batchSize?: string;
      drinkingReadyDate?: string;
      startDate?: string;
    };
    draft?: boolean;
    series?: {
      name: string;
    };
  };
}

interface SeriesCard {
  name: string;
  slug: string;
  description: string;
  featuredImage: string;
  publishedAt: string;
  draft?: boolean;
  readingTime: number;
}

interface BrewingListPageData {
  site: {
    siteMetadata: {
      title: string;
      description: string;
      siteUrl: string;
    };
  };
  allMarkdownRemark: {
    nodes: RecipeCard[];
  };
}

interface BrewingListPageContext {
  brewStatus: BrewStatus;
  seriesCards: SeriesCard[];
  limit: number;
  skip: number;
  numPages: number;
  currentPage: number;
  totalCount: number;
}

const STATUS_CONFIG: Record<BrewStatus, { title: string; description: string; icon: string }> = {
  active: {
    title: 'Active Brews',
    description: 'Batches currently in progress — fermenting, conditioning, or aging.',
    icon: '🍺',
  },
  completed: {
    title: 'Completed Brews',
    description: 'Finished brews ready to drink — tasting notes and final results.',
    icon: '🍻',
  },
  articles: {
    title: 'Brewing Articles',
    description: 'Articles and notes about brewing techniques, equipment, and experiments.',
    icon: '📝',
  },
};

const BrewingListTemplate: React.FC<PageProps<BrewingListPageData, BrewingListPageContext>> = ({
  data,
  pageContext,
}) => {
  const recipes = data.allMarkdownRemark.nodes;
  const seriesCards = pageContext.seriesCards || [];
  const { brewStatus, numPages, currentPage } = pageContext;
  const config = STATUS_CONFIG[brewStatus];

  const SeriesCardComponent: React.FC<{ card: SeriesCard }> = ({ card }) => (
    <Link
      key={card.slug}
      to={`/series/${card.slug}`}
      className="brewing-recipe-card"
    >
      {card.featuredImage && (
        <div className="brewing-recipe-card-image">
          <img
            src={card.featuredImage}
            alt={card.name}
            loading="lazy"
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
        </div>
      )}
      <div className="brewing-recipe-card-body">
        <h2>{card.name}</h2>
        {card.draft && <DraftBadge size="md" />}
        <p>{card.description}</p>
        <div className="brewing-recipe-card-meta">
          <span>{formatDate(card.publishedAt)}</span>
          <span>•</span>
          <span className="hm-article-card-reading-time">
            <ClockIcon size={14} />
            {card.readingTime} min
          </span>
        </div>
      </div>
    </Link>
  );

  const RecipeCardComponent: React.FC<{ recipe: RecipeCard }> = ({ recipe }) => {
    const isReview = recipe.fileAbsolutePath.includes('/content/reviews/');
    const isSeries = !!recipe.frontmatter.series?.name;
    const linkPath = isReview
      ? `/reviews/${recipe.frontmatter.slug}`
      : isSeries
        ? `/series/${recipe.frontmatter.slug}`
        : `/brewing/${recipe.frontmatter.slug}`;

    return (
      <Link
        key={recipe.id}
        to={linkPath}
        className="brewing-recipe-card"
      >
        {recipe.frontmatter.featuredImage && (
          <div className="brewing-recipe-card-image">
            <img
              src={recipe.frontmatter.featuredImage}
              alt={recipe.frontmatter.title}
              loading="lazy"
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
          </div>
        )}
        <div className="brewing-recipe-card-body">
          <h2>{recipe.frontmatter.title}</h2>
          {recipe.frontmatter.draft && <DraftBadge size="md" />}
          <p>{recipe.frontmatter.excerpt}</p>
          <div className="brewing-recipe-card-meta">
            <span>{formatDate(recipe.frontmatter.publishedAt)}</span>
            <span>•</span>
            <span className="hm-article-card-reading-time">
              <ClockIcon size={14} />
              {recipe.fields?.readingTime || 0} min
            </span>
            {(recipe.frontmatter.rating ?? recipe.frontmatter.review?.rating) && (
              <span className="recipe-card-rating">
                <StarRating rating={recipe.frontmatter.rating ?? recipe.frontmatter.review?.rating ?? 0} size={14} showScore={false} color="#FFC107" />
              </span>
            )}
            {recipe.frontmatter.brewData?.abv && (
              <span>{recipe.frontmatter.brewData.abv}% ABV</span>
            )}
          </div>
        </div>
      </Link>
    );
  };

  const basePath = `/brewing/${brewStatus === 'active' ? 'active' : brewStatus === 'completed' ? 'completed' : 'articles'}`;

  return (
    <Layout>
      <div className="brewing-index">
        <header className="brewing-index-header">
          <h1 style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
            <span className="section-icon">{config.icon}</span>
            {config.title}
          </h1>
          <p>{config.description}</p>
        </header>

        <div className="brewing-list-back">
          <Link to="/brewing">← Back to Brewing</Link>
        </div>

        {recipes.length > 0 || seriesCards.length > 0 ? (
          <>
            <div className="brewing-recipe-grid brewing-recipe-grid--3col">
              {seriesCards.map((card) => (
                <SeriesCardComponent key={card.slug} card={card} />
              ))}
              {brewStatus === 'articles' 
                ? recipes.filter(r => !r.frontmatter.series?.name).map((recipe) => (
                    <RecipeCardComponent key={recipe.id} recipe={recipe} />
                  ))
                : recipes.map((recipe) => (
                    <RecipeCardComponent key={recipe.id} recipe={recipe} />
                  ))
              }
            </div>

            {numPages > 1 && (
              <nav className="hm-pagination" aria-label="Pagination">
                <div className="hm-pagination-inner">
                  {currentPage > 1 && (
                    <Link
                      to={currentPage === 2 ? basePath : `${basePath}/${currentPage - 1}`}
                      className="hm-pagination-prev"
                      rel="prev"
                    >
                      ← Previous
                    </Link>
                  )}

                  <div className="hm-pagination-numbers">
                    {Array.from({ length: numPages }, (_, i) => i + 1).map((page) => {
                      const isCurrent = page === currentPage;
                      const path = page === 1 ? basePath : `${basePath}/${page}`;

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
                      to={`${basePath}/${currentPage + 1}`}
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
          <div className="brewing-empty">
            <p>No {config.title.toLowerCase()} found.</p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default BrewingListTemplate;

export const Head: HeadFC<BrewingListPageData, BrewingListPageContext> = ({ data, pageContext }) => {
  const config = STATUS_CONFIG[pageContext.brewStatus];
  return (
    <SEO
      title={config.title}
      description={config.description}
      pathname={`/brewing/${pageContext.brewStatus}`}
      siteMetadata={data.site.siteMetadata}
    />
  );
};

export const query = graphql`
  query BrewingListQuery(
    $articleSlugs: [String!]
    $limit: Int!
    $skip: Int!
  ) {
    site {
      siteMetadata {
        title
        description
        siteUrl
      }
    }
    allMarkdownRemark(
      filter: { frontmatter: { slug: { in: $articleSlugs } } }
      sort: { frontmatter: { publishedAt: DESC } }
      limit: $limit
      skip: $skip
    ) {
      nodes {
        id
        fileAbsolutePath
        fields {
          readingTime
        }
        frontmatter {
          slug
          title
          excerpt
          featuredImage
          publishedAt
          rating
          review {
            rating
          }
          type
          draft
          series {
            name
          }
          brewData {
            abv
            batchSize
            drinkingReadyDate
            startDate
          }
        }
      }
    }
  }
`;