# Data Model: Article Series Navigation

**Feature**: Article Series Navigation  
**Date**: 2025-11-13  
**Status**: In Specification

## Overview

This document defines the data model for article series functionality, including series metadata schema, navigation structure, references, attachments, and relationships between series articles.

---

## Series Metadata Schema

### Frontmatter Structure

Series information is stored in article frontmatter as a nested `series` object:

```yaml
---
slug: "getting-started-with-gatsby"
title: "Getting Started with Gatsby"
# ... standard article frontmatter ...
series:
  name: "Gatsby Fundamentals"
  prev: "/articles/introduction-to-static-sites"
  next: "/articles/gatsby-configuration-deep-dive"
  references:
    - url: "https://www.gatsbyjs.com/docs/"
      title: "Official Gatsby Documentation"
    - url: "https://reactjs.org/docs/getting-started.html"
      title: "React Documentation"
  attachments:
    - filename: "/downloads/gatsby-starter-template.zip"
      title: "Gatsby Starter Template"
    - filename: "/downloads/sample-code.zip"
      title: "Sample Code Repository"
---

Article content here...
```

### Field Definitions

| Field | Type | Required | Description | Example |
|-------|------|----------|-------------|---------|
| series | object | No | Container for all series metadata | See below |
| series.name | string | Yes* | Display name of the series | `"Gatsby Fundamentals"` |
| series.prev | string | No | Path to previous article in series | `"/articles/intro-static-sites"` |
| series.next | string | No | Path to next article in series | `"/articles/gatsby-config"` |
| series.references | array | No | External reference URLs | See Reference Schema |
| series.attachments | array | No | Downloadable file attachments | See Attachment Schema |

**\* Required if `series` object exists**

### Reference Schema

Each reference is an object with URL and optional title:

```yaml
references:
  - url: "https://example.com/resource"
    title: "Resource Title"
  - url: "https://another-resource.com"
    title: "Another Resource"
```

| Field | Type | Required | Description | Example |
|-------|------|----------|-------------|---------|
| url | string | Yes | External resource URL | `"https://docs.example.com"` |
| title | string | No | Display name for the link | `"Official Documentation"` |

**Title Generation**: If `title` is not provided, it can be derived from:
1. URL hostname and path
2. HTML `<title>` tag from fetched URL (optional enhancement)
3. URL itself as fallback

### Attachment Schema

Each attachment is an object with file path and optional title:

```yaml
attachments:
  - filename: "/downloads/sample-code.zip"
    title: "Sample Code"
  - filename: "/downloads/dataset.csv"
    title: "Sample Dataset"
```

| Field | Type | Required | Description | Example |
|-------|------|----------|-------------|---------|
| filename | string | Yes | File path (relative or absolute) | `"/downloads/code.zip"` |
| title | string | No | Display name for the download | `"Source Code Package"` |

**Path Resolution**:
- Absolute paths (starting with `/`): Resolve from site root
- Relative paths: Resolve from article location
- External URLs: Supported (e.g., `https://cdn.example.com/file.zip`)

**Title Generation**: If `title` is not provided, derive from:
1. Filename without extension: `"sample-code.zip"` → `"Sample Code"`
2. Capitalized filename with spaces: `"sample_code"` → `"Sample Code"`

---

## Field Constraints

### series.name

- **Format**: Plain text string
- **Length**: 3-60 characters
- **Case-sensitive**: Series name must match exactly across all articles
- **Special characters**: Allowed but not recommended for consistency
- **Uniqueness**: Must be unique within the site (two different series cannot share the same name)

**Valid Examples**:
- `"Gatsby Fundamentals"`
- `"Advanced TypeScript: A Deep Dive"`
- `"React Hooks Series"`

**Invalid Examples**:
- `""` (empty string)
- `"A"` (too short)
- Series names with inconsistent capitalization across articles

### series.prev / series.next

- **Format**: Article path or slug
- **Pattern**: Absolute path starting with `/` or relative slug
- **Validation**: Must reference an existing article
- **Null values**: Allowed (indicates first/last article)
- **Circular references**: Not allowed (A → B → A)

**Valid Examples**:
- `"/articles/introduction-to-gatsby"`
- `"gatsby-configuration"`
- `null` or omitted (no previous/next article)

**Invalid Examples**:
- `"https://external-site.com/article"` (external URLs not allowed)
- `"/nonexistent-article"` (article must exist)
- Circular chains: Article A → Article B → Article A

### series.references

- **Format**: Array of reference objects
- **Length**: 0-20 references per article
- **Order**: Preserved as authored (display order matters)
- **Uniqueness**: URLs should be unique within an article
- **Validation**: URLs must be well-formed (protocol + domain)

