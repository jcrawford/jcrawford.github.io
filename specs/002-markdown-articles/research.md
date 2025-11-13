# Technical Research: Markdown Migration

**Feature**: Convert Article Data from JSON to Markdown with Frontmatter  
**Date**: 2025-01-07  
**Status**: Complete

## Overview

This document consolidates all technical decisions and research findings for migrating from JSON-based articles to Markdown files with YAML frontmatter in the Gatsby blog site.

---

## R1: Gatsby Markdown Transformer Configuration

### Decision

Use `gatsby-transformer-remark` with the following configuration:

```typescript
{
  resolve: 'gatsby-transformer-remark',
  options: {
    excerpt_separator: `<!-- end-excerpt -->`, // Custom separator
    plugins: [
      {
        resolve: 'gatsby-remark-images',
        options: {
          maxWidth: 1200,
          quality: 90,
          linkImagesToOriginal: false,
        },
      },
    ],
  },
}
```

### Rationale

- **gatsby-transformer-remark**: Official Gatsby plugin for Markdown transformation, battle-tested and actively maintained
- **gatsby-remark-images**: Provides image optimization and responsive images from Markdown
- **excerpt_separator**: Allows manual control of excerpt length using HTML comments
- **maxWidth**: Matches existing image sizes in design (1200px)
- **linkImagesToOriginal**: false - prevents wrapping images in links (cleaner UX)

### Alternatives Considered

- **MDX**: Rejected because we don't need React components in Markdown
- **Custom transformer**: Rejected because gatsby-transformer-remark is standard and sufficient
- **Contentful/Sanity CMS**: Rejected because file-based content is simpler for this use case

### Dependencies

```json
{
  "gatsby-transformer-remark": "^6.13.0",
  "gatsby-remark-images": "^7.13.0"
}
```

### Configuration Changes

**gatsby-config.ts**:
- Add `gatsby-transformer-remark` to plugins array
- Configure source filesystem to point to `content/posts/`
- Keep existing `gatsby-source-filesystem` for data directory (categories, authors)

---

## R2: Frontmatter Schema Design

### Decision

Use the following YAML frontmatter structure:

```yaml
---
slug: "the-journey-not-the-arrival-matters"
title: "The Journey, Not the Arrival Matters"
excerpt: "Life is about the experiences along the way, not just the destination."
featuredImage: "https://images.unsplash.com/photo-1234567890"
category: "travel"
tags: ["featured", "travel", "mindfulness"]
author: "alex-thompson"
publishedAt: "2024-01-15T10:00:00.000Z"
updatedAt: "2024-01-15T10:00:00.000Z"
---

[Markdown content here]
```

### Rationale

- **Field mapping**: All JSON fields map 1:1 to frontmatter fields
- **Date format**: ISO 8601 format (YYYY-MM-DDTHH:mm:ss.sssZ) for consistency
- **Arrays**: YAML array syntax with brackets for tags
- **Slugs**: Explicit slug field for URL control (not derived from filename)
- **No nesting**: Flat structure for simplicity

### Field Types

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| slug | string | Yes | URL-safe identifier |
| title | string | Yes | Article title |
| excerpt | string | Yes | Brief summary |
| featuredImage | string | Yes | Image URL |
| category | string | Yes | Category slug |
| tags | string[] | Yes | Array of tags |
| author | string | Yes | Author slug |
| publishedAt | string | Yes | ISO 8601 date |
| updatedAt | string | Yes | ISO 8601 date |

### Alternatives Considered

- **Nested structure** (e.g., `metadata.author`): Rejected for complexity
- **Date-only format** (YYYY-MM-DD): Rejected to preserve exact timestamps
- **Tag strings with commas**: Rejected because YAML arrays are cleaner

---

## R3: GraphQL Query Migration Pattern

### Decision

Migrate from JSON transformer queries to MarkdownRemark queries using this pattern:

**Before (JSON)**:
```graphql
query {
  allArticlesJson {
    nodes {
      id
      slug
      title
      excerpt
      content
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

**After (Markdown)**:
```graphql
query {
  allMarkdownRemark {
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
      }
    }
  }
}
```

### Key Differences

1. **Content field**: `content` (JSON) → `html` (MarkdownRemark)
2. **Field access**: Direct (`title`) → Nested (`frontmatter.title`)
3. **Node structure**: Flat → Frontmatter wrapper
4. **HTML generation**: Manual → Automatic from Markdown

### TypeScript Interface Updates

**Before**:
```typescript
interface Article {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  featuredImage: string;
  category: string;
  tags: string[];
  author: string;
  publishedAt: string;
  updatedAt: string;
}
```

**After**:
```typescript
interface MarkdownArticle {
  id: string;
  html: string;
  frontmatter: {
    slug: string;
    title: string;
    excerpt: string;
    featuredImage: string;
    category: string;
    tags: string[];
    author: string;
    publishedAt: string;
    updatedAt: string;
  };
}
```

### Query Updates Required

- `src/pages/index.tsx` - Homepage article listing
- `src/templates/article.tsx` - Individual article page
- `src/templates/category.tsx` - Category archive
- `src/templates/author.tsx` - Author archive
- `src/components/FeaturedSlider.tsx` - Featured articles
- `src/components/ArticleCard.tsx` - Article preview cards
- `src/utils/searchIndex.ts` - Search indexing
- `gatsby-node.ts` - Page creation

### Rationale

- Standard MarkdownRemark structure used across Gatsby ecosystem
- Frontmatter nesting provides clear separation of metadata and content
- `html` field contains processed Markdown (no manual HTML generation needed)

---

## R4: Migration Script Approach

### Decision

Create a TypeScript migration script with the following features:

**Script**: `scripts/migrate-to-markdown.ts`

**Features**:
1. **Dry-run mode**: Preview changes without writing files
2. **Validation**: Verify all fields are present before conversion
3. **Checksums**: Generate MD5 hashes to verify data integrity
4. **Backup**: Copy JSON files to backup directory before deletion
5. **Logging**: Detailed output showing each file processed

**Process**:
```
1. Read all JSON files from src/data/articles/
2. For each JSON file:
   a. Parse JSON data
   b. Validate required fields
   c. Format dates to ISO 8601
   d. Generate YAML frontmatter
   e. Append content as Markdown body
   f. Write to content/posts/[slug].md
