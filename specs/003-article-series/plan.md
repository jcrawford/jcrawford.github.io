# Implementation Plan: Article Series Navigation

**Branch**: `003-article-series` | **Date**: 2025-11-13 | **Spec**: [spec.md](./spec.md)  
**Input**: Feature specification from `/specs/003-article-series/spec.md`

## Summary

This feature enables articles to be grouped into navigable series with table of contents, sticky sidebar widgets on desktop, previous/next navigation buttons, external references, and downloadable attachments. Articles in a series share a common `series.name` in frontmatter and are linked via optional `prev`/`next` fields. The series widget displays in the sidebar on desktop (≥768px) with sticky positioning, and below article content on mobile (<768px) without sticky behavior. The implementation adds a `SeriesWidget` component, extends the article frontmatter schema to include optional series metadata (name, order, prev, next, references, attachments), updates GraphQL queries to fetch series data, and implements responsive positioning with smooth scrolling performance.

## Technical Context

**Language/Version**: TypeScript 5.3.3, React 18.3.0, Gatsby 5.13.0  
**Primary Dependencies**: No new dependencies required - using existing Gatsby, React, and TypeScript stack  
**Storage**: File system - series metadata in article frontmatter (content/posts/*.md)  
**Testing**: Manual testing - verify series navigation, sticky behavior, responsive layout, prev/next buttons  
**Target Platform**: Static site - built to HTML/CSS/JS, deployed to GitHub Pages  
**Project Type**: Web application (Gatsby static site generator)  
**Performance Goals**: Series widget renders within 100ms, sticky behavior performs smoothly at 60fps, no layout shift on load  
**Constraints**: Series metadata is optional (backward compatible with existing articles), exact series name matching required (case-sensitive), no external APIs or databases  
**Scale/Scope**: Support 2-20 articles per series, 0-20 references per article, 0-10 attachments per article, unlimited total series

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### ✅ P1: TypeScript-First Development
**Status**: PASS - All new components and types will use TypeScript with proper interfaces

### ✅ P2: Strict Type Safety
**Status**: PASS - Will define strict TypeScript interfaces for series metadata, no `any` types

### ✅ P3: Best Practices Compliance
**Status**: PASS - Using Gatsby frontmatter patterns, React hooks best practices, CSS-based sticky positioning

### ✅ P4: Latest Dependency Versions
**Status**: PASS - No new dependencies required, using existing stack at latest versions

### ✅ P5: Theme-Based Architecture
**Status**: PASS - Series widget will integrate seamlessly with existing sidebar widget architecture

### ✅ P6: No Utility Libraries
**Status**: PASS - Will use native JavaScript/TypeScript for data manipulation and component logic

### ✅ P7: Date Handling with dayjs
**Status**: PASS - Existing date utilities remain unchanged, no date manipulation needed for series

### ✅ P8: Native Fetch for HTTP Requests
**Status**: N/A - No HTTP requests involved (static site generation)

### ✅ P9: Static Site Generation
**Status**: PASS - All series logic processed at build time, zero client-side data fetching

### ✅ P10: No Unit Testing Required
**Status**: PASS - Will use manual testing to verify series navigation and responsive behavior

### ✅ P11: Minimal Code Comments
**Status**: PASS - Components will have minimal comments, no FR-XXX identifiers in code

**Overall Gate Status**: ✅ PASS - All applicable principles satisfied, no violations to justify

## Project Structure

### Documentation (this feature)

```text
specs/003-article-series/
├── plan.md                     # This file
├── research.md                 # Technical decisions for series implementation
├── data-model.md               # Series metadata schema (already created)
├── quickstart.md               # Guide for creating series (already created)
├── contracts/
│   └── series-metadata-schema.md   # Series field validation (already created)
└── checklists/
    └── requirements.md         # Specification quality checklist (already created)
```

### Source Code (repository root)

```text
# New Components
src/
├── components/
│   ├── SeriesWidget.tsx           # NEW: Main series widget component
│   ├── SeriesPrevNext.tsx         # NEW: Prev/next navigation buttons
│   └── Sidebar.tsx                # UPDATE: Conditionally show SeriesWidget
├── templates/
│   └── article.tsx                # UPDATE: Add series data to context, render SeriesPrevNext
├── types/
│   └── index.ts                   # UPDATE: Add SeriesMetadata interface
└── styles/
    ├── series-widget.css          # NEW: Series widget styling
    └── series-navigation.css      # NEW: Prev/next button styling

# Updated Gatsby Files
gatsby-node.ts                     # UPDATE: Series validation during build
```

**Structure Decision**: Adding two new React components (`SeriesWidget`, `SeriesPrevNext`) following existing component patterns. Series metadata will be part of article frontmatter (no database or separate files). CSS modules for component-specific styling to avoid conflicts.

## Complexity Tracking

> No violations - this section is not needed.

---

## Phase 0: Research & Technical Decisions

### Research Tasks

1. **R1: Sticky Positioning Implementation**
   - Question: What's the best approach for sticky sidebar widgets in Gatsby/React?
   - CSS solution: `position: sticky` with proper parent/child structure
   - JS fallback: IntersectionObserver for older browsers (if needed)
   - Desktop-only: Apply sticky behavior only on ≥768px viewports

2. **R2: Series Article Grouping Algorithm**
   - Question: How to efficiently query and group articles by series name?
   - GraphQL approach: Query all articles with series metadata
   - Sorting logic: Use `series.order` if present, fallback to `publishedAt` ascending
   - Performance: All grouping happens at build time (no runtime overhead)

3. **R3: Responsive Layout Strategy**
   - Question: How to handle series widget on mobile vs desktop?
   - Desktop (≥768px): Sidebar with sticky positioning
   - Mobile (<768px): Below article content, static positioning
   - CSS approach: Media queries with flexbox/grid for reordering

4. **R4: Frontmatter Schema Extension**
   - Question: How to extend existing article frontmatter without breaking changes?
   - Approach: Add optional `series` object to frontmatter
   - Validation: Build-time validation with clear error messages
   - Backward compatibility: Existing articles without series continue to work

5. **R5: Build-Time Validation Strategy**
   - Question: How to validate series metadata during Gatsby build?
   - Approach: Extend `gatsby-node.ts` to validate series references
   - Checks: Circular references, broken prev/next links, missing series names
   - Error handling: Fail build with descriptive messages for critical errors

### Research Output → research.md

*To be generated in Phase 0*

---

## Phase 1: Design Artifacts

### Phase 1.1: Data Model

**Output**: Already created - `data-model.md`

**Existing Content**:
- Series metadata schema with field definitions
- Entity relationships (Series → Articles, Article → References/Attachments)
- Table of contents generation algorithm
- Validation rules and examples
- Complete 4-article series example

**Validation**: ✅ Comprehensive and complete

### Phase 1.2: Contracts

**Output**: Already created - `contracts/series-metadata-schema.md`

**Existing Content**:
- Complete series metadata contract with validation rules
- Field-by-field specifications (series.name, series.order, series.prev, series.next, etc.)
- Reference and attachment schemas
- Error messages for validation failures
- Testing compliance checklist

**Validation**: ✅ Comprehensive and complete

### Phase 1.3: Quick Start Guide

**Output**: Already created - `quickstart.md`

**Existing Content**:
- Quick example of series frontmatter
- Step-by-step series creation guide
- Adding references and attachments
- Important rules and validation notes
- Minimal and complete examples

**Validation**: ✅ Comprehensive and complete

---

## Phase 2: Task Planning

*Phase 2 is handled by `/speckit.tasks` command - not generated by this plan*

**Inputs for task generation**:
- All Phase 0-1 artifacts above
- Constitution constraints
- Feature spec requirements and user stories
- Clarification decisions from spec

**Expected task categories**:
1. **Setup & Types** (TypeScript interfaces for series metadata)
2. **Core Components** (SeriesWidget, SeriesPrevNext components)
3. **GraphQL Queries** (Update article template query for series data)
4. **Build Validation** (gatsby-node.ts series validation logic)
5. **Styling** (Desktop sticky behavior, mobile layout, responsive design)
6. **Integration** (Wire up components in article template and sidebar)
7. **Testing** (Manual testing of all user scenarios)
8. **Documentation** (Update content author guide with series examples)

---

## Dependencies

**External**:
- None - using existing Gatsby, React, TypeScript stack

**Internal**:
- Existing article frontmatter schema (will be extended)
- Existing Sidebar component (will be enhanced)
- Existing article template (will be updated)
- Existing GraphQL queries (will be extended)
- Existing CSS/styling system (will be extended)

**Blockers**:
- None - all required infrastructure exists

---

## Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|------------|
| Sticky positioning browser compatibility | LOW | CSS `position: sticky` supported in all modern browsers, graceful degradation for older browsers |
| Performance with long series (20+ articles) | LOW | Table of contents is pre-rendered at build time, minimal runtime overhead |
| Layout shift on page load (CLS) | MEDIUM | Pre-allocate widget space with CSS, avoid dynamic height changes |
| Series name typos causing broken navigation | MEDIUM | Build-time validation catches broken references, clear error messages guide fixes |
| Circular references in prev/next chain | LOW | Build-time validation detects and reports circular references |
| Mobile UX with widget below content | LOW | Prev/next buttons at top provide quick navigation without scrolling |

---

## Success Validation

Before marking feature complete, verify:

### Functional Requirements

1. ✅ Series widget displays on article pages with series metadata
2. ✅ Table of contents shows all articles in correct order (series.order → publishedAt)
3. ✅ Current article is non-clickable in TOC
4. ✅ Other articles are clickable links in TOC
5. ✅ Series name displays as plain text (non-clickable)
6. ✅ Prev/next buttons appear at top and bottom of article content
7. ✅ First article hides Previous button
8. ✅ Last article hides Next button
9. ✅ References section displays when metadata present
10. ✅ Attachments section displays when metadata present

### Responsive Behavior

11. ✅ Desktop (≥768px): Series widget in sidebar with sticky behavior
12. ✅ Mobile (<768px): Series widget below content without sticky behavior
13. ✅ Sticky widget returns to normal position when scrolling up (desktop)
14. ✅ Long series (20+ articles) remains scrollable without layout issues

### Build Validation

15. ✅ Build succeeds with series metadata present
16. ✅ Build fails with clear error for missing series.name
17. ✅ Build fails with clear error for broken prev/next references
18. ✅ Build fails with clear error for circular references
19. ✅ Build warns for large attachments (>50MB)

### Performance

20. ✅ Series widget renders within 100ms of page load
21. ✅ No layout shift (CLS) when widget loads
22. ✅ Smooth scrolling with sticky behavior (60fps)
23. ✅ Build time remains acceptable (no significant increase)

---

## Implementation Phases

### Phase 0: Research & Planning
- Generate research.md with technical decisions
- Finalize sticky positioning approach
- Document series grouping algorithm
- Plan responsive layout strategy

### Phase 1: Type Definitions & Data Model
- Define SeriesMetadata TypeScript interface
- Define Reference and Attachment interfaces  
- Update article query types
- Document validation rules

### Phase 2: Build Validation
- Implement series metadata validation in gatsby-node.ts
- Add circular reference detection
- Add broken link detection
- Implement descriptive error messages

### Phase 3: Core Components
- Create SeriesWidget component
  - Table of contents rendering
  - References section
  - Attachments section
- Create SeriesPrevNext component
  - Previous button (top and bottom)
  - Next button (top and bottom)
  - Conditional rendering logic

### Phase 4: Styling & Responsiveness
- Create series-widget.css
  - Desktop sidebar styling
  - Sticky positioning (≥768px)
  - Mobile below-content styling (<768px)
- Create series-navigation.css
  - Prev/next button styling
  - Hover states and accessibility

### Phase 5: Integration
- Update article template GraphQL query
- Integrate SeriesWidget into article template
- Integrate SeriesPrevNext at top and bottom
- Update Sidebar to conditionally show SeriesWidget

### Phase 6: Testing & Validation
- Test with single-article series
- Test with 3-article series (beginning, middle, end)
- Test with 20-article series (long series)
- Test references and attachments
- Test responsive behavior (desktop and mobile)
- Test sticky positioning on desktop
- Test browser compatibility

### Phase 7: Documentation
- Update author guide with series examples
- Document series creation workflow
- Provide troubleshooting guide

---

## GraphQL Query Extensions

### Article Template Query (Before)

```graphql
query ArticleBySlug($slug: String!) {
  markdownRemark(frontmatter: { slug: { eq: $slug } }) {
    html
    frontmatter {
      slug
      title
      excerpt
      featuredImage
      category
      tags
      author
      publishedAt
      updatedAt
    }
  }
}
```

### Article Template Query (After)

```graphql
query ArticleBySlug($slug: String!) {
  markdownRemark(frontmatter: { slug: { eq: $slug } }) {
    html
    frontmatter {
      slug
      title
      excerpt
      featuredImage
      category
      tags
      author
      publishedAt
      updatedAt
      series {
        name
        order
        prev
        next
        references {
          url
          title
        }
        attachments {
          filename
          title
        }
      }
    }
  }
  # Query all articles in the same series
  seriesArticles: allMarkdownRemark(
    filter: {
      frontmatter: {
        series: { name: { eq: $seriesName } }
      }
    }
    sort: [
      { frontmatter___series___order: ASC }
      { frontmatter___publishedAt: ASC }
    ]
  ) {
    nodes {
      frontmatter {
        slug
        title
        series {
          order
        }
        publishedAt
      }
    }
  }
}
```

**Note**: The `$seriesName` variable will need to be passed from the article's series.name field.

---

## Component Architecture

### SeriesWidget Component

**Purpose**: Display series table of contents, references, and attachments

**Props**:
```typescript
interface SeriesWidgetProps {
  seriesName: string;
  currentArticleSlug: string;
  seriesArticles: SeriesArticle[];
  references?: SeriesReference[];
  attachments?: SeriesAttachment[];
}
```

**Structure**:
- Header with series name (plain text)
- Table of contents (numbered list)
- References section (conditional)
- Attachments section (conditional)

**Styling**:
- Desktop: Sticky positioning in sidebar
- Mobile: Static positioning below content
- Responsive breakpoint: 768px

### SeriesPrevNext Component

**Purpose**: Display previous/next navigation buttons

**Props**:
```typescript
interface SeriesPrevNextProps {
  prevArticle?: {
    slug: string;
    title: string;
  };
  nextArticle?: {
    slug: string;
    title: string;
  };
  position: 'top' | 'bottom';
}
```

**Structure**:
- Previous button (left side, conditional)
- Next button (right side, conditional)
- Flexbox layout for alignment

**Behavior**:
- Hide Previous if not provided
- Hide Next if not provided
- Render at both top and bottom positions

---

## Styling Approach

### Desktop Layout (≥768px)

```css
.article-layout {
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 2rem;
}

.series-widget {
  position: sticky;
  top: 20px;
  max-height: calc(100vh - 40px);
  overflow-y: auto;
}
```

### Mobile Layout (<768px)

```css
@media (max-width: 767px) {
  .article-layout {
    display: block;
  }
  
  .series-widget {
    position: static;
    margin-top: 2rem;
  }
}
```

### Sticky Behavior

- CSS `position: sticky` for modern browsers
- `top: 20px` offset for visual breathing room
- `max-height: calc(100vh - 40px)` prevents overflow
- `overflow-y: auto` for long series (scrollable widget)

---

## Build Validation Logic

### Validation Steps (gatsby-node.ts)

1. **Extract all articles with series metadata**
   - Query all markdownRemark nodes
   - Filter for articles with `frontmatter.series` defined

2. **Validate series.name**
   - Error if series object exists but name is missing
   - Error if name is less than 3 characters
   - Error if name exceeds 60 characters

3. **Validate prev/next references**
   - Error if prev/next references non-existent article
   - Error if circular reference detected (A → B → A)
   - Error if article references itself

4. **Validate references**
   - Warn if reference URL is malformed
   - Skip invalid references (non-blocking)

5. **Validate attachments**
   - Error if attachment file doesn't exist
   - Warn if attachment file is very large (>50MB)

6. **Report validation results**
   - Clear error messages with article slugs and field names
   - Fail build on critical errors
   - Log warnings for non-critical issues

---

## Testing Checklist

### User Story 1: Series Metadata Declaration
- [ ] Article without series displays no widget
- [ ] Article with series displays widget
- [ ] Invalid series metadata fails build with clear error
- [ ] Build succeeds with valid series metadata

### User Story 2: Series Table of Contents Display
- [ ] Series name displays prominently
- [ ] All articles in series appear in TOC
- [ ] Current article is non-clickable
- [ ] Other articles are clickable links
- [ ] Articles numbered sequentially (1, 2, 3...)

### User Story 3: Sticky Sidebar Behavior (Desktop)
- [ ] Widget starts in normal sidebar position
- [ ] Widget becomes sticky when reaching viewport top
- [ ] Widget returns to normal when scrolling up
- [ ] Long series remains scrollable
- [ ] Mobile (<768px) shows no sticky behavior

### User Story 4: Series References Display
- [ ] References section appears when metadata present
- [ ] References numbered sequentially
- [ ] Reference links open in new tabs
- [ ] No references section when metadata absent

### User Story 5: Series Attachments Display
- [ ] Attachments section appears when metadata present
- [ ] Attachments numbered sequentially
- [ ] Attachment links download files
- [ ] No attachments section when metadata absent

### User Story 6: Previous/Next Article Navigation
- [ ] Previous button at top and bottom (when available)
- [ ] Next button at top and bottom (when available)
- [ ] First article hides Previous button
- [ ] Last article hides Next button
- [ ] Buttons navigate to correct articles

### Responsive Behavior
- [ ] Desktop (≥768px): Widget in sidebar with sticky
- [ ] Mobile (<768px): Widget below content without sticky
- [ ] Layout doesn't break on narrow viewports (320px)
- [ ] No horizontal scrolling on mobile

### Performance
- [ ] Widget renders within 100ms
- [ ] No layout shift on load
- [ ] Smooth scrolling with sticky behavior
- [ ] Build time remains acceptable

---

## Next Steps

1. ✅ Phase 0 complete: Generate `research.md` with technical decisions
2. Execute Phase 1-7: Implement components, styling, validation
3. Run `/speckit.tasks` to generate detailed implementation tasks
4. Begin implementation following task sequence
5. Manual testing against all acceptance criteria
6. Update documentation with series examples

