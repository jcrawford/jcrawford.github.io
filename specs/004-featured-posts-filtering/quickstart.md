# Quickstart Guide: Featured Posts Filtering

## Overview

This feature changes the homepage featured section from showing the 7 most recent posts to showing posts explicitly marked with `featured: true` in their frontmatter. It also adds an npm script to audit featured posts.

## Quick Implementation Checklist

### Phase 1: Update Homepage Logic (30-45 min)

- [ ] Update GraphQL query in `src/pages/index.tsx` to include `featured` field
- [ ] Replace "most recent 7" logic with "filter by featured: true" logic
- [ ] Ensure family posts are excluded even if marked as featured
- [ ] Test with sample featured posts (mark 7 non-family posts)
- [ ] Verify series handling still works correctly

### Phase 2: Create Audit Script (20-30 min)

- [ ] Create script at `scripts/list-featured.js` (or `.ts`)
- [ ] Script should read all markdown files in `content/posts/`
- [ ] Parse frontmatter and filter for `featured: true`
- [ ] Display list with filename, title, category, publishedAt
- [ ] Add warning when more than 7 posts are featured
- [ ] Add prominent warning when family posts are featured
- [ ] Add success message when exactly 7 non-family posts are featured
- [ ] Add npm script: `"list-featured": "node scripts/list-featured.js"`

### Phase 3: Content Curation (15-20 min)

- [ ] Select 7 posts to feature on the homepage
- [ ] Add `featured: true` to their frontmatter
- [ ] Verify none are in the family category
- [ ] Run `npm run list-featured` to verify configuration
- [ ] Test build and preview homepage

## Implementation Details

### 1. GraphQL Query Update

**File**: `src/pages/index.tsx`

**Current query** (line ~346):

```graphql
export const query = graphql`
  query {
    allMarkdownRemark(
      sort: { frontmatter: { publishedAt: DESC } }
      limit: 100
    ) {
      nodes {
        frontmatter {
          # ... existing fields
        }
      }
    }
  }
`;
```

**Add to frontmatter selection**:

```graphql
featured
```

### 2. Filtering Logic Update

**File**: `src/pages/index.tsx`

**Current logic** (line ~250-283):

```typescript
const latestArticles = allDisplayArticles.slice(0, 7);
```

**New logic**:

```typescript
// Filter featured posts (exclude family category)
const featuredPosts = articles.filter(
  article => article.frontmatter.featured === true && article.frontmatter.category !== 'family'
);

// Sort by publishedAt descending
const sortedFeaturedPosts = featuredPosts.sort((a, b) => 
  new Date(b.frontmatter.publishedAt).getTime() - new Date(a.frontmatter.publishedAt).getTime()
);

// Take first 7
const latestArticles = sortedFeaturedPosts.slice(0, 7);
```

### 3. Audit Script Structure

**File**: `scripts/list-featured.js`

```javascript
// Pseudocode structure
const fs = require('fs');
const path = require('path');
const matter = require('gray-matter'); // for parsing frontmatter

// Read all markdown files recursively
// Parse frontmatter
// Filter for featured: true
// Group by category to identify family posts
// Count total
// Display results with warnings/success
```

**Expected Output Example**:

```
Featured Posts Audit
====================

Found 7 featured posts:

✓ work/saferide-health.md
  "Saferide Health" 
  Published: 2025-11-20

✓ lifestyle/life-is-what-happens.md
  "Life is what happens..."
  Published: 2025-01-10

[... 5 more ...]

Status: ✓ Optimal - Exactly 7 non-family posts marked as featured
```

**Warning Example** (too many):

```
⚠️  WARNING: 10 posts marked as featured (limit is 7)
⚠️  Only the 7 most recent will be displayed
⚠️  The following 3 posts will be IGNORED on the homepage:

  - work/post-8.md (2025-01-05)
  - lifestyle/post-9.md (2025-01-03)
  - work/post-10.md (2025-01-01)
```

**Error Example** (family posts):

```
❌ ERROR: Family posts marked as featured (these will be excluded):

  - family/vacation-2025.md
    "Our Family Vacation"
    Published: 2025-11-18
```

### 4. Package.json Update

**File**: `package.json`

Add to scripts section:

```json
{
  "scripts": {
    "list-featured": "node scripts/list-featured.js"
  }
}
```

## Testing Checklist

### Unit Testing

- [ ] Exactly 7 non-family posts with `featured: true` → all 7 appear
- [ ] 10 posts with `featured: true` → only 7 most recent appear
- [ ] 5 posts with `featured: true` → only 5 appear (no filler)
- [ ] Family post with `featured: true` → excluded from featured section
- [ ] Post without `featured` property → treated as non-featured
- [ ] Featured post in a series → displays as series

### Script Testing

- [ ] `npm run list-featured` with 7 featured posts → success message
- [ ] `npm run list-featured` with 10 featured posts → warning about 3 extras
- [ ] `npm run list-featured` with family featured posts → error message
- [ ] `npm run list-featured` with 0 featured posts → clear notification

### Integration Testing

- [ ] Build completes successfully with featured posts configured
- [ ] Homepage displays correct featured posts in slider and highlighted sections
- [ ] Series posts in featured section display series information
- [ ] Featured posts maintain proper sorting (most recent first)

## Edge Cases to Handle

1. **No featured posts**: Decide on fallback behavior (empty section or revert to recent posts?)
2. **Fewer than 7 featured posts**: Display available count, don't fill with non-featured
3. **Featured post deleted**: Count decreases automatically at next build
4. **Tie in publishedAt dates**: Ensure consistent secondary sort (e.g., by slug or title)

## Content Editor Workflow

1. Choose posts to feature (up to 7, excluding family posts)
2. Edit each post's markdown file
3. Add `featured: true` to frontmatter
4. Save changes
5. Run `npm run list-featured` to verify
6. Commit and deploy

## Success Validation

After implementation, verify:

- ✅ Featured section shows only posts marked with `featured: true`
- ✅ Family posts are excluded even if marked as featured
- ✅ Maximum 7 posts display in featured section
- ✅ `npm run list-featured` provides clear, actionable output
- ✅ Build succeeds with various featured post configurations
- ✅ Series posts display correctly in featured section

## Estimated Time

- **Development**: 1-1.5 hours
- **Testing**: 30 minutes
- **Content curation**: 20 minutes
- **Total**: ~2-2.5 hours

## Dependencies

- Existing frontmatter parsing (gray-matter or similar)
- GraphQL schema already supports arbitrary frontmatter fields
- Node.js for running the audit script

## Next Steps After Implementation

1. Document the `featured: true` frontmatter property in content style guide
2. Add featured post guidelines to editorial workflow
3. Consider adding build-time warning if no posts are featured
4. Consider adding featured post count validation in CI/CD pipeline

