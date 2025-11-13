# Implementation Plan: Gatsby Magazine Website

**Branch**: `001-gatsby-site` | **Date**: 2025-11-05 | **Last Updated**: 2025-11-06 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-gatsby-site/spec.md`
**Status**: ✅ Implementation Complete

## Summary

Build a static magazine-style website using Gatsby that exactly replicates the HybridMag design found in the `design/` folder. The site will feature 20 articles distributed across 5 categories (Fashion, Lifestyle, Food, Travel, Sports), with a featured article slider, category pages, author page, search functionality, and dark/light mode toggle. The site must be deployable to GitHub Pages and built following Gatsby and React best practices.

## Technical Context

**Language/Version**: TypeScript with React (Gatsby v5.x, React 18.x, TypeScript 5.x)
**Primary Dependencies**: Gatsby, React, dayjs (date handling)
**Storage**: Static markdown/JSON files for mock article data
**Testing**: Manual testing (per constitution P10)
**Target Platform**: Static site for GitHub Pages deployment
**Project Type**: Web application (static site generator)
**Performance Goals**: Homepage load < 3 seconds on broadband, optimized images for responsive delivery
**Constraints**: 100% design replication, no utility libraries (lodash), native fetch only, dayjs for dates
**Scale/Scope**: 20 articles, 5 category pages, 1 author page, homepage with slider, search, responsive design

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| **P1: TypeScript-First** | ✅ PASS | All code will be TypeScript. Gatsby config may require JS. |
| **P2: Strict Type Safety** | ✅ PASS | No `any` types. Use proper types and `unknown` when needed. |
| **P3: Best Practices** | ✅ PASS | Follow Gatsby, React, and TypeScript best practices. |
| **P4: Latest Dependencies** | ✅ PASS | Use latest stable Gatsby 5.x, React 18.x, TypeScript 5.x. |
| **P5: Theme-Based Architecture** | ⚠️ ATTENTION | Design reference is in `design/` folder (scraped HTML), not `inspiration/`. Will extract and adapt CSS/structure from design folder. |
| **P6: No Utility Libraries** | ✅ PASS | No lodash. Use native JavaScript/TypeScript methods. |
| **P7: Date Handling with dayjs** | ✅ PASS | Use dayjs for all date operations. |
| **P8: Native Fetch** | ✅ PASS | Use native fetch (not needed for static site, but applies if data fetching required). |
| **P9: Static Site Generation** | ✅ PASS | Gatsby generates static HTML at build time. |
| **P10: No Unit Testing** | ✅ PASS | Manual testing only. |
| **P11: Minimal Comments** | ✅ PASS | No FR-XXX comments. Minimal comments, self-documenting code. |

**Constitution Status**: ✅ PASSES with attention to P5 (design folder location)

## Project Structure

### Documentation (this feature)

```text
specs/001-gatsby-site/
├── plan.md              # This file
├── research.md          # Phase 0 output (technology decisions)
├── data-model.md        # Phase 1 output (content structure)
├── quickstart.md        # Phase 1 output (setup guide)
├── contracts/           # Phase 1 output (GraphQL schema)
└── tasks.md             # Phase 2 output (NOT created yet)
```

### Source Code (repository root)

```text
/
├── src/
│   ├── components/      # React components (Header, Footer, ArticleCard, etc.)
│   ├── templates/       # Gatsby page templates (article, category, author)
│   ├── pages/           # Static pages (index, 404, search)
│   ├── styles/          # Global styles and design system
│   ├── data/            # Mock article data (JSON/markdown)
│   ├── types/           # TypeScript type definitions
│   └── utils/           # Helper functions
├── static/              # Static assets (images, fonts)
├── gatsby-config.ts     # Gatsby configuration
├── gatsby-node.ts       # Dynamic page generation
├── gatsby-browser.ts    # Browser APIs (dark mode, etc.)
├── gatsby-ssr.ts        # SSR APIs
└── package.json         # Dependencies
```

**Structure Decision**: Single web application structure since this is a static site with Gatsby. Using standard Gatsby conventions with TypeScript files. The `src/components/` will house reusable UI components, `src/templates/` will contain Gatsby page templates for dynamic pages (articles, categories, author), and `src/pages/` will have static routes (homepage, 404, search).

## Complexity Tracking

No constitution violations requiring justification.

---

## Phase 0: Research - ✅ COMPLETE

**Status**: All technical decisions resolved and documented

**Outputs**:
- ✅ `research.md` - Complete with 10 research areas covering:
  - Gatsby 5.x setup and configuration
  - Image optimization strategy (gatsby-plugin-image)
  - Dark mode implementation (CSS variables + localStorage)
  - Client-side search for static site
  - GitHub Pages deployment approach
  - GraphQL data layer architecture
  - Dynamic page generation (createPages API)
  - Typography and font loading (Figtree)
  - CSS architecture (extract from design folder)
  - Development workflow and build verification

**Key Decisions**:
- TypeScript throughout with strict mode
- Gatsby 5.x + React 18.x + TypeScript 5.x stack
- JSON files for article data with GraphQL queries
- CSS custom properties for dark mode
- Native client-side search (no external libraries)
- Self-hosted Figtree fonts
- 15 articles per page pagination

---

## Phase 1: Design & Contracts - ✅ COMPLETE

**Status**: All design artifacts created

**Outputs**:
- ✅ `data-model.md` - Complete entity definitions:
  - Article (20 total, 4 per category, varied lengths)
  - Category (5 fixed: Fashion, Lifestyle, Food, Travel, Sports)
  - Author (single author: "admin")
  - Tag (derived from articles, "featured" for slider)
  - SiteMetadata (global configuration)
  - Validation rules and GraphQL query patterns

- ✅ `contracts/graphql-schema.graphql` - GraphQL type definitions:
  - ArticlesJson type with all fields
  - CategoriesJson type
  - AuthorsJson type with social links
  - SiteMetadata and navigation types
  - Date formatting directives

- ✅ `contracts/types.ts` - TypeScript interfaces:
  - Complete type safety for all entities
  - GraphQL query result types
  - Page context types for templates
  - SearchIndexEntry for client-side search
  - ThemePreference type for dark mode

- ✅ `quickstart.md` - Developer setup guide:
  - Prerequisites and installation
  - Development workflow commands
  - Content creation guidelines
  - GraphQL query examples
  - Deployment instructions
  - Troubleshooting section
  - Constitution compliance checklist

- ✅ Agent context updated (`.cursor/rules/specify-rules.mdc`):
  - TypeScript with React stack
  - Gatsby + React + dayjs framework info
  - Static JSON data storage approach

---

## Phase 2: Task Breakdown - ✅ COMPLETE

**Status**: Tasks.md generated with 157 tasks organized by user story

Phase 1 planning complete. Next step is task creation:

```bash
# Run this command next:
/speckit.tasks
```

This will:
- Break down implementation into specific tasks
- Estimate complexity for each task
- Create dependency chains
- Generate `tasks.md` file

---

## Implementation Readiness

✅ **Constitution Check**: All principles validated
✅ **Research Complete**: All technical decisions documented
✅ **Data Model**: Complete with validation rules
✅ **Contracts**: GraphQL schema and TypeScript types ready
✅ **Quickstart**: Developer onboarding guide complete
✅ **Agent Context**: Updated with technology stack

**Ready for**: Task breakdown and implementation (`/speckit.tasks`)

---

## Reference Documents

| Document | Purpose | Status |
|----------|---------|--------|
| [spec.md](./spec.md) | Feature requirements | ✅ Complete |
| [research.md](./research.md) | Technical decisions | ✅ Complete |
| [data-model.md](./data-model.md) | Entity definitions | ✅ Complete |
| [quickstart.md](./quickstart.md) | Setup guide | ✅ Complete |
| [contracts/graphql-schema.graphql](./contracts/graphql-schema.graphql) | GraphQL types | ✅ Complete |
| [contracts/types.ts](./contracts/types.ts) | TypeScript types | ✅ Complete |
| [tasks.md](./tasks.md) | Task breakdown | ✅ Complete |

---

## Post-Implementation Refinements

**Date**: 2025-11-06

### Design Fidelity Fixes

After initial implementation, several design inconsistencies were identified and corrected to achieve 100% match with the design folder:

1. **Article Content Background**
   - Issue: Article content lacked the background card/box present in design
   - Fix: Added `background`, `padding`, `border-radius`, and `box-shadow` to `.hm-article` class
   - Files: `src/styles/global.css`

2. **Article Navigation**
   - Issue: Related articles section didn't match design pattern
   - Fix: Replaced "Related Articles" grid with Previous/Next article navigation (chronological by publishedAt date)
   - Files: `src/templates/article.tsx`, `gatsby-node.ts`, `src/styles/global.css`
   - Implementation: Used GraphQL queries with `publishedAt` filters to find adjacent articles

3. **Navigation Styling**
   - Issue: Previous/Next links displayed as separate cards instead of unified bar
   - Fix: Styled as single dark bar (#2a2a2a in dark mode, #f5f5f5 in light mode) with left/right positioning
   - Files: `src/styles/global.css`

4. **Footer Layout**
   - Issue: Footer columns stacked vertically instead of horizontal layout
   - Fix: Applied CSS Grid with `grid-template-columns: repeat(3, 1fr)` to `.hm-footer-widgets-inner`
   - Files: `src/styles/global.css`

5. **Sidebar Styling**
   - Issue: Unwanted HR elements between widgets
   - Fix: Removed all HR elements, using spacing only (margin-bottom)
   - Files: `src/components/Sidebar.tsx`, `src/styles/sidebar.css`

6. **Article Meta Spacing**
   - Issue: Inconsistent spacing between "by", author name, date, and comment count
   - Fix: Applied flexbox with `gap: 6px` and fine-tuned margins for `.hm-article-meta`
   - Files: `src/styles/global.css`, `src/templates/article.tsx`

7. **Tags Section Spacing**
   - Issue: HR between tags and navigation; HR between title and author info
   - Fix: Removed HRs, used `margin-top` spacing only
   - Files: `src/styles/global.css`

### Image Updates

- Replaced placeholder images with real Unsplash photos
- Files: All `src/data/articles/*.json`, `src/data/authors.json`

### Technical Improvements

- Fixed GraphQL query errors (changed from `articlesJson` singular to `allArticlesJson` with proper filter/sort)
- Added `publishedAt` context to page creation in `gatsby-node.ts`
- Ensured dark mode consistency across all components
- Verified responsive behavior on mobile, tablet, and desktop
