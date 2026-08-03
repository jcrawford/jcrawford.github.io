import React, { useEffect } from 'react';
import { graphql, HeadFC, PageProps } from 'gatsby';
import Layout from '../components/Layout';
import SEO from '../components/SEO';
import OptimizedImage from '../components/OptimizedImage';
import StarRating from '../components/StarRating';
import FermentationProgress from '../components/FermentationProgress';
import Comments from '../components/Comments';
import ShareButtons from '../components/ShareButtons';
import ArticleMeta from '../components/ArticleMeta';
import RecipeIngredients from '../components/RecipeIngredients';
import RecipeSteps from '../components/RecipeSteps';
import { formatDate } from '../utils/dateUtils';
import type { BrewData, RecipeStep, ShareCounts } from '../types/article';
import '../styles/brewing-recipe.css';

// Declare gtag for TypeScript
declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}

function daysBetween(start?: string, end?: string): number | null {
  if (!start || !end) return null;
  const ms = new Date(end).getTime() - new Date(start).getTime();
  if (isNaN(ms) || ms < 0) return null;
  return Math.round(ms / (1000 * 60 * 60 * 24));
}

function formatDuration(days: number): string {
  if (days < 7) return `${days} day${days !== 1 ? 's' : ''}`;
  const weeks = Math.round(days / 7 * 10) / 10;
  if (weeks < 4) return `${weeks} week${weeks !== 1 ? 's' : ''}`;
  const months = Math.round(weeks / 4.33 * 10) / 10;
  return `${months} month${months !== 1 ? 's' : ''}`;
}

// BrewData and RecipeStep imported from ../types/article

interface RecipeData {
  markdownRemark: {
    id: string;
    html: string;
    frontmatter: {
      slug: string;
      title: string;
      excerpt: string;
      featuredImage: string;
      tags: string[] | null;
      author: string;
      publishedAt: string;
      type: string;
      rating?: number;
      brewData?: BrewData;
      ingredients?: string[];
      steps?: RecipeStep[];
    };
  };
}

interface BrewingRecipePageContext {
  viewCount: number;
  commentCount: number;
  shareCounts: ShareCounts;
}

