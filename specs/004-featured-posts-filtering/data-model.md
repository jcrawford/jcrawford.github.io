# Data Model: Featured Posts Filtering

## Overview

This document describes the data structures and relationships involved in the featured posts filtering feature.

## Post Frontmatter Structure

The frontmatter is YAML metadata at the top of each markdown file. The featured posts feature adds or utilizes the following properties:

```yaml
---
slug: "post-slug"
title: "Post Title"
excerpt: "Brief description"
featuredImage: "/images/content/slug/featured.jpg"
category: "lifestyle"  # or "work", "family", etc.
tags: ["tag1", "tag2"]
author: "author-slug"
publishedAt: "2025-01-15"
updatedAt: "2025-01-15"
featured: true  # NEW: Optional boolean to mark post as featured
series:  # Optional: For posts that belong to a series
  name: "Series Name"
  order: 1
---
```

### Key Properties for Featured Posts

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `featured` | boolean | No | When `true`, marks the post for inclusion in the featured section. Defaults to `false` if not present. |
| `category` | string | Yes | Used to exclude family posts from featured section. |
| `publishedAt` | string (ISO date) | Yes | Used to sort featured posts when more than 7 are marked. |
| `series` | object | No | If present, determines whether the post is displayed as a series entity. |

## Featured Post Selection Logic

### Selection Criteria

A post is eligible for the featured section when:

1. `featured === true` (explicitly set in frontmatter)
2. `category !== "family"` (family posts are always excluded)
3. Post is published (based on existing site logic)

### Sorting and Limiting

When multiple posts meet the criteria:

1. Posts are sorted by `publishedAt` in descending order (most recent first)
2. Only the first 7 posts are selected
3. These 7 posts are distributed: 5 to slider, 2 to highlighted section

### Series Handling

If a featured post belongs to a series (`series.name` is set):

- The post represents the entire series in the featured section
- The series title is used instead of the post title
- The series is treated as a single featured entity
- This behavior is consistent with existing homepage logic

## Data Flow

### Build Time (Static Generation)

1. GraphQL query retrieves all posts with their frontmatter (including `featured` field)
2. Filter posts: exclude family category, only include `featured: true`
3. Sort by `publishedAt` descending
4. Take first 7 posts
5. Split into slider (5) and highlighted (2) arrays
6. Pass to `FeaturedPosts` component as props

### Audit Script (Development/Maintenance)

1. Read all markdown files from `content/posts/` directory
2. Parse frontmatter from each file
3. Filter posts where `featured === true`
4. Group by category to identify family posts
5. Count total featured posts
6. Generate report with warnings/success messages

## Relationships

```
Post (Markdown File)
  └─ Frontmatter (YAML)
      ├─ featured: boolean
      ├─ category: string
      ├─ publishedAt: date
      └─ series?: object
          ├─ name: string
          └─ order: number

Featured Section (Component)
  ├─ Slider (5 posts)
  │   └─ SliderArticle[]
  └─ Highlighted (2 posts)
      └─ HighlightedArticle[]
```

## Constraints

- **Maximum Featured Posts Displayed**: 7 (5 slider + 2 highlighted)
- **Recommended Featured Posts**: Exactly 7 non-family posts should have `featured: true`
- **Family Post Exclusion**: All posts with `category: "family"` are excluded from featured section, regardless of `featured` value
- **Default Value**: Posts without `featured` property are treated as `featured: false`

## Migration Impact

- **Existing Posts**: No changes required; all existing posts continue to work as non-featured posts
- **Featured Section Behavior**: Changes from "7 most recent posts" to "7 posts marked as featured"
- **Backward Compatibility**: If no posts are marked as featured, the featured section will be empty (may need fallback logic)
- **Content Editor Action Required**: Content editors must mark 7 posts with `featured: true` to populate the featured section

## Examples

### Example 1: Valid Featured Post

```yaml
---
slug: "building-scalable-systems"
title: "Building Scalable Systems"
category: "work"
publishedAt: "2025-11-15"
featured: true  # ✓ Will appear in featured section
---
```

### Example 2: Family Post (Excluded)

```yaml
---
slug: "family-vacation-2025"
title: "Our Family Vacation"
category: "family"
publishedAt: "2025-11-20"
featured: true  # ✗ Will NOT appear (family category)
---
```

### Example 3: Non-Featured Post

```yaml
---
slug: "quick-tips"
title: "Quick Tips"
category: "lifestyle"
publishedAt: "2025-11-18"
# No featured property = featured: false
---
```

### Example 4: Featured Series Post

```yaml
---
slug: "typescript-fundamentals-part-1"
title: "TypeScript Fundamentals - Part 1"
category: "work"
publishedAt: "2025-11-10"
featured: true
series:
  name: "TypeScript Mastery"
  order: 1
# ✓ Will appear as "TypeScript Mastery" series in featured section
---
```

