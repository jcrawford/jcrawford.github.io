# Research: Featured Posts Filtering

**Date**: November 21, 2025  
**Feature**: Featured Posts Filtering  
**Status**: Complete

## Overview

This document captures the technical research conducted to inform the implementation of featured posts filtering in a Gatsby static site. All unknowns from the Technical Context have been resolved.

---

## Research Area 1: Gatsby GraphQL Frontmatter Queries

### Question

How do we extend the existing GraphQL query in `index.tsx` to include the `featured` field from markdown frontmatter?

### Decision

Add `featured` to the frontmatter selection in the GraphQL query. Gatsby automatically infers GraphQL schema from markdown frontmatter.

### Rationale

- **Automatic Schema Inference**: Gatsby's `gatsby-transformer-remark` automatically makes all frontmatter fields available in GraphQL
- **No Configuration Required**: Simply adding the field to the query is sufficient
- **Type Safety**: TypeScript interfaces can be updated to match
- **Backward Compatible**: Fields not present in some posts return `undefined` (expected behavior)

### Implementation Pattern

```typescript
// In src/pages/index.tsx, update the GraphQL query:
export const query = graphql`
  query {
    allMarkdownRemark(
      sort: { frontmatter: { publishedAt: DESC } }
      limit: 100
    ) {
      nodes {
        id
        html
        frontmatter {
          slug
          title
          # ... other existing fields ...
          featured  # ← ADD THIS LINE
          series {
            name
            order
          }
        }
      }
    }
  }
`;
```

### Alternatives Considered

| Alternative | Rejected Because |
|-------------|------------------|
| Create custom GraphQL resolver | Unnecessary complexity; automatic inference handles this |
| Use custom plugin for frontmatter | Already have `gatsby-transformer-remark` which handles this |
| Add featured field to gatsby-config | Not needed; schema inference is automatic |

### References