**URL Validation**:
- Must start with `http://` or `https://`
- Must contain valid domain name
- Path and query parameters allowed
- Fragment identifiers allowed (`#section`)

### series.attachments

- **Format**: Array of attachment objects
- **Length**: 0-10 attachments per article
- **Order**: Preserved as authored (display order matters)
- **File types**: Any extension allowed (zip, pdf, csv, json, etc.)
- **Validation**: File must exist at specified path (checked during build)

---

## Entity Relationships

### Series → Articles (One-to-Many)

A series is defined by multiple articles sharing the same `series.name` value.

**Relationship**:
```
Series "Gatsby Fundamentals"
  ├── Article 1: "Introduction to Static Sites"
  ├── Article 2: "Getting Started with Gatsby"
  ├── Article 3: "Gatsby Configuration Deep Dive"
  └── Article 4: "Deploying Your Gatsby Site"
```

**Query Logic**:
- Group articles by `series.name`
- Sort by `publishedAt` date (or explicit order field)
- Generate table of contents from sorted article list

**No Explicit Order Field**: Article order in series is determined by:
1. Published date (`publishedAt` ascending)
2. Explicit `prev`/`next` chain (if present)
3. Fallback: Alphabetical by slug

### Article → Previous Article (One-to-One, Optional)

Each article can reference exactly one previous article via `series.prev`.

**Relationship Type**: Optional, unidirectional reference
**Validation**: Previous article must exist and be published
**Display**: "Previous" navigation button at bottom of article

### Article → Next Article (One-to-One, Optional)

Each article can reference exactly one next article via `series.next`.

**Relationship Type**: Optional, unidirectional reference
**Validation**: Next article must exist and be published
**Display**: "Next" navigation button at bottom of article

### Article → References (One-to-Many)

Each article can have multiple external references.

**Relationship Type**: Embedded array (no separate entity)
**Cardinality**: 0 to 20 references per article
**Display**: Numbered list below table of contents

### Article → Attachments (One-to-Many)

Each article can have multiple downloadable attachments.

**Relationship Type**: Embedded array (no separate entity)
**Cardinality**: 0 to 10 attachments per article
**Storage**: Static files in `/public/downloads/` or similar
**Display**: Numbered list below references section

---

## Table of Contents Generation

### Algorithm

To generate the table of contents for a series article:

1. **Extract series name** from current article's `series.name`
2. **Query all articles** with matching `series.name`
3. **Sort articles** by `publishedAt` date (ascending)
4. **Build ordered list** with article numbers (1, 2, 3, ...)
5. **Mark current article** as non-linked in the list
6. **Render other articles** as clickable links

### Example Data Flow

**Input**: Article "Getting Started with Gatsby" with `series.name = "Gatsby Fundamentals"`

**Query Result**:
```javascript
[
  { slug: "intro-static-sites", title: "Introduction to Static Sites", publishedAt: "2024-01-01" },
  { slug: "getting-started-gatsby", title: "Getting Started with Gatsby", publishedAt: "2024-01-08" },
  { slug: "gatsby-config", title: "Gatsby Configuration", publishedAt: "2024-01-15" },
  { slug: "deploying-gatsby", title: "Deploying Your Site", publishedAt: "2024-01-22" }
]
```

**Output HTML Structure**:
```html
<div class="series-toc">
  <h4>Table of Contents</h4>
  <ol>
    <li><a href="/articles/intro-static-sites">Introduction to Static Sites</a></li>
    <li><span class="current">Getting Started with Gatsby</span></li>
    <li><a href="/articles/gatsby-config">Gatsby Configuration</a></li>
    <li><a href="/articles/deploying-gatsby">Deploying Your Site</a></li>
  </ol>
</div>
```

**Current Article Detection**: Compare `currentArticle.slug` with each article in the list

---

## Validation Rules

### Build-Time Validation

**Series Metadata Validation**:
- If `series` object exists, `series.name` is required
- `series.prev` and `series.next` must reference existing articles (if provided)
- No circular references allowed in prev/next chain
- All reference URLs must be well-formed
- All attachment files must exist at specified paths

**Error Messages**:
```
❌ Article "getting-started-gatsby": series.name is required when series object exists
❌ Article "gatsby-config": series.prev references non-existent article "/articles/missing"
❌ Article "intro-static-sites": Circular reference detected in series navigation
❌ Article "getting-started-gatsby": Invalid reference URL "htp://broken-url"
❌ Article "gatsby-config": Attachment file not found: /downloads/missing.zip
```

