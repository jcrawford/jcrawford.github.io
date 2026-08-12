import React, { useEffect } from 'react';
import { graphql, Link, PageProps, HeadFC } from 'gatsby';
import Layout from '../components/Layout';
import SEO from '../components/SEO';
import StarRating from '../components/StarRating';
import DraftBadge from '../components/DraftBadge';
import { formatDate } from '../utils/dateUtils';
import { ClockIcon } from '../utils/icons';
import '../styles/brewing-index.css';

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

interface ListingData {
  allMarkdownRemark: {
    nodes: RecipeCard[];
  };
}

interface BrewingIndexPageContext {
  draftFilter: (boolean | null)[];
  seriesCards: SeriesCard[];
}

const BrewingIndexTemplate: React.FC<PageProps<ListingData, BrewingIndexPageContext>> = ({
  data,
  pageContext,
}) => {
  const recipes = data.allMarkdownRemark.nodes;
  const seriesCards = pageContext.seriesCards || [];
  const [activeBrewTab, setActiveBrewTab] = React.useState<'active' | 'completed'>('active');

  // Split recipes into Active and Completed based on drinkingReadyDate
  const today = new Date().toISOString().split('T')[0];
  
  const activeBrews = recipes.filter(
    (recipe) => recipe.frontmatter.type === 'brewing-recipe' && 
    (!recipe.frontmatter.brewData?.drinkingReadyDate || recipe.frontmatter.brewData.drinkingReadyDate > today)
  );
  
  const completedBrews = recipes.filter(
    (recipe) => recipe.frontmatter.type === 'brewing-recipe' && 
    recipe.frontmatter.brewData?.drinkingReadyDate && 
    recipe.frontmatter.brewData.drinkingReadyDate <= today
  );

  // Show only the latest 3 on the index page
  const PREVIEW_COUNT = 3;
  const previewActiveBrews = activeBrews.slice(0, PREVIEW_COUNT);
  const previewCompletedBrews = completedBrews.slice(0, PREVIEW_COUNT);

  // Standalone brewing posts only (no series articles).
  // Include both standard brewing posts AND reviews that are tagged with 'brewing'
  const standaloneBrewingPosts = recipes.filter(
    (recipe) => recipe.frontmatter.type !== 'brewing-recipe' && !recipe.frontmatter.series
  );
  // Calculate remaining slots after series cards
  const remainingSlots = Math.max(0, PREVIEW_COUNT - seriesCards.length);
  const previewStandalonePosts = standaloneBrewingPosts.slice(0, remainingSlots);

  const hasBrews = activeBrews.length > 0 || completedBrews.length > 0;

  const handleTabChange = (tab: 'active' | 'completed') => {
    setActiveBrewTab(tab);
  };

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
    const linkPath = isReview
      ? `/reviews/${recipe.frontmatter.slug}`
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

  return (
    <Layout>
      <div className="brewing-index">
        <header className="brewing-index-header">
          <h1>Brewing</h1>
          <p>Homebrew recipes, fermentation logs, and brewing notes.</p>
        </header>

        {/* My Brews Tab Section */}
        {hasBrews && (
          <section className="brewing-section brewing-section--my-brews">
            <h2 className="brewing-section-title">
              <span className="section-icon">🍺</span>
              My Brews
            </h2>
            <p className="brewing-section-description">
              Active batches in progress and completed brews ready to drink.
            </p>

            <div className="brewing-tabs" role="tablist" aria-label="My Brews">
              <button
                id="tab-active"
                role="tab"
                aria-selected={activeBrewTab === 'active'}
                aria-controls="panel-active"
                className={`brewing-tab ${activeBrewTab === 'active' ? 'brewing-tab--active' : ''}`}
                onClick={() => handleTabChange('active')}
              >
                <span className="brewing-tab-icon">🍺</span>
                Active
                <span className="brewing-tab-count">{activeBrews.length}</span>
              </button>
              <button
                id="tab-completed"
                role="tab"
                aria-selected={activeBrewTab === 'completed'}
                aria-controls="panel-completed"
                className={`brewing-tab ${activeBrewTab === 'completed' ? 'brewing-tab--active' : ''}`}
                onClick={() => handleTabChange('completed')}
              >
                <span className="brewing-tab-icon">🍻</span>
                Completed
                <span className="brewing-tab-count">{completedBrews.length}</span>
              </button>
            </div>

            <div
              id="panel-active"
              role="tabpanel"
              aria-labelledby="tab-active"
              className={`brewing-tab-panel ${activeBrewTab === 'active' ? 'brewing-tab-panel--active' : ''}`}
            >
              {previewActiveBrews.length > 0 ? (
                <>
                  <div className="brewing-recipe-grid">
                    {previewActiveBrews.map((recipe) => (
                      <RecipeCardComponent key={recipe.id} recipe={recipe} />
                    ))}
                  </div>
                  {activeBrews.length > PREVIEW_COUNT && (
                    <div className="brewing-view-all">
                      <Link to="/brewing/active">View All Active Brews ({activeBrews.length}) →</Link>
                    </div>
                  )}
                </>
              ) : (
                <p className="brewing-tab-empty">No active brews right now.</p>
              )}
            </div>

            <div
              id="panel-completed"
              role="tabpanel"
              aria-labelledby="tab-completed"
              className={`brewing-tab-panel ${activeBrewTab === 'completed' ? 'brewing-tab-panel--active' : ''}`}
            >
              {previewCompletedBrews.length > 0 ? (
                <>
                  <div className="brewing-recipe-grid">
                    {previewCompletedBrews.map((recipe) => (
                      <RecipeCardComponent key={recipe.id} recipe={recipe} />
                    ))}
                  </div>
                  {completedBrews.length > PREVIEW_COUNT && (
                    <div className="brewing-view-all">
                      <Link to="/brewing/completed">View All Completed Brews ({completedBrews.length}) →</Link>
                    </div>
                  )}
                </>
              ) : (
                <p className="brewing-tab-empty">No completed brews yet.</p>
              )}
            </div>
          </section>
        )}

        {/* Brewing Articles Section */}
        {(seriesCards.length > 0 || standaloneBrewingPosts.length > 0) && (
          <section className="brewing-section">
            <h2 className="brewing-section-title">
              <span className="section-icon">📝</span>
              Brewing Articles
            </h2>
            <p className="brewing-section-description">
              Articles and notes about brewing techniques, equipment, and experiments.
            </p>
            <div className="brewing-recipe-grid">
              {seriesCards.map((card) => (
                <SeriesCardComponent key={card.slug} card={card} />
              ))}
              {previewStandalonePosts.map((recipe) => (
                <RecipeCardComponent key={recipe.id} recipe={recipe} />
              ))}
            </div>
            {(seriesCards.length + standaloneBrewingPosts.length > PREVIEW_COUNT) && (
              <div className="brewing-view-all">
                <Link to="/brewing/articles">View All Brewing Articles →</Link>
              </div>
            )}
          </section>
        )}

        {recipes.length === 0 && seriesCards.length === 0 && (
          <div className="brewing-empty">
            <p>No recipes yet. Check back soon!</p>
          </div>
        )}
      </div>
    </Layout>
  );
};

// Announce brewing context to SupportBar
const BrewingIndexWithAnnouncement: React.FC = () => {
  useEffect(() => {
    const event = new CustomEvent('support-context', { detail: { context: 'brewing' } });
    window.dispatchEvent(event);
  }, []);
  
  return <BrewingIndexTemplate />;
};

export default BrewingIndexWithAnnouncement;

export const Head: HeadFC = () => (
  <SEO
    title="Brewing"
    description="Homebrew brewing recipes with step-by-step instructions and fermentation tracking."
    siteMetadata={{
      title: 'Joseph Crawford',
      description: 'A blog relating to technical topics such as programming, web development, and software engineering.',
      siteUrl: 'https://josephcrawford.com'
    }}
  />
);

export const query = graphql`
  query BrewingIndexQuery(
    $draftFilter: [Boolean]
  ) {
    allMarkdownRemark(
      filter: {
        frontmatter: { slug: { ne: null }, tags: { in: ["brewing"] }, draft: { in: $draftFilter }, series: { name: { eq: null } } }
      }
      sort: { frontmatter: { publishedAt: DESC } }
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