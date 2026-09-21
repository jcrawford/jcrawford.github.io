# Data Model: HybridMag Gatsby Site

**Feature**: 001-gatsby-theme-setup  
**Date**: November 5, 2025  
**Purpose**: Define all data entities, their properties, relationships, and sources

## Overview

This document defines the data model for the HybridMag Gatsby site. The model is derived from WordPress theme structures but adapted for static site generation with Markdown/MDX content sources.

---

## Entity Relationship Diagram

```
┌─────────────────┐
│   SiteConfig    │
│  (singleton)    │
└─────────────────┘
        │
        │ references
        │
        ├───────────────┬─────────────────┬────────────────┐
        │               │                 │                │
        ▼               ▼                 ▼                ▼
┌──────────────┐  ┌────────────────┐  ┌──────────┐  ┌─────────────┐
│ NavigationItem│  │  SocialLinks   │  │  Author  │  │WidgetConfig │
└──────────────┘  └────────────────┘  └──────────┘  └─────────────┘
        │                                    │               │
        │ parent/children                    │               │ references
        ▼                                    │               │
┌──────────────┐                             │               │
│ NavigationItem│                             │               │
│  (recursive)  │                             │               │
└──────────────┘                             │               │
                                             │               │
        ┌────────────────────────────────────┘               │
        │                                                    │
        ▼                                                    ▼
┌─────────────────┐                              ┌────────────────────┐
│    Article      │                              │    WidgetArea      │
│  (.md/.mdx)     │                              │ (sidebar position) │
└─────────────────┘                              └────────────────────┘
        │
        │ belongs to
        │
        ▼
┌─────────────────┐
│    Category     │
└─────────────────┘
        │
        │ has many
        │
        ▼
┌─────────────────┐
│    Article      │
└─────────────────┘
```

---

## Core Entities

### 1. Article

Represents a blog post or article. Sourced from Markdown (.md) or MDX (.mdx) files in `content/posts/` directory.

**Source**: Markdown/MDX files with YAML frontmatter  
**GraphQL Type**: `Mdx` or `MarkdownRemark`

#### Properties

| Property | Type | Required | Description | Default |
|----------|------|----------|-------------|---------|
| `slug` | `string` | Yes | URL-safe identifier (e.g., "my-first-post") | Generated from filename |
| `title` | `string` | Yes | Article headline | - |
| `date` | `string` (ISO 8601) | Yes | Publish date (YYYY-MM-DD) | - |
| `author` | `Author` | Yes | Author information | Default author from siteConfig |
| `category` | `Category` | Yes | Primary category | "Uncategorized" |
| `tags` | `string[]` | No | Tag list for filtering | `[]` |
| `excerpt` | `string` | Yes | Short description (150-200 chars) | First 200 chars of content |
| `featuredImage` | `ImageSharp` | No | Hero image | Default placeholder |
| `content` | `string` (HTML) | Yes | Article body (compiled from Markdown/MDX) | - |
| `readingTime` | `number` | No | Estimated minutes to read | Calculated from word count |
| `featured` | `boolean` | No | Display in featured slider | `false` |
| `pinned` | `boolean` | No | Pin to top of category | `false` |

#### Frontmatter Example

```yaml
---
slug: "gatsby-wordpress-theme-conversion"
title: "Converting WordPress Themes to Gatsby: A Complete Guide"
date: "2024-01-15"
author:
  name: "Joseph Crawford"
  bio: "Full-stack developer specializing in React and TypeScript"
  avatar: "./authors/joseph.jpg"
  social:
    twitter: "@josephcrawford"
    github: "josephcrawford"
category:
  name: "Web Development"
  slug: "web-development"
  color: "#65bc7b"
tags: ["gatsby", "wordpress", "react", "typescript"]
excerpt: "Learn how to convert a WordPress theme to a modern Gatsby static site with full TypeScript support."
featuredImage: "./images/gatsby-wordpress.jpg"
featured: true
pinned: false
---
```

#### GraphQL Query Example

```graphql
query ArticleQuery($slug: String!) {
  mdx(frontmatter: { slug: { eq: $slug } }) {
    frontmatter {
      title
      date
      author {
        name
        bio
        avatar {
          childImageSharp {
            gatsbyImageData(width: 48, height: 48)
          }
        }
      }
      category {
        name
        slug
        color
      }
      tags
      excerpt
      featuredImage {
        childImageSharp {
          gatsbyImageData(
            width: 1200
            placeholder: BLURRED
            formats: [AUTO, WEBP, AVIF]
          )
        }
      }
      featured
    }
    body
    timeToRead
  }
}
```

