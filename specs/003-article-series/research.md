# Technical Research: Article Series Navigation

**Feature**: Article Series Navigation  
**Date**: 2025-11-13  
**Status**: Complete

## Overview

This document consolidates all technical decisions and research findings for implementing article series navigation in the Gatsby blog site. The feature adds series grouping, sticky sidebar widgets, previous/next navigation, and support for references and attachments.

---

## R1: Sticky Positioning Implementation

### Decision

Use CSS `position: sticky` with responsive behavior:

**Desktop (≥768px)**:
```css
.series-widget {
  position: sticky;
  top: 20px;
  max-height: calc(100vh - 40px);
  overflow-y: auto;
}
```

**Mobile (<768px)**:
```css
@media (max-width: 767px) {
  .series-widget {
    position: static;
    margin-top: 2rem;
  }
}
```

### Rationale

- **CSS-first approach**: `position: sticky` is well-supported in all modern browsers (Chrome 56+, Firefox 59+, Safari 13+, Edge 16+)
- **No JavaScript required**: Pure CSS solution performs better and is more maintainable
- **Responsive strategy**: Apply sticky only on desktop where sidebar layout makes sense
- **Mobile simplification**: Static positioning on mobile avoids complexity and works naturally with content-first layout
- **Overflow handling**: `max-height` and `overflow-y: auto` ensure long series remain usable without breaking layout
- **Visual offset**: `top: 20px` provides breathing room from viewport edge

### Alternatives Considered

- **JavaScript-based sticky** (Intersection Observer): Rejected because CSS solution is simpler and performs better
- **Fixed positioning**: Rejected because it removes element from flow and causes layout issues
- **Scroll event listener**: Rejected due to performance concerns (60fps requirement) and unnecessary complexity

### Browser Compatibility

| Browser | Version | Support |
|---------|---------|---------|
| Chrome | 56+ | ✅ Full support |
| Firefox | 59+ | ✅ Full support |
| Safari | 13+ | ✅ Full support |
| Edge | 16+ | ✅ Full support |

**Graceful degradation**: Older browsers display widget in normal position (non-sticky), which is acceptable fallback.

---

## R2: Series Article Grouping Algorithm

### Decision

Implement two-tier sorting at build time:

1. **Primary sort**: Use `series.order` field (numeric) if present
2. **Fallback sort**: Use `publishedAt` date (ascending) if no order field

**GraphQL Query**:
```graphql
allMarkdownRemark(
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
```

### Rationale

- **Explicit control**: Authors can manually specify article order when chronology doesn't match reading sequence
- **Sensible default**: Published date provides automatic ordering when no manual ordering needed
- **Build-time processing**: All grouping and sorting happens during Gatsby build (zero runtime overhead)
- **GraphQL optimization**: Gatsby's GraphQL layer handles sorting efficiently
- **Type safety**: TypeScript ensures `order` field is optional number, preventing type errors

### Implementation Details

**Sorting Logic**:
```typescript
// Gatsby automatically handles multi-field sorting
// Articles with series.order defined sort first (by order ascending)
// Articles without series.order sort by publishedAt ascending
// This gives clean precedence without complex conditionals
```

**Edge Cases**:
- Two articles with same `series.order`: Fall back to `publishedAt`
- Missing `series.order`: Treated as undefined, sorts by `publishedAt`
- Duplicate series names: Treated as separate series (case-sensitive matching)

### Performance

