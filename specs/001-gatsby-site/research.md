# Research: Gatsby Magazine Website

**Feature**: 001-gatsby-site  
**Date**: 2025-11-05  
**Status**: Complete

## Overview

This document captures technical research and decisions for building a magazine-style website with Gatsby, ensuring adherence to best practices and project constitution.

## Research Areas

### R1: Gatsby 5.x Setup and Configuration

**Decision**: Use Gatsby 5.x with TypeScript configuration files

**Rationale**:
- Gatsby 5.x is the latest stable version (as of 2025) with React 18 support
- TypeScript config files (`gatsby-config.ts`, `gatsby-node.ts`) provide type safety
- Built-in TypeScript support eliminates need for additional plugins
- Vite-based dev server provides faster development experience

**Key Configuration**:
- Use `gatsby-config.ts` for site metadata and plugins
- Use `gatsby-node.ts` for programmatic page generation
- Enable TypeScript strict mode in `tsconfig.json`
- Configure path aliases for cleaner imports

**Alternatives Considered**:
- Gatsby 4.x: Rejected (not latest stable)
- JavaScript config: Rejected (violates P1: TypeScript-First)

---

### R2: Image Optimization Strategy

**Decision**: Use `gatsby-plugin-image` with `StaticImage` and `GatsbyImage` components

**Rationale**:
- Built-in lazy loading and responsive images
- Automatic WebP/AVIF format generation
- Placeholder blur effects for better UX
- Optimizes images at build time (static generation)
- No external dependencies required

**Implementation**:
- Use `StaticImage` for fixed images (logos, icons)
- Use `GatsbyImage` with GraphQL for dynamic article images
- Configure multiple image breakpoints in plugin options
- Store source images in `static/images/` directory

**Alternatives Considered**:
- Manual image optimization: Rejected (too time-consuming, error-prone)
- External CDN: Rejected (adds complexity, not needed for static site)
- Next.js Image: Rejected (wrong framework)

---

### R3: Dark Mode Implementation

**Decision**: CSS custom properties with localStorage and `gatsby-browser.ts`

**Rationale**:
- CSS variables enable instant theme switching without re-render
- localStorage persists user preference across sessions
- `gatsby-browser.ts` allows hydration-time preference loading
- No flash of wrong theme (FOUT)
- Lightweight, no external dependencies

**Implementation**:
```typescript
// In gatsby-browser.ts
export const onClientEntry = () => {
  const savedTheme = localStorage.getItem('theme')
  if (savedTheme) {
    document.documentElement.setAttribute('data-theme', savedTheme)
  }
}
```

**Alternatives Considered**:
- React Context API: Rejected (causes re-render, potential flicker)
- Theme UI library: Rejected (violates P6: No utility libraries)
- Styled-components theming: Rejected (adds bundle size, not needed)

---

### R4: Search Functionality for Static Site

**Decision**: Client-side search with custom implementation

**Rationale**:
- Static site requires client-side search (no server)
- With only 20 articles, full JSON index is lightweight (<10KB)
- Simple keyword matching is sufficient for magazine content
- No external dependencies (search libraries like Algolia add complexity)

**Implementation**:
- Generate search index JSON during Gatsby build
- Include article title, excerpt, content, category in index
- Implement basic keyword search with Array.filter
- Search page at `/search` route
- Case-insensitive matching, support for multiple keywords

**Alternatives Considered**:
- Algolia: Rejected (overkill for 20 articles, external service dependency)
- Lunr.js: Rejected (adds dependency, not needed for small dataset)
- Fuse.js: Rejected (violates P6, simple native search sufficient)

---

### R5: GitHub Pages Deployment

**Decision**: Use `gh-pages` package with `gatsby build` and prefix path configuration

**Rationale**:
- Standard approach for Gatsby on GitHub Pages
- `gh-pages` package handles branch management automatically
- Path prefix ensures assets load correctly from subdirectory
- Simple npm script for deployment

**Implementation**:
```json
// package.json
{
  "scripts": {
    "deploy": "gatsby build --prefix-paths && gh-pages -d public"
  }
}
```

```typescript
// gatsby-config.ts
export default {
  pathPrefix: '/site', // repository name
  // ... other config
}
```

**Alternatives Considered**:
- Manual gh-pages branch: Rejected (error-prone, `gh-pages` package is standard)
- GitHub Actions: Deferred (can add later, manual deploy sufficient initially)
- Netlify/Vercel: Rejected (spec requires GitHub Pages)

---

### R6: Data Layer Architecture

**Decision**: Use Gatsby's GraphQL data layer with `gatsby-transformer-json`

**Rationale**:
- GraphQL is idiomatic Gatsby approach
- Type-safe queries with GraphQL Code Generator
- `gatsby-transformer-json` for article data (simple, no markdown parser needed)
- Centralized data queries in page templates
- Automatic query result typing

**Implementation**:
- Store articles as JSON files in `src/data/articles/`
- Use `gatsby-source-filesystem` to source data
- Transform with `gatsby-transformer-json`
- Query with GraphQL in templates
- Generate TypeScript types from GraphQL schema