#### Relationships

- **belongs to** one `Author`
- **belongs to** one primary `Category`
- **tagged with** many `Tag` (string array)
- **has one** `ImageSharp` (featuredImage)

---

### 2. Author

Represents an article author. Can be embedded in article frontmatter or referenced from `src/data/authors.ts`.

**Source**: Article frontmatter or TypeScript configuration file

#### Properties

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `id` | `string` | Yes | Unique identifier (e.g., "joseph-crawford") |
| `name` | `string` | Yes | Display name |
| `bio` | `string` | No | Short author bio (1-2 sentences) |
| `avatar` | `ImageSharp` | No | Author photo |
| `email` | `string` | No | Contact email |
| `social` | `SocialLinks` | No | Social media links |

#### TypeScript Interface

```typescript
interface Author {
  id: string;
  name: string;
  bio?: string;
  avatar?: string; // Relative path to image
  email?: string;
  social?: {
    twitter?: string;
    github?: string;
    linkedin?: string;
    website?: string;
  };
}
```

#### Configuration Example

```typescript
// src/data/authors.ts
export const authors: Record<string, Author> = {
  'joseph-crawford': {
    id: 'joseph-crawford',
    name: 'Joseph Crawford',
    bio: 'Full-stack developer specializing in React and TypeScript',
    avatar: '../images/authors/joseph.jpg',
    email: 'joseph@example.com',
    social: {
      twitter: '@josephcrawford',
      github: 'josephcrawford',
      linkedin: 'josephcrawford',
    },
  },
};
```

---

### 3. Category

Represents an article category. Categories are defined in article frontmatter or `src/data/categories.ts`.

**Source**: Article frontmatter or TypeScript configuration file

#### Properties

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `slug` | `string` | Yes | URL-safe identifier |
| `name` | `string` | Yes | Display name |
| `description` | `string` | No | Category description |
| `color` | `string` (hex) | No | Theme color for category badge |
| `icon` | `string` | No | Icon identifier (Font Awesome or custom SVG) |

#### TypeScript Interface

```typescript
interface Category {
  slug: string;
  name: string;
  description?: string;
  color?: string; // Hex color
  icon?: string;
}
```

#### Configuration Example

```typescript
// src/data/categories.ts
export const categories: Record<string, Category> = {
  'web-development': {
    slug: 'web-development',
    name: 'Web Development',
    description: 'Articles about modern web development',
    color: '#65bc7b',
    icon: 'code',
  },
  'javascript': {
    slug: 'javascript',
    name: 'JavaScript',
    description: 'JavaScript tutorials and tips',
    color: '#f0db4f',
    icon: 'js',
  },
  'typescript': {
    slug: 'typescript',
    name: 'TypeScript',
    description: 'TypeScript guides and best practices',
    color: '#3178c6',
    icon: 'ts',
  },
};
```

---

### 4. SiteConfig

Global site configuration. Replaces WordPress theme customizer settings and get_theme_mod() calls.

**Source**: `src/data/siteConfig.ts` (TypeScript file)  
**Access**: Import directly in components

#### Properties

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `siteTitle` | `string` | Yes | Site name |
| `siteTagline` | `string` | No | Site description |
| `siteUrl` | `string` | Yes | Production URL (for SEO) |
| `siteLogo` | `string` | No | Logo image path |
| `defaultAuthor` | `Author` | Yes | Fallback author for articles |
| `headerLayout` | `'default' \| 'large'` | Yes | Header style variant |
| `social` | `SocialLinks` | No | Site-wide social links |
| `footer` | `FooterConfig` | Yes | Footer configuration |
| `breakingNews` | `BreakingNewsItem[]` | No | Breaking news ticker items |
| `newsletter` | `NewsletterConfig` | No | Newsletter signup settings |

#### TypeScript Interface

```typescript
interface SiteConfig {
  siteTitle: string;
  siteTagline?: string;
  siteUrl: string;
  siteLogo?: string;
  defaultAuthor: Author;
  headerLayout: 'default' | 'large';
  social?: SocialLinks;
  footer: FooterConfig;
  breakingNews?: BreakingNewsItem[];
  newsletter?: NewsletterConfig;
}

interface FooterConfig {
  copyright: string;
  legalLinks: { label: string; url: string }[];
  showSocial: boolean;
  showNewsletter: boolean;
}

interface NewsletterConfig {
  title: string;
  description: string;
  submitUrl: string; // Newsletter service endpoint
  privacy: string; // Privacy policy URL
}
```

