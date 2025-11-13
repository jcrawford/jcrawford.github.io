/**
 * TypeScript type definitions for Gatsby Magazine Website
 * These types correspond to the GraphQL schema and JSON data files
 */

/**
 * Article represents a blog post with full content and metadata
 */
export interface Article {
  /** Unique identifier */
  id: string
  
  /** URL-friendly identifier */
  slug: string
  
  /** Article title (1-200 characters) */
  title: string
  
  /** Brief summary (100-300 characters) */
  excerpt: string
  
  /** Full article body content (HTML format, 100-800 words) */
  content: string
  
  /** Path to featured image (relative to /static/images/) */
  featuredImage: string
  
  /** Category slug (fashion, lifestyle, food, travel, sports) */
  category: CategorySlug
  
  /** Content tags (includes 'featured' for slider articles) */
  tags: string[]
  
  /** Author slug (always 'admin') */
  author: string
  
  /** Publication date (ISO 8601 format: YYYY-MM-DD) */
  publishedAt: string
  
  /** Last update date (ISO 8601 format: YYYY-MM-DD) */
  updatedAt?: string
  
  /** Series metadata (if article is part of a series) */
  series?: SeriesMetadata
}

/**
 * Category represents a content category for organizing articles
 */
export interface Category {
  /** Unique identifier */
  id: string
  
  /** URL-friendly identifier */
  slug: CategorySlug
  
  /** Display name (capitalized) */
  name: string
  
  /** Category description (50-200 characters) */
  description: string
}

/**
 * Valid category slugs (fixed set of 5)
 */
export type CategorySlug = 'fashion' | 'lifestyle' | 'food' | 'travel' | 'sports'

/**
 * Author represents a content author
 */
export interface Author {
  /** Unique identifier */
  id: string
  
  /** URL-friendly identifier (always 'admin') */
  slug: string
  
  /** Display name */
  name: string
  
  /** Author biography (100-300 characters) */
  bio: string
  
  /** Path to avatar image (relative to /static/images/) */
  avatar: string
  
  /** Social media links */
  socialLinks?: AuthorSocialLinks
}

/**
 * Social media links for author
 */
export interface AuthorSocialLinks {
  /** Facebook profile URL */
  facebook?: string
  
  /** Twitter profile URL */
  twitter?: string
  
  /** Instagram profile URL */
  instagram?: string
}

/**
 * Site metadata from gatsby-config.ts
 */
export interface SiteMetadata {
  /** Site title */
  title: string
  
  /** Site description for SEO */
  description: string
  
  /** Base URL for deployment */
  siteUrl: string
  
  /** Social media links */
  socialLinks: SiteSocialLinks
  
  /** Main navigation menu items */
  navigation: NavigationItem[]
}

/**
 * Social media links for site
 */
export interface SiteSocialLinks {
  /** Facebook page URL */
  facebook: string
  
  /** Twitter profile URL */
  twitter: string
  
  /** Instagram profile URL */
  instagram: string
}

/**
 * Navigation menu item
 */
export interface NavigationItem {
  /** Menu item display name */
  name: string
  
  /** Menu item path */
  path: string
}

/**
 * GraphQL query result for all articles
 */
export interface AllArticlesQuery {
  allArticlesJson: {
    nodes: Article[]
  }
}

/**
 * GraphQL query result for featured articles (homepage slider)
 */
export interface FeaturedArticlesQuery {
  allArticlesJson: {
    nodes: Article[]
  }
}

/**
 * GraphQL query result for articles by category
 */
export interface ArticlesByCategoryQuery {
  allArticlesJson: {
    nodes: Article[]
  }
}

/**
 * GraphQL query result for single article
 */
export interface ArticleQuery {
  articlesJson: Article | null
}

/**
 * GraphQL query result for all categories
 */
export interface AllCategoriesQuery {
  allCategoriesJson: {
    nodes: Category[]
  }
}

/**
 * GraphQL query result for single category
 */
export interface CategoryQuery {
  categoriesJson: Category | null
}

/**
 * GraphQL query result for author
 */
export interface AuthorQuery {
  authorsJson: Author | null
}

/**
 * GraphQL query result for site metadata
 */
export interface SiteMetadataQuery {
  site: {
    siteMetadata: SiteMetadata
  }
}

/**
 * Page context for article template
 */
export interface ArticlePageContext {
  slug: string
}

/**
 * Page context for category template
 */
export interface CategoryPageContext {
  category: CategorySlug
  limit: number
  skip: number
  numPages: number
  currentPage: number
}

/**
 * Page context for author template
 */
export interface AuthorPageContext {
  author: string
  limit: number
  skip: number
  numPages: number
  currentPage: number
}

/**
 * Search index entry for client-side search
 */
export interface SearchIndexEntry {
  /** Article slug */
  slug: string
  
  /** Article title */
  title: string
  
  /** Article excerpt */
  excerpt: string
  
  /** Searchable content (stripped of HTML) */
  content: string
  
  /** Category slug */
  category: CategorySlug
  
  /** Tags */
  tags: string[]
}

/**
 * Theme preference for dark/light mode
 */
export type ThemePreference = 'light' | 'dark'

/**
 * Article Series - Reference to external resource
 */
export interface SeriesReference {
  /** External URL */
  url: string
  
  /** Optional display title (defaults to URL if not provided) */
  title?: string
}

/**
 * Article Series - Downloadable attachment
 */
export interface SeriesAttachment {
  /** Path to file (relative to /static/ or absolute URL) */
  filename: string
  
  /** Optional display title (defaults to filename if not provided) */
  title?: string
}

/**
 * Article Series - Metadata for articles that are part of a series
 */
export interface SeriesMetadata {
  /** Series name/title (required if series exists) */
  name: string
  
  /** Optional explicit ordering number */
  order?: number
  
  /** Slug of previous article in series */
  prev?: string
  
  /** Slug of next article in series */
  next?: string
  
  /** Optional array of external reference links */
  references?: SeriesReference[]
  
  /** Optional array of downloadable attachments */
  attachments?: SeriesAttachment[]
}

/**
 * Article in a series (for Table of Contents display)
 */
export interface SeriesArticle {
  /** Article slug */
  slug: string
  
  /** Article title */
  title: string
  
  /** Article order in series (if specified) */
  order?: number
  
  /** Publication date (fallback for ordering) */
  publishedAt: string
}

