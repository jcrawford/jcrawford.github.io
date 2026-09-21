# Brewing Recipe Feature Implementation Plan

> **For Hermes/Lyra:** Use subagent-driven-development skill to implement this plan task-by-task.

**Goal:** Add a new "Brewing" category to the site header with a custom post type (`brewing-recipe`) that renders as a recipe card with step-by-step instructions, inline images, and brewing data points (gravity readings, dates).

**Architecture:** New content directory `content/brewing/` sourced by Gatsby filesystem plugin. New Gatsby template `brewing-recipe.tsx` with recipe-card layout. New category listing page at `/brewing/`. Posts excluded from homepage query, search index, and recent articles. Header nav updated with "Brewing" link. Custom frontmatter fields for brewing data.

**Tech Stack:** Gatsby 5, TypeScript, React, Markdown (gatsby-transformer-remark), plain CSS

**Project Root:** `/home/jcrawford/Projects/jcrawford.github.io`

---

## Key Design Decisions

1. **Separate content directory** (`content/brewing/`) — NOT in `content/posts/`. This cleanly excludes recipes from the homepage query, search index, and recent articles without complex filters.
2. **Custom template** (`src/templates/brewing-recipe.tsx`) — distinct from `article.tsx`. Recipe-card layout with structured data sections.
3. **Category listing page** at `/brewing/` — paginated grid of recipe cards. User must navigate here explicitly; recipes never appear on homepage.
4. **Path pattern** — `/brewing/{slug}` for individual recipes. Does NOT collide with `/posts/` or `/series/` or `/reviews/`.
5. **Exclusion from search** — the local search query in `gatsby-config.ts` filters `fileAbsolutePath` with regex `//content/(posts|reviews)/`. Adding `content/brewing/` to a SEPARATE search index or excluding it entirely. Default: exclude from search (user navigates to category manually).
6. **Exclusion from homepage** — homepage query already filters by `fileAbsolutePath: { regex: "//content/(posts|reviews)/" }`. Since recipes live in `content/brewing/`, they are automatically excluded. No change needed to homepage query.
7. **Exclusion from tag pages** — tag page creation in `gatsby-node.ts` filters articles from `content/(posts|reviews)`. Recipes are auto-excluded.
8. **Exclusion from sitemap** — recipe pages still get sitemap entries (good for SEO) but with lower priority.
9. **Header nav** — add `{ name: 'Brewing', path: '/brewing' }` to `siteMetadata.navigation` in `gatsby-config.ts`.
10. **Brewing data as frontmatter** — structured fields (OG, FG, SG, dates) in frontmatter, rendered as a data card in the template.

---

## Frontmatter Schema for Brewing Recipes

```yaml
---
slug: traditional-brew-recipe
title: "Traditional Brewing Recipe"
excerpt: "A classic brew recipe with step-by-step instructions."
featuredImage: /images/content/brewing/traditional-brew-recipe/featured.jpg
tags:
  - brewing
  - recipe
author: joseph-crawford
publishedAt: '2026-07-22'
type: brewing-recipe
rating: 4.5

# Brewing data points
brewData:
  originalGravity: 1.090
  finalGravity: 1.010
  specificGravity: 1.090
  startDate: '2026-07-22'
  primaryEndDate: '2026-08-05'
  secondaryStartDate: '2026-08-05'
  bottlingDate: '2026-09-15'
  drinkingReadyDate: '2026-11-15'
  abv: 10.5
  batchSize: "5 gallons"
  yeast: "Lalvin D-47"
  fermentationTime: "6-8 weeks"

# Recipe ingredients
ingredients:
  - "15 lbs wildflower honey"
  - "4 gallons spring water"
  - "1 packet Lalvin D-47 yeast"
  - "1 tsp yeast nutrient"

# Recipe steps (rendered as numbered cards)
steps:
  - title: "Sanitize Equipment"
    description: "Thoroughly sanitize all fermentation equipment..."
    image: /images/content/brewing/traditional-brew-recipe/step-1.jpg
  - title: "Mix Must"
    description: "Combine honey and water..."
    image: /images/content/brewing/traditional-brew-recipe/step-2.jpg
  - title: "Pitch Yeast"
    description: "Add yeast to the must..."
    image: /images/content/brewing/traditional-brew-recipe/step-3.jpg
---
```

---

## Task Breakdown

### Task 1: Add Content Directory and Gatsby Source Plugin

**Objective:** Create the `content/brewing/` directory and register it with `gatsby-source-filesystem`.

**Files:**
- Create: `content/brewing/.gitkeep`
- Modify: `gatsby-config.ts` (lines 51-105, plugins array)

