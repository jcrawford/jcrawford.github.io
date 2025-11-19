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
  
  /** Primary tag slug (fashion, lifestyle, food, travel, sports, reviews) */
  category: TagSlug
  
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
  
  /** Review metadata (if article is a review) */
  review?: ReviewMetadata
}

/**
 * Review metadata for product/software reviews
 */
export interface ReviewMetadata {
  /** Product rating (1-5 stars) */
  rating: number
  
  /** List of positive aspects */
  pros: string[]
  
  /** List of negative aspects */
  cons: string[]
  
  /** Product price (e.g., "$99", "Free", "$4.99/month") */
  price?: string
  
  /** Product brand/manufacturer */
  brand?: string
  
  /** Official product URL */
  productUrl?: string
  
  /** Affiliate purchase link */
  affiliateLink?: string
}

/**
 * Tag represents a content tag for organizing articles
 */
export interface Tag {
  /** Unique identifier */
  id: string
  
  /** URL-friendly identifier */
  slug: TagSlug
  
  /** Display name (capitalized) */
  name: string
  
  /** Tag description (50-200 characters) */
  description: string
  
  /** Whether this tag appears in navigation */
  featured: boolean
}

/**
 * Valid tag slugs (fixed set of 6)
 */
export type TagSlug = 'fashion' | 'lifestyle' | 'food' | 'travel' | 'sports' | 'reviews'

/**
 * @deprecated Use Tag instead
 */
export type Category = Tag

/**
 * @deprecated Use TagSlug instead
 */
export type CategorySlug = TagSlug

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
 * GraphQL query result for articles by tag
 */
export interface ArticlesByTagQuery {
  allArticlesJson: {
    nodes: Article[]
  }
}

/**
 * @deprecated Use ArticlesByTagQuery instead
 */
export type ArticlesByCategoryQuery = ArticlesByTagQuery

/**
 * GraphQL query result for single article
 */
export interface ArticleQuery {
  articlesJson: Article | null
}

/**
 * GraphQL query result for all tags
 */
export interface AllTagsQuery {
  allTagsJson: {
    nodes: Tag[]
  }
}

/**
 * GraphQL query result for single tag
 */
export interface TagQuery {
  tagsJson: Tag | null
}

/**
 * @deprecated Use AllTagsQuery instead
 */
export type AllCategoriesQuery = AllTagsQuery

/**
 * @deprecated Use TagQuery instead
 */
export type CategoryQuery = TagQuery

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
 * Page context for tag template
 */
export interface TagPageContext {
  tag: TagSlug
  limit: number
  skip: number
  numPages: number
  currentPage: number
}

/**
 * @deprecated Use TagPageContext instead
 */
export type CategoryPageContext = TagPageContext

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
  
  /** Primary tag slug */
  category: TagSlug
  
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