#### Configuration Example

```typescript
// src/data/siteConfig.ts
export const siteConfig: SiteConfig = {
  siteTitle: 'HybridMag',
  siteTagline: 'A modern programming blog',
  siteUrl: 'https://josephcrawford.github.io',
  siteLogo: '/images/logo.svg',
  defaultAuthor: {
    id: 'joseph-crawford',
    name: 'Joseph Crawford',
    bio: 'Full-stack developer',
  },
  headerLayout: 'large',
  social: {
    twitter: 'https://twitter.com/josephcrawford',
    github: 'https://github.com/josephcrawford',
    linkedin: 'https://linkedin.com/in/josephcrawford',
  },
  footer: {
    copyright: '© 2024 HybridMag. All rights reserved.',
    legalLinks: [
      { label: 'Privacy Policy', url: '/privacy' },
      { label: 'Terms of Service', url: '/terms' },
    ],
    showSocial: true,
    showNewsletter: true,
  },
  breakingNews: [
    {
      id: '1',
      text: 'New tutorial: Converting WordPress to Gatsby',
      url: '/blog/wordpress-to-gatsby',
    },
  ],
  newsletter: {
    title: 'Subscribe to Newsletter',
    description: 'Get weekly updates on web development',
    submitUrl: 'https://example.com/api/subscribe',
    privacy: '/privacy',
  },
};
```

---

### 5. NavigationItem

Represents a navigation menu item. Supports nested dropdowns (recursive structure).

**Source**: `src/data/navigation.ts` (TypeScript file)

#### Properties

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `id` | `string` | Yes | Unique identifier |
| `label` | `string` | Yes | Display text |
| `url` | `string` | Yes | Link destination |
| `external` | `boolean` | No | Open in new tab if true |
| `icon` | `string` | No | Icon identifier (optional) |
| `children` | `NavigationItem[]` | No | Dropdown menu items (recursive) |
| `megaMenu` | `boolean` | No | Use mega menu layout (future) |

#### TypeScript Interface

```typescript
interface NavigationItem {
  id: string;
  label: string;
  url: string;
  external?: boolean;
  icon?: string;
  children?: NavigationItem[];
  megaMenu?: boolean;
}
```

#### Configuration Example

```typescript
// src/data/navigation.ts
export const primaryNav: NavigationItem[] = [
  {
    id: 'home',
    label: 'Home',
    url: '/',
  },
  {
    id: 'blog',
    label: 'Blog',
    url: '/blog',
    children: [
      {
        id: 'web-dev',
        label: 'Web Development',
        url: '/blog/web-development',
      },
      {
        id: 'javascript',
        label: 'JavaScript',
        url: '/blog/javascript',
        children: [
          {
            id: 'react',
            label: 'React',
            url: '/blog/javascript/react',
          },
          {
            id: 'vue',
            label: 'Vue',
            url: '/blog/javascript/vue',
          },
        ],
      },
    ],
  },
  {
    id: 'about',
    label: 'About',
    url: '/about',
  },
  {
    id: 'contact',
    label: 'Contact',
    url: '/contact',
  },
];

export const secondaryNav: NavigationItem[] = [
  {
    id: 'subscribe',
    label: 'Subscribe',
    url: '/subscribe',
  },
  {
    id: 'newsletter',
    label: 'Newsletter',
    url: '/newsletter',
  },
];
```

---

### 6. SocialLinks

Social media links used throughout the site (header, footer, author cards).

**Source**: Embedded in `SiteConfig`, `Author`, etc.

#### TypeScript Interface

```typescript
interface SocialLinks {
  facebook?: string;
  twitter?: string;
  instagram?: string;
  linkedin?: string;
  github?: string;
  youtube?: string;
  pinterest?: string;
  website?: string;
}
```

---

### 7. WidgetConfig

Configuration for widget areas (sidebars). Replaces WordPress dynamic_sidebar() system.

**Source**: `src/data/widgetConfig.ts` (TypeScript file)

#### Properties

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `area` | `WidgetArea` | Yes | Widget area identifier |
| `widgets` | `Widget[]` | Yes | Array of widget configurations |

#### TypeScript Interface