**Step 1: Create content directory**

```bash
mkdir -p content/brewing
touch content/brewing/.gitkeep
```

**Step 2: Add gatsby-source-filesystem plugin entry**

In `gatsby-config.ts`, add after the `reviews` source (around line 98), before `galleries`:

```typescript
    {
      resolve: 'gatsby-source-filesystem',
      options: {
        name: 'brewing',
        path: `${__dirname}/content/brewing`,
      },
    },
```

**Step 3: Verify Gatsby picks up the new source**

Run: `npx gatsby develop`
Expected: No errors. Gatsby logs show `gatsby-source-filesystem` loading the new path.

**Step 4: Commit**

```bash
git add content/brewing/.gitkeep gatsby-config.ts
git commit -m "feat: add brewing content directory and source plugin"
```

---

### Task 2: Add Schema Customization for Recipe Frontmatter

**Objective:** Define Gatsby schema types for the new frontmatter fields so they are queryable.

**Files:**
- Modify: `gatsby-node.ts` (lines 32-128, `createSchemaCustomization`)

**Step 1: Add new types to createSchemaCustomization**

In `gatsby-node.ts`, inside `createSchemaCustomization`, add after the existing types (before the closing `\``);`):

```typescript
    type BrewingBrewData {
      originalGravity: Float
      finalGravity: Float
      specificGravity: Float
      startDate: Date
      primaryEndDate: Date
      secondaryStartDate: Date
      bottlingDate: Date
      drinkingReadyDate: Date
      abv: Float
      batchSize: String
      yeast: String
      fermentationTime: String
    }

    type BrewingStep {
      title: String
      description: String
      image: String
    }

    type MarkdownRemarkFrontmatter {
      type: String
      rating: Float
      brewData: BrewingBrewData
      ingredients: [String]
      steps: [BrewingStep]
    }
```

Note: `MarkdownRemarkFrontmatter` is already defined — we are EXTENDING it. Append `type`, `brewData`, `ingredients`, `steps` fields to the existing type definition. Do NOT create a duplicate `MarkdownRemarkFrontmatter` block. Add the fields inside the existing block at lines 36-49.

The `BrewingBrewData` and `BrewingStep` types go as new top-level type definitions alongside the existing `GalleryPhoto`, `SpinnerImage`, etc.

**Step 2: Verify build**

Run: `npx gatsby develop`
Expected: No schema errors in console.

**Step 3: Commit**

```bash
git add gatsby-node.ts
git commit -m "feat: add schema types for brewing recipe frontmatter"
```

---

### Task 3: Add Header Navigation Link

**Objective:** Add "Brewing" to the site header navigation.

**Files:**
- Modify: `gatsby-config.ts` (lines 13-20, `siteMetadata.navigation`)

**Step 1: Add nav item**

In `gatsby-config.ts`, add to the `navigation` array:

```typescript
    navigation: [
      { name: 'Home', path: '/' },
      { name: 'Galleries', path: '/gallery' },
      { name: 'Brewing', path: '/brewing' },
      { name: 'Family', path: '/tag/family' },
      { name: 'Reviews', path: '/tag/reviews' },
      { name: 'Work', path: '/tag/work' },
      { name: 'Resume', path: '/resume' },
    ],
```

**Step 2: Verify nav appears**

Run: `npx gatsby develop`
Navigate to `http://localhost:8000/`
Expected: "Brewing" link visible in header nav bar and mobile menu.

**Step 3: Commit**

```bash
git add gatsby-config.ts
git commit -m "feat: add Brewing to header navigation"
```

---

### Task 4: Create Page Creation Logic in gatsby-node.ts

**Objective:** Create Gatsby pages for individual brewing recipes and the category listing page.

**Files:**
- Modify: `gatsby-node.ts` (after existing `createPages` logic, around line 397)

**Step 1: Add brewing page creation**

In `gatsby-node.ts`, inside `createPages`, after the article pages loop (after line 397 `reporter.info(...)`), add:

```typescript
  // Create brewing recipe pages
  const brewingTemplate = path.resolve('./src/templates/brewing-recipe.tsx');
  
  const brewingResult = await graphql<{
    allMarkdownRemark: {
      nodes: Array<{
        id: string;
        frontmatter: {
          slug: string;
          title: string;
          publishedAt: string;
        };
      }>;
    };
  }>(`
    query BrewingQuery {
      allMarkdownRemark(
        filter: {
          fileAbsolutePath: { regex: "/content/brewing/" }
          frontmatter: { slug: { ne: null }, draft: { ne: true } }
        }
        sort: { frontmatter: { publishedAt: DESC } }
      ) {
        nodes {
          id
          frontmatter {
            slug
            title
            publishedAt
          }
        }
      }
    }
  `);

  if (brewingResult.errors) {
    reporter.panicOnBuild('Error loading brewing recipes', brewingResult.errors);
  }

  const brewingRecipes = brewingResult.data?.allMarkdownRemark.nodes || [];
  
  brewingRecipes.forEach((recipe) => {
    createPage({
      path: `/brewing/${recipe.frontmatter.slug}`,
      component: brewingTemplate,
      context: {
        slug: recipe.frontmatter.slug,
      },
    });
  });

  reporter.info(`Created ${brewingRecipes.length} brewing recipe pages`);

  // Create brewing category listing page
  const brewingListingTemplate = path.resolve('./src/templates/brewing-index.tsx');
  
  const recipesPerPage = 12;
  const numBrewingPages = Math.ceil(brewingRecipes.length / recipesPerPage);
  
  Array.from({ length: numBrewingPages || 1 }).forEach((_, i) => {
    createPage({
      path: i === 0 ? '/brewing' : `/brewing/${i + 1}`,
      component: brewingListingTemplate,
      context: {
        limit: recipesPerPage,
        skip: i * recipesPerPage,
        numPages: numBrewingPages || 1,
        currentPage: i + 1,
      },
    });
  });
```

**Step 2: Verify build runs without errors**

Run: `npx gatsby develop`
Expected: No errors. Console shows "Created 0 brewing recipe pages" (no content yet).

**Step 3: Commit**

```bash
git add gatsby-node.ts
git commit -m "feat: add brewing page creation in gatsby-node"
```

---


### Task 5: Create the Fermentation Progress Component

**Objective:** Build a `FermentationProgress` component that shows a visual progress meter tracking the brew through 4 stages: Primary, Secondary, Conditioning, Drinking Ready. Each stage shows duration in days. Overall total shown at end.

**Files:**
- Create: `src/components/FermentationProgress.tsx`
- Create: `src/styles/fermentation-progress.css`

**Step 1: Create the CSS file**

Create `src/styles/fermentation-progress.css`:

```css
/* Fermentation Progress Meter */
.fermentation-progress {
  background: var(--hm-card-bg, #1a1a2e);
  border: 1px solid var(--hm-border, #333);
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 2rem;
}

.fermentation-progress-title {
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--hm-text-muted, #888);
  margin: 0 0 1rem 0;
}

.fermentation-progress-track {
  display: flex;
  align-items: stretch;
  gap: 0;
  margin-bottom: 1rem;
  position: relative;
}

.fermentation-progress-stage {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  padding-top: 1.5rem;
}

.fermentation-progress-stage::before {
  content: '';
  position: absolute;
  top: 0;
  left: 50%;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: var(--hm-border, #444);
  border: 2px solid var(--hm-bg, #222);
  transform: translateX(-50%);
  z-index: 1;
}

.fermentation-progress-stage.completed::before {
  background: var(--hm-accent, #48b490);
  border-color: var(--hm-accent, #48b490);
}

.fermentation-progress-stage.active::before {
  background: var(--hm-accent, #48b490);
  border-color: var(--hm-accent, #48b490);
  box-shadow: 0 0 0 4px rgba(72, 180, 144, 0.25);
}

/* Connector line between stages */
.fermentation-progress-stage::after {
  content: '';
  position: absolute;
  top: 6px;
  left: 50%;
  width: 100%;
  height: 2px;
  background: var(--hm-border, #444);
  z-index: 0;
}

.fermentation-progress-stage:last-child::after {
  display: none;
}

.fermentation-progress-stage.completed::after {
  background: var(--hm-accent, #48b490);
}

.fermentation-progress-stage-label {
  font-size: 0.8rem;
  font-weight: 600;
  margin-top: 0.5rem;
  text-align: center;
  white-space: nowrap;
}

.fermentation-progress-stage-days {
  font-size: 0.75rem;
  color: var(--hm-text-muted, #888);
  margin-top: 0.25rem;
  text-align: center;
}

.fermentation-progress-stage.completed .fermentation-progress-stage-label,
.fermentation-progress-stage.active .fermentation-progress-stage-label {
  color: var(--hm-accent, #48b490);
}

.fermentation-progress-total {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  font-size: 0.85rem;
  color: var(--hm-text-muted, #888);
  border-top: 1px solid var(--hm-border, #333);
  padding-top: 0.75rem;
  margin-top: 0.5rem;
}

.fermentation-progress-total-value {
  font-weight: 700;
  color: var(--hm-text, #fff);
}

/* Responsive */
@media (max-width: 768px) {
  .fermentation-progress-stage-label {
    font-size: 0.7rem;
  }

  .fermentation-progress-stage-days {
    font-size: 0.65rem;
  }

  .fermentation-progress {
    padding: 1rem;
  }
}
```