**Alternatives Considered**:
- Direct file imports: Rejected (loses GraphQL benefits, harder to query)
- Markdown with frontmatter: Rejected (JSON simpler for mock data)
- Headless CMS: Rejected (overkill, adds external dependency)

---

### R7: Dynamic Page Generation

**Decision**: Use `createPages` API in `gatsby-node.ts` with TypeScript

**Rationale**:
- Standard Gatsby approach for creating pages programmatically
- Full type safety with TypeScript
- Single source of truth for routing logic
- Supports pagination, categories, and author pages

**Implementation**:
```typescript
// gatsby-node.ts
export const createPages: GatsbyNode['createPages'] = async ({ graphql, actions }) => {
  const { createPage } = actions
  
  // Query all articles
  const result = await graphql<ArticlesQuery>(`...`)
  
  // Create article pages
  result.data.allArticlesJson.nodes.forEach((article) => {
    createPage({
      path: `/articles/${article.slug}`,
      component: path.resolve('./src/templates/article.tsx'),
      context: { slug: article.slug }
    })
  })
  
  // Create category pages with pagination
  // Create author page
}
```

**Alternatives Considered**:
- File-based routing only: Rejected (doesn't support dynamic article pages)
- Custom routing solution: Rejected (Gatsby API is standard and well-supported)

---

### R8: Typography and Font Loading

**Decision**: Self-host Figtree font with `gatsby-plugin-google-fonts` or local files

**Rationale**:
- Design spec requires Figtree font family
- Self-hosting avoids GDPR issues and external requests
- Faster load times (no external DNS lookup)
- Font files already available in design folder

**Implementation**:
- Extract Figtree WOFF2 files from `design/wp-content/themes/hybridmag/assets/fonts/`
- Place in `static/fonts/` directory
- Define @font-face rules in global CSS
- Preload critical font weights (400, 700)

**Alternatives Considered**:
- Google Fonts CDN: Rejected (privacy concerns, slower)
- System fonts: Rejected (design spec requires Figtree)

---

### R9: CSS Architecture

**Decision**: Extract and adapt CSS from design folder, organize by component

**Rationale**:
- Design folder contains complete CSS (`style_1225677685.css`)
- CSS custom properties enable dark mode
- Component-scoped CSS modules prevent conflicts
- No CSS-in-JS needed (adds complexity, bundle size)

**Implementation**:
- Extract CSS from `design/wp-content/themes/hybridmag/style_*.css`
- Convert to CSS modules per component
- Extract common variables to `src/styles/variables.css`
- Use global styles for typography and resets
- Add dark mode variables

**Alternatives Considered**:
- Styled-components: Rejected (adds bundle size, runtime cost)
- Tailwind CSS: Rejected (conflicts with existing design CSS)
- Sass/SCSS: Rejected (CSS custom properties sufficient)

---

### R10: Development Workflow

**Decision**: Standard Gatsby development workflow with build verification

**Rationale**:
- `gatsby develop` for local development with hot reload
- `gatsby build` to verify static generation
- Spec requires build verification after every change
- TypeScript compilation catches errors early

**Scripts**:
```json
{
  "scripts": {
    "develop": "gatsby develop",
    "build": "gatsby build",
    "serve": "gatsby serve",
    "clean": "gatsby clean",
    "type-check": "tsc --noEmit"
  }
}
```

**Workflow**:
1. Make changes
2. Verify in `gatsby develop`
3. Run `gatsby build` to ensure static generation works
4. Run `type-check` for TypeScript validation
5. Commit changes

**Alternatives Considered**:
- Custom webpack config: Rejected (Gatsby handles this)
- Vite instead of Gatsby: Rejected (spec requires Gatsby)

---

## Technology Stack Summary

| Category | Technology | Version | Rationale |
|----------|-----------|---------|-----------|
| **Framework** | Gatsby | 5.x | Latest stable, React 18 support, static generation |
| **Language** | TypeScript | 5.x | Type safety, constitution P1 |
| **UI Library** | React | 18.x | Required by Gatsby |
| **Date Handling** | dayjs | 1.x | Constitution P7 |
| **Images** | gatsby-plugin-image | 3.x | Built-in optimization |
| **Data Source** | gatsby-source-filesystem | 5.x | File-based data |
| **Data Transform** | gatsby-transformer-json | 5.x | JSON article data |
| **Deployment** | gh-pages | 6.x | GitHub Pages automation |

## Dependencies

### Production

```json
{
  "gatsby": "^5.13.0",
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "dayjs": "^1.11.10"
}
```

### Development

```json
{
  "typescript": "^5.3.0",
  "@types/react": "^18.2.0",
  "@types/react-dom": "^18.2.0",
  "@types/node": "^20.0.0",
  "gh-pages": "^6.1.0"
}
```

### Gatsby Plugins

```json
{
  "gatsby-plugin-image": "^3.13.0",
  "gatsby-plugin-sharp": "^5.13.0",
  "gatsby-transformer-sharp": "^5.13.0",
  "gatsby-source-filesystem": "^5.13.0",
  "gatsby-transformer-json": "^5.13.0"
}
```

## Next Steps

With research complete, proceed to Phase 1:
1. Create data-model.md (content structure)
2. Define GraphQL contracts
3. Write quickstart.md (setup instructions)
4. Update agent context with technology decisions

