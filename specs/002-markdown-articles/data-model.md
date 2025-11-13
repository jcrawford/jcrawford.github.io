# Data Model: Markdown Articles

**Feature**: Convert Article Data from JSON to Markdown with Frontmatter  
**Date**: 2025-01-07  
**Status**: Complete

## Overview

This document defines the data model for Markdown-based articles, including file structure, frontmatter schema, content format, and relationships with other entities.

---

## File Structure

### Directory Organization

```
content/
└── posts/
    ├── the-journey-not-the-arrival-matters.md
    ├── fashion-fades-only-style-remains.md
    ├── be-happy-for-this-moment-this-moment-is-your-life.md
    └── ... (20 total files)
```

**Naming Convention**: `[slug].md`
- Slug must match the `slug` field in frontmatter
- Use kebab-case (lowercase with hyphens)
- No special characters except hyphens
- Extension must be `.md`

### File Format

Each Markdown file consists of two parts:

1. **Frontmatter Block**: YAML metadata enclosed in `---` delimiters
2. **Content Body**: Markdown-formatted article content

**Example**:

```markdown
---
slug: "the-journey-not-the-arrival-matters"
title: "The Journey, Not the Arrival Matters"
excerpt: "Life is about the experiences along the way."
featuredImage: "https://images.unsplash.com/photo-1234567890"
category: "travel"
tags: ["featured", "travel", "mindfulness"]
author: "alex-thompson"
publishedAt: "2024-01-15T10:00:00.000Z"
updatedAt: "2024-01-15T10:00:00.000Z"
---

## Introduction

This is the article content in Markdown format...

### Subheading

More content here...
```

---

## Frontmatter Schema

### Field Definitions

| Field | Type | Required | Description | Example |
|-------|------|----------|-------------|---------|
| slug | string | Yes | URL-safe identifier | `"the-journey-not-the-arrival-matters"` |
| title | string | Yes | Article display title | `"The Journey, Not the Arrival Matters"` |
| excerpt | string | Yes | Brief summary (150-200 chars) | `"Life is about the experiences..."` |
| featuredImage | string | Yes | Unsplash image URL | `"https://images.unsplash.com/photo-..."` |
| category | string | Yes | Category slug | `"travel"` |
| tags | array | Yes | Tag strings | `["featured", "travel"]` |
| author | string | Yes | Author slug | `"alex-thompson"` |
| publishedAt | string | Yes | ISO 8601 date | `"2024-01-15T10:00:00.000Z"` |
| updatedAt | string | Yes | ISO 8601 date | `"2024-01-15T10:00:00.000Z"` |

### Field Constraints

**slug**:
- Must be unique across all articles
- Lowercase letters, numbers, hyphens only
- No leading/trailing hyphens
- Pattern: `^[a-z0-9]+(-[a-z0-9]+)*$`

**title**:
- Maximum 100 characters
- No HTML tags
- Can include punctuation and special characters

**excerpt**:
- Recommended 150-200 characters
- Plain text only (no Markdown)
- Complete sentences preferred

**featuredImage**:
- Must be valid HTTPS URL
- Unsplash URLs preferred for consistency
- Format: `https://images.unsplash.com/photo-[id]?w=1200&q=90`

**category**:
- Must match existing category slug
- Valid values: `fashion`, `lifestyle`, `food`, `travel`, `sports`
- See: `src/data/categories.json`

**tags**:
- Array with 1-5 tags
- Each tag is lowercase string
- Common tags: `featured`, `slide`, category names
- Tags don't need pre-registration

**author**:
- Must match existing author slug
- Currently only: `alex-thompson`
- See: `src/data/authors.json`

**publishedAt / updatedAt**:
- ISO 8601 format with timezone
- Format: `YYYY-MM-DDTHH:mm:ss.sssZ`
- UTC timezone (Z suffix)
- Both dates required (even if identical)

---

## Content Body

### Markdown Format

- Standard Markdown syntax supported
- Headings: `##` (H2) through `####` (H4)
- Paragraphs: Separated by blank lines
- Emphasis: `*italic*`, `**bold**`
- Links: `[text](url)`
- Images: `![alt](url)` (inline images not recommended)
- Lists: Unordered (`-`) and ordered (`1.`)
- Blockquotes: `> quote text`
- Code blocks: ` ```language` (fenced)

### Content Guidelines

**Length**: 
- Minimum 300 words
- Typical 500-1000 words
- No maximum limit

**Structure**:
- Start with introduction paragraph (no heading)
- Use H2 (`##`) for main sections
- Use H3 (`###`) for subsections
- Conclude with summary or call-to-action

**Images**:
- Feature image comes from frontmatter
- Inline images should be avoided (use featured image)
- If needed, use full Unsplash URLs

**HTML**:
- Avoid HTML in Markdown body
- Use Markdown syntax for formatting
- Exception: HTML comments for excerpt separator

---

## Entity Relationships

### Article → Category (Many-to-One)

- Each article belongs to exactly one category
- Category determined by `category` field in frontmatter
- Category data stored separately in `src/data/categories.json`

**Category Entity**:
```json
{
  "slug": "travel",
  "name": "Travel",
  "description": "Travel and adventure articles"
}
```

**Relationship**:
- `Article.frontmatter.category` → `Category.slug`
- Enforced by GraphQL query validation
- Category must exist before article creation

### Article → Author (Many-to-One)

- Each article has exactly one author
- Author determined by `author` field in frontmatter
- Author data stored separately in `src/data/authors.json`

**Author Entity**:
```json
{
  "slug": "alex-thompson",
  "name": "Alex Thompson",
  "bio": "Content creator and writer",
  "avatar": "https://images.unsplash.com/photo-avatar"
}
```

