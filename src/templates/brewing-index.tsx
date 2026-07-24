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
    brewData?: {
      abv?: number;
      batchSize?: string;
    };
  };
}

interface ListingData {
  allMarkdownRemark: {
    nodes: RecipeCard[];
  };
}

interface ListingContext {
  limit: number;
  skip: number;
  numPages: number;
  currentPage: number;
}

const BrewingIndexTemplate: React.FC<PageProps<ListingData, ListingContext>> = ({
  data,
  pageContext,
}) => {
  const recipes = data.allMarkdownRemark.nodes;
  const { numPages, currentPage } = pageContext;

  return (
    <Layout>
      <div className="brewing-index">
        <header className="brewing-index-header">
          <h1>Brewing Recipes</h1>
          <p>Homebrew recipes with step-by-step instructions, gravity readings, and fermentation data.</p>
        </header>

        {recipes.length === 0 ? (
          <div className="brewing-empty">
            <p>No recipes yet. Check back soon!</p>
          </div>
        ) : (
          <div className="brewing-recipe-grid">
            {recipes.map((recipe) => (
              <Link
                key={recipe.id}
                to={`/brewing/${recipe.frontmatter.slug}`}
                className="brewing-recipe-card"
              >
                {recipe.frontmatter.featuredImage && (
                  <div className="brewing-recipe-card-image">
                    <OptimizedImage
                      src={recipe.frontmatter.featuredImage}
                      alt={recipe.frontmatter.title}
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
            ))}
          </div>
        )}

        {numPages > 1 && (
          <nav className="brewing-pagination">
            {Array.from({ length: numPages }).map((_, i) => {
              const pageNum = i + 1;
              const path = pageNum === 1 ? '/brewing' : `/brewing/${pageNum}`;
              return pageNum === currentPage ? (
                <span key={pageNum} className="active">{pageNum}</span>
              ) : (
                <Link key={pageNum} to={path}>{pageNum}</Link>
              );
            })}
          </nav>
        )}
      </div>
    </Layout>
  );
};

export default BrewingIndexTemplate;

export const Head: HeadFC = () => (
  <SEO
    title="Brewing Recipes"
    description="Homebrew brewing recipes with step-by-step instructions and brewing data."
  />
);

export const query = graphql`
  query BrewingListingQuery($limit: Int!, $skip: Int!) {
    allMarkdownRemark(
      filter: {
        fileAbsolutePath: { regex: "/content/brewing/" }
        frontmatter: { slug: { ne: null }, draft: { ne: true } }
      }
      sort: { frontmatter: { publishedAt: DESC } }
      limit: $limit
      skip: $skip
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
          brewData {
            abv
            batchSize
          }
        }
      }
    }
  }
`;