**Step 2: Create the component**

Create `src/components/FermentationProgress.tsx`:

```tsx
import React from 'react';
import '../styles/fermentation-progress.css';

interface BrewData {
  startDate?: string;
  primaryEndDate?: string;
  secondaryStartDate?: string;
  bottlingDate?: string;
  drinkingReadyDate?: string;
}

interface FermentationProgressProps {
  brewData: BrewData;
}

function daysBetween(start?: string, end?: string): number | null {
  if (!start || !end) return null;
  const ms = new Date(end).getTime() - new Date(start).getTime();
  if (isNaN(ms) || ms < 0) return null;
  return Math.round(ms / (1000 * 60 * 60 * 24));
}

interface Stage {
  label: string;
  days: number | null;
  completed: boolean;
  active: boolean;
}

const FermentationProgress: React.FC<FermentationProgressProps> = ({ brewData }) => {
  const now = new Date().toISOString().split('T')[0];

  // Stage durations
  const primaryDays = daysBetween(brewData.startDate, brewData.primaryEndDate);
  const secondaryDays = daysBetween(brewData.secondaryStartDate, brewData.bottlingDate);
  const conditioningDays = daysBetween(brewData.bottlingDate, brewData.drinkingReadyDate);
  const totalDays = daysBetween(brewData.startDate, brewData.drinkingReadyDate);

  // Determine completion state
  const stages: Stage[] = [
    {
      label: 'Primary',
      days: primaryDays,
      completed: !!brewData.primaryEndDate && !!brewData.startDate,
      active: !brewData.primaryEndDate && !!brewData.startDate,
    },
    {
      label: 'Secondary',
      days: secondaryDays,
      completed: !!brewData.bottlingDate && !!brewData.secondaryStartDate,
      active: !brewData.bottlingDate && !!brewData.secondaryStartDate,
    },
    {
      label: 'Conditioning',
      days: conditioningDays,
      completed: !!brewData.drinkingReadyDate && !!brewData.bottlingDate,
      active: !brewData.drinkingReadyDate && !!brewData.bottlingDate,
    },
    {
      label: 'Drinking Ready',
      days: null,
      completed: !!brewData.drinkingReadyDate,
      active: !brewData.drinkingReadyDate && !!brewData.bottlingDate,
    },
  ];

  return (
    <div className="fermentation-progress">
      <p className="fermentation-progress-title">Fermentation Progress</p>
      <div className="fermentation-progress-track">
        {stages.map((stage, index) => (
          <div
            key={index}
            className={`fermentation-progress-stage${stage.completed ? ' completed' : ''}${stage.active ? ' active' : ''}`}
          >
            <span className="fermentation-progress-stage-label">{stage.label}</span>
            {stage.days !== null && (
              <span className="fermentation-progress-stage-days">{stage.days} days</span>
            )}
          </div>
        ))}
      </div>
      {totalDays !== null && (
        <div className="fermentation-progress-total">
          <span>Total:</span>
          <span className="fermentation-progress-total-value">{totalDays} days</span>
        </div>
      )}
    </div>
  );
};

export default FermentationProgress;
```

**Step 3: Verify build compiles**

Run: `npx gatsby develop`
Expected: No TypeScript or build errors.

**Step 4: Commit**

```bash
git add src/components/FermentationProgress.tsx src/styles/fermentation-progress.css
git commit -m "feat: add FermentationProgress component with 4-stage progress meter"
```

---

### Task 6: Create the Recipe Template Component

**Objective:** Build the `brewing-recipe.tsx` template that renders a recipe card layout with brewing data, ingredients, and step-by-step instructions with images.

**Files:**
- Create: `src/templates/brewing-recipe.tsx`
- Create: `src/styles/brewing-recipe.css`

**Step 1: Create the CSS file**

Create `src/styles/brewing-recipe.css`:

```css
/* Brewing Recipe Template */
.brewing-recipe {
  max-width: 900px;
  margin: 0 auto;
  padding: 2rem 1rem;
}

.brewing-recipe-header {
  margin-bottom: 2rem;
  text-align: center;
}

.brewing-recipe-header h1 {
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
}

.brewing-recipe-header .recipe-rating {
  margin-top: 0.5rem;
  display: flex;
  justify-content: center;
}

.brewing-recipe-header .recipe-meta {
  color: var(--hm-text-muted, #888);
  font-size: 0.9rem;
}

.brewing-recipe-featured-image {
  width: 100%;
  border-radius: 12px;
  margin-bottom: 2rem;
  overflow: hidden;
}

.brewing-recipe-featured-image img {
  width: 100%;
  height: auto;
  display: block;
}

/* Brew Data Card */
.brew-data-card {
  background: var(--hm-card-bg, #1a1a2e);
  border: 1px solid var(--hm-border, #333);
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 2rem;
}

.brew-data-card h2 {
  margin-top: 0;
  margin-bottom: 1rem;
  font-size: 1.3rem;
  border-bottom: 1px solid var(--hm-border, #333);
  padding-bottom: 0.5rem;
}

.brew-data-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 1rem;
}

.brew-data-item {
  display: flex;
  flex-direction: column;
}

.brew-data-label {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--hm-text-muted, #888);
  margin-bottom: 0.25rem;
}

.brew-data-value {
  font-size: 1.1rem;
  font-weight: 600;
}

/* Ingredients Section */
.recipe-ingredients {
  margin-bottom: 2rem;
}

.recipe-ingredients h2 {
  font-size: 1.5rem;
  margin-bottom: 1rem;
}

.recipe-ingredients ul {
  list-style: none;
  padding: 0;
}

.recipe-ingredients li {
  padding: 0.5rem 0;
  border-bottom: 1px solid var(--hm-border, #333);
  font-size: 1.05rem;
}

/* Recipe Steps */
.recipe-steps {
  margin-bottom: 2rem;
}

.recipe-steps h2 {
  font-size: 1.5rem;
  margin-bottom: 1.5rem;
}

.recipe-step {
  display: flex;
  gap: 1.5rem;
  margin-bottom: 2rem;
  align-items: flex-start;
}

.recipe-step-number {
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--hm-accent, #48b490);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 1.2rem;
}

.recipe-step-content {
  flex: 1;
}

.recipe-step-content h3 {
  margin: 0 0 0.5rem 0;
  font-size: 1.2rem;
}

.recipe-step-content p {
  margin: 0 0 0.75rem 0;
  line-height: 1.6;
}

.recipe-step-image {
  width: 100%;
  border-radius: 8px;
  overflow: hidden;
}

.recipe-step-image img {
  width: 100%;
  height: auto;
  display: block;
}

/* Dark mode adjustments */
.hm-dark .brew-data-card {
  background: #1a1a2e;
  border-color: #333;
}

.hm-dark .brew-data-label {
  color: #888;
}

/* Responsive */
@media (max-width: 768px) {
  .brewing-recipe {
    padding: 1rem 0.75rem;
  }

  .brewing-recipe-header h1 {
    font-size: 1.8rem;
  }

  .brew-data-grid {
    grid-template-columns: 1fr 1fr;
  }

  .recipe-step {
    flex-direction: column;
    gap: 0.75rem;
  }

  .recipe-step-number {
    width: 32px;
    height: 32px;
    font-size: 1rem;
  }
}
```

**Step 2: Create the template component**

Create `src/templates/brewing-recipe.tsx`:

```tsx
import React from 'react';
import { graphql, PageProps, HeadFC } from 'gatsby';
import Layout from '../components/Layout';
import SEO from '../components/SEO';
import OptimizedImage from '../components/OptimizedImage';
import StarRating from '../components/StarRating';
import FermentationProgress from '../components/FermentationProgress';
import { formatDate } from '../utils/dateUtils';
import '../styles/brewing-recipe.css';

interface BrewData {
  originalGravity?: number;
  finalGravity?: number;
  specificGravity?: number;
  startDate?: string;
  primaryEndDate?: string;
  secondaryStartDate?: string;
  bottlingDate?: string;
  drinkingReadyDate?: string;
  abv?: number;
  batchSize?: string;
  yeast?: string;
  fermentationTime?: string;
}

interface RecipeStep {
  title: string;
  description: string;
  image?: string;
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

const BrewingRecipeTemplate: React.FC<PageProps<RecipeData>> = ({ data }) => {
  const recipe = data.markdownRemark;
  const { frontmatter, html } = recipe;

  const brewData = frontmatter.brewData;
  const ingredients = frontmatter.ingredients || [];
  const steps = frontmatter.steps || [];

  const brewDataItems: Array<{ label: string; value?: string | number }> = [
    { label: 'Original Gravity', value: brewData?.originalGravity },
    { label: 'Final Gravity', value: brewData?.finalGravity },
    { label: 'Specific Gravity', value: brewData?.specificGravity },
    { label: 'ABV', value: brewData?.abv ? `${brewData.abv}%` : undefined },
    { label: 'Batch Size', value: brewData?.batchSize },
    { label: 'Yeast', value: brewData?.yeast },
    { label: 'Fermentation Time', value: brewData?.fermentationTime },
    { label: 'Start Date', value: brewData?.startDate ? formatDate(brewData.startDate) : undefined },
    { label: 'Primary End', value: brewData?.primaryEndDate ? formatDate(brewData.primaryEndDate) : undefined },
    { label: 'Secondary Start', value: brewData?.secondaryStartDate ? formatDate(brewData.secondaryStartDate) : undefined },
    { label: 'Bottling Date', value: brewData?.bottlingDate ? formatDate(brewData.bottlingDate) : undefined },
    { label: 'Drinking Ready', value: brewData?.drinkingReadyDate ? formatDate(brewData.drinkingReadyDate) : undefined },
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
          </div>
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
              width={1200}
            />
          </div>
        )}

        {/* Fermentation Progress Meter — after image, before recipe content */}
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
              <div key={index} className="recipe-step">
                <div className="recipe-step-number">{index + 1}</div>
                <div className="recipe-step-content">
                  <h3>{step.title}</h3>
                  <p>{step.description}</p>
                  {step.image && (
                    <div className="recipe-step-image">
                      <OptimizedImage
                        src={step.image}
                        alt={step.title}
                        width={800}
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
      </article>
    </Layout>
  );
};

export default BrewingRecipeTemplate;

export const Head: HeadFC<RecipeData> = ({ data }) => (
  <SEO
    title={data.markdownRemark.frontmatter.title}
    description={data.markdownRemark.frontmatter.excerpt}
    image={data.markdownRemark.frontmatter.featuredImage}
  />
);

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
        brewData {
          originalGravity
          finalGravity
          specificGravity
          startDate
          primaryEndDate
          secondaryStartDate
          bottlingDate
          drinkingReadyDate
          abv
          batchSize
          yeast
          fermentationTime
        }
        ingredients
        steps {
          title
          description
          image
        }
      }
    }
  }
`;
```

**Step 3: Verify build compiles**

Run: `npx gatsby develop`
Expected: No TypeScript or build errors. (No content yet, so no pages to navigate to.)

**Step 4: Commit**

```bash
git add src/templates/brewing-recipe.tsx src/styles/brewing-recipe.css
git commit -m "feat: create brewing recipe template with brew data card"
```

---

### Task 7: Create the Category Listing Template

**Objective:** Build the `brewing-index.tsx` template that lists all recipes in a paginated grid.

**Files:**
- Create: `src/templates/brewing-index.tsx`
- Create: `src/styles/brewing-index.css`

**Step 1: Create the CSS file**

Create `src/styles/brewing-index.css`:

```css
/* Brewing Category Listing */
.brewing-index {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1rem;
}

.brewing-index-header {
  text-align: center;
  margin-bottom: 2.5rem;
}

.brewing-index-header h1 {
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
}