```typescript
type WidgetArea = 
  | 'header-2' 
  | 'header-3' 
  | 'primary' 
  | 'mobile-sidebar' 
  | 'slideout-sidebar' 
  | 'footer-1' 
  | 'footer-2' 
  | 'footer-3' 
  | 'footer-4';

type Widget =
  | SidebarPostsWidget
  | CategoriesWidget
  | NewsletterWidget
  | SearchWidget
  | TagCloudWidget;

interface SidebarPostsWidget {
  type: 'sidebar-posts';
  title: string;
  count: number;
  source: 'popular' | 'recent';
  showThumbnail?: boolean;
}

interface CategoriesWidget {
  type: 'categories';
  title: string;
  showCount: boolean;
  hierarchical?: boolean;
}

interface NewsletterWidget {
  type: 'newsletter';
  title: string;
  description: string;
}

interface SearchWidget {
  type: 'search';
  placeholder: string;
}

interface TagCloudWidget {
  type: 'tag-cloud';
  title: string;
  maxTags: number;
}
```

#### Configuration Example

```typescript
// src/data/widgetConfig.ts
export const widgetAreas: WidgetConfig[] = [
  {
    area: 'primary',
    widgets: [
      {
        type: 'sidebar-posts',
        title: 'Popular Posts',
        count: 5,
        source: 'popular',
        showThumbnail: true,
      },
      {
        type: 'categories',
        title: 'Categories',
        showCount: true,
        hierarchical: false,
      },
      {
        type: 'newsletter',
        title: 'Stay Updated',
        description: 'Subscribe for weekly updates',
      },
    ],
  },
  {
    area: 'footer-1',
    widgets: [
      {
        type: 'sidebar-posts',
        title: 'Recent Articles',
        count: 3,
        source: 'recent',
        showThumbnail: true,
      },
    ],
  },
];
```

---

### 8. BreakingNewsItem

Breaking news ticker item displayed in the header.

**Source**: `SiteConfig.breakingNews` array

#### Properties

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `id` | `string` | Yes | Unique identifier |
| `text` | `string` | Yes | News headline |
| `url` | `string` | Yes | Link to full article |
| `startDate` | `string` (ISO 8601) | No | Start showing on this date |
| `endDate` | `string` (ISO 8601) | No | Stop showing after this date |

#### TypeScript Interface

```typescript
interface BreakingNewsItem {
  id: string;
  text: string;
  url: string;
  startDate?: string;
  endDate?: string;
}
```

---

### 9. FeaturedSliderItem

Content item for the featured content slider (Swiper).

**Source**: GraphQL query for most recent articles with `featured: true`

#### Properties

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `slug` | `string` | Yes | Article slug |
| `title` | `string` | Yes | Article title |
| `excerpt` | `string` | Yes | Short description |
| `featuredImage` | `ImageSharp` | Yes | Slide background image |
| `category` | `Category` | Yes | Primary category |
| `date` | `string` | Yes | Publish date |

#### GraphQL Query Example

```graphql
query FeaturedSliderQuery {
  allMdx(
    filter: { frontmatter: { featured: { eq: true } } }
    sort: { frontmatter: { date: DESC } }
    limit: 5
  ) {
    nodes {
      frontmatter {
        slug
        title
        excerpt
        category {
          name
          slug
          color
        }
        featuredImage {
          childImageSharp {
            gatsbyImageData(width: 1200, height: 600)
          }
        }
        date
      }
    }
  }
}
```

---

### 10. DarkModeState

Client-side state for dark mode theme.

**Source**: React state + localStorage  
**Storage Key**: `hybridmagDarkMode`

#### Properties

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `enabled` | `boolean` | Yes | True if dark mode active |
| `source` | `'user' \| 'system'` | Yes | User toggle or system preference |

#### localStorage Format

```json
{
  "hybridmagDarkMode": "enabled"  // or "disabled"
}
```

#### TypeScript Interface

```typescript
interface DarkModeState {
  enabled: boolean;
  source: 'user' | 'system';
}
```

---

## Data Flow Diagrams

### Article Rendering Flow

```
┌──────────────────────┐
│  Markdown/MDX File   │
│  content/posts/*.md  │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│  gatsby-source-      │
│   filesystem         │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│  gatsby-transformer- │
│   remark / mdx       │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│  GraphQL Node        │
│  (Mdx/MarkdownRemark)│
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│  createPages API     │
│  (gatsby-node.ts)    │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│  Static HTML Page    │
│  /blog/article-slug  │
└──────────────────────┘
```

### Widget Rendering Flow

