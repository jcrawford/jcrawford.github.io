# Data Model: Gatsby Magazine Website

**Feature**: 001-gatsby-site  
**Date**: 2025-11-05  
**Status**: Complete

## Overview

This document defines the data structures for the magazine website content. All data is stored as JSON files and queried through Gatsby's GraphQL layer.

## Entities

### Article

Represents a blog post/article with full content and metadata.

**Storage**: `src/data/articles/{slug}.json`

**Fields**:

| Field | Type | Required | Description | Validation |
|-------|------|----------|-------------|------------|
| `id` | string | Yes | Unique identifier | UUID or sequential |
| `slug` | string | Yes | URL-friendly identifier | lowercase, hyphens, no spaces |
| `title` | string | Yes | Article title | 1-200 characters |
| `excerpt` | string | Yes | Brief summary | 100-300 characters |
| `content` | string | Yes | Full article body (HTML) | 100-800 words (varied lengths) |
| `featuredImage` | string | Yes | Path to image | Relative to `/static/images/` |
| `category` | string | Yes | Category slug | One of: fashion, lifestyle, food, travel, sports |
| `tags` | string[] | Yes | Content tags | Min 1 tag, include "featured" for slider |
| `author` | string | Yes | Author slug | Fixed value: "admin" |
| `publishedAt` | string | Yes | Publication date | ISO 8601 format (YYYY-MM-DD) |
| `updatedAt` | string | No | Last update date | ISO 8601 format |

**Example**:

```json
{
  "id": "001",
  "slug": "the-journey-not-the-arrival-matters",
  "title": "The journey, not the arrival, matters",
  "excerpt": "Travel is not just about reaching your destination, but embracing every moment of the adventure along the way.",
  "content": "<p>Travel teaches us that the experiences we gather along the way shape us more than any destination ever could.</p><p>Every detour, every unexpected encounter, every challenge overcome becomes part of our story...</p>",
  "featuredImage": "/images/travel-journey-beach.jpg",
  "category": "travel",
  "tags": ["featured", "travel", "inspiration"],
  "author": "admin",
  "publishedAt": "2025-01-15",
  "updatedAt": "2025-01-15"
}
```

**Relationships**:
- Many-to-One with Category
- Many-to-One with Author
- Many-to-Many with Tags

**State/Lifecycle**: Static (no workflow states, all articles are published)

---

### Category

Represents a content category for organizing articles.

**Storage**: `src/data/categories.json` (single file, array of categories)

**Fields**:

| Field | Type | Required | Description | Validation |
|-------|------|----------|-------------|------------|
| `id` | string | Yes | Unique identifier | Sequential |
| `slug` | string | Yes | URL-friendly identifier | One of: fashion, lifestyle, food, travel, sports |
| `name` | string | Yes | Display name | Capitalized |
| `description` | string | Yes | Category description | 50-200 characters |

**Example**:

```json
{
  "id": "1",
  "slug": "travel",
  "name": "Travel",
  "description": "Explore the world through our travel stories, tips, and destination guides."
}
```

**Fixed Categories** (per spec clarification):
1. Fashion
2. Lifestyle
3. Food
4. Travel
5. Sports

**Relationships**:
- One-to-Many with Articles

---

### Author

Represents a content author (single author per spec clarification).

**Storage**: `src/data/authors.json` (single file, array with one author)

**Fields**:

| Field | Type | Required | Description | Validation |
|-------|------|----------|-------------|------------|
| `id` | string | Yes | Unique identifier | Fixed: "1" |
| `slug` | string | Yes | URL-friendly identifier | Fixed: "admin" |
| `name` | string | Yes | Display name | Full name |
| `bio` | string | Yes | Author biography | 100-300 characters |
| `avatar` | string | Yes | Path to avatar image | Relative to `/static/images/` |
| `socialLinks` | object | No | Social media links | Facebook, Twitter, Instagram URLs |

**Example**:

```json
{
  "id": "1",
  "slug": "admin",
  "name": "Alex Thompson",
  "bio": "Magazine editor and lifestyle writer passionate about fashion, food, and travel. Sharing stories that inspire and inform.",
  "avatar": "/images/avatar-admin.jpg",
  "socialLinks": {
    "facebook": "https://www.facebook.com/wordpress",
    "twitter": "https://twitter.com/wordpress",
    "instagram": "https://instagram.com"
  }
}
```

**Relationships**:
- One-to-Many with Articles

---

### Tag

Represents keywords/topics for articles.

**Storage**: Derived from article data (no separate file needed)