.brewing-index-header p {
  color: var(--hm-text-muted, #888);
  font-size: 1.1rem;
  max-width: 600px;
  margin: 0 auto;
}

.brewing-recipe-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.brewing-recipe-card {
  border: 1px solid var(--hm-border, #333);
  border-radius: 12px;
  overflow: hidden;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  text-decoration: none;
  color: inherit;
  display: block;
}

.brewing-recipe-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.brewing-recipe-card-image {
  width: 100%;
  height: 200px;
  overflow: hidden;
}

.brewing-recipe-card-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.brewing-recipe-card-body {
  padding: 1rem 1.25rem;
}

.brewing-recipe-card-body h2 {
  font-size: 1.2rem;
  margin: 0 0 0.5rem 0;
}

.brewing-recipe-card-body p {
  font-size: 0.9rem;
  color: var(--hm-text-muted, #888);
  margin: 0;
  line-height: 1.5;
}

.recipe-card-rating {
  display: inline-flex;
  align-items: center;
}

.brewing-recipe-card-meta {
  display: flex;
  gap: 1rem;
  margin-top: 0.75rem;
  font-size: 0.8rem;
  color: var(--hm-text-muted, #888);
}

/* Empty state */
.brewing-empty {
  text-align: center;
  padding: 4rem 1rem;
  color: var(--hm-text-muted, #888);
}

/* Pagination */
.brewing-pagination {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 2.5rem;
}

.brewing-pagination a,
.brewing-pagination span {
  padding: 0.5rem 0.75rem;
  border: 1px solid var(--hm-border, #333);
  border-radius: 6px;
  text-decoration: none;
  color: inherit;
}

.brewing-pagination a:hover {
  background: var(--hm-card-bg, #1a1a2e);
}

.brewing-pagination .active {
  background: var(--hm-accent, #48b490);
  color: white;
  border-color: var(--hm-accent, #48b490);
}

/* Responsive */
@media (max-width: 768px) {
  .brewing-recipe-grid {
    grid-template-columns: 1fr;
  }

  .brewing-index-header h1 {
    font-size: 1.8rem;
  }
}
```

**Step 2: Create the listing template**

Create `src/templates/brewing-index.tsx`:

```tsx
import React from 'react';
import { graphql, Link, PageProps, HeadFC } from 'gatsby';
import Layout from '../components/Layout';
import SEO from '../components/SEO';
import OptimizedImage from '../components/OptimizedImage';
import StarRating from '../components/StarRating';
import FermentationProgress from '../components/FermentationProgress';
import { formatDate } from '../utils/dateUtils';
import '../styles/brewing-recipe.css';

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
                      width={400}
                      height={200}
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

        {/* Pagination */}
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
```

**Step 3: Verify build**

Run: `npx gatsby develop`
Navigate to `http://localhost:8000/brewing`
Expected: Page loads with empty state "No recipes yet. Check back soon!"

**Step 4: Commit**

```bash
git add src/templates/brewing-index.tsx src/styles/brewing-index.css
git commit -m "feat: create brewing category listing template"
```

---

### Task 8: Create Sample Recipe Content

**Objective:** Create a sample brewing recipe to verify the full pipeline works end-to-end.

**Files:**
- Create: `content/brewing/traditional-brew.md`
- Create: `static/images/content/brewing/traditional-brew/featured.jpg` (placeholder)

**Step 1: Create image directory**

```bash
mkdir -p static/images/content/brewing/traditional-brew
```

Add a placeholder `featured.jpg` image (can be any image for testing).

**Step 2: Create the recipe markdown file**

Create `content/brewing/traditional-brew.md` with the frontmatter schema from the "Frontmatter Schema" section above. Use the full example with brewData, ingredients, and steps.

**Step 3: Verify end-to-end**

Run: `npx gatsby develop`
Navigate to `http://localhost:8000/brewing`
Expected: Recipe card appears in grid with title, excerpt, date, ABV.

Click the recipe card.
Expected: Recipe page loads with:
- Title and date
- Featured image
- Brew data card with all gravity readings and dates
- Ingredients list
- Numbered step cards with images
- Step descriptions

Navigate to `http://localhost:8000/`
Expected: Recipe does NOT appear on homepage (featured slider, article grid, or sidebar).

**Step 4: Commit**

```bash
git add content/brewing/traditional-brew.md static/images/content/brewing/
git commit -m "content: add sample traditional brewing recipe"
```

---

### Task 9: Add Sitemap Priority for Brewing Pages

**Objective:** Update the sitemap serializer to handle `/brewing/` paths with appropriate priority.

**Files:**
- Modify: `gatsby-config.ts` (lines 226-250, sitemap `serialize` function)

**Step 1: Add brewing path handling**

In the `serialize` function, add after the `/tag/` check:

```typescript
          } else if (path.startsWith('/brewing/')) {
            priority = 0.6;
            changefreq = 'monthly';
```

So the full chain becomes:
```typescript
          if (path === '/') {
            priority = 1.0;
            changefreq = 'daily';
          } else if (path.startsWith('/posts/') || path.startsWith('/series/')) {
            priority = 0.8;
            changefreq = 'monthly';
          } else if (path.startsWith('/brewing/')) {
            priority = 0.6;
            changefreq = 'monthly';
          } else if (path.startsWith('/tag/')) {
            priority = 0.7;
            changefreq = 'weekly';
          } else {
            priority = 0.5;
            changefreq = 'yearly';
          }
```

**Step 2: Verify build**

Run: `npx gatsby develop`
Expected: No errors. Sitemap generation includes brewing pages.

**Step 3: Commit**

```bash
git add gatsby-config.ts
git commit -m "feat: add sitemap priority for brewing pages"
```

---

### Task 10: Exclude Recipes from Search Index

**Objective:** Ensure brewing recipes do NOT appear in the site search index. The user must navigate to the category manually.

**Files:**
- Verify: `gatsby-config.ts` (lines 118-136, local search query)

**Step 1: Verify exclusion**

The existing search query in `gatsby-plugin-local-search` filters:
```
fileAbsolutePath: { regex: "//content/(posts|reviews)/" }
```

Since brewing recipes live in `content/brewing/`, they are automatically excluded from the search index. No change needed.

**Step 2: Verify search exclusion**

Run: `npx gatsby develop`
Use the search overlay (search icon in header).
Search for "brewing" or "traditional brew".
Expected: No results. Recipes are not in the search index.

**Step 3: No commit needed (no files changed)**

Document this as a verified exclusion. If search inclusion is desired later, update the regex to `//content/(posts|reviews|brewing)/`.

---

### Task 11: Verify Homepage Exclusion

**Objective:** Confirm brewing recipes do NOT appear on the homepage, recent articles, or sidebar.

**Files:**
- Verify: `src/pages/index.tsx` (line 214, homepage query filter)
- Verify: `src/components/RecentArticles.tsx` (if it has its own query)
- Verify: `src/components/Sidebar.tsx` (if it has its own query)

**Step 1: Verify homepage query filter**

The homepage query in `index.tsx` line 214 filters:
```
fileAbsolutePath: { regex: "//content/(posts|reviews)/" }
```

Since recipes live in `content/brewing/`, they are automatically excluded.

**Step 2: Check RecentArticles and Sidebar components**

```bash
grep -n "fileAbsolutePath" src/components/RecentArticles.tsx src/components/Sidebar.tsx
```

If any component queries without the `fileAbsolutePath` regex filter, add the filter to exclude `content/brewing/`.

**Step 3: Verify end-to-end**

Run: `npx gatsby develop`
Navigate to `http://localhost:8000/`
Expected: No brewing recipes in featured slider, article grid, or sidebar.
Navigate to `http://localhost:8000/brewing`
Expected: Recipe appears here.

**Step 4: Commit (only if changes were needed)**

```bash
git add src/components/RecentArticles.tsx src/components/Sidebar.tsx
git commit -m "fix: exclude brewing recipes from homepage and sidebar queries"
```

---

## Summary

| Task | Description | Files |
|------|-------------|-------|
| 1 | Content directory + source plugin | `content/brewing/`, `gatsby-config.ts` |
| 2 | Schema types for frontmatter | `gatsby-node.ts` |
| 3 | Header nav link | `gatsby-config.ts` |
| 4 | Page creation logic | `gatsby-node.ts` |
| 5 | Fermentation progress component | `src/components/FermentationProgress.tsx`, `src/styles/fermentation-progress.css` |
| 6 | Recipe template | `src/templates/brewing-recipe.tsx`, `src/styles/brewing-recipe.css` |
| 7 | Category listing template | `src/templates/brewing-index.tsx`, `src/styles/brewing-index.css` |
| 8 | Sample recipe content | `content/brewing/traditional-brew.md` |
| 9 | Sitemap priority | `gatsby-config.ts` |
| 10 | Search exclusion (verify) | None (auto-excluded) |
| 11 | Homepage exclusion (verify) | Verify only |

## Exclusion Strategy Recap

Recipes are excluded from:
- **Homepage** (featured slider + article grid) — auto-excluded by `fileAbsolutePath` regex filter
- **Search index** — auto-excluded by `fileAbsolutePath` regex filter
- **Tag pages** — auto-excluded (tag page creation only queries `content/(posts|reviews)`)
- **Recent articles** — auto-excluded if component uses same regex filter (verify in Task 10)
- **Sidebar** — auto-excluded if component uses same regex filter (verify in Task 10)

Recipes are accessible from:
- **Header nav** — "Brewing" link to `/brewing`
- **Category listing page** — `/brewing` paginated grid
- **Direct URL** — `/brewing/{slug}`
- **Sitemap** — included with priority 0.6

## Notes for Lyra

- All CSS uses CSS custom properties (`var(--hm-*)`) that match the existing site theme. Check `src/styles/` for the actual variable names used and adjust if they differ.
- The `OptimizedImage` component is used for all images. Check its props signature in `src/components/OptimizedImage.tsx` before assuming the `width`/`height` API.
- The `formatDate` utility is in `src/utils/dateUtils.ts`. Verify its signature.
- The `SEO` component is in `src/components/SEO.tsx`. Verify it accepts `image` prop.
- The `Layout` component is in `src/components/Layout.tsx`. It wraps pages with Header + Footer.
- All new CSS files must be imported in the template component (not in `gatsby-browser.ts`).
- Gatsby build command: `npx gatsby build` (production), `npx gatsby develop` (dev).
- Test the full build before pushing: `npx gatsby build && npx gatsby serve` then check `/brewing` and a recipe page.