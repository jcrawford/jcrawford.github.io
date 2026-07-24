import React, { useEffect } from 'react';
import { graphql, PageProps, HeadFC } from 'gatsby';
import Layout from '../components/Layout';
import SEO from '../components/SEO';
import OptimizedImage from '../components/OptimizedImage';
import StarRating from '../components/StarRating';
import FermentationProgress from '../components/FermentationProgress';
import Comments from '../components/Comments';
import ShareButtons from '../components/ShareButtons';
import { formatDate } from '../utils/dateUtils';
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

interface BrewData {
  originalGravity?: number;
  finalGravity?: number;

  startDate?: string;
  primaryEndDate?: string;
  secondaryStartDate?: string;
  secondaryEndDate?: string;
  bottlingDate?: string;
  drinkingReadyDate?: string;
  bulkConditioningTime?: string;
  bottleConditioningTime?: string;
  abv?: number;
  batchSize?: string;
  yeast?: string;
  fermentationTime?: string;
  secondaryTime?: string;
}

interface RecipeStep {
  title: string;
  description: string;
  image?: string;
  video?: string;
}

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
  shareCounts: { facebook: number; twitter: number; linkedin: number; copy: number };
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

  // Track page view in GA4
  useEffect(() => {
    if (typeof window !== 'undefined' && window.gtag) {
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
    { label: 'Bulk Conditioning', value: brewData?.bulkConditioningTime },
    { label: 'Bottle Conditioning', value: brewData?.bottleConditioningTime },
    { label: 'Start Date', value: brewData?.startDate ? formatDate(brewData.startDate) : undefined },
    { label: 'Secondary Start', value: brewData?.secondaryStartDate ? formatDate(brewData.secondaryStartDate) : undefined },
    { label: 'Bottling Date', value: brewData?.bottlingDate ? formatDate(brewData.bottlingDate) : undefined },
  ].filter(item => item.value !== undefined);

  return (
    <Layout>
      <article className="brewing-recipe">
        {/* Header */}
        <header className="brewing-recipe-header">
          <h1>{frontmatter.title}</h1>
          <div className="recipe-meta">
            <time dateTime={frontmatter.publishedAt}>
              {formatDate(frontmatter.publishedAt)}
            </time>
            <span className="recipe-meta-separator">•</span>
            <span className="recipe-views">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
              {viewCount.toLocaleString()}
            </span>
            <span className="recipe-meta-separator">•</span>
            <span className="recipe-comments">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
              </svg>
              {commentCount}
            </span>
          </div>
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

        {/* Featured Image */}
        {frontmatter.featuredImage && (
          <div className="brewing-recipe-featured-image">
            <OptimizedImage
              src={frontmatter.featuredImage}
              alt={frontmatter.title}
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
        {ingredients.length > 0 && (
          <section className="recipe-ingredients">
            <h2>Ingredients</h2>
            <ul>
              {ingredients.map((ingredient, index) => (
                <li key={index}>{ingredient}</li>
              ))}
            </ul>
          </section>
        )}

        {/* Steps */}
        {steps.length > 0 && (
          <section className="recipe-steps">
            <h2>Instructions</h2>
            {steps.map((step, index) => (
              <div key={index} className="recipe-step watermark-step">
                <span className="watermark-number">{index + 1}</span>
                <div className="recipe-step-content">
                  <h3>{step.title}</h3>
                  <p>{step.description}</p>
                  {step.video && (
                    <div className="recipe-step-video">
                      <video controls playsInline muted loop>
                        <source src={step.video} type="video/mp4" />
                        Your browser does not support the video tag.
                      </video>
                    </div>
                  )}
                  {step.image && (
                    <div className="recipe-step-image">
                      <OptimizedImage
                        src={step.image}
                        alt={step.title}
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </section>
        )}

        {/* Any additional markdown body content */}
        {html && (
          <div
            className="recipe-additional-content"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        )}

        <ShareButtons
          title={frontmatter.title}
          url={shareUrl}
          shareCounts={shareCounts}
        />

        <Comments slug={frontmatter.slug} title={frontmatter.title} />
      </article>
    </Layout>
  );
};

export default BrewingRecipeTemplate;

export const Head: HeadFC<RecipeData> = ({ data }) => {
  const siteUrl = 'https://josephcrawford.com';
  const imageUrl = data.markdownRemark.frontmatter.featuredImage?.startsWith('http') 
    ? data.markdownRemark.frontmatter.featuredImage 
    : `${siteUrl}${data.markdownRemark.frontmatter.featuredImage}`;
  
  return (
    <>
      <title>{data.markdownRemark.frontmatter.title} | Joseph Crawford</title>
      <meta name="description" content={data.markdownRemark.frontmatter.excerpt} />
      <meta name="image" content={imageUrl} />
      
      <meta property="og:type" content="article" />
      <meta property="og:title" content={data.markdownRemark.frontmatter.title} />
      <meta property="og:description" content={data.markdownRemark.frontmatter.excerpt} />
      <meta property="og:image" content={imageUrl} />
      <meta property="og:url" content={`${siteUrl}/brewing/${data.markdownRemark.frontmatter.slug}`} />
      
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={data.markdownRemark.frontmatter.title} />
      <meta name="twitter:description" content={data.markdownRemark.frontmatter.excerpt} />
      <meta name="twitter:image" content={imageUrl} />
    </>
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