3. Generate migration report (files processed, errors, warnings)
4. Run validation checks
5. Output success/failure status
```

### Rationale

- **TypeScript**: Type safety prevents field mapping errors
- **Dry-run**: Safe testing before actual migration
- **Validation**: Catches missing/malformed data before write
- **Checksums**: Verifies no data corruption during migration
- **Logging**: Provides audit trail and debugging info

### Script Structure

```typescript
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

interface JSONArticle {
  slug: string;
  title: string;
  // ... all fields
}

interface MigrationOptions {
  dryRun: boolean;
  verbose: boolean;
  backup: boolean;
}

function generateFrontmatter(article: JSONArticle): string {
  // Convert JSON to YAML frontmatter
}

function migrateArticle(filePath: string, options: MigrationOptions): void {
  // Read JSON, convert, write Markdown
}

function validateMarkdownFile(filePath: string): boolean {
  // Verify frontmatter is valid YAML
}

function main() {
  // Execute migration with options
}
```

### Alternatives Considered

- **Manual conversion**: Rejected because error-prone for 20 files
- **Shell script**: Rejected because lacks type safety
- **Online converter**: Rejected because requires uploading sensitive data

---

## R5: Backward Compatibility Strategy

### Decision

Implement a three-phase migration with temporary dual-format support:

**Phase 1: Setup (1 day)**
- Install gatsby-transformer-remark
- Configure both JSON and Markdown transformers
- Add content/posts/ directory
- No code changes yet

**Phase 2: Migration & Validation (1 day)**
- Run migration script (dry-run first)
- Generate all 20 Markdown files
- Keep JSON files intact
- Both transformers active in gatsby-config

**Phase 3: Cutover (1 day)**
- Update all GraphQL queries to use MarkdownRemark
- Update TypeScript interfaces
- Test all pages thoroughly
- Remove gatsby-transformer-json from config
- Delete src/data/articles/ directory
- Commit changes

### Rollback Strategy

If issues are discovered:
1. Revert Git branch to pre-migration commit
2. JSON files still present (not deleted until Phase 3 complete)
3. Original code still functional
4. No data loss risk

### Testing Checklist (Phase 2)

- [ ] All 20 Markdown files created
- [ ] Frontmatter syntax valid (no YAML errors)
- [ ] All fields present in each file
- [ ] Dates formatted correctly
- [ ] Images paths correct
- [ ] gatsby develop runs without errors
- [ ] Build completes successfully

### Rationale

- **Phased approach**: Reduces risk of breaking changes
- **Dual support**: Allows validation before cutover
- **Git safety net**: Easy rollback if needed
- **Testing period**: Verifies migration success before deletion

### Alternatives Considered

- **Direct cutover**: Rejected because too risky
- **Permanent dual support**: Rejected because adds complexity
- **Parallel site**: Rejected because unnecessary for static site

---

## Implementation Sequence

1. **Install dependencies** (gatsby-transformer-remark, gatsby-remark-images)
2. **Create content/posts/** directory
3. **Update gatsby-config.ts** (add new transformer, keep JSON temporarily)
4. **Create migration script** (scripts/migrate-to-markdown.ts)
5. **Run migration** (dry-run first, then real)
6. **Validate Markdown files** (check frontmatter, build site)
7. **Update GraphQL queries** (all templates and pages)
8. **Update TypeScript types** (interfaces for MarkdownRemark)
9. **Test thoroughly** (manual testing of all pages)
10. **Remove JSON files** (after validation passes)
11. **Remove JSON transformer** (clean up gatsby-config.ts)
12. **Update documentation** (quickstart guide for new articles)

---

## Open Questions

**None** - All research tasks completed with concrete decisions.

---

## References

- [Gatsby Markdown Guide](https://www.gatsbyjs.com/docs/how-to/routing/adding-markdown-pages/)
- [gatsby-transformer-remark Documentation](https://www.gatsbyjs.com/plugins/gatsby-transformer-remark/)
- [YAML Specification](https://yaml.org/spec/1.2.2/)
- [ISO 8601 Date Format](https://www.iso.org/iso-8601-date-and-time-format.html)

---

## Approval

**Status**: ✅ Approved for Phase 1 (Design & Contracts)

All technical decisions are concrete, aligned with constitution principles, and ready for implementation planning.




