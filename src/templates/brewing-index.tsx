import React from 'react';
import { graphql, Link, PageProps, HeadFC } from 'gatsby';
import Layout from '../components/Layout';
import SEO from '../components/SEO';
import OptimizedImage from '../components/OptimizedImage';
import StarRating from '../components/StarRating';
import DraftBadge from '../components/DraftBadge';
import { formatDate } from '../utils/dateUtils';
import '../styles/brewing-index.css';

const SHOW_DRAFTS = typeof process !== 'undefined' && process.env.GATSBY_SHOW_DRAFTS === 'true';

interface RecipeCard {
  id: string;
  fileAbsolutePath: string;
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
  };
}

interface ListingData {
  allMarkdownRemark: {
    nodes: RecipeCard[];
  };
}

const BrewingIndexTemplate: React.FC<PageProps<ListingData>> = ({
  data,
}) => {
  const recipesAll = data.allMarkdownRemark.nodes;
  const recipes = SHOW_DRAFTS ? recipesAll : recipesAll.filter((recipe) => !recipe.frontmatter.draft);
  const [activeBrewTab, setActiveBrewTab] = React.useState<'active' | 'completed'>('active');
  const [activePage, setActivePage] = React.useState(1);
  const [completedPage, setCompletedPage] = React.useState(1);
  const BREWS_PER_PAGE = 6;

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

  const paginatedActiveBrews = activeBrews.slice((activePage - 1) * BREWS_PER_PAGE, activePage * BREWS_PER_PAGE);
  const activeTotalPages = Math.ceil(activeBrews.length / BREWS_PER_PAGE);
  const paginatedCompletedBrews = completedBrews.slice((completedPage - 1) * BREWS_PER_PAGE, completedPage * BREWS_PER_PAGE);
  const completedTotalPages = Math.ceil(completedBrews.length / BREWS_PER_PAGE);

  const brewingPosts = recipes.filter(
    (recipe) => recipe.frontmatter.type !== 'brewing-recipe'
  );

  const hasBrews = activeBrews.length > 0 || completedBrews.length > 0;

  const handleTabChange = (tab: 'active' | 'completed') => {
    setActiveBrewTab(tab);
    if (tab === 'active') setActivePage(1);
    else setCompletedPage(1);
  };

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
            {(recipe.frontmatter.rating ?? recipe.frontmatter.review?.rating) && (
              <span className="recipe-card-rating">
                <StarRating rating={recipe.frontmatter.rating ?? recipe.frontmatter.review?.rating} size={14} showScore={false} color="#FFC107" />
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
              {paginatedActiveBrews.length > 0 ? (
                <>
                  <div className="brewing-recipe-grid">
                    {paginatedActiveBrews.map((recipe) => (
                      <RecipeCardComponent key={recipe.id} recipe={recipe} />
                    ))}
                  </div>
                  {activeTotalPages > 1 && (
                    <div className="brewing-pagination">
                      {Array.from({ length: activeTotalPages }, (_, i) => i + 1).map((page) => (
                        <button
                          key={page}
                          className={`brewing-pagination-button ${page === activePage ? 'active' : ''}`}
                          onClick={() => setActivePage(page)}
                          aria-label={`Active brews page ${page}`}
                          aria-current={page === activePage ? 'page' : undefined}
                        >
                          {page}
                        </button>
                      ))}
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
              {paginatedCompletedBrews.length > 0 ? (
                <>
                  <div className="brewing-recipe-grid">
                    {paginatedCompletedBrews.map((recipe) => (
                      <RecipeCardComponent key={recipe.id} recipe={recipe} />
                    ))}
                  </div>
                  {completedTotalPages > 1 && (
                    <div className="brewing-pagination">
                      {Array.from({ length: completedTotalPages }, (_, i) => i + 1).map((page) => (
                        <button
                          key={page}
                          className={`brewing-pagination-button ${page === completedPage ? 'active' : ''}`}
                          onClick={() => setCompletedPage(page)}
                          aria-label={`Completed brews page ${page}`}
                          aria-current={page === completedPage ? 'page' : undefined}
                        >
                          {page}
                        </button>
                      ))}
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
        {brewingPosts.length > 0 && (
          <section className="brewing-section">
            <h2 className="brewing-section-title">
              <span className="section-icon">📝</span>
              Brewing Articles
            </h2>
            <p className="brewing-section-description">
              Articles and notes about brewing techniques, equipment, and experiments.
            </p>
            <div className="brewing-recipe-grid">
              {brewingPosts.map((recipe) => (
                <RecipeCardComponent key={recipe.id} recipe={recipe} />
              ))}
            </div>
          </section>
        )}

        {recipes.length === 0 && (
          <div className="brewing-empty">
            <p>No recipes yet. Check back soon!</p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default BrewingIndexTemplate;

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
  query BrewingIndexQuery {
    allMarkdownRemark(
      filter: {
        frontmatter: { slug: { ne: null }, tags: { in: ["brewing"] } }
      }
      sort: { frontmatter: { publishedAt: DESC } }
    ) {
      nodes {
        id
        fileAbsolutePath
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