- **Build time**: O(n log n) for sorting (Gatsby's GraphQL layer)
- **Runtime**: Zero - all sorting pre-computed at build time
- **Memory**: Minimal - only storing sorted slug/title arrays

### Alternatives Considered

- **Only published date**: Rejected because doesn't allow manual ordering for non-chronological series
- **Only manual order**: Rejected because requires extra work for all articles (not backward compatible)
- **Client-side sorting**: Rejected due to performance concerns and unnecessary JavaScript

---

## R3: Responsive Layout Strategy

### Decision

Use CSS media queries with different positioning strategies:

**Desktop Layout (≥768px)**:
```css
.article-container {
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 2rem;
}

.article-content {
  grid-column: 1;
}

.sidebar-with-series {
  grid-column: 2;
}
```

**Mobile Layout (<768px)**:
```css
@media (max-width: 767px) {
  .article-container {
    display: block;
  }
  
  .series-widget {
    order: 2; /* Appears after article content */
    margin-top: 2rem;
  }
}
```

### Rationale

- **Breakpoint choice (768px)**: Standard tablet/desktop breakpoint, matches existing site responsive design
- **Grid on desktop**: Provides clean two-column layout with sidebar
- **Block on mobile**: Simplified single-column layout prioritizes content readability
- **Content-first mobile**: Article content appears before series widget, allowing readers to start reading immediately
- **Prev/next buttons**: Provide quick navigation on mobile without needing to scroll to widget
- **Performance**: CSS-only solution, no JavaScript layout calculations

### Mobile UX Considerations

- **Why below content**: Series table of contents can be long (20 articles), pushing content far down would hurt reading experience
- **Navigation still accessible**: Top prev/next buttons provide quick access to adjacent articles
- **Widget still valuable**: After finishing article, readers naturally encounter series widget for broader navigation

### Alternatives Considered

- **Above content on mobile**: Rejected because pushes article content down, hurting initial reading experience
- **Collapsible accordion**: Rejected because adds complexity and requires JavaScript
- **Floating overlay**: Rejected because intrusive and covers content
- **Hidden with toggle button**: Rejected because reduces discoverability

---

## R4: Frontmatter Schema Extension

### Decision

Add optional `series` object to existing article frontmatter:

```yaml
---
# Existing required fields (unchanged)
slug: "article-slug"
title: "Article Title"
excerpt: "Article excerpt"
featuredImage: "https://..."
category: "category-slug"
tags: ["tag1", "tag2"]
author: "author-slug"
publishedAt: "2024-01-01T10:00:00.000Z"
updatedAt: "2024-01-01T10:00:00.000Z"

# New optional series object
series:
  name: "Series Name"           # Required if series object exists
  order: 2                      # Optional numeric position
  prev: "/articles/article-1"   # Optional previous article path
  next: "/articles/article-3"   # Optional next article path
  references:                   # Optional array
    - url: "https://example.com"
      title: "Resource Title"
  attachments:                  # Optional array
    - filename: "/downloads/file.zip"
      title: "Download Title"
---
```

### Rationale

- **Backward compatibility**: Existing articles without `series` continue to work unchanged
- **Optional by design**: Series is opt-in feature, doesn't affect existing content
- **Nested structure**: Groups all series-related fields under single `series` object (clean organization)
- **Gatsby transformer**: `gatsby-transformer-remark` automatically parses nested YAML objects
- **Type safety**: TypeScript interfaces enforce correct structure

### Type Definitions

```typescript
interface SeriesMetadata {
  name: string;                    // Required
  order?: number;                  // Optional
  prev?: string;                   // Optional
  next?: string;                   // Optional
  references?: SeriesReference[];  // Optional
  attachments?: SeriesAttachment[]; // Optional
}

interface SeriesReference {
  url: string;
  title?: string;
}

interface SeriesAttachment {
  filename: string;
  title?: string;
}

interface ArticleFrontmatter {
  // ... existing fields ...
  series?: SeriesMetadata;         // Optional
}
```

### Validation Strategy

**Build-time validation** (gatsby-node.ts):
- If `series` exists, `name` must be present
- If `prev`/`next` provided, referenced articles must exist
- No circular references allowed
- Series name must be 3-60 characters
- Validate reference URLs are well-formed
- Check attachment files exist

### Migration Path

**No migration needed** - feature is fully additive:
1. Deploy feature with no series metadata (nothing changes)
2. Authors add series metadata to articles over time
3. Each article with series automatically gets navigation

### Alternatives Considered

- **Separate series.json file**: Rejected because centralizes data away from articles, harder to maintain
- **Top-level fields (no nesting)**: Rejected because pollutes article frontmatter namespace
- **Custom GraphQL plugin**: Rejected because adds unnecessary complexity

---

## R5: Build-Time Validation Strategy

### Decision

Implement comprehensive validation in `gatsby-node.ts` during `createPages` lifecycle:

**Validation Steps**:

1. **Extract series articles**
```typescript
const seriesArticles = articles.filter(article => 
  article.frontmatter.series !== undefined
);
```

2. **Validate series.name**
```typescript
seriesArticles.forEach(article => {
  if (!article.frontmatter.series.name) {
    throw new Error(`Missing series.name in article: ${article.frontmatter.slug}`);
  }
  if (article.frontmatter.series.name.length < 3) {
    throw new Error(`series.name too short in article: ${article.frontmatter.slug}`);
  }
});
```

3. **Build article lookup map**
```typescript
const articleMap = new Map(
  articles.map(a => [a.frontmatter.slug, a])
);
```

4. **Validate prev/next references**
```typescript
seriesArticles.forEach(article => {
  const { prev, next } = article.frontmatter.series;
  
  if (prev && !articleMap.has(extractSlug(prev))) {
    throw new Error(`Invalid series.prev in ${article.frontmatter.slug}: ${prev} not found`);
  }
  
  if (next && !articleMap.has(extractSlug(next))) {
    throw new Error(`Invalid series.next in ${article.frontmatter.slug}: ${next} not found`);
  }
});
```

5. **Detect circular references**
```typescript
function detectCircularReference(startSlug: string, visited = new Set()): boolean {
  if (visited.has(startSlug)) return true;
  visited.add(startSlug);
  
  const article = articleMap.get(startSlug);
  const nextSlug = extractSlug(article?.frontmatter.series?.next);
  
  if (nextSlug) {
    return detectCircularReference(nextSlug, visited);
  }
  
  return false;
}
```

6. **Validate attachments**
```typescript
import fs from 'fs';
import path from 'path';

seriesArticles.forEach(article => {
  article.frontmatter.series.attachments?.forEach(attachment => {
    const filePath = path.join(__dirname, 'public', attachment.filename);
    if (!fs.existsSync(filePath)) {
      throw new Error(`Attachment not found: ${attachment.filename} in ${article.frontmatter.slug}`);
    }
    
    const stats = fs.statSync(filePath);
    if (stats.size > 50 * 1024 * 1024) {
      console.warn(`Warning: Large attachment (${stats.size} bytes) in ${article.frontmatter.slug}: ${attachment.filename}`);
    }
  });
});
```

### Rationale

- **Fail fast**: Build fails immediately on critical errors, preventing broken deployments
- **Clear errors**: Error messages include article slug and specific field causing issue
- **Warnings vs errors**: Non-critical issues (large files) log warnings but don't fail build
- **Performance**: Validation runs once during build (zero runtime overhead)
- **Safety net**: Catches author mistakes before they reach production

### Error Message Examples

**Missing series name**:
```
Error: Missing series.name in article: getting-started-gatsby
```

**Broken prev reference**:
```
Error: Invalid series.prev in getting-started-gatsby: /articles/nonexistent not found
```

**Circular reference**:
```
Error: Circular reference detected in series navigation starting from: article-1
Chain: article-1 → article-2 → article-1
```

**Attachment not found**:
```
Error: Attachment not found: /downloads/missing.zip in getting-started-gatsby
```

### Alternatives Considered

- **Runtime validation**: Rejected because errors would only appear after deployment
- **Optional validation (warnings only)**: Rejected because broken links hurt user experience
- **External validation script**: Rejected because build-time validation is more integrated

---

## R6: Component Architecture Patterns

### Decision

Create two focused React components following existing component patterns:

**1. SeriesWidget Component**

**Purpose**: Display series information in sidebar/below content

**Responsibilities**:
- Render series header with name
- Render table of contents with article links
- Render references section (conditional)
- Render attachments section (conditional)
- Handle current article highlighting

**Props Interface**:
```typescript
interface SeriesWidgetProps {
  seriesName: string;
  currentArticleSlug: string;
  seriesArticles: Array<{
    slug: string;
    title: string;
    order?: number;
    publishedAt: string;
  }>;
  references?: Array<{
    url: string;
    title?: string;
  }>;
  attachments?: Array<{
    filename: string;
    title?: string;
  }>;
}
```

**2. SeriesPrevNext Component**

**Purpose**: Display previous/next navigation buttons

**Responsibilities**:
- Render Previous button (conditional)
- Render Next button (conditional)
- Handle button positioning (top vs bottom)

**Props Interface**:
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

### Rationale

- **Single responsibility**: Each component has one clear purpose
- **Reusability**: SeriesPrevNext used at top and bottom with different `position` prop
- **Type safety**: Strict TypeScript interfaces prevent prop errors
- **Gatsby patterns**: Follows existing component structure (see Sidebar.tsx, ArticleCard.tsx)
- **Optional props**: Use optional types (?) for conditional rendering (references, attachments, prev/next)

### Component Integration

**Article Template (article.tsx)**:
```typescript
<article>
  <SeriesPrevNext position="top" {...seriesNavigation} />
  
  <div className="article-content">
    {/* Article HTML */}
  </div>
  
  <SeriesPrevNext position="bottom" {...seriesNavigation} />
</article>

<Sidebar>
  {/* Existing sidebar widgets */}
  {series && (
    <SeriesWidget
      seriesName={series.name}
      currentArticleSlug={slug}
      seriesArticles={seriesArticles}
      references={series.references}
      attachments={series.attachments}
    />
  )}
</Sidebar>
```

### Styling Strategy

**Component-specific CSS files**:
- `series-widget.css` - SeriesWidget styling
- `series-navigation.css` - SeriesPrevNext styling

**CSS naming convention** (BEM-style):
```css
/* SeriesWidget */
.series-widget { }
.series-widget__header { }
.series-widget__toc { }
.series-widget__toc-item { }
.series-widget__toc-item--current { }
.series-widget__references { }
.series-widget__attachments { }

/* SeriesPrevNext */
.series-navigation { }
.series-navigation--top { }
.series-navigation--bottom { }
.series-navigation__prev { }
.series-navigation__next { }
```

### Alternatives Considered

- **Single monolithic component**: Rejected because mixing concerns (widget + navigation buttons)
- **Inline styles**: Rejected because CSS provides better maintainability and performance
- **CSS-in-JS (styled-components)**: Rejected because project uses CSS files (no new dependencies per P6)

---

## Technology Stack Summary

### Dependencies (No new packages required)

**Existing packages** (used):
- React 18.3.0 - Component framework
- TypeScript 5.3.3 - Type safety
- Gatsby 5.13.0 - Static site generator
- gatsby-transformer-remark 6.15.0 - Markdown processing

**No new dependencies needed** - Feature built entirely with existing stack

### File Structure

```
src/
├── components/
│   ├── SeriesWidget.tsx           # NEW
│   ├── SeriesPrevNext.tsx         # NEW
│   └── Sidebar.tsx                # MODIFIED
├── templates/
│   └── article.tsx                # MODIFIED
├── types/
│   └── index.ts                   # MODIFIED (add series types)
└── styles/
    ├── series-widget.css          # NEW
    └── series-navigation.css      # NEW

gatsby-node.ts                     # MODIFIED (add validation)
```

### Build Pipeline

**No changes to build process**:
1. Markdown files with series frontmatter processed by gatsby-transformer-remark (existing)
2. GraphQL queries extended to fetch series data (standard Gatsby pattern)
3. Validation added to createPages lifecycle (standard gatsby-node.ts pattern)
4. Static HTML/CSS/JS generated (existing build output)

---

## Performance Considerations

### Build Time Impact

**Expected increase**: <1 second
- Series validation: O(n) where n = number of articles with series
- Additional GraphQL queries: Minimal (Gatsby caching)
- No external API calls or network requests

**Optimization**:
- Validation runs once during build
- GraphQL queries leverage Gatsby's built-in optimization
- No build-time image processing or heavy computation

### Runtime Performance

**Page Load**:
- Series widget HTML pre-rendered (static)
- No JavaScript data fetching required
- CSS loaded with rest of site styles

**Rendering**:
- React components are simple (no expensive operations)
- Table of contents is plain HTML list (fast rendering)
- No animations or transitions (60fps requirement easily met)

**Sticky Behavior**:
- Pure CSS (no JavaScript overhead)
- Browser-native sticky positioning (hardware accelerated)
- No scroll event listeners (eliminates main thread work)

### Memory Usage

**Minimal impact**:
- Series metadata stored in GraphQL layer (Gatsby's responsibility)
- Component state is minimal (only current article slug)
- No large data structures or caching in JavaScript

---

## Accessibility Considerations

### Keyboard Navigation

**Requirements**:
- All article links in TOC must be keyboard accessible (tab navigation)
- Prev/next buttons must be focusable and activatable via keyboard
- Skip links should allow bypassing series widget

**Implementation**:
```tsx
// Standard anchor tags provide keyboard accessibility
<Link to={`/articles/${article.slug}`} tabIndex={0}>
  {article.title}
</Link>
```

### Screen Readers

**Requirements**:
- Series structure should be announced clearly
- Current article should be identified
- Navigation buttons should have descriptive labels

**Implementation**:
```tsx
<nav aria-label="Series navigation">
  <h4 id="series-toc">Table of Contents</h4>
  <ol aria-labelledby="series-toc">
    <li>
      <span aria-current={isCurrent ? "page" : undefined}>
        {article.title}
      </span>
    </li>
  </ol>
</nav>

<Link 
  to={prevArticle.slug}
  aria-label={`Previous: ${prevArticle.title}`}
>
  Previous
</Link>
```

### Visual Accessibility

**Requirements**:
- Sufficient color contrast for all text
- Focus indicators for all interactive elements
- No color-only indicators (use text/icons)

**Implementation**:
- Follow existing site color palette (already accessible)
- Add `:focus` styles matching site patterns
- Current article uses text indicator (non-clickable) not just color

---

## SEO Considerations

### Structured Data

**Recommendation**: Add schema.org structured data for series relationships

**Implementation** (article template):
```tsx
<script type="application/ld+json">
{JSON.stringify({
  "@context": "https://schema.org",
  "@type": "Article",
  "name": title,
  "isPartOf": {
    "@type": "Series",
    "name": series.name
  },
  "position": seriesArticles.findIndex(a => a.slug === slug) + 1
})}
</script>
```

**Benefits**:
- Search engines understand series relationships
- Potential for series breadcrumbs in search results
- Improved semantic understanding of content structure

### Internal Linking

**SEO value**:
- Series TOC creates strong internal linking structure
- Prev/next links improve crawlability
- Related content signals boost topical authority

**Best practices**:
- Use descriptive anchor text (article titles)
- Ensure all links are crawlable (no JavaScript-only navigation)
- Maintain consistent URL structure (/articles/[slug])

---

## Browser Compatibility

### Sticky Positioning

| Feature | Requirement | Support |
|---------|-------------|---------|
| `position: sticky` | Required | Chrome 56+, Firefox 59+, Safari 13+, Edge 16+ |
| CSS Grid | Required | Chrome 57+, Firefox 52+, Safari 10.1+, Edge 16+ |
| Flexbox | Required | All modern browsers |

**Graceful degradation**:
- Older browsers: Widget displays in normal position (non-sticky)
- No JavaScript fallback needed (feature is enhancement, not requirement)

### JavaScript Features

**ES6+ features used**:
- Optional chaining (`?.`) - TypeScript transpiles to compatible code
- Array methods (`filter`, `map`, `find`) - Supported in all modern browsers
- Template literals - Supported in all modern browsers

**Transpilation**: TypeScript → ES5 (Gatsby default) ensures broad compatibility

---

## Security Considerations

### External References

**Risk**: Series references may link to malicious external sites

**Mitigation**:
```tsx
<a 
  href={reference.url}
  target="_blank"
  rel="noopener noreferrer"  // Prevents window.opener access
>
  {reference.title}
</a>
```

### Attachment Downloads

**Risk**: Malicious files could be linked as attachments

**Mitigation**:
- Attachments stored in public directory (not user-uploaded)
- Build-time validation ensures files exist (no arbitrary URLs)
- Content authors are trusted (not public contributions)

### XSS Prevention

**Protection**:
- React auto-escapes all text content (series name, article titles)
- No `dangerouslySetInnerHTML` used in series components
- All URLs validated during build

---

## Documentation Requirements

### For Content Authors

**Topics to document**:
1. How to add series metadata to articles
2. Series naming conventions (exact match required)
3. Using `series.order` vs `publishedAt` ordering
4. Adding references with titles
5. Adding attachments (file paths and titles)
6. Troubleshooting validation errors

**Location**: Update existing content authoring guide

### For Developers

**Topics to document**:
1. SeriesWidget component API
2. SeriesPrevNext component API
3. Build validation logic
4. Extending series functionality
5. Debugging series-related issues

**Location**: Add to component documentation (inline JSDoc)

---

## Future Enhancements (Out of Scope)

Potential future improvements identified during research:

1. **Series Landing Pages**: Dedicated page for each series with overview and full article list
2. **Progress Tracking**: LocalStorage-based tracking of which articles in series have been read
3. **Reading Time Estimates**: Calculate and display time to complete entire series
4. **Series RSS Feeds**: Subscribe to specific series for updates
5. **Cross-Series Recommendations**: Suggest related series based on tags/categories
6. **Automatic Series Detection**: ML-based grouping of related articles (no manual metadata)

**Note**: These are intentionally out of scope per spec.md to maintain focused implementation.

---

## Decision Summary

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Sticky positioning | CSS `position: sticky` | Simple, performant, well-supported |
| Article ordering | `series.order` → `publishedAt` | Flexible with sensible default |
| Mobile layout | Below content, no sticky | Content-first, simpler UX |
| Schema extension | Optional `series` object | Backward compatible, clean structure |
| Validation | Build-time in gatsby-node.ts | Fail fast, clear errors |
| Components | SeriesWidget + SeriesPrevNext | Single responsibility, reusable |
| Styling | Separate CSS files | Maintainable, no new dependencies |
| Performance | Build-time rendering | Zero runtime overhead |

---

## References

- [MDN: position sticky](https://developer.mozilla.org/en-US/docs/Web/CSS/position#sticky)
- [Gatsby GraphQL Queries](https://www.gatsbyjs.com/docs/graphql-reference/)
- [Gatsby Node APIs](https://www.gatsbyjs.com/docs/reference/config-files/gatsby-node/)
- [React Accessibility](https://reactjs.org/docs/accessibility.html)
- [Schema.org Series](https://schema.org/Series)

---

## Changelog

- **2025-11-13**: Initial research completed for Article Series Navigation feature