- [Gatsby GraphQL Queries](https://www.gatsbyjs.com/docs/graphql/)
- [gatsby-transformer-remark frontmatter](https://www.gatsbyjs.com/plugins/gatsby-transformer-remark/#frontmatter)

---

## Research Area 2: Frontmatter Parsing for Audit Script

### Question

What library should we use to parse frontmatter in the Node.js audit script (`scripts/list-featured.js`)?

### Decision

Use `gray-matter` - it's already a transitive dependency of Gatsby and provides reliable YAML frontmatter parsing.

### Rationale

- **Already Available**: Installed as dependency of `gatsby-transformer-remark`
- **Battle-Tested**: Industry standard for frontmatter parsing
- **Simple API**: Easy to use, well-documented
- **Type Support**: Works well with TypeScript
- **Zero Added Dependencies**: No need to expand dependency tree

### Implementation Pattern

```javascript
const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

// Read all markdown files
const postsDir = path.join(__dirname, '../content/posts');
const files = getAllMarkdownFiles(postsDir);

// Parse each file
files.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  const { data: frontmatter } = matter(content);
  
  if (frontmatter.featured === true) {
    // Process featured post
  }
});
```

### Alternatives Considered

| Alternative | Rejected Because |
|-------------|------------------|
| `front-matter` npm package | `gray-matter` more popular and already installed |
| Custom regex parsing | Error-prone, doesn't handle YAML edge cases |
| `js-yaml` directly | Would need to manually extract frontmatter boundaries |
| Read from Gatsby's GraphQL cache | Adds complexity; script should be standalone |

### References

- [gray-matter GitHub](https://github.com/jonschlinkert/gray-matter)
- [gray-matter npm](https://www.npmjs.com/package/gray-matter)

---

## Research Area 3: Table Formatting for Audit Script

### Question

How should we format the audit script output as a human-readable table with aligned columns?

### Decision

**Option A (Recommended)**: Use `cli-table3` package for professional table formatting

**Option B (Fallback)**: Implement simple template literal table if minimizing dependencies is critical

### Rationale

**For cli-table3:**
- Professional-looking output with borders and alignment
- Handles column width calculation automatically
- Supports colors and styling
- Minimal overhead (~50KB)
- Well-maintained and widely used

**For template literals:**
- Zero dependencies
- Simple implementation
- Sufficient for basic table needs
- Slightly more code to maintain

### Implementation Pattern

**Option A: Using cli-table3**

```javascript
const Table = require('cli-table3');

const table = new Table({
  head: ['Filename', 'Title', 'Category', 'Published'],
  colWidths: [40, 50, 15, 12]
});

featuredPosts.forEach(post => {
  table.push([
    post.filename,
    post.title,
    post.category,
    post.publishedAt
  ]);
});

console.log(table.toString());
```

**Output:**
```
┌────────────────────────────────────────┬──────────────────────────────────────────────────┬───────────────┬────────────┐
│ Filename                               │ Title                                            │ Category      │ Published  │
├────────────────────────────────────────┼──────────────────────────────────────────────────┼───────────────┼────────────┤
│ 2025/11/saferide-health.md             │ Saferide Health                                  │ work          │ 2025-11-20 │
│ 2025/01/life-is-what-happens.md        │ Life is what happens...                          │ lifestyle     │ 2025-01-10 │
└────────────────────────────────────────┴──────────────────────────────────────────────────┴───────────────┴────────────┘
```

**Option B: Template Literals (No Dependency)**

```javascript
function formatTable(posts) {
  const pad = (str, len) => str.padEnd(len, ' ');
  
  console.log('\n' + '='.repeat(120));
  console.log(
    pad('Filename', 40) + ' | ' +
    pad('Title', 50) + ' | ' +
    pad('Category', 15) + ' | ' +
    'Published'
  );
  console.log('='.repeat(120));
  
  posts.forEach(post => {
    console.log(
      pad(post.filename, 40) + ' | ' +
      pad(post.title.slice(0, 47) + '...', 50) + ' | ' +
      pad(post.category, 15) + ' | ' +
      post.publishedAt
    );
  });
  
  console.log('='.repeat(120) + '\n');
}
```

### Recommendation

Start with **Option B (template literals)** for MVP to avoid adding dependencies. If output needs enhancement (colors, better overflow handling), upgrade to `cli-table3` later.

### Alternatives Considered

| Alternative | Rejected Because |
|-------------|------------------|
| `ascii-table` | Less maintained than cli-table3 |
| `table` package | Excessive features for our needs |
| Markdown table format | Less readable in terminal |
| JSON output | Spec requires human-readable table (clarification session) |

### References

- [cli-table3 npm](https://www.npmjs.com/package/cli-table3)
- [Node.js String.prototype.padEnd()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/padEnd)

---

## Research Area 4: Build-Time Filtering Best Practices

### Question

What are the best practices for implementing build-time filtering in Gatsby to maintain performance and compatibility with existing features (like series grouping)?

### Decision

Implement filtering in the page component (`index.tsx`) after GraphQL query executes, preserving existing data processing pipeline.

### Rationale

- **Maintains Existing Logic**: All current transformations (series grouping, family exclusion) remain intact
- **Clear Separation**: Filtering is a single, testable step in the pipeline
- **Performance**: O(n) filtering over ~120 posts is negligible (<1ms)
- **Debuggability**: Easy to log and inspect filtered results
- **No Build System Changes**: Stays within Gatsby's standard patterns

### Implementation Strategy

```typescript
// In src/pages/index.tsx IndexPage component

// 1. Execute GraphQL query (existing)
const articles = data.allMarkdownRemark.nodes.filter(
  article => article.frontmatter && article.frontmatter.category !== 'family'
);

// 2. Group by series (existing logic - preserve)
const seriesMap = new Map<string, Article[]>();
const standaloneArticles: Article[] = [];
// ... existing series grouping logic ...

// 3. Combine and sort (existing)
const allDisplayArticles = [...standaloneArticles, ...seriesFirstArticles].sort(...);

// 4. NEW: Filter featured posts
const featuredPosts = allDisplayArticles.filter(
  article => article.frontmatter.featured === true
);

// 5. Sort featured posts
const sortedFeaturedPosts = featuredPosts.sort((a, b) => {
  // Primary: publishedAt descending
  const dateA = new Date(a.frontmatter.publishedAt).getTime();
  const dateB = new Date(b.frontmatter.publishedAt).getTime();
  if (dateA !== dateB) return dateB - dateA;
  
  // Secondary: slug ascending (clarification session decision)
  return a.frontmatter.slug.localeCompare(b.frontmatter.slug);
});

// 6. Take first 7
const latestArticles = sortedFeaturedPosts.slice(0, 7);

// 7. Split into slider and highlighted (existing pattern)
const featuredArticles = latestArticles.slice(0, 5).map(...);
const highlightedArticles = latestArticles.slice(5, 7).map(...);

// 8. Pass to component (existing)
<FeaturedPosts 
  sliderArticles={featuredArticles}
  highlightedArticles={highlightedArticles}
/>
```

### Performance Considerations

| Operation | Complexity | Time (120 posts) | Impact |
|-----------|-----------|------------------|--------|
| GraphQL Query | O(n) | ~5ms | Existing |
| Series Grouping | O(n) | ~2ms | Existing |
| Featured Filtering | O(n) | <1ms | **NEW** ✅ Negligible |
| Sorting (featured) | O(n log n) | <1ms | **NEW** ✅ Negligible |
| Total Build Time | - | ~30s | No measurable change |

### Edge Case Handling

**Zero Featured Posts**
```typescript
if (sortedFeaturedPosts.length === 0) {
  // Render empty state component (FR-012)
  return <EmptyFeaturedState message="No featured posts configured" />;
}
```

**Fewer Than 7 Featured Posts**
```typescript
// slice(0, 7) handles this gracefully
// If only 5 posts, highlightedArticles will be empty array
const featuredArticles = latestArticles.slice(0, Math.min(5, latestArticles.length));
const highlightedArticles = latestArticles.slice(5, 7); // Empty if < 6 posts
```

**Series Posts in Featured**
```typescript
// Series grouping happens BEFORE featured filtering
// So if a series post is featured, it represents the entire series
// This preserves existing series behavior (FR-006)
```

### Alternatives Considered

| Alternative | Rejected Because |
|-------------|------------------|
| Filter in GraphQL query | Can't filter on frontmatter booleans easily in GraphQL |
| Custom Gatsby plugin | Overkill for simple filtering; harder to debug |
| Filter at transformer level | Would break series grouping logic |
| Client-side filtering | Against Gatsby patterns; defeats static generation purpose |

### References

- [Gatsby Data Layer](https://www.gatsbyjs.com/docs/data-layer/)
- [Gatsby Build Process](https://www.gatsbyjs.com/docs/conceptual/overview-of-the-gatsby-build-process/)
- [React Array Methods](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)

---

## Research Area 5: File System Traversal for Audit Script

### Question

How should the audit script recursively find all markdown files in `content/posts/` directory structure?

### Decision

Use Node.js built-in `fs` module with recursive directory traversal function.

### Rationale

- **No Dependencies**: Built-in Node.js functionality
- **Simple**: Straightforward recursive implementation
- **Fast**: Sufficient for ~120 files
- **Cross-Platform**: Works on Windows, macOS, Linux

### Implementation Pattern

```javascript
const fs = require('fs');
const path = require('path');

function getAllMarkdownFiles(dir, files = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    
    if (entry.isDirectory()) {
      // Recurse into subdirectory
      getAllMarkdownFiles(fullPath, files);
    } else if (entry.name.endsWith('.md')) {
      // Add markdown file
      files.push(fullPath);
    }
  }
  
  return files;
}

// Usage
const postsDir = path.join(__dirname, '../content/posts');
const allFiles = getAllMarkdownFiles(postsDir);
```

### Alternatives Considered

| Alternative | Rejected Because |
|-------------|------------------|
| `glob` package | Adds dependency; built-in is sufficient |
| `fs.promises` async version | Sync is fine for ~120 files; simpler code |
| Gatsby's file cache | Script should be standalone; no Gatsby dependency |
| Shell command (`find`) | Not cross-platform; harder to test |

### Performance

- **Directory Scan**: O(n) where n = total files in directory tree
- **Expected Time**: ~10-20ms for ~120 posts
- **Well Within**: 3-second target for entire script (SC-003)

---

## Summary of Technical Decisions

| Area | Decision | Dependency | Status |
|------|----------|------------|--------|
| GraphQL Extension | Add `featured` to query | None (Gatsby built-in) | ✅ Resolved |
| Frontmatter Parsing | Use `gray-matter` | Already installed | ✅ Resolved |
| Table Formatting | Template literals (MVP) | None | ✅ Resolved |
| Build-Time Filtering | Filter in page component | None | ✅ Resolved |
| File Traversal | Node.js `fs` built-in | None | ✅ Resolved |

## Open Questions

**None** - All technical unknowns from the Technical Context have been resolved.

## Dependencies Added

**None** - All implementation uses existing dependencies or Node.js built-ins.

**Optional Enhancement** (can be added later):
- `cli-table3` for improved table formatting (if simple template literals aren't sufficient)

## Next Steps

1. ✅ Technical research complete
2. ⏭️ Proceed to Phase 1: Implementation
3. ⏭️ Follow [quickstart.md](./quickstart.md) for detailed implementation steps
4. ⏭️ Generate tasks with `/speckit.tasks` command

---

**Research Status**: ✅ Complete  
**Ready for Implementation**: ✅ Yes  
**Blockers**: None

