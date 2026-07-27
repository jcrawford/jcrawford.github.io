import React from 'react';
import { graphql, Link, PageProps, HeadFC } from 'gatsby';
import Layout from '../components/Layout';
import SEO from '../components/SEO';
import OptimizedImage from '../components/OptimizedImage';
import StarRating from '../components/StarRating';
import { formatDate } from '../utils/dateUtils';
import '../styles/brewing-index.css';

interface RecipeCard {
  id: string;
  frontmatter: {
    slug: string;
    title: string;
    excerpt: string;
    featuredImage: string;
    publishedAt: string;
    rating?: number;
    type?: string;
    brewData?: {
      abv?: number;
      batchSize?: string;
      drinkingReadyDate?: string;
      startDate?: string;
    };
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
  const recipes = data.allMarkdownRemark.nodes;

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

  const brewingPosts = recipes.filter(
    (recipe) => recipe.frontmatter.type !== 'brewing-recipe' &&
    recipe.frontmatter.tags?.some((tag: string) => tag.toLowerCase() === 'brewing')
  );

  const RecipeCardComponent: React.FC<{ recipe: RecipeCard }> = ({ recipe }) => {
    const isBrewingRecipe = recipe.frontmatter.type === 'brewing-recipe';
    const linkPath = isBrewingRecipe 
      ? `/brewing/${recipe.frontmatter.slug}`
      : `/posts/${recipe.frontmatter.slug}`;
    
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
          <p>{recipe.frontmatter.excerpt}</p>
          <div className="brewing-recipe-card-meta">
            <span>{formatDate(recipe.frontmatter.publishedAt)}</span>
            {recipe.frontmatter.rating && (
              <span className="recipe-card-rating">
                <StarRating rating={recipe.frontmatter.rating} size={14} showScore={false} color="#FFC107" />
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

        {/* Active Brews Section */}
        {activeBrews.length > 0 && (
          <section className="brewing-section">
            <h2 className="brewing-section-title">
              <span className="section-icon">🍺</span>
              Active Brews
            </h2>
            <p className="brewing-section-description">
              Currently fermenting or conditioning — not quite ready to drink yet.
            </p>
            <div className="brewing-recipe-grid">
              {activeBrews.map((recipe) => (
                <RecipeCardComponent key={recipe.id} recipe={recipe} />
              ))}
            </div>
          </section>
        )}

        {/* Completed Brews Section */}
        {completedBrews.length > 0 && (
          <section className="brewing-section">
            <h2 className="brewing-section-title">
              <span className="section-icon">🍻</span>
              Completed Brews
            </h2>
            <p className="brewing-section-description">
              Ready to drink — bottles are conditioned and tasting notes are in.
            </p>
            <div className="brewing-recipe-grid">
              {completedBrews.map((recipe) => (
                <RecipeCardComponent key={recipe.id} recipe={recipe} />
              ))}
            </div>
          </section>
        )}

        {/* Brewing Posts Section */}
        {brewingPosts.length > 0 && (
          <section className="brewing-section">
            <h2 className="brewing-section-title">
              <span className="section-icon">📝</span>
              Brewing Posts
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
        fileAbsolutePath: { regex: "/content/(brewing|posts)/" }
        frontmatter: { slug: { ne: null }, draft: { ne: true } }
      }
      sort: { frontmatter: { publishedAt: DESC } }
    ) {
      nodes {
        id
        frontmatter {
          slug
          title
          excerpt
          featuredImage
          publishedAt
          rating
          type
          tags
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