**Relationship**:
- `Article.frontmatter.author` → `Author.slug`
- Enforced by GraphQL query validation
- Author must exist before article creation

### Article → Tags (Many-to-Many)

- Each article can have multiple tags
- Tags stored as string array in frontmatter
- No separate tag entity (tags are freeform)

**Tag Usage**:
- `featured`: Appears in homepage slider
- `slide`: Legacy tag (same as featured)
- Category names: Often duplicated as tags
- Custom tags: Any relevant keywords

**Relationship**:
- `Article.frontmatter.tags[]` → Freeform strings
- No referential integrity (tags can be any string)
- Filtering: Articles can be queried by tag

---

## GraphQL Schema

### Query Structure

**Query All Articles**:
```graphql
query {
  allMarkdownRemark(
    filter: { fileAbsolutePath: { regex: "/content/posts/" } }
    sort: { frontmatter: { publishedAt: DESC } }
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
      }
    }
  }
}
```

**Query Single Article**:
```graphql
query($slug: String!) {
  markdownRemark(frontmatter: { slug: { eq: $slug } }) {
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
```

**Query Articles by Category**:
```graphql
query($category: String!) {
  allMarkdownRemark(
    filter: { 
      fileAbsolutePath: { regex: "/content/posts/" }
      frontmatter: { category: { eq: $category } }
    }
    sort: { frontmatter: { publishedAt: DESC } }
  ) {
    nodes {
      # ... same fields
    }
  }
}
```

### TypeScript Interfaces

**Query Result Type**:
```typescript
interface MarkdownArticleNode {
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

interface ArticlesQueryResult {
  allMarkdownRemark: {
    nodes: MarkdownArticleNode[];
  };
}
```

---

## Validation Rules

### Frontmatter Validation

**On Build**:
- Gatsby validates YAML syntax (build fails if invalid)
- Required fields checked via TypeScript interfaces
- Date format validated by dayjs parsing

**Migration Script**:
- Validates all required fields present
- Checks slug uniqueness
- Verifies category/author references
- Ensures date formats are ISO 8601

### Content Validation

**Optional Checks** (not enforced):
- Minimum word count (300 words)
- Maximum line length (120 characters)
- Heading hierarchy (no skipped levels)
- No broken links (external)

**Enforced Checks**:
- Valid Markdown syntax (parser errors fail build)
- Frontmatter YAML syntax (must parse correctly)
- Required frontmatter fields (TypeScript compile error if missing)

---

## Migration Mapping

### JSON to Markdown Field Mapping

| JSON Field | Markdown Location | Notes |
|------------|-------------------|-------|
| `slug` | `frontmatter.slug` | Unchanged |
| `title` | `frontmatter.title` | Unchanged |
| `excerpt` | `frontmatter.excerpt` | Unchanged |
| `content` | Markdown body | Convert HTML to Markdown if needed |
| `featuredImage` | `frontmatter.featuredImage` | Unchanged |
| `category` | `frontmatter.category` | Unchanged |
| `tags` | `frontmatter.tags` | Unchanged (array format) |
| `author` | `frontmatter.author` | Unchanged |
| `publishedAt` | `frontmatter.publishedAt` | Ensure ISO 8601 format |
| `updatedAt` | `frontmatter.updatedAt` | Ensure ISO 8601 format |

**No Data Loss**: All fields preserved 1:1

---

## State Transitions

### Article Lifecycle

1. **Created**: New Markdown file written to `content/posts/`
2. **Detected**: Gatsby detects file on next build/develop
3. **Parsed**: gatsby-transformer-remark parses frontmatter and content
4. **Indexed**: GraphQL schema updated with new node
5. **Rendered**: Page generated via gatsby-node createPage API
6. **Published**: Static HTML deployed to GitHub Pages

### Update Workflow

1. Edit Markdown file
2. Save changes
3. Gatsby hot-reloads (development mode)
4. Review changes in browser
5. Commit to Git
6. Push to trigger GitHub Pages build

**No Database**: All state stored in Git repository

---

## Performance Considerations

**Build Time**:
- Markdown parsing: ~50ms per file
- Expected total: ~1 second for 20 articles
- Acceptable: Under 3 seconds for 100 articles

**Memory Usage**:
- Frontmatter: ~500 bytes per article
- Content: 3-5KB per article
- Total: ~110KB for 20 articles
- Negligible impact on build memory

**Query Performance**:
- GraphQL queries cached during build
- No runtime performance impact (static site)
- All queries resolved at build time

---

## Future Extensibility

### Adding New Fields

To add a field to articles:

1. Update frontmatter in all Markdown files
2. Update TypeScript interface (`MarkdownArticleNode`)
3. Update GraphQL queries to include new field
4. Update templates/components using the field

Example: Adding `readingTime` field
```yaml
---
# ... existing fields
readingTime: 5  # minutes
---
```

### Multi-Author Support

To support multiple authors per article:
```yaml
---
# Change from string to array
authors: ["alex-thompson", "jane-doe"]
---
```

### Localization (i18n)

To support multiple languages:
```
content/
├── posts/
│   └── en/
│       └── article.md
└── posts/
    └── es/
        └── article.md
```

Frontmatter would include `lang: "en"` field.

---

## References

- [Gatsby Markdown Pages](https://www.gatsbyjs.com/docs/how-to/routing/adding-markdown-pages/)
- [YAML Specification](https://yaml.org/spec/1.2.2/)
- [CommonMark Spec](https://commonmark.org/)
- [ISO 8601 Dates](https://www.iso.org/iso-8601-date-and-time-format.html)

---

## Changelog

- **2025-01-07**: Initial data model created for JSON to Markdown migration