**Warnings** (non-blocking):
```
⚠️  Series "Gatsby Fundamentals" has only 1 article (series typically have 2+)
⚠️  Article "gatsby-config": Reference URL could not be fetched for title extraction
⚠️  Article "intro-static-sites": Attachment file is very large (>50MB)
```

### Runtime Validation

**No runtime validation needed**: Series data is fully resolved at build time. Static pages include pre-rendered series navigation.

---

## State Transitions

### Series Creation Workflow

1. **Author creates first article** with `series.name` field
2. **Build process** recognizes new series (single-article series)
3. **Article page renders** with series widget (no prev/next navigation)
4. **Author creates second article** with same `series.name`
5. **Build process** links articles (table of contents shows both)
6. **Author updates first article** with `series.next` to second article
7. **Build process** renders navigation buttons

### Series Expansion

Adding a new article to an existing series:

1. Author creates new article with matching `series.name`
2. Author sets `series.prev` to last article in series
3. Author updates previous article's `series.next` to point to new article
4. Build validates all references
5. All series articles automatically show updated table of contents

**No database updates required**: All series information is self-contained in article frontmatter.

---

## Example: Complete Series

### Article 1: Introduction

```yaml
---
slug: "intro-static-sites"
title: "Introduction to Static Sites"
publishedAt: "2024-01-01T10:00:00Z"
series:
  name: "Gatsby Fundamentals"
  next: "/articles/getting-started-gatsby"
  references:
    - url: "https://jamstack.org/"
      title: "JAMstack Architecture"
---
```

### Article 2: Getting Started

```yaml
---
slug: "getting-started-gatsby"
title: "Getting Started with Gatsby"
publishedAt: "2024-01-08T10:00:00Z"
series:
  name: "Gatsby Fundamentals"
  prev: "/articles/intro-static-sites"
  next: "/articles/gatsby-config"
  references:
    - url: "https://www.gatsbyjs.com/docs/"
      title: "Gatsby Docs"
  attachments:
    - filename: "/downloads/gatsby-starter.zip"
      title: "Starter Template"
---
```

### Article 3: Configuration

```yaml
---
slug: "gatsby-config"
title: "Gatsby Configuration Deep Dive"
publishedAt: "2024-01-15T10:00:00Z"
series:
  name: "Gatsby Fundamentals"
  prev: "/articles/getting-started-gatsby"
  next: "/articles/deploying-gatsby"
---
```

### Article 4: Deployment

```yaml
---
slug: "deploying-gatsby"
title: "Deploying Your Gatsby Site"
publishedAt: "2024-01-22T10:00:00Z"
series:
  name: "Gatsby Fundamentals"
  prev: "/articles/gatsby-config"
  references:
    - url: "https://pages.github.com/"
      title: "GitHub Pages"
    - url: "https://www.netlify.com/"
      title: "Netlify"
---
```

**Result**: 4-article series with complete navigation, table of contents, references, and attachments.

---

## Performance Considerations

**Build Impact**:
- Series grouping query: O(n) where n = total articles
- Sorting: O(n log n) per series
- Expected impact: < 10ms for typical site (< 100 articles)

**Page Size Impact**:
- Series widget HTML: ~2-5KB per article page
- Minimal increase (< 5% of total page size)

**No Client-Side Processing**: All series logic handled at build time. Zero JavaScript required for basic functionality (optional for sticky behavior enhancement).

---

## Future Extensibility

### Explicit Article Ordering

Add `order` field to series metadata:

```yaml
series:
  name: "Gatsby Fundamentals"
  order: 2  # Explicit position in series
```

Benefits: Manual control over sequence (overrides publishedAt sorting)

### Series Landing Pages

Create dedicated series overview pages:

```
/series/gatsby-fundamentals/
```

Would show: Series description, all articles, progress tracking, estimated reading time

### Series Progress Tracking

Store reader progress in localStorage:

```javascript
{
  "gatsby-fundamentals": {
    "completed": ["intro-static-sites", "getting-started-gatsby"],
    "current": "gatsby-config",
    "progress": 0.75
  }
}
```

Display: Progress bar in series widget showing articles completed

### Multi-Series Support

Allow articles to belong to multiple series:

```yaml
series:
  - name: "Gatsby Fundamentals"
    order: 2
  - name: "Web Performance"
    order: 5
```

Display: Multiple series widgets or tabbed interface

---

## References

- [YAML Specification](https://yaml.org/spec/1.2.2/)
- [Markdown Frontmatter Guide](https://jekyllrb.com/docs/front-matter/)
- [URL Validation Standards](https://url.spec.whatwg.org/)

---

## Changelog

- **2025-11-13**: Initial data model created for Article Series Navigation feature