**Fields**:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | Yes | Tag name |
| `slug` | string | Yes | URL-friendly version |

**Special Tags**:
- `featured`: Indicates article should appear in homepage slider (exactly 3 articles)
- `slide`: Alternative featured indicator (from design)

**Relationships**:
- Many-to-Many with Articles

---

### SiteMetadata

Global site configuration.

**Storage**: `gatsby-config.ts` (siteMetadata object)

**Fields**:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `title` | string | Yes | Site title: "HybridMag" |
| `description` | string | Yes | Site description for SEO |
| `siteUrl` | string | Yes | Base URL for deployment |
| `socialLinks` | object | Yes | Social media URLs |
| `navigation` | array | Yes | Main menu items |

**Example**:

```typescript
// gatsby-config.ts
export default {
  siteMetadata: {
    title: 'HybridMag',
    description: 'A modern magazine featuring articles on fashion, lifestyle, food, travel, and sports.',
    siteUrl: 'https://yourusername.github.io/site',
    socialLinks: {
      facebook: 'https://www.facebook.com/wordpress',
      twitter: 'https://twitter.com/wordpress',
      instagram: 'https://instagram.com'
    },
    navigation: [
      { name: 'Home', path: '/' },
      { name: 'Fashion', path: '/category/fashion' },
      { name: 'Lifestyle', path: '/category/lifestyle' },
      { name: 'Food', path: '/category/food' },
      { name: 'Travel', path: '/category/travel' },
      { name: 'Sports', path: '/category/sports' }
    ]
  }
}
```

---

## Data Generation Requirements

Based on spec clarifications:

### Article Distribution

- **Total Articles**: 20
- **Per Category**: 4 articles each (Fashion: 4, Lifestyle: 4, Food: 4, Travel: 4, Sports: 4)
- **Featured Articles**: 3 articles tagged with "featured" for homepage slider
- **Content Lengths**:
  - Short: ~6-7 articles (100-200 words)
  - Medium: ~6-7 articles (300-500 words)
  - Long: ~6-7 articles (500-800 words)

### File Organization

```text
src/data/
├── articles/
│   ├── 001-journey-not-arrival-matters.json
│   ├── 002-elegance-not-standing-out.json
│   ├── 003-fashion-fades-style-remains.json
│   ├── 004-food-is-our-love-language.json
│   ├── 005-life-begins-after-coffee.json
│   ├── 006-first-wealth-is-health.json
│   ├── ... (20 files total)
│   └── 020-wherever-you-go-with-heart.json
├── categories.json
└── authors.json
```

---

## Data Validation Rules

### Article Validation

1. **Slug uniqueness**: No two articles can have the same slug
2. **Category validity**: Must be one of the 5 defined categories
3. **Featured tag limit**: Exactly 3 articles must have "featured" tag
4. **Content length**: Must meet word count requirements (varied)
5. **Image paths**: Featured images must exist in `static/images/`
6. **Date format**: Must be valid ISO 8601 date

### Category Validation

1. **Slug uniqueness**: No duplicate category slugs
2. **Fixed set**: Must be exactly 5 categories as defined
3. **Name capitalization**: Category names must be properly capitalized

### Author Validation

1. **Single author**: Must be exactly one author with slug "admin"
2. **Avatar exists**: Avatar image must exist in `static/images/`

---

## GraphQL Query Patterns

### Common Queries

**All Articles**:
```graphql
query AllArticles {
  allArticlesJson {
    nodes {
      id
      slug
      title
      excerpt
      featuredImage
      category
      tags
      author
      publishedAt
    }
  }
}
```

**Featured Articles** (homepage slider):
```graphql
query FeaturedArticles {
  allArticlesJson(filter: { tags: { in: ["featured"] } }, limit: 3) {
    nodes {
      id
      slug
      title
      featuredImage
      category
      publishedAt
    }
  }
}
```

**Articles by Category**:
```graphql
query ArticlesByCategory($category: String!) {
  allArticlesJson(filter: { category: { eq: $category } }) {
    nodes {
      id
      slug
      title
      excerpt
      featuredImage
      tags
      author
      publishedAt
    }
  }
}
```

**Single Article**:
```graphql
query Article($slug: String!) {
  articlesJson(slug: { eq: $slug }) {
    id
    slug
    title
    excerpt
    content
    featuredImage
    category
    tags
    author
    publishedAt
    updatedAt
  }
}
```

---

## Next Steps

With data model defined:
1. Create GraphQL schema contracts
2. Generate TypeScript types from GraphQL schema
3. Implement data generation script
4. Create quickstart guide