const BrewingRecipeTemplate: React.FC<PageProps<RecipeData, BrewingRecipePageContext>> = ({ data, pageContext }) => {
  const recipe = data.markdownRemark;
  const { frontmatter, html } = recipe;
  const viewCount = pageContext.viewCount || 0;
  const commentCount = pageContext.commentCount || 0;
  const shareCounts = pageContext.shareCounts || { facebook: 0, twitter: 0, linkedin: 0, copy: 0 };
  const shareUrl = `https://josephcrawford.com/brewing/${frontmatter.slug}`;

  const brewData = frontmatter.brewData;
  const ingredients = frontmatter.ingredients || [];
  const steps = frontmatter.steps || [];

  // Track page view in GA4 (production only)
  useEffect(() => {
    if (typeof window !== 'undefined' && window.gtag && window.location.hostname === 'josephcrawford.com') {
      window.gtag('event', 'page_view', {
        page_path: `/brewing/${frontmatter.slug}`,
        page_title: frontmatter.title,
      });
    }
  }, [frontmatter.slug, frontmatter.title]);

  const formatGravity = (g?: number | null) => g != null ? g.toFixed(3) : undefined;

  // Calculate fermentation time from primary + secondary (excluding conditioning)
  const primaryDays = daysBetween(brewData?.startDate, brewData?.primaryEndDate);
  const secondaryDays = daysBetween(brewData?.secondaryStartDate, brewData?.secondaryEndDate);
  const calculatedFermentationDays = (primaryDays || 0) + (secondaryDays || 0);
  const calculatedFermentationTime = calculatedFermentationDays > 0 
    ? formatDuration(calculatedFermentationDays)
    : brewData?.fermentationTime; // fallback to manual value if dates not available

  const brewDataItems: Array<{ label: string; value?: string | number }> = [
    { label: 'Original Gravity', value: formatGravity(brewData?.originalGravity) },
    { label: 'Final Gravity', value: formatGravity(brewData?.finalGravity) },

    { label: 'ABV', value: brewData?.abv ? `${brewData.abv}%` : undefined },
    { label: 'Batch Size', value: brewData?.batchSize },
    { label: 'Yeast', value: brewData?.yeast },
    { label: 'Fermentation Time', value: calculatedFermentationTime },
    { label: 'Bulk Conditioning', value: brewData?.bulkConditioningTime && brewData.bulkConditioningTime !== '0 days' ? brewData.bulkConditioningTime : undefined },
    { label: 'Bottle Conditioning', value: brewData?.bottleConditioningTime && brewData.bottleConditioningTime !== '0 days' ? brewData.bottleConditioningTime : undefined },
    { label: 'Start Date', value: brewData?.startDate ? formatDate(brewData.startDate) : undefined },
    { label: 'Secondary Start', value: brewData?.secondaryStartDate ? formatDate(brewData.secondaryStartDate) : undefined },
    { label: 'Bottling Date', value: brewData?.bottlingDate ? formatDate(brewData.bottlingDate) : undefined },
  ].filter(item => item.value !== undefined && item.value !== '' && item.value !== null);

  return (
    <Layout>
      <article className="brewing-recipe">
        {/* Header */}
        <header className="brewing-recipe-header">
          <h1>{frontmatter.title}</h1>
          <ArticleMeta
            publishedAt={frontmatter.publishedAt}
            viewCount={viewCount}
            commentCount={commentCount}
            variant="recipe"
          />
          <ShareButtons
            title={frontmatter.title}
            url={shareUrl}
            variant="top"
            shareCounts={shareCounts}
          />
          {frontmatter.rating && (
            <div className="recipe-rating">
              <StarRating rating={frontmatter.rating} size={20} showScore={true} color="#FFC107" />
            </div>
          )}
        </header>

        {frontmatter.featuredImage && (
          <div className="brewing-recipe-featured-image">
            <OptimizedImage
              src={frontmatter.featuredImage}
              alt={frontmatter.title}
              loading="eager"
              sizes="(max-width: 768px) 100vw, 850px"
            />
          </div>
        )}

        {/* Fermentation Progress Meter */}
        {frontmatter.brewData && (
          <FermentationProgress brewData={frontmatter.brewData} />
        )}

        {/* Brew Data Card */}
        {brewDataItems.length > 0 && (
          <section className="brew-data-card">
            <h2>Brewing Data</h2>
            <div className="brew-data-grid">
              {brewDataItems.map((item, index) => (
                <div key={index} className="brew-data-item">
                  <span className="brew-data-label">{item.label}</span>
                  <span className="brew-data-value">{item.value}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Ingredients */}
        <RecipeIngredients ingredients={ingredients} />

        {/* Steps */}
        <RecipeSteps steps={steps} variant="recipe" />

        {/* Any additional markdown body content */}
        {html && (
          <div
            className="recipe-additional-content"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        )}

        <div className="recipe-footer">
          <hr />

          <ShareButtons
            title={frontmatter.title}
            url={shareUrl}
            shareCounts={shareCounts}
          />

          <hr />

          <Comments slug={frontmatter.slug} title={frontmatter.title} />
        </div>
      </article>
    </Layout>
  );
};

export default BrewingRecipeTemplate;

export const Head: HeadFC<RecipeData> = ({ data }) => {
  const frontmatter = data.markdownRemark.frontmatter;
  
  return (
    <SEO
      title={frontmatter.title}
      description={frontmatter.excerpt}
      image={frontmatter.featuredImage}
      article={true}
      pathname={`/brewing/${frontmatter.slug}`}
      siteMetadata={{
        title: 'Joseph Crawford',
        description: 'A blog relating to technical topics such as programming, web development, and software engineering.',
        siteUrl: 'https://josephcrawford.com'
      }}
    />
  );
};

export const query = graphql`
  query BrewingRecipeQuery($slug: String!) {
    markdownRemark(
      frontmatter: { slug: { eq: $slug } }
      fileAbsolutePath: { regex: "/content/brewing/" }
    ) {
      id
      html
      frontmatter {
        slug
        title
        excerpt
        featuredImage
        tags
        author
        publishedAt
        type
        rating
        brewData {
          originalGravity
          finalGravity

          startDate
          primaryEndDate
          secondaryStartDate
          secondaryEndDate
          bottlingDate
          drinkingReadyDate
          abv
          batchSize
          yeast
          fermentationTime
          secondaryTime
          bulkConditioningTime
          bottleConditioningTime
        }
        ingredients
        steps {
          title
          description
          image
          video
        }
      }
    }
  }
`;