```
┌──────────────────────┐
│  widgetConfig.ts     │
│  (TypeScript config) │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│  WidgetArea          │
│  component           │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│  Widget type check   │
│  (switch statement)  │
└──────────┬───────────┘
           │
           ├─────────────┬─────────────┬──────────────┐
           ▼             ▼             ▼              ▼
┌────────────────┐ ┌──────────┐ ┌───────────┐ ┌──────────┐
│ SidebarPosts   │ │Categories│ │Newsletter │ │ Search   │
└────────────────┘ └──────────┘ └───────────┘ └──────────┘
```

### Dark Mode State Flow

```
┌──────────────────────┐
│  Component mount     │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│  Check localStorage  │
│  'hybridmagDarkMode' │
└──────────┬───────────┘
           │
           ├─── Found? ───┐
           │ Yes           │ No
           ▼               ▼
┌──────────────────┐  ┌─────────────────────┐
│ Use stored value │  │ Check prefers-color-│
│                  │  │ scheme media query  │
└──────────┬───────┘  └──────────┬──────────┘
           │                     │
           └──────────┬──────────┘
                      │
                      ▼
           ┌──────────────────────┐
           │  Set initial state   │
           └──────────┬───────────┘
                      │
                      ▼
           ┌──────────────────────┐
           │  Apply 'hm-dark'     │
           │  class to <html>     │
           └──────────────────────┘
```

---

## Type Definitions Location

All TypeScript interfaces should be defined in:

**`src/types/index.ts`** - Central type definitions file

```typescript
// src/types/index.ts
export interface Article { /* ... */ }
export interface Author { /* ... */ }
export interface Category { /* ... */ }
export interface SiteConfig { /* ... */ }
export interface NavigationItem { /* ... */ }
export interface SocialLinks { /* ... */ }
export interface WidgetConfig { /* ... */ }
export interface BreakingNewsItem { /* ... */ }
export interface DarkModeState { /* ... */ }
```

---

## GraphQL Schema Extensions

Gatsby automatically infers GraphQL schema from Markdown frontmatter. No custom schema definitions needed for basic fields.

For custom fields, use `createSchemaCustomization` in `gatsby-node.ts`:

```typescript
export const createSchemaCustomization: GatsbyNode['createSchemaCustomization'] = ({ actions }) => {
  const { createTypes } = actions;
  
  createTypes(`
    type MdxFrontmatter {
      slug: String!
      title: String!
      date: Date! @dateformat
      author: Author
      category: Category
      tags: [String!]
      excerpt: String!
      featuredImage: File @fileByRelativePath
      featured: Boolean
      pinned: Boolean
    }
    
    type Author {
      id: String!
      name: String!
      bio: String
      avatar: File @fileByRelativePath
      email: String
      social: SocialLinks
    }
    
    type Category {
      slug: String!
      name: String!
      description: String
      color: String
      icon: String
    }
    
    type SocialLinks {
      facebook: String
      twitter: String
      instagram: String
      linkedin: String
      github: String
      youtube: String
      pinterest: String
      website: String
    }
  `);
};
```

---

## Summary

**Total Entities**: 10  
**Configuration Files**: 4 (siteConfig, navigation, widgetConfig, categories)  
**Content Sources**: Markdown/MDX files in `content/posts/`  
**GraphQL Types**: 2 primary (Mdx, MarkdownRemark)

### Data Sources by Type

| Entity | Source Type | File Location |
|--------|-------------|---------------|
| Article | Markdown/MDX | `content/posts/*.md(x)` |
| Author | TypeScript | `src/data/authors.ts` or frontmatter |
| Category | TypeScript | `src/data/categories.ts` or frontmatter |
| SiteConfig | TypeScript | `src/data/siteConfig.ts` |
| NavigationItem | TypeScript | `src/data/navigation.ts` |
| WidgetConfig | TypeScript | `src/data/widgetConfig.ts` |
| BreakingNewsItem | TypeScript | Embedded in `siteConfig.ts` |
| DarkModeState | localStorage | Client-side only |

### WordPress Equivalents

| Gatsby Entity | WordPress Equivalent |
|---------------|---------------------|
| Article (frontmatter) | wp_posts table + post meta |
| Author | wp_users table |
| Category | wp_terms (category taxonomy) |
| SiteConfig | theme_mods / wp_options |
| NavigationItem | wp_nav_menu |
| WidgetConfig | wp_options (widget settings) |
| DarkModeState | N/A (client-side only) |

---

**Next Steps**: Use these entity definitions when implementing GraphQL queries, component props, and TypeScript interfaces.
