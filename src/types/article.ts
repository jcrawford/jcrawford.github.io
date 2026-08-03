/**
 * Shared article-related type definitions
 * Used across article, series-article, and brewing-recipe templates
 */

export interface SpinnerImage {
  src: string
  alt: string
  caption?: string
}

export interface NamedSpinner {
  id: string
  images: SpinnerImage[] | null
}

export interface BrewData {
  originalGravity?: number
  finalGravity?: number
  startDate?: string
  primaryEndDate?: string
  secondaryStartDate?: string
  secondaryEndDate?: string
  bottlingDate?: string
  drinkingReadyDate?: string
  bulkConditioningTime?: string
  bottleConditioningTime?: string
  abv?: number
  batchSize?: string
  yeast?: string
  fermentationTime?: string
  secondaryTime?: string
}

export interface RecipeStep {
  title: string
  description: string
  image?: string
  video?: string
}

export interface GalleryEmbedData {
  slug: string
  title: string
  path?: string
  coverImage: string
  description: string
  photoCount: number
  videoCount?: number
  date: string
}

export interface ReviewData {
  rating: number
  childRating?: number
  pros: string[]
  cons: string[]
  price?: string
  brand?: string
  productUrl?: string
  affiliateLink?: string
}

export interface ShareCounts {
  facebook: number
  twitter: number
  linkedin: number
  copy: number
}

export interface ArticlePageContext {
  isReview: boolean
  isBrewing?: boolean
  viewCount: number
  commentCount: number
  shareCounts: ShareCounts
}