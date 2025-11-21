# Frontmatter Schema Contract

## Purpose

This document defines the contract for the `featured` property in post frontmatter and its expected behavior.

## Schema Definition

### Post Frontmatter Type

```typescript
interface PostFrontmatter {
  slug: string;
  title: string;
  excerpt: string;
  featuredImage: string;
  category: string;
  tags: string[];
  author: string;
  publishedAt: string;  // ISO date format: "YYYY-MM-DD"
  updatedAt: string;    // ISO date format: "YYYY-MM-DD"
  featured?: boolean;   // NEW: Optional flag to mark post as featured
  series?: {
    name: string;
    order?: number;
  };
}
```

## Featured Property Contract

### Type Signature

```typescript
featured?: boolean
```

### Behavior Contract

| Value | Interpretation | Homepage Display |
|-------|---------------|------------------|
| `true` | Post is marked as featured | ✅ Eligible for featured section (if not family category) |
| `false` | Post is explicitly non-featured | ❌ Never shown in featured section |
| `undefined` (not present) | Post is non-featured by default | ❌ Never shown in featured section |

### Category Interaction

The `featured` property interacts with the `category` property:

```typescript
function isFeaturedEligible(frontmatter: PostFrontmatter): boolean {
  return frontmatter.featured === true && frontmatter.category !== 'family';
}
```

**Contract Rules:**

1. If `featured === true` AND `category !== 'family'` → Eligible for featured section
2. If `featured === true` AND `category === 'family'` → NOT eligible (family exclusion takes precedence)
3. If `featured !== true` → NOT eligible (regardless of category)

## GraphQL Schema Contract

### Query Update

The GraphQL query must include the `featured` field in the frontmatter selection:

```graphql
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
        excerpt
        featuredImage
        category
        tags
        author
        publishedAt
        updatedAt
        featured  # NEW FIELD
        series {
          name
          order
        }
      }
    }
  }
}
```

### Return Type

The GraphQL query returns `boolean | undefined` for the `featured` field:

- Returns `true` when frontmatter contains `featured: true`
- Returns `false` when frontmatter contains `featured: false`
- Returns `undefined` when frontmatter does not contain `featured` property

## Validation Rules

### Build-Time Validation

**No hard validation** - the build should succeed in all cases:

- ✅ Build succeeds with 0 featured posts
- ✅ Build succeeds with < 7 featured posts
- ✅ Build succeeds with exactly 7 featured posts
- ✅ Build succeeds with > 7 featured posts
- ✅ Build succeeds with family posts marked as featured

**Soft validation** - warnings may be issued but build continues:

- ⚠️ Warn if > 7 posts are marked as featured (only via audit script)
- ⚠️ Warn if family posts are marked as featured (only via audit script)

### Runtime Behavior

At runtime (static site generation), the system must:

1. Filter posts where `featured === true`
2. Exclude posts where `category === 'family'`
3. Sort remaining posts by `publishedAt` descending
4. Take first 7 posts
5. Pass to `FeaturedPosts` component

### Type Safety

TypeScript should enforce:

```typescript
// Valid
const post1: PostFrontmatter = { featured: true, /* ... */ };
const post2: PostFrontmatter = { featured: false, /* ... */ };
const post3: PostFrontmatter = { /* no featured field */ };

// Invalid
const post4: PostFrontmatter = { featured: "yes", /* ... */ };  // ❌ Type error
const post5: PostFrontmatter = { featured: 1, /* ... */ };      // ❌ Type error
```

## YAML Syntax Contract

### Valid Syntax

```yaml
# Explicitly featured
featured: true

# Explicitly not featured
featured: false

# Implicitly not featured (field absent)
# (no featured property)
```

### Invalid Syntax (Rejected)

```yaml
# String values are invalid
featured: "true"   # ❌ String, not boolean
featured: "yes"    # ❌ Invalid

# Number values are invalid
featured: 1        # ❌ Number, not boolean

# Null/empty values
featured: null     # ❌ Null
featured:          # ❌ Empty
```

