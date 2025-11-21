# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
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

