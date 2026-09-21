# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- **Automated SEO Sitemap Generation** (2025-11-21)
  - XML sitemap automatically generated on every build using `gatsby-plugin-sitemap`
  - Sitemap accessible at `/sitemap-index.xml` with 153 URLs indexed
  - Includes all public pages: blog posts (138), series (3), tags (11), author (1), static pages (3)
  - SEO-optimized with priority values by page type (homepage: 1.0, posts: 0.8, tags: 0.7, etc.)
  - Change frequency hints by content type (homepage: daily, posts: monthly, tags: weekly, etc.)
  - Proper URL encoding and protocol compliance (sitemaps.org v0.9)
  - robots.txt created with sitemap reference for search engine discovery
  - Automatic scaling support (plugin handles splitting if > 50,000 URLs)
  - Current metrics: 22 KB file size, < 0.004s load time, well under protocol limits
  - Comprehensive documentation in `specs/005-sitemap/README.md`

- **Featured Posts Filtering** (2025-11-21)
  - Homepage now displays exactly 7 curated featured posts instead of most recent
  - Posts marked with `featured: true` in frontmatter are displayed in featured section
  - Featured posts sorted by publication date (descending) with slug as secondary sort
  - Family category posts are automatically excluded from featured section
  - Empty state component displays when no featured posts are configured
  - Added `npm run list-featured` audit script to validate featured posts configuration
  - Audit script warns when more than 7 posts are featured (excess posts ignored)
  - Audit script errors when family posts are marked as featured
  - Audit script confirms optimal configuration with exactly 7 non-family featured posts

### Changed
- Featured section now shows curated posts instead of most recent posts
- Updated TypeScript interfaces to include `featured?: boolean` field
- Updated GraphQL queries to include featured field from markdown frontmatter

### Technical Details
- New files:
  - `src/components/EmptyFeaturedState.tsx` - Empty state component
  - `src/styles/empty-featured.css` - Empty state styling
  - `scripts/list-featured.js` - Featured posts audit script
- Modified files:
  - `src/pages/index.tsx` - Featured filtering logic
  - `package.json` - Added list-featured script

## [1.0.0] - 2025-11-20

### Initial Release
- Gatsby-based magazine-style blog with TypeScript and React
- Markdown content management with YAML frontmatter
- Category and author filtering
- Dark mode support
- SEO optimization
- Fully responsive design