## Backward Compatibility

### Existing Posts

All existing posts without the `featured` property continue to work:

- **No changes required** to existing markdown files
- Posts without `featured` are treated as `featured: false`
- Existing behavior preserved (won't appear in featured section)

### Migration Path

To mark an existing post as featured:

```diff
  ---
  slug: "existing-post"
  title: "Existing Post"
  category: "work"
  publishedAt: "2025-01-15"
+ featured: true
  ---
```

## Examples

### Example 1: Featured Work Post (Valid)

```yaml
---
slug: "scalable-systems"
title: "Building Scalable Systems"
category: "work"
publishedAt: "2025-11-20"
featured: true  # ✅ Will appear in featured section
---
```

**Result**: Eligible for featured section

### Example 2: Featured Family Post (Excluded)

```yaml
---
slug: "family-trip"
title: "Our Family Trip"
category: "family"
publishedAt: "2025-11-18"
featured: true  # ❌ Will NOT appear (family category)
---
```

**Result**: NOT eligible for featured section (category exclusion)

### Example 3: Non-Featured Post (Default)

```yaml
---
slug: "quick-tips"
title: "Quick Tips"
category: "lifestyle"
publishedAt: "2025-11-15"
# No featured property
---
```

**Result**: NOT eligible for featured section (default behavior)

### Example 4: Explicitly Non-Featured Post

```yaml
---
slug: "draft-post"
title: "Draft Post"
category: "work"
publishedAt: "2025-11-10"
featured: false  # ✅ Explicitly marked as non-featured
---
```

**Result**: NOT eligible for featured section

## Testing Contract

### Unit Tests

```typescript
describe('Featured Post Filtering', () => {
  it('should include post when featured is true and category is not family', () => {
    const post = { featured: true, category: 'work' };
    expect(isFeaturedEligible(post)).toBe(true);
  });

  it('should exclude post when category is family even if featured is true', () => {
    const post = { featured: true, category: 'family' };
    expect(isFeaturedEligible(post)).toBe(false);
  });

  it('should exclude post when featured is undefined', () => {
    const post = { category: 'work' };
    expect(isFeaturedEligible(post)).toBe(false);
  });

  it('should exclude post when featured is false', () => {
    const post = { featured: false, category: 'work' };
    expect(isFeaturedEligible(post)).toBe(false);
  });
});
```

## Component Contract

### FeaturedPosts Component

**No changes required** to the `FeaturedPosts` component interface. It continues to receive:

```typescript
interface FeaturedPostsProps {
  sliderArticles: SliderArticle[];      // Still 5 articles
  highlightedArticles: HighlightedArticle[];  // Still 2 articles
}
```

**What changes**: The source of these arrays (now from featured posts instead of recent posts)

**What doesn't change**: The component interface, props, and rendering logic

## Audit Script Contract

### Command

```bash
npm run list-featured
```

### Exit Codes

- `0`: Success - optimal configuration (exactly 7 non-family featured posts)
- `0`: Success with warnings - suboptimal but acceptable configuration
- `0`: Success with errors - configuration issues detected (family posts featured)

Note: Script always exits with 0 to avoid breaking CI/CD pipelines

### Output Format

**Standard Output (stdout)**:

```
Featured Posts Audit
====================

Found N featured posts:

[List of posts with metadata]

Status: [SUCCESS/WARNING/ERROR message]
```

### Output Schema

```typescript
interface AuditOutput {
  featuredPosts: Array<{
    filename: string;
    title: string;
    category: string;
    publishedAt: string;
    isFamilyPost: boolean;
  }>;
  totalCount: number;
  familyCount: number;
  eligibleCount: number;
  status: 'optimal' | 'warning' | 'error';
  messages: string[];
}
```

## Version History

- **v1.0** (2025-11-21): Initial contract definition for `featured` property

